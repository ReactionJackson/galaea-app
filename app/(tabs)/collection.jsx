import { CollectionItem } from "@/components/CollectionItem";
import { AnimatedSpacer } from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { ThemedText } from "@/components/interface/ThemedText";
import { ItemHero } from "@/components/ItemHero";
import { EditLightbox } from "@/components/lightbox/EditLightbox";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { CollectionTrack } from "@/components/track/CollectionTrack";
import { Colors } from "@/constants/theme";
import {
  COLLECTION_HERO_HEIGHT,
  COLLECTION_HERO_SPACING,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { pickAndStoreImage } from "@/utils/images";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

async function pickImage(kind) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
  });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  return pickAndStoreImage(asset, kind);
}

export default function CollectionScreen() {
  const { state, dispatch, itemsById } = useApp();
  const { items, itemDraft, editingItemId } = state;
  const editMode = !!itemDraft;

  const { width: screenWidth } = useWindowDimensions();
  const [activeItemId, setActiveItemId] = useState(items[0]?.itemId);
  const [coverImageToEdit, setCoverImageToEdit] = useState(null);

  const activeItem = itemsById[activeItemId] ?? items[0];
  const displayItem = itemDraft ?? activeItem;
  const orderedEntries = displayItem
    ? [...displayItem.entries].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )
    : [];

  const updateDraft = (changes) =>
    dispatch({ type: "UPDATE_ITEM_DRAFT", changes });

  const handleAddItem = () =>
    dispatch({ type: "ENTER_ITEM_EDIT", itemId: null });

  const handleCancelAddItem = () => dispatch({ type: "CANCEL_ITEM_EDIT" });

  const handleDelete = () => {
    if (editingItemId == null) {
      dispatch({ type: "CANCEL_ITEM_EDIT" });
      return;
    }
    const deletedIndex = items.findIndex((it) => it.itemId === editingItemId);
    const landingItem = deletedIndex > 0 ? items[deletedIndex - 1] : items[1];
    dispatch({ type: "DELETE_ITEM", itemId: editingItemId });
    if (landingItem) setActiveItemId(landingItem.itemId);
  };

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
    const stored = await pickImage("card");
    if (stored) updateDraft({ cardImage: stored });
  };

  const handlePickCover = async () => {
    const stored = await pickImage("cover");
    if (stored) setCoverImageToEdit(stored);
  };

  const handleSaveCover = (focus) => {
    if (!coverImageToEdit) return;
    const { uri, rawWidth, rawHeight, aspectRatio } = coverImageToEdit;
    updateDraft({
      coverImage: {
        uri,
        rawWidth,
        rawHeight,
        aspectRatio,
        ...(focus ? { focus } : {}),
      },
    });
    setCoverImageToEdit(null);
  };

  const handleCloseCover = () => setCoverImageToEdit(null);

  const handleEditCover = () => {
    if (displayItem.coverImage) setCoverImageToEdit(displayItem.coverImage);
  };

  const handleRemoveCover = () => updateDraft({ coverImage: null });

  if (!displayItem) return <Container />;

  return (
    <Container>
      <PageScroll
        resetKey={editMode ? (editingItemId ?? "new-item") : activeItemId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        <ItemHero
          height={COLLECTION_HERO_HEIGHT}
          spacing={COLLECTION_HERO_SPACING}
          cardImage={displayItem.cardImage}
          coverImage={displayItem.coverImage}
          editable={editMode}
          onPressCard={handlePickCard}
          onPressCover={handlePickCover}
          onEditCover={handleEditCover}
          onRemoveCover={handleRemoveCover}
        />

        <EditLightbox
          image={coverImageToEdit}
          onClose={handleCloseCover}
          onSave={handleSaveCover}
          targetAspectRatio={screenWidth / COLLECTION_HERO_HEIGHT}
        />

        <PageHeader gap={7} style={{ marginBottom: 10 }}>
          <PageHeader.Title
            key={editMode ? "editing" : "display"}
            value={
              !editMode && !displayItem.title ? "New Item" : displayItem.title
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

        <FadeInOnMount>
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
        </FadeInOnMount>
      </PageScroll>

      <CollectionTrack
        editMode={editMode}
        onChangeItem={setActiveItemId}
        onPressActiveItem={handlePressActiveItem}
        onAddItem={handleAddItem}
        onCancelAddItem={handleCancelAddItem}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </Container>
  );
}
