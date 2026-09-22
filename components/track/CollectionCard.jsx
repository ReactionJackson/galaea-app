import { CoverImage } from "@/components/image/CoverImage";
import { ThemedText } from "@/components/interface/ThemedText";
import { ArrowIcon } from "@/components/interface/icons/ArrowIcon";
import { Colors } from "@/constants/theme";
import { FADE_TRANSITION_DURATION, ITEM_HEIGHT } from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { useFadeStyle } from "@/hooks/useFadeStyle";
import { Pressable } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import styled, { css } from "styled-components/native";

export const FLIP_DURATION = FADE_TRANSITION_DURATION * 2;

const Card = styled.View`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 20px;
  overflow: hidden;
  border-width: 2px;
  border-color: ${({ $showBorder }) =>
    $showBorder ? Colors.buttonBorder : "transparent"};
`;

const Slider = styled(Animated.View)`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT * 2}px;
`;

const TopFace = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  padding: 4px;
  border-radius: 20px;
`;

const BottomFace = styled.View`
  align-items: center;
  justify-content: center;
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
`;

const ThumbnailWrap = styled.View`
  width: 42px;
  height: 42px;
  overflow: hidden;
  border-radius: 6px;
  background-color: ${Colors.thumbnailOverlay};
  ${({ $index }) =>
    $index === 0 &&
    css`
      border-top-left-radius: 16px;
    `}
  ${({ $index }) =>
    $index === 1 &&
    css`
      border-top-right-radius: 16px;
    `}
    ${({ $index }) =>
    $index === 2 &&
    css`
      border-bottom-left-radius: 16px;
    `}
    ${({ $index }) =>
    $index === 3 &&
    css`
      border-bottom-right-radius: 16px;
    `}
`;

export function CollectionCard({
  thumbnails = [],
  active = true,
  inactiveOpacity = 1,
  flipped = false,
  $showBorder = true,
  onFlipSettle,
  onPress,
  disabled,
}) {
  const style = useFadeStyle(active, inactiveOpacity);
  const sliderStyle = useAnimatedTransition(
    flipped,
    { translateY: [0, -ITEM_HEIGHT] },
    {
      duration: FLIP_DURATION,
      easing: Easing.inOut(Easing.cubic),
      onSettle: onFlipSettle,
    },
  );

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={style}>
        <Card $showBorder={$showBorder}>
          <Slider style={sliderStyle}>
            <TopFace>
              {Array.from({ length: 4 }).map((_, i) => {
                const thumbnail = thumbnails[i];
                return (
                  <ThumbnailWrap key={thumbnail?.uri ?? i} $index={i}>
                    {thumbnail && <CoverImage {...thumbnail} />}
                  </ThumbnailWrap>
                );
              })}
            </TopFace>
            <BottomFace>
              <ArrowIcon rotation={-90} />
              <ThemedText type="caption">Back</ThemedText>
            </BottomFace>
          </Slider>
        </Card>
      </Animated.View>
    </Pressable>
  );
}
