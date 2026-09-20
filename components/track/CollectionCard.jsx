import { CoverImage } from "@/components/image/CoverImage";
import { Colors, cardShadow } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  CARD_THUMBNAIL_HEIGHT,
  ITEM_HEIGHT,
} from "@/constants/values";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";
import { useFadeStyle } from "./ItemCard";

const GRID_GAP = 5;
const THUMBNAIL_RADIUS = 6;

const Card = styled.View`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  background-color: ${Colors.white};
  padding: ${GRID_GAP}px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${GRID_GAP}px;
  ${cardShadow(CARD_SHADOW_RADIUS, CARD_SHADOW_OPACITY)}
`;

const ThumbnailWrap = styled.View`
  width: ${CARD_THUMBNAIL_HEIGHT}px;
  height: ${CARD_THUMBNAIL_HEIGHT}px;
  border-radius: ${THUMBNAIL_RADIUS}px;
  overflow: hidden;
`;

export function CollectionCard({
  thumbnails = [],
  active = true,
  inactiveOpacity = 1,
  onPress,
  disabled,
}) {
  const style = useFadeStyle(active, inactiveOpacity);

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View style={style}>
        <Card>
          {thumbnails.slice(0, 4).map((thumbnail, i) => (
            <ThumbnailWrap key={thumbnail.uri ?? i}>
              <CoverImage {...thumbnail} />
            </ThumbnailWrap>
          ))}
        </Card>
      </Animated.View>
    </Pressable>
  );
}
