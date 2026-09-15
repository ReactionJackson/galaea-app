import { CollectionItem } from "@/components/CollectionItem";
import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { Tags } from "@/components/Tags";
import { ItemPickerTrack } from "@/components/track/ItemPickerTrack";
import { JournalTrack } from "@/components/track/JournalTrack";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Fragment, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components/native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.background};
`;


// Duplicate:
const Button = styled.Pressable`
  height: 36px;
  align-self: center;
  margin-top: 20px;
  padding: 4px 14px;
  border-radius: 20px;
  border: 2px solid ${Colors.dateBorder};
  background-color: ${Colors.accent};
  ${({ secondary }) =>
    secondary &&
    css`
      background-color: transparent;
    `}
`;
// End Duplicate

function JournalScreen() {
  const { state, activeEntry, dispatch } = useApp();
  const { editMode, cancelling, committed } = state;
  const cancelTimerRef = useRef(null);
  const [pickingItem, setPickingItem] = useState(false);

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
    setPickingItem(false);
    dispatch({ type: "ENTER_EDIT" });
  };

  const handleCancelEdit = () => {
    // Phase 1: exit edit mode so animations start (controls slide away,
    // new item entries collapse, draft-only text closes, etc.)
    setPickingItem(false);
    dispatch({ type: "BEGIN_CANCEL" });
    // Phase 2: once animations have had time to finish, clear the draft.
    // The delay matches the AnimateHeight duration with a small buffer.
    cancelTimerRef.current = setTimeout(() => {
      cancelTimerRef.current = null;
      dispatch({ type: "COMPLETE_CANCEL" });
    }, 350);
  };

  const handleSelectItem = (itemId) => {
    dispatch({ type: "ADD_ITEM", itemId });
    setPickingItem(false);
  };

  // Clean up any pending cancel timer if the component unmounts mid-animation.
  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
    };
  }, []);

  // A fresh day never opens with the picker mid-flight.
  useEffect(() => {
    setPickingItem(false);
  }, [activeEntry.dayId]);

  // Render:

  return (
    <Container>
      <PageScroll resetKey={activeEntry.dayId}>
        <PageHeader>
          <PageHeader.Badge>
            <ThemedText type="date-number">{formatDate("day")}</ThemedText>
          </PageHeader.Badge>
          <PageHeader.Meta>
            <ThemedText type="subtitle">{formatDate("month")}</ThemedText>
            <ThemedText type="subtitle" color="faded">
              {formatDate("time")}
            </ThemedText>
          </PageHeader.Meta>
          <PageHeader.Title
            // Remounts whenever editing starts or stops, so the native text
            // input always begins fresh from the value React just handed it.
            // Without this, rapid controlled updates while typing can leave
            // the native view's own text buffer slightly out of step with
            // what React thinks it last set — harmless while still editing,
            // but on cancel it means the revert to the committed title can
            // silently fail to apply, since React sees no change from its
            // point of view even though the native field is showing
            // something else.
            key={editMode ? "editing" : "display"}
            value={
              !editMode && !activeEntry.title
                ? formatDate("weekday")
                : activeEntry.title
            }
            placeholder={formatDate("weekday")}
            onChangeText={(title) => dispatch({ type: "UPDATE_TITLE", title })}
            editable={editMode}
          />
        </PageHeader>

        <AnimateHeight visible={textVisible}>
          <ThemedText
            key={editMode ? "editing" : "display"}
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

        {activeEntry.items.map(
          ({ itemId, entryId, isNew, text, tags, gallery }, i) => {
            const itemVisible = !cancelling || !isNew || !!text;
            return (
              <Fragment key={`${itemId}-${String(entryId)}-${i}`}>
                <AnimateHeight visible={itemVisible} animateOnMount={!!isNew}>
                  <CollectionItem
                    itemId={itemId}
                    entryId={entryId}
                    index={i}
                    text={text}
                    tagIds={tags}
                    gallery={gallery}
                  />
                </AnimateHeight>
                <AnimatedSpacer
                  visible={itemVisible}
                  animateOnMount={!!isNew}
                />
              </Fragment>
            );
          },
        )}
        <AnimatedSpacer
          visible={activeEntry.items.length > 0}
          height={pickingItem ? 20 : 10}
        />

        <AnimateHeight
          visible={pickingItem && editMode}
          style={{ marginHorizontal: -20 }}
        >
          <ItemPickerTrack
            attachedItemIds={activeEntry.items.map((it) => it.itemId)}
            onSelect={handleSelectItem}
          />
        </AnimateHeight>

        <AnimateHeight visible={editMode}>
          <Button
            secondary={pickingItem}
            onPress={() => setPickingItem((prev) => !prev)}
          >
            <ThemedText color={pickingItem ? "black" : "white"}>
              {pickingItem ? "Close" : "Add Item"}
            </ThemedText>
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
