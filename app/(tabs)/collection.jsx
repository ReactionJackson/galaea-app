import { CollectionItem } from "@/components/CollectionItem";
import { ItemHero } from "@/components/ItemHero";
import { AnimatedSpacer } from "@/components/interface/AnimateHeight";
import { ThemedText } from "@/components/interface/ThemedText";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { CollectionTrack } from "@/components/track/CollectionTrack";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

async function pickImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
  });
  if (result.canceled) return null;
  return result.assets?.[0]?.uri ?? null;
}

export default function CollectionScreen() {
  const { state, dispatch } = useApp();
  const { items, itemDraft, editingItemId } = state;
  const editMode = !!itemDraft;

  const [activeItemId, setActiveItemId] = useState(items[0]?.itemId);

  const activeItem = items.find((it) => it.itemId === activeItemId);
  const displayItem = itemDraft ?? activeItem;
  const orderedEntries = displayItem
    ? [...displayItem.entries].sort((a, b) => a.entryId - b.entryId)
    : [];

  const updateDraft = (changes) =>
    dispatch({ type: "UPDATE_ITEM_DRAFT", changes });

  const handleAddItem = () =>
    dispatch({ type: "ENTER_ITEM_EDIT", itemId: null });

  const handleCancelAddItem = () => dispatch({ type: "CANCEL_ITEM_EDIT" });

  const handlePressActiveItem = (itemId) => {
    if (editMode && editingItemId === itemId) {
      dispatch({ type: "CANCEL_ITEM_EDIT" });
    } else {
      dispatch({ type: "ENTER_ITEM_EDIT", itemId });
    }
  };

  const handleSave = () => {
    if (!editMode) return;
    const isNew = editingItemId == null;
    const itemId = isNew
      ? Math.max(0, ...items.map((it) => it.itemId)) + 1
      : editingItemId;
    dispatch({ type: "SAVE_ITEM_EDIT", itemId });
    if (isNew) setActiveItemId(itemId);
  };

  const handlePickCard = async () => {
    const uri = await pickImage();
    if (uri) updateDraft({ cardImage: uri });
  };

  const handlePickCover = async () => {
    const uri = await pickImage();
    if (uri) updateDraft({ coverImage: uri });
  };

  if (!displayItem) return <Container />;

  return (
    <Container>
      <PageScroll
        resetKey={editMode ? (editingItemId ?? "new-item") : activeItemId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        <ItemHero
          cardImage={displayItem.cardImage}
          coverImage={displayItem.coverImage}
          editable={editMode}
          onPressCard={handlePickCard}
          onPressCover={handlePickCover}
        />

        <PageHeader gap={7}>
          <PageHeader.Title
            key={editMode ? "editing" : "display"}
            value={
              !editMode && !displayItem.title
                ? "New Item"
                : displayItem.title
            }
            placeholder="New Item"
            onChangeText={(title) => updateDraft({ title })}
            editable={editMode}
          />
          <PageHeader.Meta>
            <ThemedText
              type="subtitle"
              color={displayItem.entries.length === 0 ? "faded" : ""}
            >
              {displayItem.entries.length === 0
                ? "No"
                : String(displayItem.entries.length).padStart(2, "0")}{" "}
              {displayItem.entries.length === 1 ? "Entry" : "Entries"}
            </ThemedText>
          </PageHeader.Meta>
        </PageHeader>

        {orderedEntries.map((entry) => (
          <CollectionItem
            key={entry.entryId}
            isMinimal
            editable={editMode}
            entryId={entry.entryId}
            date={entry.date}
            text={entry.text}
            tagIds={entry.tags}
            gallery={entry.gallery}
            onUpdate={(changes) =>
              dispatch({
                type: "UPDATE_ITEM_DRAFT_ENTRY",
                entryId: entry.entryId,
                changes,
              })
            }
          />
        ))}

        <AnimatedSpacer visible={editMode} height={50} />
      </PageScroll>

      <CollectionTrack
        editMode={editMode}
        onChangeItem={setActiveItemId}
        onPressActiveItem={handlePressActiveItem}
        onAddItem={handleAddItem}
        onCancelAddItem={handleCancelAddItem}
        onSave={handleSave}
      />
    </Container>
  );
}
