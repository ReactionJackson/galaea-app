import { GALLERY_ITEM_RADIUS } from "@/components/gallery/shared";
import { Image } from "@/components/image/Image";
import { CAPTION_SETTLE_DELAY_DURATION } from "@/constants/values";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";
import { ThemedText } from "../interface/ThemedText";
import { Lightbox } from "./Lightbox";

const MAX_SCALE = 4;
const IMAGE_BLEED_SCALE = 1 + MAX_SCALE * 0.005;

const Container = styled.View`
  width: 100%;
  flex-direction: column;
  gap: 15px;
`;

const ImageCrop = styled.View`
  width: 100%;
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  overflow: hidden;
`;

function InteractiveImage({ image }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const activeGestures = useSharedValue(0);

  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const focalOffsetX = useSharedValue(0);
  const focalOffsetY = useSharedValue(0);
  const anchorTranslateX = useSharedValue(0);
  const anchorTranslateY = useSharedValue(0);

  const updateAnchor = () => {
    "worklet";
    const cos = Math.cos(rotation.value);
    const sin = Math.sin(rotation.value);
    const rotatedX = focalOffsetX.value * cos - focalOffsetY.value * sin;
    const rotatedY = focalOffsetX.value * sin + focalOffsetY.value * cos;
    anchorTranslateX.value = focalOffsetX.value - scale.value * rotatedX;
    anchorTranslateY.value = focalOffsetY.value - scale.value * rotatedY;
  };

  const pinch = Gesture.Pinch()
    .onBegin((e) => {
      activeGestures.value += 1;
      focalOffsetX.value = e.focalX - containerWidth.value / 2;
      focalOffsetY.value = e.focalY - containerHeight.value / 2;
    })
    .onUpdate((e) => {
      scale.value = Math.min(e.scale, MAX_SCALE);
      updateAnchor();
    })
    .onFinalize(() => {
      activeGestures.value = Math.max(0, activeGestures.value - 1);
      scale.value = withSpring(1);
      anchorTranslateX.value = withSpring(0);
      anchorTranslateY.value = withSpring(0);
    });

  const rotate = Gesture.Rotation()
    .onBegin((e) => {
      activeGestures.value += 1;
      focalOffsetX.value = e.anchorX - containerWidth.value / 2;
      focalOffsetY.value = e.anchorY - containerHeight.value / 2;
    })
    .onUpdate((e) => {
      rotation.value = e.rotation;
      updateAnchor();
    })
    .onFinalize(() => {
      activeGestures.value = Math.max(0, activeGestures.value - 1);
      rotation.value = withSpring(0);
      anchorTranslateX.value = withSpring(0);
      anchorTranslateY.value = withSpring(0);
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

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + anchorTranslateX.value },
      { translateY: translateY.value + anchorTranslateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity:
      activeGestures.value > 0
        ? withTiming(0)
        : withDelay(CAPTION_SETTLE_DELAY_DURATION, withTiming(1)),
  }));

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={imageStyle}
          onLayout={(e) => {
            containerWidth.value = e.nativeEvent.layout.width;
            containerHeight.value = e.nativeEvent.layout.height;
          }}
        >
          <ImageCrop>
            <Image
              {...image}
              width="100%"
              radius={GALLERY_ITEM_RADIUS}
              contentFit="cover"
              style={{ transform: [{ scale: IMAGE_BLEED_SCALE }] }}
            />
          </ImageCrop>
        </Animated.View>
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
