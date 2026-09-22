import { ItemEntryBubble } from "@/components/collections/ItemEntryBubble";
import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { HeaderText } from "@/components/interface/HeaderText";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageScroll } from "@/components/page/PageScroll";
import { StickyHeader } from "@/components/page/StickyHeader";
import { Tags } from "@/components/tags/Tags";
import { JournalTrack } from "@/components/track/JournalTrack";
import { PickerTrack } from "@/components/track/PickerTrack";
import { TrackTray } from "@/components/track/TrackTray";
import { Colors } from "@/constants/theme";
import { resolveEntryGalleryPairs, useApp } from "@/context/AppContext";
import { deleteDroppedImages } from "@/utils/images";
import { Fragment, useEffect, useRef, useState } from "react";
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
  const { editMode } = state;
  const pageScrollRef = useRef(null);
  const pendingScrollItemIdRef = useRef(null);
  const pickerTrackRef = useRef(null);
  const wasEditingRef = useRef(editMode);
  const [trayControls, setTrayControls] = useState({});

  useEffect(() => {
    if (editMode && !wasEditingRef.current) {
      pickerTrackRef.current?.reset();
    }
    wasEditingRef.current = editMode;
  }, [editMode]);

  // Derived state:

  const textVisible = !!(activeEntry.text || editMode);
  const tagsVisible = !!(activeEntry.tags.length || editMode);
  const dayIndex = state.entries.findIndex(
    (e) => e.dayId === activeEntry.dayId,
  );
  const dayNumber = dayIndex === -1 ? state.entries.length + 1 : dayIndex + 1;

  // Helpers:

  const formatDate = (format) => {
    const date = new Date(activeEntry.date);
    switch (format) {
      case "day":
        return date.getDate().toString();
      case "month":
        return date.toLocaleString("default", { month: "long" });
      case "weekday":
        return date.toLocaleString("default", { weekday: "long" });
      case "year":
        return date.getFullYear().toString();
    }
  };

  // Handlers:

  const handleToggleTag = (tagId) => dispatch({ type: "TOGGLE_TAG", tagId });

  const handleEnterEdit = () => dispatch({ type: "ENTER_EDIT" });

  const handleCancelEdit = () => {
    if (state.draft) {
      for (const { draftGallery, storedGallery } of resolveEntryGalleryPairs(
        state.items,
        state.draft.items,
      )) {
        deleteDroppedImages(draftGallery, storedGallery);
      }
    }
    dispatch({ type: "CANCEL_EDIT" });
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

  // Render:

  return (
    <Container>
      <PageScroll ref={pageScrollRef} resetKey={activeEntry.dayId}>
        <StickyHeader>
          <HeaderText>
            <HeaderText.Badge>
              <ThemedText type="date-number">{formatDate("day")}</ThemedText>
            </HeaderText.Badge>
            <HeaderText.Title
              key={editMode ? "editing" : "display"}
              value={
                !editMode && !activeEntry.title
                  ? formatDate("weekday")
                  : activeEntry.title
              }
              placeholder={formatDate("weekday")}
              onChangeText={(title) =>
                dispatch({ type: "UPDATE_TITLE", title })
              }
              editable={editMode}
            />
            <HeaderText.Subtitle>{formatDate("month")}</HeaderText.Subtitle>
            <HeaderText.SubtitleFaded>
              {formatDate("year")}
            </HeaderText.SubtitleFaded>
          </HeaderText>
        </StickyHeader>

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
            <AnimatedSpacer visible={textVisible || tagsVisible} height={25} />

            {activeEntry.items.map(
              ({ itemId, entryId, isNew, text, tags, gallery }, i) => (
                <View
                  key={`${itemId}-${String(entryId)}-${i}`}
                  onLayout={(e) =>
                    handleItemLayout(itemId, e.nativeEvent.layout)
                  }
                >
                  <AnimateHeight visible>
                    <ItemEntryBubble
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
                    <AnimatedSpacer visible />
                  )}
                </View>
              ),
            )}
            <AnimatedSpacer visible={activeEntry.items.length > 0} />

            <AnimateHeight
              visible={editMode}
              animateOnMount
              style={{ marginHorizontal: -20 }}
            >
              <PickerTrack
                ref={pickerTrackRef}
                attachedItemIds={activeEntry.items.map((it) => it.itemId)}
                onSelect={handleSelectItem}
              />
            </AnimateHeight>
            <AnimatedSpacer visible={editMode} height={70} />
          </Fragment>
        </FadeInOnMount>
      </PageScroll>

      <TrackTray
        editMode={editMode}
        trackHeight={90}
        trackPaddingTop={25}
        {...trayControls}
      >
        <JournalTrack
          onEnterEdit={handleEnterEdit}
          onCancelEdit={handleCancelEdit}
          onControlsChange={setTrayControls}
        />
      </TrackTray>
    </Container>
  );
}

export default JournalScreen;
