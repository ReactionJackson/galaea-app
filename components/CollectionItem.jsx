import {
  AnimatedSpacer,
  AnimateHeight,
} from "@/components/interface/AnimateHeight";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import styled, { css } from "styled-components/native";
import { Gallery, getImageUri } from "./Gallery";
import { Tags } from "./Tags";
import { ThemedText } from "./interface/ThemedText";

const Container = styled.View`
  width: 100%;
  ${({ isMinimal }) =>
    !isMinimal &&
    css`
      border-radius: 15px;
      background-color: ${Colors.background};
      shadow-color: ${Colors.black};
      shadow-offset: 0px 0px;
      shadow-opacity: 0.12;
      shadow-radius: 8px;
    `}
`;

const Header = styled.View`
  position: relative;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 120px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: ${Colors.black};
  overflow: hidden;
`;

const HeaderBackground = styled(ExpoImage)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 0.65;
`;

const Content = styled.View`
  margin-bottom: 30px;
  ${({ isMinimal }) =>
    !isMinimal &&
    css`
      padding: 20px;
      margin-bottom: 0px;
      border: 1px solid ${Colors.border};
      border-top-width: 0px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
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
  editable,
  date,
  text: textProp,
  tagIds: tagIdsProp,
  gallery: galleryProp,
  onUpdate,
}) {
  const { state, dispatch } = useApp();
  const editMode = editable ?? (isMinimal ? false : state.editMode);

  const { title, coverImage, entries } =
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

  const handleUpdateImage = (imageIndex, focus) => {
    updateItem({
      gallery: gallery.map((item, i) => {
        if (i !== imageIndex) return item;
        const uri = getImageUri(item);
        return focus ? { uri, focus } : uri;
      }),
    });
  };

  const handleDeleteImage = (imageIndex) => {
    updateItem({ gallery: gallery.filter((_, i) => i !== imageIndex) });
  };

  return (
    <Container isMinimal={isMinimal}>
      {!isMinimal && (
        <Header>
          <HeaderBackground
            contentFit="cover"
            source={{
              uri: coverImage,
            }}
          />
          <ThemedText type="title" color="white">
            {title}
          </ThemedText>
        </Header>
      )}
      <Content isMinimal={isMinimal}>
        {Boolean(isMinimal && date) && (
          <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
            {datePart}
            <ThemedText type="subtitle" color="faded">
              {" "}
              {timePart}
            </ThemedText>
          </ThemedText>
        )}
        <AnimatedSpacer
          height={isMinimal ? 10 : 0}
          visible={!!(gallery.length || editMode)}
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
            horizontalPadding={isMinimal ? 40 : undefined}
          />
        </AnimateHeight>
        <AnimatedSpacer
          height={!isMinimal ? 20 : 10}
          visible={!!(gallery.length || editMode)}
        />
        {!isMinimal && (
          <ThemedText type="subtitle" color="text">
            Entry {String(entryNumber).padStart(2, "0")}
          </ThemedText>
        )}
        <AnimateHeight visible={!!(text || editMode)}>
          {!isMinimal && (
            <AnimatedSpacer height={5} visible={!!(text || editMode)} />
          )}
          <ThemedText
            isInput
            multiline={true}
            value={text}
            placeholder="Write something about this..."
            onChangeText={(t) => updateItem({ text: t })}
            editable={editMode}
          />
        </AnimateHeight>
        <AnimatedSpacer height={15} visible={!!(tagIds.length || editMode)} />
        <Tags
          tagIds={tagIds}
          editMode={editMode}
          onToggleTag={handleToggleTag}
        />
      </Content>
    </Container>
  );
});
