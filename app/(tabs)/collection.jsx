import { CollectionEntry } from "@/components/CollectionEntry";
import { CollectionTrack } from "@/components/CollectionTrack";
import { PageHeader } from "@/components/PageHeader";
import { PageScroll } from "@/components/PageScroll";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useJournal } from "@/context/JournalContext";
import { useState } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const InfoColumn = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const GameMeta = styled.View`
  flex-direction: row;
  gap: 5px;
  margin: 3px 0 -2px 0;
`;

export default function CollectionScreen() {
  // Same context journal.jsx reads from (provided once, in the tab layout)
  // — games/entries and tags are the shared live store, not a static import,
  // so a journal edit shows up here without a reload.
  const { state } = useJournal();
  const games = state.games;

  const [activeGameId, setActiveGameId] = useState(
    games[games.length - 1]?.gameId,
  );
  const [addMode, setAddMode] = useState(false);

  const activeGame = games.find((g) => g.gameId === activeGameId);
  // A game's page shows every entry ever written for it, oldest first —
  // distinct from the journal view, which only ever shows the one entry
  // made on that particular day.
  const orderedEntries = activeGame
    ? [...activeGame.entries].sort((a, b) => a.entryId - b.entryId)
    : [];

  const handleSave = () => {
    // Nothing to persist yet — add-game itself isn't built out. This just
    // closes the panel the same way Save does in the journal view.
    setAddMode(false);
  };

  return (
    <Container>
      <PageHeader>
        <InfoColumn>
          {!addMode && activeGame && (
            <GameMeta>
              <ThemedText type="subtitle">{activeGame.platform}</ThemedText>
              <ThemedText type="subtitle" color="faded">
                {activeGame.genre}
              </ThemedText>
            </GameMeta>
          )}
          <ThemedText type="title">
            {addMode ? "New Game" : activeGame?.title}
          </ThemedText>
        </InfoColumn>
      </PageHeader>

      <PageScroll
        resetKey={addMode ? "new-game" : activeGameId}
        contentContainerStyle={{
          paddingTop: 70,
          paddingBottom: 130,
          paddingHorizontal: 20,
        }}
      >
        {!addMode &&
          orderedEntries.map((entry) => (
            <CollectionEntry
              key={entry.entryId}
              entryId={entry.entryId}
              text={entry.text}
              tagIds={entry.tags}
              tags={state.tags}
              gallery={entry.gallery}
            />
          ))}
      </PageScroll>

      <CollectionTrack
        games={games}
        editMode={addMode}
        onChangeGame={setActiveGameId}
        onAddGame={() => setAddMode(true)}
        onCancelAddGame={() => setAddMode(false)}
        onSave={handleSave}
      />
    </Container>
  );
}
