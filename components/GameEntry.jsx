import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import styled from "styled-components/native";
import { EntryContent } from "./EntryContent";
import { ThemedText } from "./ThemedText";

const Container = styled.View`
  width: 100%;
  border-radius: 15px;
  background-color: ${Colors.background};
  shadow-color: ${Colors.black};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
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
  padding: 20px;
  padding-bottom: 0px;
  border: 1px solid ${Colors.border};
  border-top-width: 0px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  background-color: ${Colors.background};
`;

// games is the live games store (JournalContext's state.games), passed down
// rather than imported statically — its entries can change at runtime (see
// JournalContext's SAVE_EDIT), so this always needs the current copy rather
// than the seed data snapshot.
export const GameEntry = memo(function GameEntry({
  games = [],
  gameId = 1,
  entryId = null,
  editMode = false,
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

  // For existing entries, entryId is the sequential index already;
  // for new entries (null), it's total historical count + 1.
  const entryNumber = entryId ?? (entries?.length ?? 0) + 1;

  const {
    text: dataText = "",
    tags: dataTagIds = [],
    gallery: dataGallery = [],
  } = entries?.find((entry) => entry.entryId === entryId) ?? {};

  // Controlled when parent passes text/tags/gallery explicitly (after first
  // edit), otherwise fall back to the live games-store value.
  const text = textProp ?? dataText;
  const tagIds = tagIdsProp ?? dataTagIds;
  const gallery = galleryProp ?? dataGallery;

  return (
    <Container>
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

      <Content>
        <EntryContent
          entryNumber={entryNumber}
          editMode={editMode}
          text={text}
          tagIds={tagIds}
          tags={allTags}
          gallery={gallery}
          onChangeText={onChangeText}
          onChangeTags={onChangeTags}
          onChangeGallery={onChangeGallery}
          onAddTag={onAddTag}
          onUpdateTagColor={onUpdateTagColor}
          onReplaceTag={onReplaceTag}
        />
      </Content>
    </Container>
  );
});
