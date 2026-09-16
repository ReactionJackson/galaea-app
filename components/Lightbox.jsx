import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
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

const ImageFrame = styled.View`
  width: 100%;
  aspect-ratio: ${({ ratio }) => ratio};
  border-radius: 10px;
  overflow: hidden;
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
  justify-content: space-between;
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

function getCropGeometry(rect, targetAspectRatio) {
  if (!rect) return null;
  const imageRatio = rect.width / rect.height;
  if (Math.abs(imageRatio - targetAspectRatio) < 0.001) {
    return { axis: null, width: rect.width, height: rect.height, maxOffset: 0 };
  }
  if (imageRatio > targetAspectRatio) {
    // Image proportionally wider than the target — full height, horizontal slack.
    const width = rect.height * targetAspectRatio;
    return {
      axis: "x",
      width,
      height: rect.height,
      maxOffset: rect.width - width,
    };
  }
  // Image proportionally taller/narrower than the target — full width, vertical slack.
  const height = rect.width / targetAspectRatio;
  return {
    axis: "y",
    width: rect.width,
    height,
    maxOffset: rect.height - height,
  };
}

function parseFocus(focus) {
  if (!focus) return null;
  if (focus.left != null) return parseFloat(focus.left);
  if (focus.top != null) return parseFloat(focus.top);
  return null;
}

export function Lightbox({
  state,
  onClose,
  onSave,
  targetAspectRatio = ITEM_ASPECT_RATIO,
}) {
  const [rect, setRect] = useState(null);
  const [focusPercent, setFocusPercent] = useState(null);

  const isEdit = state?.mode === "edit";
  const uri = state?.uri;
  const imageRatio =
    state?.width && state?.height ? state.width / state.height : null;

  useEffect(() => {
    if (!state) return;
    setRect(null);
    setFocusPercent(isEdit ? parseFocus(state.focus) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const crop = getCropGeometry(rect, targetAspectRatio);

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

  const handleFrameLayout = (e) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setRect({ x, y, width, height });
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

  const imageContent = uri ? (
    imageRatio ? (
      <ImageFrame ratio={imageRatio} onLayout={handleFrameLayout}>
        <FullImage contentFit="cover" source={{ uri }} />
      </ImageFrame>
    ) : (
      <FullImage
        contentFit="contain"
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
      />
    )
  ) : null;

  return (
    <Modal
      visible={!!state}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Backdrop>
        {isEdit ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
            {...panResponder.panHandlers}
          >
            {imageContent}
            {boxStyle && <CropBox style={boxStyle} />}
          </View>
        ) : (
          <Pressable
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            onPress={onClose}
          >
            {imageContent}
          </Pressable>
        )}

        <ControlsRow>
          {isEdit ? (
            <>
              <GhostButton onPress={onClose}>
                <ThemedText color="white">Cancel</ThemedText>
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
