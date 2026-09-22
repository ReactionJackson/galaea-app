import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  HERO_HEIGHT,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { memo } from "react";
import styled from "styled-components/native";
import { ItemHero } from "./ItemHero";
import { EntryFields } from "./shared";

const ShadowWrap = styled.View`
  width: 100%;
  shadow-color: ${Colors.black};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
`;

const Container = styled.View`
  width: 100%;
  border-radius: 30px;
  background-color: ${Colors.background};
`;

const Header = styled.View`
  width: 100%;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  overflow: hidden;
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

const TitleContainer = styled.View`
  margin: 0 0 5px -2px;
`;

const Labels = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
`;

export const ItemEntryBubble = memo(function ItemEntryBubble({
  itemId = 1,
  entryId = null,
  index,
  isNew = false,
  editable,
  text: textProp,
  tagIds: tagIdsProp,
  gallery: galleryProp,
}) {
  const { state, dispatch, itemsById } = useApp();
  const editMode = editable ?? state.editMode;

  const item = itemsById[itemId];
  const { title, cardImage, coverImage, collectionId } = item ?? {};
  const collectionName =
    state.collections.find((c) => c.collectionId === collectionId)?.name ?? "";
  const resolvedEntry = entryId != null ? item?.entriesById[entryId] : null;
  const entryNumber = resolvedEntry?.entryNumber ?? (item?.entryCount ?? 0) + 1;

  const {
    text: dataText = "",
    tags: dataTagIds = [],
    gallery: dataGallery = [],
  } = resolvedEntry ?? {};

  const text = textProp ?? dataText;
  const tagIds = tagIdsProp ?? dataTagIds;
  const gallery = galleryProp ?? dataGallery;

  const updateItem = (changes) =>
    dispatch({ type: "UPDATE_ITEM", index, changes });

  return (
    <ShadowWrap>
      <Container>
        <Header>
          <ItemHero
            height={HERO_HEIGHT}
            spacing={15}
            cardImage={cardImage}
            coverImage={coverImage}
            animateCoverReveal={isNew}
            nestedInCard
            shadowRadius={CARD_SHADOW_RADIUS}
            shadowOpacity={CARD_SHADOW_OPACITY}
          />
        </Header>
        <Content>
          <TitleContainer>
            <ThemedText type="title">{title}</ThemedText>
          </TitleContainer>
          <Labels>
            <ThemedText type="subtitle">{collectionName}</ThemedText>
            <ThemedText type="subtitle" color="faded">
              Entry {String(entryNumber).padStart(2, "0")}
            </ThemedText>
          </Labels>
          <EntryFields
            text={text}
            tagIds={tagIds}
            gallery={gallery}
            editable={editMode}
            onUpdate={updateItem}
          />
        </Content>
      </Container>
    </ShadowWrap>
  );
});
