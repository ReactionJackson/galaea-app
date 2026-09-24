import { GALLERY_ITEM_RADIUS } from "@/components/gallery/shared";
import { CAPTION_SETTLE_DELAY_DURATION } from "@/constants/values";
import {
  Canvas,
  FilterMode,
  Group,
  MipmapMode,
  rect,
  rrect,
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";
import { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";
import { ThemedText } from "../interface/ThemedText";
import { Lightbox } from "./Lightbox";

const MAX_SCALE = 4;

const Container = styled.View`
  width: 100%;
  flex-direction: column;
  gap: 15px;
`;

const ImageCrop = styled.View`
  width: 100%;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio ?? 1};
`;

function InteractiveImage({ image }) {
  const skImage = useImage(image.uri);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const activeGestures = useSharedValue(0);

  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const focalOffsetX = useSharedValue(0);
  const focalOffsetY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onBegin((e) => {
      if (activeGestures.value === 0) {
        focalOffsetX.value = e.focalX - containerWidth.value / 2;
        focalOffsetY.value = e.focalY - containerHeight.value / 2;
      }
      activeGestures.value += 1;
    })
    .onUpdate((e) => {
      scale.value = Math.min(e.scale, MAX_SCALE);
    })
    .onFinalize(() => {
      activeGestures.value = Math.max(0, activeGestures.value - 1);
      scale.value = withSpring(1);
    });

  const rotate = Gesture.Rotation()
    .onBegin((e) => {
      if (activeGestures.value === 0) {
        focalOffsetX.value = e.anchorX - containerWidth.value / 2;
        focalOffsetY.value = e.anchorY - containerHeight.value / 2;
      }
      activeGestures.value += 1;
    })
    .onUpdate((e) => {
      rotation.value = e.rotation;
    })
    .onFinalize(() => {
      activeGestures.value = Math.max(0, activeGestures.value - 1);
      rotation.value = withSpring(0);
    });

  const pan = Gesture.Pan()
    .minPointers(2)
    .onBegin(() => {
      activeGestures.value += 1;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onFinalize(() => {
      activeGestures.value = Math.max(0, activeGestures.value - 1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const gesture = Gesture.Simultaneous(pinch, rotate, pan);

  const marginX = (layout.width * MAX_SCALE) / 2;
  const marginY = (layout.height * MAX_SCALE) / 2;
  const canvasWidth = layout.width + marginX * 2;
  const canvasHeight = layout.height + marginY * 2;
  const transform = useDerivedValue(() => {
    const pivotX = marginX + layout.width / 2 + focalOffsetX.value;
    const pivotY = marginY + layout.height / 2 + focalOffsetY.value;
    return [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { translateX: pivotX },
      { translateY: pivotY },
      { scale: scale.value },
      { rotate: rotation.value },
      { translateX: -pivotX },
      { translateY: -pivotY },
    ];
  });

  const captionStyle = useAnimatedStyle(() => ({
    opacity:
      activeGestures.value > 0
        ? withTiming(0)
        : withDelay(CAPTION_SETTLE_DELAY_DURATION, withTiming(1)),
  }));

  return (
    <>
      <GestureDetector gesture={gesture}>
        <ImageCrop
          $aspectRatio={image.aspectRatio}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            containerWidth.value = width;
            containerHeight.value = height;
            setLayout({ width, height });
          }}
        >
          {skImage && layout.width > 0 && layout.height > 0 && (
            <Canvas
              style={{
                position: "absolute",
                left: -marginX,
                top: -marginY,
                width: canvasWidth,
                height: canvasHeight,
              }}
            >
              <Group
                transform={transform}
                clip={rrect(
                  rect(marginX, marginY, layout.width, layout.height),
                  GALLERY_ITEM_RADIUS,
                  GALLERY_ITEM_RADIUS,
                )}
              >
                <SkiaImage
                  image={skImage}
                  x={marginX}
                  y={marginY}
                  width={layout.width}
                  height={layout.height}
                  fit="cover"
                  sampling={{
                    filter: FilterMode.Linear,
                    mipmap: MipmapMode.Linear,
                  }}
                />
              </Group>
            </Canvas>
          )}
        </ImageCrop>
      </GestureDetector>
      {!!image.caption && (
        <ThemedText
          color="white"
          style={[{ textAlign: "center" }, captionStyle]}
        >
          {image.caption}
        </ThemedText>
      )}
    </>
  );
}

export function ViewerLightbox({ image, onClose }) {
  return (
    <Lightbox visible={!!image} onClose={onClose}>
      {!!image && (
        <Container>
          <InteractiveImage image={image} />
        </Container>
      )}
    </Lightbox>
  );
}
