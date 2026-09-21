import { CoverImage } from "@/components/image/CoverImage";
import { ThemedText } from "@/components/interface/ThemedText";
import { ArrowIcon } from "@/components/interface/icons/ArrowIcon";
import { Colors } from "@/constants/theme";
import {
  CARD_THUMBNAIL_HEIGHT,
  FADE_TRANSITION_DURATION,
  ITEM_HEIGHT,
} from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { useFadeStyle } from "@/hooks/useFadeStyle";
import { Pressable } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import styled from "styled-components/native";

const GRID_GAP = 5;
const CONTENT_SIZE = ITEM_HEIGHT - 10;
const FLIP_DURATION = FADE_TRANSITION_DURATION * 2;

const Card = styled.View`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 20px;
  overflow: hidden;
  border: 5px solid ${({ $backgroundColor }) => $backgroundColor};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

const Slider = styled(Animated.View)`
  width: ${CONTENT_SIZE}px;
  height: ${CONTENT_SIZE * 2 + 5}px;
  gap: 5px;
`;

const BackFace = styled.View`
  width: ${CONTENT_SIZE}px;
  height: ${CONTENT_SIZE}px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: ${Colors.thumbnailOverlay};
`;

const ThumbnailFace = styled.View`
  width: ${CONTENT_SIZE}px;
  height: ${CONTENT_SIZE}px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${GRID_GAP}px;
`;

const ThumbnailWrap = styled.View`
  width: ${CARD_THUMBNAIL_HEIGHT}px;
  height: ${CARD_THUMBNAIL_HEIGHT}px;
  border-radius: 6px;
  overflow: hidden;
  background-color: ${Colors.thumbnailOverlay};
`;

export function CollectionCard({
  thumbnails = [],
  active = true,
  inactiveOpacity = 1,
  backgroundColor = Colors.white,
  flipped = false,
  onPress,
  disabled,
}) {
  const style = useFadeStyle(active, inactiveOpacity);
  const sliderStyle = useAnimatedTransition(
    flipped,
    { translateY: [0, -CONTENT_SIZE - 5] },
    { duration: FLIP_DURATION, easing: Easing.inOut(Easing.cubic) },
  );

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={style}>
        <Card $backgroundColor={backgroundColor}>
          <Slider style={sliderStyle}>
            <ThumbnailFace>
              {Array.from({ length: 4 }).map((_, i) => {
                const thumbnail = thumbnails[i];
                return (
                  <ThumbnailWrap key={thumbnail?.uri ?? i}>
                    {thumbnail && <CoverImage {...thumbnail} />}
                  </ThumbnailWrap>
                );
              })}
            </ThumbnailFace>
            <BackFace>
              <ArrowIcon rotation={-90} />
              <ThemedText type="caption">Back</ThemedText>
            </BackFace>
          </Slider>
        </Card>
      </Animated.View>
    </Pressable>
  );
}
