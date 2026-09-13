import { ITEM_ASPECT_RATIO } from "@/components/Gallery";
import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Modal, PanResponder, Pressable, View } from "react-native";
import styled from "styled-components/native";
import { ThemedText } from "./ThemedText";

// Single-image, no pagination — closing and re-tapping the gallery to move
// to another image is the intended flow (see spec.md "Lightbox").
//
// Driven entirely by the `state` prop, which is either null (closed) or one
// of:
//   { mode: "view", uri }
//     Read-only — used outside edit mode. Just a Close button.
//   { mode: "edit", uri, width, height, focus }
//     Cancel / Reset / Save controls, for setting or moving a focal point.
//     Used both for a freshly picked image not yet in the gallery, and for
//     repositioning an existing one while the entry is in edit mode — the
//     caller (Gallery.jsx) decides which, via whether it already knows an
//     index for the image; Lightbox itself only cares that it's editable.
//     width/height are native pixel dimensions (from the picker for a new
//     image, or Image.getSize for an existing one), used only to size and
//     place the crop-box preview against the letterboxed "contain" render —
//     never persisted. focus, if present, seeds the box at its current spot.
//
// The crop-box is a live preview of ITEM_ASPECT_RATIO (the gallery
// thumbnail's fixed crop ratio) scaled against this specific image. Given a
// FIXED target ratio, an image only ever has one axis of actual freedom —
// whichever dimension doesn't already match the target exactly ends up
// "trimmed", and that trim amount is what's draggable. So the box always
// spans the image's full extent on one axis and a fixed (shorter) span on
// the other, and dragging is confined to that one axis. This is exactly
// what a contentFit: "cover" crop does under the hood — the box makes that
// otherwise-invisible mechanism visible and directly manipulable, rather
// than asking for a point tap that (as it turns out) only has an effect on
// whichever axis the crop happens to be trimming for that image.

const Backdrop = styled.View`
  flex: 1;
  padding: 20px;
  background-color: ${Colors.overlay};
`;

const ImageHolder = styled.View`
  flex: 1;
  position: relative;
`;

const FullImage = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`;

const CropBox = styled.View`
  position: absolute;
  border-width: 2px;
  border-color: ${Colors.white};
  background-color: ${Colors.accentFaded};
`;

const ControlsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
`;

const GhostButton = styled.Pressable`
  height: 36px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${Colors.overlayBorder};
`;

const PrimaryButton = styled.Pressable`
  height: 36px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  background-color: ${Colors.accent};
`;

