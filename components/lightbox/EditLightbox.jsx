import { GALLERY_ITEM_RADIUS } from "@/components/gallery/shared";
import { Image } from "@/components/image/Image";
import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { useEffect, useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import styled from "styled-components/native";
import { ThemedText } from "../interface/ThemedText";
import { Lightbox } from "./Lightbox";
import { GhostButton, PrimaryButton } from "./shared";

const CropBox = styled.View`
  position: absolute;
  border-width: 2px;
  border-color: ${Colors.white};
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  background-color: ${Colors.accentFaded};
`;

// The crop box is always the shape of the target aspect ratio (a gallery
// thumbnail). Whichever image dimension has slack once that shape is fit
// inside the rendered image frame becomes the draggable axis.
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

export function EditLightbox({
  image,
  onClose,
  onSave,
  targetAspectRatio = ITEM_ASPECT_RATIO,
}) {
  const [rect, setRect] = useState(null);
  const [focusPercent, setFocusPercent] = useState(null);
  const [displayImage, setDisplayImage] = useState(image);

  const cropRef = useRef(null);
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

  const crop = getCropGeometry(rect, targetAspectRatio);
  cropRef.current = crop;
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

  useEffect(() => {
    if (!image) return;
    setDisplayImage(image);
    setRect(null);
    setFocusPercent(parseFocus(image.focus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const handleFrameLayout = (e) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setRect({ x, y, width, height });
  };

  const handleSave = () => {
    const percent = focusPercent ?? 50;
    const focus =
      crop?.axis === "x"
        ? { left: `${percent.toFixed(1)}%` }
        : crop?.axis === "y"
          ? { top: `${percent.toFixed(1)}%` }
          : null;
    onSave?.(focus);
  };

  return (
    <Lightbox visible={!!image} onClose={onClose}>
      <View {...panResponder.panHandlers}>
        <Image
          {...displayImage}
          width="100%"
          onLayout={handleFrameLayout}
          radius={GALLERY_ITEM_RADIUS}
        />
        {boxStyle && <CropBox style={boxStyle} />}
      </View>

      <Lightbox.Controls>
        <GhostButton onPress={onClose}>
          <ThemedText color="white">Cancel</ThemedText>
        </GhostButton>
        <PrimaryButton onPress={handleSave}>
          <ThemedText color="white">Save</ThemedText>
        </PrimaryButton>
      </Lightbox.Controls>
    </Lightbox>
  );
}
