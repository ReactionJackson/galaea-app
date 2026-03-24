import { BlurView } from "@/components/BlurView";
import { GameEntry } from "@/components/GameEntry";
import { JournalTrack } from "@/components/JournalTrack";
import { Tags } from "@/components/Tags";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { daysData } from "@/data/entries";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
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
  const [entries, setEntries] = useState(() => [...daysData]);
  const [activeEntry, setActiveEntry] = useState(daysData[0]);
  const { top } = useSafeAreaInsets();
  const scrollRef = useRef(null);

  // Stable refs so callbacks don't go stale:
  const entriesRef = useRef(entries);
  const activeEntryRef = useRef(activeEntry);
  entriesRef.current = entries;
  activeEntryRef.current = activeEntry;

  // Derived state:

  const showAddButton = useMemo(() => {
    if (entries.length === 0) return true;
    const latestDate = new Date(entries[entries.length - 1].date);
    const today = new Date();
    return (
      latestDate.getFullYear() !== today.getFullYear() ||
      latestDate.getMonth() !== today.getMonth() ||
      latestDate.getDate() !== today.getDate()
    );
  }, [entries]);

  // Handlers:

  const formatDate = (format) => {
    const date = new Date(activeEntry.date);
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

  const handleChangeDay = useCallback((dayId) => {
    setActiveEntry(entriesRef.current.find((day) => day.dayId === dayId));
  }, []);

  const handleAdd = useCallback(() => {
    setActiveEntry({
      dayId: `day-new-${Date.now()}`,
      date: new Date().toISOString(),
      title: null,
      text: "",
      tags: [],
      games: [],
    });
  }, []);

  const handleSave = useCallback(() => {
    const entry = activeEntryRef.current;
    if (!entry) return;
    setEntries((prev) => [...prev, entry]);
  }, []);

  // Effects:

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // Render:

  return (
    <Container>
      <TopBar>
        <ThemedText type="title">Galaea</ThemedText>
        <ThemedText type="title">O</ThemedText>
      </TopBar>

      <Header tint="light" topInset={top}>
        <EntryNumber>
          <ThemedText type="date-number">{formatDate("day")}</ThemedText>
        </EntryNumber>
        <EntryInfo>
          <EntryDate>
            <ThemedText type="subtitle">{formatDate("month")}</ThemedText>
            <ThemedText type="subtitle" color="faded">
              {formatDate("time")}
            </ThemedText>
          </EntryDate>
          <ThemedText type="title">
            {activeEntry.title || formatDate("weekday")}
          </ThemedText>
        </EntryInfo>
      </Header>

      <Content
        key={activeEntry.dayId}
        ref={scrollRef}
        contentContainerStyle={{
          gap: 20,
          paddingTop: 70,
          paddingBottom: 110,
          paddingHorizontal: 20,
        }}
      >
        <ThemedText>
          {activeEntry.text || "Write something about today..."}
        </ThemedText>
        <Tags tagIds={activeEntry.tags} />
        {activeEntry.games.map(({ gameId, entryId }, i) => (
          <GameEntry
            key={`${gameId}-${entryId}-${i}`}
            gameId={gameId}
            entryId={entryId}
          />
        ))}
      </Content>

      <JournalTrack
        entries={entries}
        showAddButton={showAddButton}
        onChangeDay={handleChangeDay}
        onAdd={handleAdd}
        onSave={handleSave}
      />
    </Container>
  );
}
