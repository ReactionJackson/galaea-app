import { GameEntry } from "@/components/GameEntry";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { CollectionTrack } from "@/components/track/CollectionTrack";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
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
  const { state } = useApp();
  const games = state.games;

  const [activeGameId, setActiveGameId] = useState(
    games[games.length - 1]?.gameId,
  );
  const [addMode, setAddMode] = useState(false);

  const activeGame = games.find((g) => g.gameId === activeGameId);
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

      <PageScroll resetKey={addMode ? "new-game" : activeGameId}>
        {!addMode &&
          orderedEntries.map((entry) => (
            <GameEntry
              key={entry.entryId}
              isMinimal
              entryId={entry.entryId}
              date={entry.date}
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
