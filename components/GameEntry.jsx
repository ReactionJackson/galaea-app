import {
  AnimatedSpacer,
  AnimateHeight,
} from "@/components/interface/AnimateHeight";
import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import { View } from "react-native";
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
  height: 80px;
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
  ${({ isMinimal }) =>
    !isMinimal &&
    css`
      padding: 20px;
      padding-bottom: 0px;
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

export const GameEntry = memo(function GameEntry({
  games = [],
  gameId = 1,
  entryId = null,
  editMode = false,
  isMinimal = false,
  date,
  text: textProp,
  tagIds: tagIdsProp,
  tags: allTags = [],
  gallery: galleryProp,
  onChangeText,
  onChangeTags,
  onChangeGallery,
  onAddTag,
  onUpdateTagColor,
  onReplaceTag,
}) {
  const { title, platform, genre, cover, entries } =
    games.find((game) => game.gameId === gameId) ?? {};

  const entryNumber = entryId ?? (entries?.length ?? 0) + 1;

  const {
    text: dataText = "",
    tags: dataTagIds = [],
    gallery: dataGallery = [],
  } = entries?.find((entry) => entry.entryId === entryId) ?? {};

  const text = textProp ?? dataText;
  const tagIds = tagIdsProp ?? dataTagIds;
  const gallery = galleryProp ?? dataGallery;

  const { datePart, timePart } = date ? formatEntryDate(date) : {};
  const label =
    isMinimal && date ? (
      <ThemedText type="subtitle">
        {datePart}
        <ThemedText type="subtitle" color="faded">
          {" "}
          {timePart}
        </ThemedText>
      </ThemedText>
    ) : (
      <ThemedText type="subtitle" color="text">
        Entry {String(entryNumber).padStart(2, "0")}
      </ThemedText>
    );

  const handleToggleTag = (tagId) => {
    const next = tagIds.includes(tagId)
      ? tagIds.filter((id) => id !== tagId)
      : [...tagIds, tagId];
    onChangeTags?.(next);
  };

  const handleAddImage = (item) => {
    onChangeGallery?.([...gallery, item]);
  };

  const handleUpdateImage = (index, focus) => {
    onChangeGallery?.(
      gallery.map((item, i) => {
        if (i !== index) return item;
        const uri = getImageUri(item);
        return focus ? { uri, focus } : uri;
      }),
    );
  };

  return (
    <Container isMinimal={isMinimal}>
      {!isMinimal && (
        <Header>
          <HeaderBackground
            contentFit="cover"
            source={{
              uri: cover,
            }}
          />
          <ThemedText type="title-small" color="white">
            {title}
          </ThemedText>
          <ThemedText type="subtitle" color="white" style={{ opacity: 1 }}>
            {platform} / {genre}
          </ThemedText>
        </Header>
      )}
      <Content isMinimal={isMinimal}>
        <AnimateHeight
          visible={!!(gallery.length || editMode)}
          style={{ marginHorizontal: -20 }}
        >
          <Gallery
            images={gallery}
            editMode={editMode}
            onAddImage={handleAddImage}
            onUpdateImage={handleUpdateImage}
            horizontalPadding={isMinimal ? 40 : undefined}
          />
        </AnimateHeight>
        <AnimatedSpacer visible={!!(gallery.length || editMode)} />
        <AnimateHeight visible={!!(text || editMode)}>
          <View style={{ marginBottom: 10 }}>{label}</View>
          <ThemedText
            isInput
            multiline={true}
            value={text}
            placeholder="Write something about this game..."
            onChangeText={onChangeText}
            editable={editMode}
          />
        </AnimateHeight>
        <AnimatedSpacer visible={!!(text || editMode)} />
        <Tags
          tagIds={tagIds}
          tags={allTags}
          editMode={editMode}
          onToggleTag={handleToggleTag}
          onAddTag={onAddTag}
          onUpdateTagColor={onUpdateTagColor}
          onReplaceTag={onReplaceTag}
        />
        <AnimatedSpacer visible={!!(tagIds.length || editMode)} />
      </Content>
    </Container>
  );
});