// Contain-fit maths — the rendered rect of an `imgW` x `imgH` image inside a
// `containerW` x `containerH` box at contentFit: "contain" (centred,
// letterboxed on whichever axis has slack).
function getContainRect(containerW, containerH, imgW, imgH) {
  if (!containerW || !containerH || !imgW || !imgH) return null;
  const scale = Math.min(containerW / imgW, containerH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  return {
    width,
    height,
    x: (containerW - width) / 2,
    y: (containerH - height) / 2,
  };
}

// Where the crop-box sits and how it can move, in the same coordinate space
// as `rect` (the rendered, letterboxed image). `axis` is null when the
// image's ratio already matches the target — nothing to trim, box == rect.
function getCropGeometry(rect) {
  if (!rect) return null;
  const imageRatio = rect.width / rect.height;
  if (Math.abs(imageRatio - ITEM_ASPECT_RATIO) < 0.001) {
    return { axis: null, width: rect.width, height: rect.height, maxOffset: 0 };
  }
  if (imageRatio > ITEM_ASPECT_RATIO) {
    // Image proportionally wider than the target — full height, horizontal slack.
    const width = rect.height * ITEM_ASPECT_RATIO;
    return { axis: "x", width, height: rect.height, maxOffset: rect.width - width };
  }
  // Image proportionally taller/narrower than the target — full width, vertical slack.
  const height = rect.width / ITEM_ASPECT_RATIO;
  return { axis: "y", width: rect.width, height, maxOffset: rect.height - height };
}

// { top: "42.0%" } | { left: "63.0%" } | null -> 0-100 | null
function parseFocus(focus) {
  if (!focus) return null;
  if (focus.left != null) return parseFloat(focus.left);
  if (focus.top != null) return parseFloat(focus.top);
  return null;
}

export function Lightbox({ state, onClose, onSave }) {
  const [containerSize, setContainerSize] = useState(null);
  const [focusPercent, setFocusPercent] = useState(null); // 0-100 | null (untouched)

  const isEdit = state?.mode === "edit";
  const uri = state?.uri;

  // Each new session (opening, or switching to a different image) reseeds
  // the draft from whatever focus the caller already has on file — nothing
  // carries over from whatever was previously open.
  useEffect(() => {
    if (!state) return;
    setContainerSize(null);
    setFocusPercent(isEdit ? parseFocus(state.focus) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const rect =
    isEdit && containerSize
      ? getContainRect(containerSize.width, containerSize.height, state.width, state.height)
      : null;
  const crop = getCropGeometry(rect);

  // PanResponder's handlers close over a single ref instance, so anything
  // they need that changes over time (the current crop geometry, the
  // in-progress percent) is read via refs kept in sync every render rather
  // than captured at creation time.
  const cropRef = useRef(crop);
  cropRef.current = crop;
  const focusPercentRef = useRef(focusPercent);
  focusPercentRef.current = focusPercent;
  const dragStartPercentRef = useRef(50);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!cropRef.current?.axis,
      onMoveShouldSetPanResponder: () => !!cropRef.current?.axis,
      onPanResponderGrant: () => {
        dragStartPercentRef.current = focusPercentRef.current ?? 50;
      },
      onPanResponderMove: (_, gestureState) => {
        const current = cropRef.current;
        if (!current?.axis || !current.maxOffset) return;
        const deltaPx = current.axis === "x" ? gestureState.dx : gestureState.dy;
        const deltaPercent = (deltaPx / current.maxOffset) * 100;
        const next = Math.min(
          Math.max(dragStartPercentRef.current + deltaPercent, 0),
          100,
        );
        setFocusPercent(next);
      },
    }),
  ).current;

  const handleLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const handleSave = () => {
    // expo-image's contentPosition shape — this percentage reads the same
    // way CSS background-position does (0% = crop-box at the start of its
    // travel, 100% = the end), so it maps directly onto the thumbnail's
    // contentFit: "cover" render with no further conversion. Only the axis
    // that actually has slack is meaningful, so only that one is stored.
    const percent = focusPercent ?? 50;
    const value =
      crop?.axis === "x"
        ? { left: `${percent.toFixed(1)}%` }
        : crop?.axis === "y"
          ? { top: `${percent.toFixed(1)}%` }
          : null;
    onSave?.(value);
  };

  // Crop-box's on-screen rect, recomputed every render from the current
  // geometry and percent rather than cached, so it can't drift.
  const boxStyle =
    rect && crop
      ? {
          width: crop.width,
          height: crop.height,
          left:
            rect.x +
            (crop.axis === "x" ? ((focusPercent ?? 50) / 100) * crop.maxOffset : 0),
          top:
            rect.y +
            (crop.axis === "y" ? ((focusPercent ?? 50) / 100) * crop.maxOffset : 0),
        }
      : null;

  return (
    <Modal
      visible={!!state}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Backdrop>
        {isEdit && (
          <ThemedText
            color="white"
            style={{ textAlign: "center", marginBottom: 14 }}
          >
            Drag the box to set what shows in the thumbnail
          </ThemedText>
        )}

        <ImageHolder onLayout={handleLayout}>
          {isEdit ? (
            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
              {uri && <FullImage contentFit="contain" source={{ uri }} />}
              {boxStyle && <CropBox style={boxStyle} />}
            </View>
          ) : (
            <Pressable style={{ flex: 1 }} onPress={onClose}>
              {uri && <FullImage contentFit="contain" source={{ uri }} />}
            </Pressable>
          )}
        </ImageHolder>

        <ControlsRow>
          {isEdit ? (
            <>
              <GhostButton onPress={onClose}>
                <ThemedText color="white">Cancel</ThemedText>
              </GhostButton>
              <GhostButton onPress={() => setFocusPercent(null)}>
                <ThemedText color="white">Reset</ThemedText>
              </GhostButton>
              <PrimaryButton onPress={handleSave}>
                <ThemedText color="white">Save</ThemedText>
              </PrimaryButton>
            </>
          ) : (
            <GhostButton onPress={onClose}>
              <ThemedText color="white">Close</ThemedText>
            </GhostButton>
          )}
        </ControlsRow>
      </Backdrop>
    </Modal>
  );
}
