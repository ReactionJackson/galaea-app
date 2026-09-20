import { CollectionItem } from "@/components/collection-item/CollectionItem";
import { CollectionItemHero } from "@/components/collection-item/CollectionItemHero";
import { AnimatedSpacer } from "@/components/interface/AnimateHeight";
import { FadeInOnMount } from "@/components/interface/FadeInOnMount";
import { ThemedText } from "@/components/interface/ThemedText";
import { EditLightbox } from "@/components/lightbox/EditLightbox";
import { PageHeader } from "@/components/page/PageHeader";
import { PageScroll } from "@/components/page/PageScroll";
import { CollectionsTrack } from "@/components/track/CollectionsTrack";
import { ItemsTrack } from "@/components/track/ItemsTrack";
import { TrackTray } from "@/components/track/TrackTray";
import { Colors } from "@/constants/theme";
import {
  COLLECTION_HERO_HEIGHT,
  COLLECTION_HERO_SPACING,
  FADE_TRANSITION_DURATION,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { pickAndStoreImage } from "@/utils/images";
import * as ImagePicker from "expo-image-picker";
import { Fragment, useCallback, useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const TrackStack = styled.View`
  width: 100%;
  height: 100%;
`;

const TrackLayer = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

function fadeItemsIn(itemsFade, onComplete) {
  itemsFade.value = withTiming(
    1,
    { duration: SLIDE_TRANSITION_DURATION },
    (finished) => {
      if (finished) scheduleOnRN(onComplete);
    },
  );
}

function fadeItemsOut(itemsFade, onComplete) {
  itemsFade.value = withTiming(
    0,
    { duration: SLIDE_TRANSITION_DURATION },
    (finished) => {
      if (finished) scheduleOnRN(onComplete);
    },
  );
}

export default function CollectionScreen() {
  const { state, dispatch, itemsById } = useApp();
  const { items, itemDraft, editingItemId } = state;
  const editMode = !!itemDraft;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeItemId, setActiveItemId] = useState(items[0]?.itemId);
  const [coverImageToEdit, setCoverImageToEdit] = useState(null);
  const [trayControls, setTrayControls] = useState({});
  const [viewingCollectionId, setViewingCollectionId] = useState(null);
  const [contentCollectionId, setContentCollectionId] = useState(
    () => state.collections[0]?.collectionId ?? null,
  );
  const [collectionsSoloed, setCollectionsSoloed] = useState(false);
  const [collectionsVisible, setCollectionsVisible] = useState(true);
  const [itemsFadeTarget, setItemsFadeTarget] = useState(0);
  const itemsFade = useSharedValue(0);

  const itemsStyle = useAnimatedStyle(() => ({ opacity: itemsFade.value }));

  useEffect(() => {
    if (itemsFadeTarget === 1) {
      const timer = setTimeout(
        () => fadeItemsIn(itemsFade, () => setCollectionsVisible(false)),
        FADE_TRANSITION_DURATION,
      );
      return () => clearTimeout(timer);
    }
    fadeItemsOut(itemsFade, () => {
      setViewingCollectionId(null);
      setCollectionsSoloed(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsFadeTarget]);

  const collectionStub = editMode
    ? null
    : state.collections.find((c) => c.collectionId === contentCollectionId);
  const activeItem = itemsById[activeItemId] ?? items[0];
  const displayItem = itemDraft ?? activeItem;
  const contentKey = editMode
    ? (editingItemId ?? "new-item")
    : collectionStub
      ? `collection-${collectionStub.collectionId}`
      : activeItemId;
  const orderedEntries = displayItem
    ? [...displayItem.entries].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )
    : [];

  const updateDraft = (changes) =>
    dispatch({ type: "UPDATE_ITEM_DRAFT", changes });

  const handleAddItem = useCallback(
    () =>
      dispatch({
        type: "ENTER_ITEM_EDIT",
        itemId: null,
        collectionId: viewingCollectionId,
      }),
    [dispatch, viewingCollectionId],
  );

  const handleCancelAddItem = useCallback(
    () => dispatch({ type: "CANCEL_ITEM_EDIT" }),
    [dispatch],
  );

  const handleDelete = () => {
    if (editingItemId == null) {
      dispatch({ type: "CANCEL_ITEM_EDIT" });
      return;
    }
    const collectionItems = items.filter(
      (it) => it.collectionId === viewingCollectionId,
    );
    const deletedIndex = collectionItems.findIndex(
      (it) => it.itemId === editingItemId,
    );
    const landingItem =
      deletedIndex > 0 ? collectionItems[deletedIndex - 1] : collectionItems[1];
    dispatch({ type: "DELETE_ITEM", itemId: editingItemId });
    if (landingItem) setActiveItemId(landingItem.itemId);
  };

  const handleChooseCollection = useCallback((collectionId) => {
    setViewingCollectionId(collectionId);
    setCollectionsSoloed(true);
    setItemsFadeTarget(1);
  }, []);

  const handleGoBackToCollections = useCallback(() => {
    setCollectionsVisible(true);
    setItemsFadeTarget(0);
  }, []);

  const handleChangeCollection = useCallback((collectionId) => {
    setContentCollectionId(collectionId);
  }, []);

  const handleViewCollectionCard = useCallback(() => {
    setContentCollectionId(viewingCollectionId);
  }, [viewingCollectionId]);

  const handleChangeItem = useCallback((itemId) => {
    setActiveItemId(itemId);
    setContentCollectionId(null);
  }, []);

  const handlePressActiveItem = useCallback(
    (itemId) => {
      if (editMode && editingItemId === itemId) {
        dispatch({ type: "CANCEL_ITEM_EDIT" });
      } else {
        dispatch({ type: "ENTER_ITEM_EDIT", itemId });
      }
    },
    [editMode, editingItemId, dispatch],
  );

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

  const handleCloseCover = () => setCoverImageToEdit(null);

  const handleEditCover = () => {
    if (displayItem.coverImage) setCoverImageToEdit(displayItem.coverImage);
  };

  const handleRemoveCover = () => updateDraft({ coverImage: null });

  if (!displayItem && !collectionStub) return <Container />;

  return (
    <Container>
      <PageScroll
        resetKey={contentKey}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        {collectionStub ? (
          <>
            <PageHeader gap={7} style={{ marginBottom: 10 }}>
              <PageHeader.Title
                value={`${collectionStub.name} Collection`}
                editable={false}
                onChangeText={() => {}}
              />
            </PageHeader>
            <View
              style={{
                height: screenHeight,
                marginHorizontal: -20,
                backgroundColor:
                  collectionStub.name === "Games"
                    ? "dodgerblue"
                    : "mediumseagreen",
              }}
            />
          </>
        ) : (
          <>
            <CollectionItemHero
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

            <FadeInOnMount>
              <Fragment key={contentKey}>
                {orderedEntries.map((entry) => (
                  <CollectionItem
                    key={entry.entryId}
                    editable={editMode}
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
              </Fragment>
            </FadeInOnMount>
          </>
        )}
      </PageScroll>

      <TrackTray
        editMode={editMode}
        trackHeight={125}
        trackPaddingTop={6}
        onDelete={handleDelete}
        onSave={handleSave}
        {...trayControls}
      >
        <TrackStack>
          <TrackLayer
            style={itemsStyle}
            pointerEvents={viewingCollectionId ? "auto" : "none"}
          >
            <ItemsTrack
              key={viewingCollectionId}
              collectionId={viewingCollectionId}
              editMode={editMode}
              revealed={!collectionsVisible}
              onChangeItem={handleChangeItem}
              onPressActiveItem={handlePressActiveItem}
              onAddItem={handleAddItem}
              onCancelAddItem={handleCancelAddItem}
              onPressBack={handleGoBackToCollections}
              onViewCollectionCard={handleViewCollectionCard}
              onControlsChange={setTrayControls}
            />
          </TrackLayer>
          <TrackLayer
            style={{ opacity: collectionsVisible ? 1 : 0 }}
            pointerEvents={viewingCollectionId ? "none" : "auto"}
          >
            <CollectionsTrack
              soloed={collectionsSoloed}
              onChangeCollection={handleChangeCollection}
              onPressActiveCollection={handleChooseCollection}
            />
          </TrackLayer>
        </TrackStack>
      </TrackTray>
    </Container>
  );
}
