import { Image } from "@/components/image/Image";
import { CrossIcon } from "@/components/interface/icons/CrossIcon";
import { Colors } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { useFadeStyle } from "@/hooks/useFadeStyle";
import { fileExists } from "@/utils/images";
import { useMemo } from "react";
import { Pressable } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";

export const EmptyCard = styled(Animated.View)`
  width: ${({ $width = EMPTY_CARD_WIDTH }) => $width}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: ${({ $radius = 8 }) => $radius}px;
  border: 2px solid ${Colors.buttonBorder};
  justify-content: center;
  align-items: center;
`;

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

export function AddItemCard({
  $width,
  $radius,
  active,
  inactiveOpacity = 0.5,
  onPress,
  disabled = false,
}) {
  const style = useFadeStyle(active, inactiveOpacity);

  return (
    <Animated.View
      layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
    >
      <Pressable onPress={onPress} disabled={disabled}>
        <EmptyCard $width={$width} $radius={$radius} style={style}>
          <CrossIcon size={18} color={Colors.black} />
        </EmptyCard>
      </Pressable>
    </Animated.View>
  );
}
