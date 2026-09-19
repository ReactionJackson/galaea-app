import { CollectionItem } from "@/components/CollectionItem";
import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { Tags } from "@/components/Tags";
import { ItemPickerTrack } from "@/components/track/ItemPickerTrack";
import { JournalTrack } from "@/components/track/JournalTrack";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { Fragment, useEffect, useRef } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.background};
`;

const STICKY_HEADER_HEIGHT = 70;

function JournalScreen() {
  const { state, activeEntry, dispatch } = useApp();
  const { editMode, cancelling, committed } = state;
  const cancelTimerRef = useRef(null);
  const pageScrollRef = useRef(null);
  const pendingScrollItemIdRef = useRef(null);

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
    // new item entries collapse, draft-only text closes, etc.)
    dispatch({ type: "BEGIN_CANCEL" });
    // Phase 2: once animations have had time to finish, clear the draft.
    // The delay matches the AnimateHeight duration with a small buffer.
    cancelTimerRef.current = setTimeout(() => {
      cancelTimerRef.current = null;
      dispatch({ type: "COMPLETE_CANCEL" });
    }, 350);
  };

  const handleSelectItem = (itemId) => {
    pendingScrollItemIdRef.current = itemId;
    dispatch({ type: "ADD_ITEM", itemId });
  };

  const handleItemLayout = (itemId, { y }) => {
    if (pendingScrollItemIdRef.current !== itemId) return;
    pendingScrollItemIdRef.current = null;
    pageScrollRef.current?.scrollTo({
      y: Math.max(y - STICKY_HEADER_HEIGHT, 0),
      animated: true,
    });
  };

  // Clean up any pending timer if the component unmounts mid-cancel.
  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
    };
  }, []);

  // Render:

  return (
    <Container>
      <PageScroll ref={pageScrollRef} resetKey={activeEntry.dayId}>
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

        <FadeInOnMount>
          <Fragment key={activeEntry.dayId}>
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

            <Tags
              tagIds={activeEntry.tags}
              editMode={editMode}
              onToggleTag={handleToggleTag}
            />
            <AnimatedSpacer visible={tagsVisible} height={25} />

            {activeEntry.items.map(
              ({ itemId, entryId, isNew, text, tags, gallery }, i) => {
                const itemVisible = !cancelling || !isNew || !!text;
                return (
                  <View
                    key={`${itemId}-${String(entryId)}-${i}`}
                    onLayout={(e) =>
                      handleItemLayout(itemId, e.nativeEvent.layout)
                    }
                  >
                    <AnimateHeight visible={itemVisible}>
                      <CollectionItem
                        itemId={itemId}
                        entryId={entryId}
                        index={i}
                        isNew={isNew}
                        text={text}
                        tagIds={tags}
                        gallery={gallery}
                      />
                    </AnimateHeight>
                    {i !== activeEntry.items.length - 1 && (
                      <AnimatedSpacer visible={itemVisible} />
                    )}
                  </View>
                );
              },
            )}
            <AnimatedSpacer
              visible={activeEntry.items.length > 0}
              height={editMode ? 20 : 10}
            />

            {(editMode || cancelling) && (
              <AnimateHeight
                visible={editMode}
                animateOnMount
                style={{ marginHorizontal: -20 }}
              >
                <ItemPickerTrack
                  attachedItemIds={activeEntry.items.map((it) => it.itemId)}
                  onSelect={handleSelectItem}
                />
              </AnimateHeight>
            )}
            <AnimatedSpacer visible={editMode} height={70} />
          </Fragment>
        </FadeInOnMount>
      </PageScroll>

      <JournalTrack
        onEnterEdit={handleEnterEdit}
        onCancelEdit={handleCancelEdit}
      />
    </Container>
  );
}

export default JournalScreen;
