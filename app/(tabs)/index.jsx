import { BlurView } from "@/components/BlurView";
import { GameEntry } from "@/components/GameEntry";
import { JournalTrack } from "@/components/JournalTrack";
import { Tags } from "@/components/Tags";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { daysData } from "@/data/entries";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const Container = styled.SafeAreaView`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: ${Colors.background};
`;

const TopBar = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 20px;
  background-color: ${Colors.background};
  shadow-color: ${Colors.black};
  shadow-offset: 0px 5px;
  shadow-opacity: 0.12;
  shadow-radius: 4px;
`;

const Header = styled(BlurView)`
  z-index: 100;
  position: absolute;
  top: ${({ topInset }) => topInset + 60}px;
  left: 0;
  right: 0;
  gap: 10px;
  height: 70px;
  padding: 20px 20px 10px 20px;
  flex-direction: row;
  justify-content: flex-start;
`;

const EntryNumber = styled.View`
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${Colors.accent};
`;

const EntryInfo = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const EntryDate = styled.View`
  flex-direction: row;
  gap: 5px;
  margin: 3px 0 -2px 0;
`;

const Content = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

export default function HomeScreen() {
  const { top } = useSafeAreaInsets();
  const [activeEntry, setActiveEntry] = useState(daysData[0]);

  // Handlers:

  const formatDate = (dateString, format) => {
    const date = new Date(dateString);
    switch (format) {
      case "day":
        return date.getDate().toString();
      case "month":
        return date.toLocaleString("default", { month: "long" });
      case "time":
        return date.toLocaleString("default", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      case "weekday":
        return date.toLocaleString("default", { weekday: "long" });
    }
  };

  const handleChangeDay = (dayId) => {
    setActiveEntry(daysData.find((day) => day.dayId === dayId));
  };

  return (
    <Container>
      <TopBar>
        <ThemedText type="title">Galaea</ThemedText>
        <ThemedText type="title">O</ThemedText>
      </TopBar>

      <Header tint="light" topInset={top}>
        <EntryNumber>
          <ThemedText type="date-number">
            {formatDate(activeEntry.date, "day")}
          </ThemedText>
        </EntryNumber>
        <EntryInfo>
          <EntryDate>
            <ThemedText type="subtitle">
              {formatDate(activeEntry.date, "month")}
            </ThemedText>
            <ThemedText type="subtitle" color="faded">
              {formatDate(activeEntry.date, "time")}
            </ThemedText>
          </EntryDate>
          <ThemedText type="title">
            {activeEntry.title || formatDate(activeEntry.date, "weekday")}
          </ThemedText>
        </EntryInfo>
      </Header>

      <Content
        contentContainerStyle={{
          gap: 20,
          paddingTop: 70,
          paddingBottom: 110,
          paddingHorizontal: 20,
        }}
      >
        <ThemedText>{activeEntry.text}</ThemedText>
        <Tags tagIds={activeEntry.tags} />
        {activeEntry.games.map(({ gameId, entryId }, i) => (
          <GameEntry
            key={`${gameId}-${entryId}-${i}`}
            gameId={gameId}
            entryId={entryId}
          />
        ))}
      </Content>

      <JournalTrack onChangeDay={handleChangeDay} />
    </Container>
  );
}
