import { Image as ExpoImage } from "expo-image";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

export const ITEM_HEIGHT = 105;

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export const Card = styled(AnimatedImage).attrs({ transition: 200 })`
  width: ${({ itemWidth }) => itemWidth}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 4px;
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
      <Card
        source={{ uri: cardImage }}
        contentFit="cover"
        itemWidth={itemWidth}
        style={style}
      />
    </Pressable>
  );
}
