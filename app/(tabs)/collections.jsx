import { ItemPage } from "@/components/collections/ItemPage";
import { OverviewPage } from "@/components/collections/OverviewPage";
import { TrackStack } from "@/components/track/TrackStack";
import { TrackTray } from "@/components/track/TrackTray";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { triggerHaptics } from "@/utils/haptics";
import {
  collectItemImages,
  deleteDroppedImages,
  deleteStoredImage,
  pickAndStoreImage,
} from "@/utils/images";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

async function pickImageAsset() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
  });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  return asset?.uri ? asset : null;
}

async function pickImage(kind) {
  const asset = await pickImageAsset();
  return asset ? pickAndStoreImage(asset, kind) : null;
}

export default function CollectionScreen() {
  const { state, dispatch, itemsById } = useApp();
  const { items, itemDraft, editingItemId } = state;
  const editMode = !!itemDraft;

  const [activeItemId, setActiveItemId] = useState(items[0]?.itemId);
  const [coverImageToEdit, setCoverImageToEdit] = useState(null);
  const [trayControls, setTrayControls] = useState({});
  const [contentCollectionId, setContentCollectionId] = useState(
    () => state.collections[0]?.collectionId ?? null,
  );
  const trackStackRef = useRef(null);
  const activeCollection = editMode
    ? null
    : state.collections.find((c) => c.collectionId === contentCollectionId);
  const showOverviewPage = !!activeCollection;
  const activeItem = itemsById[activeItemId] ?? items[0];
  const displayItem = itemDraft ?? activeItem;
  const contentKey = editMode
    ? (editingItemId ?? "new-item")
    : showOverviewPage
      ? `collection-${activeCollection.collectionId}`
      : activeItemId;
  const orderedEntries = displayItem
    ? [...displayItem.entries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((entry, i, sorted) => ({
          ...entry,
          entryNumber:
            itemsById[displayItem.itemId]?.entriesById[entry.entryId]
              ?.entryNumber ?? sorted.length - i,
        }))
    : [];
  const displayItemCollectionName = displayItem
    ? (state.collections.find(
        (c) => c.collectionId === displayItem.collectionId,
      )?.name ?? "")
    : "";

  const updateDraft = (changes) =>
    dispatch({ type: "UPDATE_ITEM_DRAFT", changes });

  const handleAddItem = useCallback(
    (collectionId) =>
      dispatch({
        type: "ENTER_ITEM_EDIT",
        itemId: null,
        collectionId,
      }),
    [dispatch],
  );

  const cancelItemEdit = useCallback(() => {
    const baseline = items.find((it) => it.itemId === editingItemId) ?? null;
    deleteDroppedImages(
      collectItemImages(itemDraft),
      collectItemImages(baseline),
    );
    dispatch({ type: "CANCEL_ITEM_EDIT" });
  }, [items, editingItemId, itemDraft, dispatch]);

  const handleDelete = () => {
    if (editingItemId == null) {
      cancelItemEdit();
      return;
    }
    const editingCollectionId = items.find(
      (it) => it.itemId === editingItemId,
    )?.collectionId;
    const collectionItems = items.filter(
      (it) => it.collectionId === editingCollectionId,
    );
    const deletedIndex = collectionItems.findIndex(
      (it) => it.itemId === editingItemId,
    );
    const landingItem =
      deletedIndex > 0 ? collectionItems[deletedIndex - 1] : collectionItems[1];
    dispatch({ type: "DELETE_ITEM", itemId: editingItemId });
    if (landingItem) setActiveItemId(landingItem.itemId);
  };

  const handleChangeCollection = useCallback((collectionId) => {
    setContentCollectionId(collectionId);
  }, []);

  const handleAddCollection = useCallback(() => {
    const collectionId =
      Math.max(0, ...state.collections.map((c) => c.collectionId)) + 1;
    dispatch({ type: "ADD_COLLECTION", collectionId });
    setContentCollectionId(collectionId);
  }, [state.collections, dispatch]);

  const handleChangeCollectionName = useCallback(
    (name) => {
      if (!activeCollection) return;
      dispatch({
        type: "UPDATE_COLLECTION_NAME",
        collectionId: activeCollection.collectionId,
        name,
      });
    },
    [activeCollection, dispatch],
  );

  const handlePressRowItem = useCallback((item) => {
    triggerHaptics("Light");
    trackStackRef.current?.viewCollectionItem(item.collectionId, item.itemId);
  }, []);

  const handlePressAddRow = useCallback((collectionId) => {
    triggerHaptics("Light");
    trackStackRef.current?.addItemToCollection(collectionId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      trackStackRef.current?.reset();
    }, []),
  );

  const handleChangeItem = useCallback((itemId) => {
    setActiveItemId(itemId);
    setContentCollectionId(null);
  }, []);

  const handlePressActiveItem = useCallback(
    (itemId) => {
      if (editMode && editingItemId === itemId) {
        cancelItemEdit();
      } else {
        dispatch({ type: "ENTER_ITEM_EDIT", itemId });
      }
    },
    [editMode, editingItemId, dispatch, cancelItemEdit],
  );

  const handleSave = () => {
    if (!editMode) return;
    const isNew = editingItemId == null;
    const itemId = isNew
      ? Math.max(0, ...items.map((it) => it.itemId)) + 1
      : editingItemId;
    const baseline = isNew
      ? null
      : (items.find((it) => it.itemId === editingItemId) ?? null);
    deleteDroppedImages(
      collectItemImages(baseline),
      collectItemImages(itemDraft),
    );
    dispatch({ type: "SAVE_ITEM_EDIT", itemId });
    if (isNew) setActiveItemId(itemId);
  };

  const handlePickCard = async () => {
    const asset = await pickImageAsset();
    if (!asset) return;
    const [cardImage, cardThumbnail] = await Promise.all([
      pickAndStoreImage(asset, "card"),
      pickAndStoreImage(asset, "card-thumbnail"),
    ]);
    updateDraft({ cardImage, cardThumbnail });
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

  const handleCloseCover = () => {
    if (
      coverImageToEdit &&
      coverImageToEdit.uri !== displayItem?.coverImage?.uri
    ) {
      deleteStoredImage(coverImageToEdit);
    }
    setCoverImageToEdit(null);
  };

  const handleEditCover = () => {
    if (displayItem.coverImage) setCoverImageToEdit(displayItem.coverImage);
  };

  const handleRemoveCover = () => updateDraft({ coverImage: null });

  if (!displayItem && !showOverviewPage) return <Container />;

  return (
    <Container>
      {showOverviewPage ? (
        <OverviewPage
          collection={activeCollection}
          items={items}
          editable
          onChangeName={handleChangeCollectionName}
          onPressItem={handlePressRowItem}
          onPressAdd={handlePressAddRow}
        />
      ) : (
        <ItemPage
          item={displayItem}
          collectionName={displayItemCollectionName}
          editMode={editMode}
          contentKey={contentKey}
          coverImageToEdit={coverImageToEdit}
          orderedEntries={orderedEntries}
          onPressCard={handlePickCard}
          onPressCover={handlePickCover}
          onEditCover={handleEditCover}
          onRemoveCover={handleRemoveCover}
          onCloseCover={handleCloseCover}
          onSaveCover={handleSaveCover}
          onChangeTitle={(title) => updateDraft({ title })}
          onUpdateEntry={(entryId, changes) =>
            dispatch({ type: "UPDATE_ITEM_DRAFT_ENTRY", entryId, changes })
          }
        />
      )}

      <TrackTray
        editMode={editMode}
        trackHeight={125}
        trackPaddingTop={6}
        onDelete={handleDelete}
        onSave={handleSave}
        {...trayControls}
      >
        <TrackStack
          ref={trackStackRef}
          isEditable
          editMode={editMode}
          onPressActiveItem={handlePressActiveItem}
          onChangeItem={handleChangeItem}
          onAddItem={handleAddItem}
          onCancelAddItem={cancelItemEdit}
          onViewCollectionCard={handleChangeCollection}
          onChangeCollection={handleChangeCollection}
          onAddCollection={handleAddCollection}
          onControlsChange={setTrayControls}
        />
      </TrackTray>
    </Container>
  );
}
