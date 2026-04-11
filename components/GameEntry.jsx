import { AnimatedSpacer, AnimateHeight } from "@/components/AnimateHeight";
import { Colors } from "@/constants/theme";
import { gamesData } from "@/data/entries";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import styled from "styled-components/native";
import { Gallery } from "./Gallery";
import { Tags } from "./Tags";
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

export const GameEntry = memo(function GameEntry({
  gameId = 1,
  entryId = null,
  editMode = false,
  text: textProp,
  onChangeText,
}) {
  const { title, platform, genre, cover, entries } = gamesData.find(
    (game) => game.gameId === gameId,
  );

  // For existing entries, entryId is the sequential index already;
  // for new entries (null), it's total historical count + 1.
  const entryNumber = entryId ?? entries.length + 1;

  const {
    text: dataText = "",
    tags = [],
    gallery = [],
  } = entries.find((entry) => entry.entryId === entryId) ?? {};

  // Controlled when parent passes text explicitly (after first edit),
  // otherwise fall back to the static gamesData value.
  const text = textProp ?? dataText;

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
        <AnimateHeight visible={!!(gallery.length || editMode)}>
          <Gallery images={gallery} editMode={editMode} />
        </AnimateHeight>
        <AnimatedSpacer visible={!!(gallery.length || editMode)} />
        <AnimateHeight visible={!!(text || editMode)}>
          <ThemedText type="subtitle" color="text" style={{ marginBottom: 10 }}>
            Entry {String(entryNumber).padStart(2, "0")}
          </ThemedText>
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
        <Tags tagIds={tags} editMode={editMode} />
        <AnimatedSpacer visible={!!(tags.length || editMode)} />
      </Content>
    </Container>
  );
});
