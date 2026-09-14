import { ITEM_ASPECT_RATIO } from "@/components/Gallery";
import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Modal, PanResponder, Pressable, View } from "react-native";
import styled from "styled-components/native";
import { ThemedText } from "./interface/ThemedText";

const Backdrop = styled.View`
  flex: 1;
  padding: 20px;
  background-color: ${Colors.overlay};
`;

const ImageHolder = styled.View`
  flex: 1;
  position: relative;
`;

const FullImage = styled(ExpoImage).attrs({ transition: 200 })`
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
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 20px;
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
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

function getCropGeometry(rect) {
  if (!rect) return null;
  const imageRatio = rect.width / rect.height;
  if (Math.abs(imageRatio - ITEM_ASPECT_RATIO) < 0.001) {
    return { axis: null, width: rect.width, height: rect.height, maxOffset: 0 };
  }
  if (imageRatio > ITEM_ASPECT_RATIO) {
    // Image proportionally wider than the target — full height, horizontal slack.
    const width = rect.height * ITEM_ASPECT_RATIO;
    return {
      axis: "x",
      width,
      height: rect.height,
      maxOffset: rect.width - width,
    };
  }
  // Image proportionally taller/narrower than the target — full width, vertical slack.
  const height = rect.width / ITEM_ASPECT_RATIO;
  return {
    axis: "y",
    width: rect.width,
    height,
    maxOffset: rect.height - height,
  };
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

  useEffect(() => {
    if (!state) return;
    setContainerSize(null);
    setFocusPercent(isEdit ? parseFocus(state.focus) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const rect =
    isEdit && containerSize
      ? getContainRect(
          containerSize.width,
          containerSize.height,
          state.width,
          state.height,
        )
      : null;
  const crop = getCropGeometry(rect);

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
        const deltaPx =
          current.axis === "x" ? gestureState.dx : gestureState.dy;
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
    const percent = focusPercent ?? 50;
    const value =
      crop?.axis === "x"
        ? { left: `${percent.toFixed(1)}%` }
        : crop?.axis === "y"
          ? { top: `${percent.toFixed(1)}%` }
          : null;
    onSave?.(value);
  };

  const boxStyle =
    rect && crop
      ? {
          width: crop.width,
          height: crop.height,
          left:
            rect.x +
            (crop.axis === "x"
              ? ((focusPercent ?? 50) / 100) * crop.maxOffset
              : 0),
          top:
            rect.y +
            (crop.axis === "y"
              ? ((focusPercent ?? 50) / 100) * crop.maxOffset
              : 0),
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
