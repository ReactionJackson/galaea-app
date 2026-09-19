import { Image } from "@/components/image/Image";
import { Colors } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
} from "@/constants/values";
import { fileExists } from "@/utils/images";
import { useMemo } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

export const EmptyCard = styled(Animated.View)`
  width: ${EMPTY_CARD_WIDTH}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  border: 2px solid ${Colors.dateBorder};
  justify-content: center;
  align-items: center;
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
  active,
  inactiveOpacity,
  onPress,
  disabled,
  shadowRadius = CARD_SHADOW_RADIUS,
  shadowOpacity = CARD_SHADOW_OPACITY,
}) {
  const style = useFadeStyle(active, inactiveOpacity);
  // A dangling reference (the file's gone) needs the same fallback as never
  // having a cardImage at all — otherwise the track loses a usable, tappable
  // slot for that item.
  const exists = useMemo(() => fileExists(cardImage?.uri), [cardImage?.uri]);

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {cardImage && exists ? (
        <Animated.View style={style}>
          <Image
            {...cardImage}
            height={ITEM_HEIGHT}
            shadowRadius={shadowRadius}
            shadowOpacity={shadowOpacity}
            radius={8}
          />
        </Animated.View>
      ) : (
        <Animated.View style={style}>
          <EmptyCard />
        </Animated.View>
      )}
    </Pressable>
  );
}
