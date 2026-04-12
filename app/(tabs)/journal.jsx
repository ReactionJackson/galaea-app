import { AnimateHeight, AnimatedSpacer } from "@/components/AnimateHeight";
import { BlurView } from "@/components/BlurView";
import { GameEntry } from "@/components/GameEntry";
import { JournalTrack } from "@/components/JournalTrack";
import { Tags } from "@/components/Tags";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { JournalProvider, useJournal } from "@/context/JournalContext";
import { useFocusEffect } from "@react-navigation/native";
import { Fragment, useCallback, useMemo, useRef, useEffect } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
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

// Duplicate:
const Button = styled.Pressable`
  height: 36px;
  align-self: center;
  padding: 4px 14px;
  border-radius: 20px;
  border: 2px solid ${Colors.dateBorder};
  background-color: ${Colors.accent};
`;
// End Duplicate

function JournalScreen() {
  const { state, activeEntry, dispatch } = useJournal();
  const { entries, editMode, cancelling } = state;
  const committed = state.committed;
  const scrollRef = useRef(null);
  const cancelTimerRef = useRef(null);

  // Derived state:

  // During the cancel animation window we use committed as the visibility
  // source — this ensures content that only existed in the draft (typed text,
  // added tags) starts closing immediately rather than snapping away after the
  // timer fires.
  const textVisible = cancelling
    ? !!committed.text
    : !!(activeEntry.text || editMode);
  const tagsVisible = cancelling
    ? !!(committed.tags.length)
    : !!(activeEntry.tags.length || editMode);

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

  // Helpers:

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

  // Handlers:

  const handleChangeDay = (dayId) => dispatch({ type: "CHANGE_DAY", dayId });
  const handleAdd = () => dispatch({ type: "ADD_DAY" });
  const handleSave = () => dispatch({ type: "SAVE_EDIT" });
  const handleToggleTag = (tagId) => dispatch({ type: "TOGGLE_TAG", tagId });

  const handleEnterEdit = () => {
    // If a cancel is already in flight, abort it and go straight to edit.
    if (cancelTimerRef.current) {
      clearTimeout(cancelTimerRef.current);
      cancelTimerRef.current = null;
      dispatch({ type: "COMPLETE_CANCEL" });
    }
    dispatch({ type: "ENTER_EDIT" });
  };

  const handleCancelEdit = () => {
    // Phase 1: exit edit mode so animations start (controls slide away,
    // new game entries collapse, draft-only text closes, etc.)
    dispatch({ type: "BEGIN_CANCEL" });
    // Phase 2: once animations have had time to finish, clear the draft.
    // The delay matches the AnimateHeight duration with a small buffer.
    cancelTimerRef.current = setTimeout(() => {
      cancelTimerRef.current = null;
      dispatch({ type: "COMPLETE_CANCEL" });
    }, 350);
  };

  // Clean up any pending cancel timer if the component unmounts mid-animation.
  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
    };
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
            onChangeText={(title) => dispatch({ type: "UPDATE_TITLE", title })}
            editable={editMode}
          />
        </EntryInfo>
      </Header>

      <Content
        key={activeEntry.dayId}
        ref={scrollRef}
        contentContainerStyle={{
          paddingTop: 70,
          paddingBottom: 110,
          paddingHorizontal: 20,
        }}
      >
        <AnimateHeight visible={textVisible}>
          <ThemedText
            isInput
            multiline={true}
            value={activeEntry.text}
            placeholder="Write something about today..."
            onChangeText={(text) => dispatch({ type: "UPDATE_TEXT", text })}
            editable={editMode}
          />
        </AnimateHeight>
        <AnimatedSpacer visible={textVisible} />

        <Tags tagIds={activeEntry.tags} editMode={editMode} onToggleTag={handleToggleTag} />
        <AnimatedSpacer visible={tagsVisible} />

        {activeEntry.games.map(({ gameId, entryId, isNew, text }, i) => {
          // New entries with no content collapse away on cancel — an empty card
          // animating shut looks intentional. New entries that already have
          // content (user typed something) stay visible until COMPLETE_CANCEL
          // removes them from the list, because squishing real content looks wrong.
          // Existing (committed) entries are always visible.
          const gameVisible = !cancelling || !isNew || !!text;
          return (
            <Fragment key={`${gameId}-${String(entryId)}-${i}`}>
              <AnimateHeight visible={gameVisible} animateOnMount={!!isNew}>
                <GameEntry
                  gameId={gameId}
                  entryId={entryId}
                  editMode={editMode}
                  text={text}
                  onChangeText={(t) =>
                    dispatch({
                      type: "UPDATE_GAME",
                      index: i,
                      changes: { text: t },
                    })
                  }
                />
              </AnimateHeight>
              <AnimatedSpacer visible={gameVisible} animateOnMount={!!isNew} />
            </Fragment>
          );
        })}
        <AnimatedSpacer visible={activeEntry.games.length > 0} height={10} />

        <AnimateHeight visible={editMode}>
          <Button onPress={() => dispatch({ type: "ADD_GAME" })}>
            <ThemedText color="white">Add Game</ThemedText>
          </Button>
        </AnimateHeight>
        <AnimatedSpacer visible={editMode} height={70} />
      </Content>

      <JournalTrack
        entries={entries}
        showAddButton={showAddButton}
        onChangeDay={handleChangeDay}
        onAdd={handleAdd}
        onSave={handleSave}
        onEnterEdit={handleEnterEdit}
        onCancelEdit={handleCancelEdit}
        editMode={editMode}
      />
    </Container>
  );
}

export default function JournalTab() {
  return (
    <JournalProvider>
      <JournalScreen />
    </JournalProvider>
  );
}
