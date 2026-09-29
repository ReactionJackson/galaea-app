import { Gallery } from "@/components/gallery/Gallery";
import { AnimateHeight } from "@/components/interface/AnimateHeight";
import { HeaderText } from "@/components/interface/HeaderText";
import { Spacer } from "@/components/interface/Spacer";
import { ThemedText } from "@/components/interface/ThemedText";
import { Tags } from "@/components/tags/Tags";
import { Colors } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  HERO_HEIGHT,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import styled from "styled-components/native";
import { ItemHero } from "./ItemHero";

const Shadow = styled.View`
  width: 100%;
  shadow-color: ${Colors.black};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
`;

const Container = styled.View`
  width: 100%;
  border-radius: 30px;
  overflow: hidden;
  background-color: ${Colors.background};
`;

const Content = styled.View`
  padding: 20px;
  padding-top: 15px;
  border: 1px solid ${Colors.border};
  border-top-width: 0px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  background-color: ${Colors.background};
`;

export const ItemEntryBubble = ({
  text,
  tags,
  gallery,
  parents,
  draft,
  isVisible = true,
  gap = 20,
}) => {
  const { getById, collectionIdByItemId } = useApp();
  const { title: itemTitle, images: { card, cover } = {} } =
    getById("items", parents.item) ?? {};
  const { title: collectionTitle } =
    getById("collections", collectionIdByItemId[parents.item]) ?? {};

  return (
    <AnimateHeight isVisible={isVisible} gap={gap}>
      <Shadow>
        <Container>
          <ItemHero
            cardId={card}
            coverId={cover}
            height={HERO_HEIGHT}
            shadowRadius={CARD_SHADOW_RADIUS}
            shadowOpacity={CARD_SHADOW_OPACITY}
          />
          <Content>
            <HeaderText>
              <HeaderText.Title>{itemTitle}</HeaderText.Title>
              <HeaderText.Subtitle>{collectionTitle}</HeaderText.Subtitle>
              <HeaderText.SubtitleFaded>Entry X</HeaderText.SubtitleFaded>
            </HeaderText>
            <Spacer isVisible={!!text} height={10} />
            <ThemedText
              isInput
              multiline={true}
              placeholder="Write something about this..."
              onChangeText={() => {}}
              isVisible={!!text}
              gap={15}
            >
              {text}
            </ThemedText>
            <Gallery gallery={gallery} isVisible={!!gallery} gap={15} />
            <Tags tagIds={tags} isVisible={!!tags} />
          </Content>
        </Container>
      </Shadow>
    </AnimateHeight>
  );
};
