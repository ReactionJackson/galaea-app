import { GameArt } from "@/components/GameArt";
import { GameEntry } from "@/components/GameEntry";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { CollectionTrack } from "@/components/track/CollectionTrack";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const InfoColumn = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: -4px;
  margin-bottom: 10px;
`;

const GameMeta = styled.View`
  flex-direction: row;
  gap: 5px;
  margin-top: 3px;
`;

async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
  });
  if (result.canceled) return null;
  return result.assets?.[0]?.uri ?? null;
}

export default function CollectionScreen() {
  const { state, dispatch } = useApp();
  const { games, gameDraft, editingGameId } = state;
  const editMode = !!gameDraft;

  const [activeGameId, setActiveGameId] = useState(
    games[games.length - 1]?.gameId,
  );

  const activeGame = games.find((g) => g.gameId === activeGameId);
  const displayGame = gameDraft ?? activeGame;
  const orderedEntries = displayGame
    ? [...displayGame.entries].sort((a, b) => a.entryId - b.entryId)
    : [];

  const updateDraft = (changes) =>
    dispatch({ type: "UPDATE_GAME_DRAFT", changes });

  const handleAddGame = () =>
    dispatch({ type: "ENTER_GAME_EDIT", gameId: null });

  const handleCancelAddGame = () => dispatch({ type: "CANCEL_GAME_EDIT" });

  const handlePressActiveGame = (gameId) => {
    if (editMode && editingGameId === gameId) {
      dispatch({ type: "CANCEL_GAME_EDIT" });
    } else {
      dispatch({ type: "ENTER_GAME_EDIT", gameId });
    }
  };

  const handleSave = () => {
    if (!editMode) return;
    const isNew = editingGameId == null;
    const gameId = isNew
      ? Math.max(0, ...games.map((g) => g.gameId)) + 1
      : editingGameId;
    dispatch({ type: "SAVE_GAME_EDIT", gameId });
    if (isNew) setActiveGameId(gameId);
  };

  const handlePickBoxArt = async () => {
    const uri = await pickImage();
    if (uri) updateDraft({ boxArt: uri });
  };

  const handlePickCover = async () => {
    const uri = await pickImage();
    if (uri) updateDraft({ cover: uri });
  };

  if (!displayGame) return <Container />;

  return (
    <Container>
      <PageScroll
        resetKey={editMode ? (editingGameId ?? "new-game") : activeGameId}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
      >
        <GameArt
          boxArt={displayGame.boxArt}
          cover={displayGame.cover}
          editable={editMode}
          onPressBoxArt={handlePickBoxArt}
          onPressCover={handlePickCover}
        />

        <PageHeader>
          <InfoColumn>
            <ThemedText
              type="title"
              isInput
              value={displayGame.title}
              placeholder="New Game"
              onChangeText={(title) => updateDraft({ title })}
              editable={editMode}
            />
            <GameMeta>
              <ThemedText
                type="subtitle"
                color={displayGame.entries.length === 0 ? "faded" : ""}
              >
                {displayGame.entries.length === 0
                  ? "No"
                  : String(displayGame.entries.length).padStart(2, "0")}{" "}
                {displayGame.entries.length === 1 ? "Entry" : "Entries"}
              </ThemedText>
            </GameMeta>
          </InfoColumn>
        </PageHeader>

        {orderedEntries.map((entry) => (
          <GameEntry
            key={entry.entryId}
            isMinimal
            editable={editMode}
            entryId={entry.entryId}
            date={entry.date}
            text={entry.text}
            tagIds={entry.tags}
            gallery={entry.gallery}
            onUpdate={(changes) =>
              dispatch({
                type: "UPDATE_GAME_DRAFT_ENTRY",
                entryId: entry.entryId,
                changes,
              })
            }
          />
        ))}
      </PageScroll>

      <CollectionTrack
        editMode={editMode}
        onChangeGame={setActiveGameId}
        onPressActiveGame={handlePressActiveGame}
        onAddGame={handleAddGame}
        onCancelAddGame={handleCancelAddGame}
        onSave={handleSave}
      />
    </Container>
  );
}
