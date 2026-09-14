import { GameEntry } from "@/components/GameEntry";
import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { Tags } from "@/components/Tags";
import { JournalTrack } from "@/components/track/JournalTrack";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Fragment, useEffect, useRef } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.background};
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
  const { state, activeEntry, dispatch } = useApp();
  const { editMode, cancelling, committed } = state;
  const cancelTimerRef = useRef(null);

  // Derived state:

  const textVisible = cancelling
    ? !!committed.text
    : !!(activeEntry.text || editMode);
  const tagsVisible = cancelling
    ? !!committed.tags.length
    : !!(activeEntry.tags.length || editMode);

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

  // Render:

  return (
    <Container>
      <PageHeader>
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
      </PageHeader>

      <PageScroll resetKey={activeEntry.dayId}>
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

        <Tags
          tagIds={activeEntry.tags}
          editMode={editMode}
          onToggleTag={handleToggleTag}
        />
        <AnimatedSpacer visible={tagsVisible} />

        {activeEntry.games.map(
          ({ gameId, entryId, isNew, text, tags, gallery }, i) => {
            const gameVisible = !cancelling || !isNew || !!text;
            return (
              <Fragment key={`${gameId}-${String(entryId)}-${i}`}>
                <AnimateHeight visible={gameVisible} animateOnMount={!!isNew}>
                  <GameEntry
                    gameId={gameId}
                    entryId={entryId}
                    index={i}
                    text={text}
                    tagIds={tags}
                    gallery={gallery}
                  />
                </AnimateHeight>
                <AnimatedSpacer
                  visible={gameVisible}
                  animateOnMount={!!isNew}
                />
              </Fragment>
            );
          },
        )}
        <AnimatedSpacer visible={activeEntry.games.length > 0} height={10} />

        <AnimateHeight visible={editMode}>
          <Button onPress={() => dispatch({ type: "ADD_GAME" })}>
            <ThemedText color="white">Add Game</ThemedText>
          </Button>
        </AnimateHeight>
        <AnimatedSpacer visible={editMode} height={70} />
      </PageScroll>

      <JournalTrack
        onEnterEdit={handleEnterEdit}
        onCancelEdit={handleCancelEdit}
      />
    </Container>
  );
}

export default JournalScreen;
