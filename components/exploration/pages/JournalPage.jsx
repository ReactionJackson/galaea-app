import { ItemEntryBubble } from "@/components/exploration/pages/components/ItemEntryBubble";
import { PageScroll } from "@/components/exploration/pages/components/PageScroll";
import { StickyHeader } from "@/components/exploration/pages/components/StickyHeader";
import {
  AnimatedSpacer,
  AnimateHeight,
} from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { HeaderText } from "@/components/interface/HeaderText";
import { ThemedText } from "@/components/interface/ThemedText";
import { Tags } from "@/components/tags/Tags";
import { PickerNavigator } from "@/components/exploration/navigators/PickerNavigator";
import { useApp } from "@/context/AppContext";
import { Fragment } from "react";
import { View } from "react-native";

function formatEntryDate(dateString, format) {
  const date = new Date(dateString);
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
}

export function JournalPage({ entry }) {
  const { state, activeEntry, dispatch } = useApp();
  const { editMode } = state;
  const isActive = entry.dayId === activeEntry.dayId;
  const data = isActive ? activeEntry : entry;
  const pageEditMode = isActive && editMode;
  const textVisible = !!(data.text || pageEditMode);
  const tagsVisible = !!(data.tags.length || pageEditMode);

  const formatDate = (format) => formatEntryDate(data.date, format);

  const handleToggleTag = (tagId) => dispatch({ type: "TOGGLE_TAG", tagId });
  const handleChangeTitle = (title) =>
    dispatch({ type: "UPDATE_TITLE", title });
  const handleChangeText = (text) => dispatch({ type: "UPDATE_TEXT", text });
  const handleSelectItem = (itemId) => dispatch({ type: "ADD_ITEM", itemId });

  return (
    <PageScroll resetKey={entry.dayId}>
      <StickyHeader>
        <HeaderText>
          <HeaderText.Badge>
            <ThemedText type="date-number">{formatDate("day")}</ThemedText>
          </HeaderText.Badge>
          <HeaderText.Title
            key={pageEditMode ? "editing" : "display"}
            value={
              !pageEditMode && !data.title ? formatDate("weekday") : data.title
            }
            placeholder={formatDate("weekday")}
            onChangeText={handleChangeTitle}
            editable={pageEditMode}
          />
          <HeaderText.Subtitle>{formatDate("month")}</HeaderText.Subtitle>
          <HeaderText.SubtitleFaded>
            {formatDate("year")}
          </HeaderText.SubtitleFaded>
        </HeaderText>
      </StickyHeader>

      <FadeInOnMount>
        <Fragment key={entry.dayId}>
          <AnimateHeight visible={textVisible}>
            <ThemedText
              key={pageEditMode ? "editing" : "display"}
              isInput
              multiline={true}
              value={data.text}
              placeholder="Write something about today..."
              onChangeText={handleChangeText}
              editable={pageEditMode}
            />
          </AnimateHeight>

          <Tags
            tagIds={data.tags}
            editMode={pageEditMode}
            onToggleTag={handleToggleTag}
          />
          <AnimatedSpacer visible={textVisible || tagsVisible} height={25} />

          {data.items.map(
            ({ itemId, entryId, isNew, text, tags, gallery }, i) => (
              <View key={`${itemId}-${String(entryId)}-${i}`}>
                <AnimateHeight visible>
                  <ItemEntryBubble
                    itemId={itemId}
                    entryId={entryId}
                    index={i}
                    isNew={isNew}
                    editable={pageEditMode}
                    text={text}
                    tagIds={tags}
                    gallery={gallery}
                  />
                </AnimateHeight>
                {i !== data.items.length - 1 && <AnimatedSpacer visible />}
              </View>
            ),
          )}
          <AnimatedSpacer visible={data.items.length > 0} />

          {pageEditMode && (
            <>
              <AnimateHeight
                visible={editMode}
                animateOnMount
                style={{ marginHorizontal: -20 }}
              >
                <PickerNavigator
                  attachedItemIds={activeEntry.items.map((it) => it.itemId)}
                  onSelect={handleSelectItem}
                />
              </AnimateHeight>
              <AnimatedSpacer visible={editMode} height={70} />
            </>
          )}
        </Fragment>
      </FadeInOnMount>
    </PageScroll>
  );
}
