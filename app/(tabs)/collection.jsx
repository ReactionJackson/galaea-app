import { CollectionTrack } from "@/components/CollectionTrack";
import { PageHeader } from "@/components/PageHeader";
import { PageScroll } from "@/components/PageScroll";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { gamesData } from "@/data/entries";
import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

// Temporary — just here so there's enough vertical content to confirm the
// track keeps working correctly while this area scrolls. Remove once real
// per-game content replaces it.
const CoverBlock = styled.View`
  width: 100%;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 16px;
`;

const CoverImage = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

export default function CollectionScreen() {
  const [activeGameId, setActiveGameId] = useState(gamesData[gamesData.length - 1]?.gameId);
  const [addMode, setAddMode] = useState(false);

  const activeGame = gamesData.find((g) => g.gameId === activeGameId);

  const handleSave = () => {
    // Nothing to persist yet — add-game itself isn't built out. This just
    // closes the panel the same way Save does in the journal view.
    setAddMode(false);
  };

  return (
    <Container>
      <PageHeader>
        <ThemedText type="title">
          {addMode ? "New Game" : activeGame?.title}
        </ThemedText>
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
          activeGame?.cover &&
          Array.from({ length: 6 }).map((_, i) => (
            <CoverBlock key={i}>
              <CoverImage source={{ uri: activeGame.cover }} contentFit="cover" />
            </CoverBlock>
          ))}
      </PageScroll>

      <CollectionTrack
        games={gamesData}
        editMode={addMode}
        onChangeGame={setActiveGameId}
        onAddGame={() => setAddMode(true)}
        onCancelAddGame={() => setAddMode(false)}
        onSave={handleSave}
      />
    </Container>
  );
}
