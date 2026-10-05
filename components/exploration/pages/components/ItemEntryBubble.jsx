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
import { usePage } from "@/context/PageContext";
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
  const { getById } = usePage();
  const { images: { cardId, coverId } = {} } = getById("items", itemId) ?? {};

  return (
    <ItemHero
      cardId={cardId}
      coverId={coverId}
      height={HERO_HEIGHT}
      shadowRadius={CARD_SHADOW_RADIUS}
      shadowOpacity={CARD_SHADOW_OPACITY}
    />
  );
};

const EntryHeading = ({ itemId, entryId }) => {
  const { getById, collectionIdByItemId, entryNumberById } = usePage();
  const { title: itemTitle } = getById("items", itemId) ?? {};
  const { title: collectionTitle } =
    getById("collections", collectionIdByItemId[itemId]) ?? {};

  return (
    <HeaderText>
      <HeaderText.Title>{itemTitle}</HeaderText.Title>
      <HeaderText.Subtitle>{collectionTitle}</HeaderText.Subtitle>
      <HeaderText.SubtitleFaded>
        Entry {String(entryNumberById[entryId]).padStart(2, "0")}
      </HeaderText.SubtitleFaded>
    </HeaderText>
  );
};

// Main Component:

export const ItemEntryBubble = ({ entryId }) => {
  const { isEditing, getById } = usePage();
  const { text, tagIds, galleryId, parents } =
    getById("entries", entryId) ?? {};

  return (
    <>
      <Shadow>
        <Container>
          <EntryHero itemId={parents.itemId} />
          <Content>
            <EntryHeading itemId={parents.itemId} entryId={entryId} />
            <Spacer isVisible height={10} />
            <MultilineText>{text}</MultilineText>
            <Spacer
              isVisible={
                isEditing ||
                (!!text && !!galleryId) ||
                (!!text && !!tagIds.length)
              }
              height={15}
            />
            <Gallery galleryId={galleryId} />
            <Spacer
              isVisible={isEditing || (!!galleryId && !!tagIds.length)}
              height={15}
            />
            <Tags parent={{ key: "entries", id: entryId }} tagIds={tagIds} />
          </Content>
        </Container>
      </Shadow>
      <Spacer isVisible height={20} />
    </>
  );
};
