import { CoverImage } from "@/components/image/CoverImage";
import { Image } from "@/components/image/Image";
import { BlurView } from "@/components/interface/BlurView";
import { HeaderText } from "@/components/interface/HeaderText";
import { CrossIcon } from "@/components/interface/icons/CrossIcon";
import { Colors } from "@/constants/theme";
import { useMemo } from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";

export const ROW_HEIGHT = 70;
const BADGE_SIZE = ROW_HEIGHT - 16;

const Container = styled(BlurView)`
  width: 100%;
  height: ${ROW_HEIGHT}px;
  flex-direction: row;
  align-items: center;
  padding: 0 6px;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid ${Colors.buttonBorder};
`;

const CoverFill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Placeholder = styled.View`
  width: 100%;
  height: ${ROW_HEIGHT}px;
  border-radius: 15px;
  border: 2px solid ${Colors.emptySlotBackground};
`;

const AddContainer = styled.View`
  height: ${ROW_HEIGHT}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  border: 2px solid ${Colors.buttonBorder};
`;

export function AddBubble({ onPress }) {
  return (
    <Pressable onPress={onPress}>
      <AddContainer>
        <CrossIcon size={16} color={Colors.black} />
      </AddContainer>
    </Pressable>
  );
}

export function OverviewItemsBubble({ item, onPress }) {
  const { title, cardThumbnail, coverImage, entries = [] } = item;
  const entryCount = entries.length;
  const imageCount = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.gallery?.length ?? 0), 0),
    [entries],
  );

  return (
    <Pressable onPress={() => onPress?.(item)}>
      <Container intensity={30}>
        <HeaderText>
          <HeaderText.Badge shape="image" size={BADGE_SIZE}>
            {coverImage && (
              <CoverFill>
                <CoverImage {...coverImage} addOverlay />
              </CoverFill>
            )}
            {cardThumbnail && (
              <Image
                {...cardThumbnail}
                width={BADGE_SIZE - 12}
                height={BADGE_SIZE - 12}
                radius={4}
                contentFit="cover"
              />
            )}
          </HeaderText.Badge>
          <HeaderText.Title numberOfLines={1} ellipsizeMode="tail">
            {title}
          </HeaderText.Title>
          <HeaderText.Subtitle>
            {String(entryCount).padStart(2, "0")} Entries
          </HeaderText.Subtitle>
          <HeaderText.SubtitleFaded>
            {String(imageCount).padStart(2, "0")} Images
          </HeaderText.SubtitleFaded>
        </HeaderText>
      </Container>
    </Pressable>
  );
}
