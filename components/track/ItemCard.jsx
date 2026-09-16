import { Colors, cardShadow } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
} from "@/constants/values";
import { useResizedImage } from "@/hooks/useResizedImage";
import { Image as ExpoImage } from "expo-image";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

const CardShadow = styled(Animated.View)`
  width: ${({ itemWidth }) => itemWidth}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  ${({ shadowRadius, shadowOpacity }) =>
    cardShadow(shadowRadius, shadowOpacity)}
`;

export const Card = styled(AnimatedImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
  border-radius: 8px;
`;

const EmptyCard = styled.View`
  width: ${EMPTY_CARD_WIDTH}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  border: 2px solid ${Colors.dateBorder};
  background-color: ${Colors.emptySlotBackground};
`;

export function useFadeStyle(active, inactiveOpacity) {
  return useAnimatedStyle(
    () => ({
      opacity: withTiming(active ? 1 : inactiveOpacity, { duration: 200 }),
    }),
    [active, inactiveOpacity],
  );
}

export function ItemCard({
  cardImage,
  itemWidth,
  active,
  inactiveOpacity,
  onPress,
  disabled,
  shadowRadius = CARD_SHADOW_RADIUS,
  shadowOpacity = CARD_SHADOW_OPACITY,
}) {
  const style = useFadeStyle(active, inactiveOpacity);
  // Track thumbnails are small — no need to decode the full source image
  // (which may be several thousand pixels wide straight from a camera) just
  // to show it at itemWidth x ITEM_HEIGHT.
  const displayImage = useResizedImage(cardImage, itemWidth, ITEM_HEIGHT);
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {cardImage ? (
        <CardShadow
          itemWidth={itemWidth}
          shadowRadius={shadowRadius}
          shadowOpacity={shadowOpacity}
          style={style}
        >
          <Card source={{ uri: displayImage }} contentFit="cover" />
        </CardShadow>
      ) : (
        <Animated.View style={style}>
          <EmptyCard />
        </Animated.View>
      )}
    </Pressable>
  );
}
