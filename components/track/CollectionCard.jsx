import { CoverImage } from "@/components/image/CoverImage";
import { Colors } from "@/constants/theme";
import { CARD_THUMBNAIL_HEIGHT, ITEM_HEIGHT } from "@/constants/values";
import { useFadeStyle } from "@/hooks/useFadeStyle";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

const GRID_GAP = 5;

const Card = styled.View`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 16px;
  overflow: hidden;
  border: 5px solid ${({ $backgroundColor }) => $backgroundColor};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${GRID_GAP}px;
`;

const ThumbnailWrap = styled.View`
  width: ${CARD_THUMBNAIL_HEIGHT}px;
  height: ${CARD_THUMBNAIL_HEIGHT}px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${Colors.thumbnailOverlay};
`;

export function CollectionCard({
  thumbnails = [],
  active = true,
  inactiveOpacity = 1,
  backgroundColor = Colors.white,
  onPress,
  disabled,
}) {
  const style = useFadeStyle(active, inactiveOpacity);

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={style}>
        <Card $backgroundColor={backgroundColor}>
          {Array.from({ length: 4 }).map((_, i) => {
            const thumbnail = thumbnails[i];
            return (
              <ThumbnailWrap key={thumbnail?.uri ?? i}>
                {thumbnail && <CoverImage {...thumbnail} />}
              </ThumbnailWrap>
            );
          })}
        </Card>
      </Animated.View>
    </Pressable>
  );
}
