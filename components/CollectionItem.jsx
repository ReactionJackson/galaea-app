import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { Colors } from "@/constants/theme";
import {
  CARD_SHADOW_OPACITY,
  CARD_SHADOW_RADIUS,
  HERO_HEIGHT,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { memo } from "react";
import styled, { css } from "styled-components/native";
import { Gallery, getImageFocus, getImageUri } from "./gallery/Gallery";
import { ItemHero } from "./ItemHero";
import { Tags } from "./Tags";
import { ThemedText } from "./interface/ThemedText";

// The shadow lives on its own plain (non-rounded) wrapper rather than on
// Container itself. A shadow computed for a rounded-rect silhouette needs an
// off-screen alpha mask on iOS, which is expensive and, worse, can leave a
// stale rendering of itself briefly on screen after the view is removed —
// exactly what was happening here when a whole page got torn down at once.
// A plain rectangle's shadow is cheap to compute and doesn't exhibit that;
// Container's own border-radius still shapes its background, just not the
// shadow.
const ShadowWrap = styled.View`
  width: 100%;
  ${({ isMinimal }) =>
    !isMinimal &&
    css`
      shadow-color: ${Colors.black};
      shadow-offset: 0px 0px;
      shadow-opacity: 0.12;
      shadow-radius: 8px;
    `}
`;

const Container = styled.View`
  width: 100%;
  ${({ isMinimal }) =>
    !isMinimal &&
    css`
      border-radius: 30px;
      background-color: ${Colors.background};
    `}
`;

const Header = styled.View`
  width: 100%;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  overflow: hidden;
`;

const Content = styled.View`
  margin-bottom: 30px;
  ${({ isMinimal }) =>
    !isMinimal &&
    css`
      padding: 20px;
      padding-top: 15px;
      margin-bottom: 0px;
      border: 1px solid ${Colors.border};
      border-top-width: 0px;
      border-bottom-left-radius: 30px;
      border-bottom-right-radius: 30px;
      background-color: ${Colors.background};
    `}
`;

function formatEntryDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "pm" : "am";
  const hour12 = date.getHours() % 12 || 12;
  return {
    datePart: `${day} ${month} ${year}`,
    timePart: `${hour12}:${minutes}${period}`,
  };
}

export const CollectionItem = memo(function CollectionItem({
  itemId = 1,
  entryId = null,
  index,
  isMinimal = false,
  isNew = false,
  editable,
  date,
  text: textProp,
  tagIds: tagIdsProp,
  gallery: galleryProp,
  onUpdate,
}) {
  const { state, dispatch } = useApp();
  const editMode = editable ?? (isMinimal ? false : state.editMode);

  const { title, cardImage, coverImage, entries } =
    state.items.find((item) => item.itemId === itemId) ?? {};

  // Purely a display ordinal — "the Nth thing written about this item" —
  // computed fresh from current entries every render rather than stored, so
  // it can never drift out of sync. entryId itself just keeps incrementing
  // and is never reused/shown, so a gap left by a removed entry elsewhere
  // never surfaces here: this entry simply becomes "number 3" instead of
  // "number 4" once whatever was in front of it in creation order is gone.
  const sortedEntries = entries
    ? [...entries].sort((a, b) => a.entryId - b.entryId)
    : [];
  const entryIndex =
    entryId != null
      ? sortedEntries.findIndex((entry) => entry.entryId === entryId)
      : -1;
  const entryNumber =
    entryIndex !== -1 ? entryIndex + 1 : sortedEntries.length + 1;

  const {
    text: dataText = "",
    tags: dataTagIds = [],
    gallery: dataGallery = [],
  } = entries?.find((entry) => entry.entryId === entryId) ?? {};

  const text = textProp ?? dataText;
  const tagIds = tagIdsProp ?? dataTagIds;
  const gallery = galleryProp ?? dataGallery;

  const updateItem = (changes) =>
    onUpdate
      ? onUpdate(changes)
      : dispatch({ type: "UPDATE_ITEM", index, changes });

  const { datePart, timePart } = date ? formatEntryDate(date) : {};

  const handleToggleTag = (tagId) => {
    const next = tagIds.includes(tagId)
      ? tagIds.filter((id) => id !== tagId)
      : [...tagIds, tagId];
    updateItem({ tags: next });
  };

  const handleAddImage = (item) => {
    updateItem({ gallery: [...gallery, item] });
  };

  const handleUpdateImage = (imageIndex, item) => {
    updateItem({
      gallery: gallery.map((existing, i) =>
        i === imageIndex ? item : existing,
      ),
    });
  };

  const handleDeleteImage = (imageIndex) => {
    updateItem({ gallery: gallery.filter((_, i) => i !== imageIndex) });
  };

  const handleReorderImages = (fromIndex, toIndex) => {
    const next = [...gallery];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    updateItem({ gallery: next });
  };

  return (
    <ShadowWrap isMinimal={isMinimal}>
      <Container isMinimal={isMinimal}>
        {!isMinimal && (
          <Header>
            <ItemHero
              height={HERO_HEIGHT}
              spacing={15}
              cardImage={cardImage}
              coverImage={getImageUri(coverImage)}
              coverFocus={getImageFocus(coverImage)}
              animateCoverReveal={isNew}
              nestedInCard
              shadowRadius={CARD_SHADOW_RADIUS}
              shadowOpacity={CARD_SHADOW_OPACITY}
            />
          </Header>
        )}
        <Content isMinimal={isMinimal}>
          {!isMinimal ? (
            <>
              <ThemedText type="title" style={{ marginBottom: 10 }}>
                {title}
              </ThemedText>
              <ThemedText
                type="subtitle"
                color="text"
                style={{ marginBottom: 5 }}
              >
                Entry {String(entryNumber).padStart(2, "0")}
              </ThemedText>
            </>
          ) : (
            <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
              {datePart}
              <ThemedText type="subtitle" color="faded">
                {" "}
                {timePart}
              </ThemedText>
            </ThemedText>
          )}
          <AnimateHeight visible={!!(text || editMode)}>
            <ThemedText
              isInput
              multiline={true}
              value={text}
              placeholder="Write something about this..."
              onChangeText={(t) => updateItem({ text: t })}
              editable={editMode}
            />
          </AnimateHeight>
          <AnimatedSpacer
            height={15}
            visible={!!((text && gallery.length) || editMode)}
          />
          <AnimateHeight
            visible={!!(gallery.length || editMode)}
            style={{ marginHorizontal: -20 }}
          >
            <Gallery
              images={gallery}
              editMode={editMode}
              onAddImage={handleAddImage}
              onUpdateImage={handleUpdateImage}
              onDeleteImage={handleDeleteImage}
              onReorderImages={handleReorderImages}
              horizontalPadding={isMinimal ? 40 : undefined}
            />
          </AnimateHeight>
          <Tags
            tagIds={tagIds}
            editMode={editMode}
            onToggleTag={handleToggleTag}
          />
        </Content>
      </Container>
    </ShadowWrap>
  );
});
