import { CoverImage } from "@/components/image/CoverImage";
import { Image } from "@/components/image/Image";
import { ThemedText } from "@/components/interface/ThemedText";
import { CrossIcon } from "@/components/interface/icons/CrossIcon";
import { Colors } from "@/constants/theme";
import { useMemo } from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";

export const ROW_HEIGHT = 70;
const HERO_PADDING = 12;

const Container = styled.View`
  width: 100%;
  height: ${ROW_HEIGHT}px;
  flex-direction: row;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${Colors.overlayBorder};
`;

const HeroWrap = styled.View`
  width: 20%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.surfaceTint};
`;

const CoverFill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Content = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 0 15px;
  border: 2px solid ${Colors.buttonBorder};
  border-left-width: 0;
  border-radius: 0 15px 15px 0;
`;

const Title = styled(ThemedText)`
  margin: -5px 0 -2px -2px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  gap: 5px;
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
      <Container>
        <HeroWrap>
          {coverImage && (
            <CoverFill>
              <CoverImage {...coverImage} addOverlay />
            </CoverFill>
          )}
          {cardThumbnail && (
            <Image
              {...cardThumbnail}
              height={ROW_HEIGHT - HERO_PADDING * 2}
              radius={8}
            />
          )}
        </HeroWrap>
        <Content>
          <Title type="title" numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Title>
          <StatsRow>
            <ThemedText type="subtitle">
              {String(entryCount).padStart(2, "0")} Entries
            </ThemedText>
            <ThemedText type="subtitle" color="faded">
              {String(imageCount).padStart(2, "0")} Images
            </ThemedText>
          </StatsRow>
        </Content>
      </Container>
    </Pressable>
  );
}
