import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

export const ITEM_HEIGHT = 105;

// Width used for a card with no image set — matches the track's own add
// button, so an empty item reads as "another slot like that one", not as a
// stray sliver of nothing.
export const EMPTY_CARD_WIDTH = 70;

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export const Card = styled(AnimatedImage).attrs({ transition: 200 })`
  width: ${({ itemWidth }) => itemWidth}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 4px;
`;

const EmptyCard = styled.View`
  width: ${EMPTY_CARD_WIDTH}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  border: 2px solid ${Colors.dateBorder};
  background-color: rgba(0, 0, 0, 0.02);
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
}) {
  const style = useFadeStyle(active, inactiveOpacity);
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {cardImage ? (
        <Card
          source={{ uri: cardImage }}
          contentFit="cover"
          itemWidth={itemWidth}
          style={style}
        />
      ) : (
        <Animated.View style={style}>
          <EmptyCard />
        </Animated.View>
      )}
    </Pressable>
  );
}
