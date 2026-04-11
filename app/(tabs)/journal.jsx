import { BlurView } from "@/components/BlurView";
import { GameEntry } from "@/components/GameEntry";
import { JournalTrack } from "@/components/JournalTrack";
import { Tags } from "@/components/Tags";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { daysData } from "@/data/entries";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: ${Colors.background};
`;

const Header = styled(BlurView)`
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  gap: 10px;
  height: 70px;
  padding: 15px 20px;
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
  flex: 1;
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
  const [activeEntry, setActiveEntry] = useState(daysData[daysData.length - 1]);
  const [editMode, setEditMode] = useState(false);
  const scrollRef = useRef(null);

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

  const handleChangeDay = (dayId) => {
    setActiveEntry(entries.find((day) => day.dayId === dayId));
  };

  const handleAdd = () => {
    setActiveEntry({
      dayId: `day-new-${Date.now()}`,
      date: new Date().toISOString(),
      title: null,
      text: "",
      tags: [],
      games: [],
    });
  };

  const handleSave = () => {
    if (!activeEntry) return;
    const exists = entries.some((entry) => entry.dayId === activeEntry.dayId);
    if (exists) {
      setEntries(
        entries.map((entry) =>
          entry.dayId === activeEntry.dayId ? activeEntry : entry,
        ),
      );
    } else {
      setEntries([...entries, activeEntry]);
    }
    setEditMode(false);
  };

  // Effects:

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  // Render:

  return (
    <Container>
      <Header tint="light">
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
          <ThemedText
            type="title"
            isInput
            value={
              !editMode && !activeEntry.title
                ? formatDate("weekday")
                : activeEntry.title
            }
            placeholder={formatDate("weekday")}
            onChangeText={(text) =>
              setActiveEntry({ ...activeEntry, title: text })
            }
            editable={editMode}
          />
        </EntryInfo>
      </Header>

      <Content
        key={activeEntry.dayId}
        ref={scrollRef}
        contentContainerStyle={{
          gap: 20,
          paddingTop: 65,
          paddingBottom: 110,
          paddingHorizontal: 20,
        }}
      >
        {activeEntry.text || editMode ? (
          <ThemedText
            isInput
            multiline={true}
            value={activeEntry.text}
            placeholder="Write something about today..."
            onChangeText={(text) => setActiveEntry({ ...activeEntry, text })}
            editable={editMode}
          />
        ) : null}
        <Tags tagIds={activeEntry.tags} editMode={editMode} />
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
        editMode={editMode}
        setEditMode={setEditMode}
      />
    </Container>
  );
}
