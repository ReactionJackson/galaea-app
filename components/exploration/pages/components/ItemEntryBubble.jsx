import { Gallery } from "@/components/gallery/Gallery";
import { HeaderText } from "@/components/interface/HeaderText";
import { MultilineText } from "@/components/interface/MultilineText";
import { Spacer } from "@/components/interface/Spacer";
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

// Sub Components:

const EntryHero = ({ itemId }) => {
  const { getById } = useApp();
  const { images: { card, cover } = {} } = getById("items", itemId) ?? {};

  return (
    <ItemHero
      cardId={card}
      coverId={cover}
      height={HERO_HEIGHT}
      shadowRadius={CARD_SHADOW_RADIUS}
      shadowOpacity={CARD_SHADOW_OPACITY}
    />
  );
};

const EntryHeading = ({ itemId }) => {
  const { getById, getCollectionByItemId } = useApp();
  const { title: itemTitle } = getById("items", itemId) ?? {};
  const { title: collectionTitle } = getCollectionByItemId(itemId) ?? {};

  return (
    <HeaderText>
      <HeaderText.Title>{itemTitle}</HeaderText.Title>
      <HeaderText.Subtitle>{collectionTitle}</HeaderText.Subtitle>
      <HeaderText.SubtitleFaded>Entry X</HeaderText.SubtitleFaded>
    </HeaderText>
  );
};

// Main Component:

export const ItemEntryBubble = ({ text, tags, gallery, parents }) => {
  const { isEditing } = useApp();

  return (
    <Shadow>
      <Container>
        <EntryHero itemId={parents.item} />
        <Content>
          <EntryHeading itemId={parents.item} />
          <MultilineText isVisible={!!text}>
            {text}
          </MultilineText>
          <Spacer isVisible={!gallery && !!tags.length} height={15} />
          <Gallery galleryId={gallery} />
          <Spacer
            isVisible={isEditing || (!!gallery && !!tags.length)}
            height={15}
          />
          <Tags tagIds={tags} />
        </Content>
      </Container>
    </Shadow>
  );
};
