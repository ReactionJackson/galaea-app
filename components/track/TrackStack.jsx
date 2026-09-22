import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import styled from "styled-components/native";
import { CollectionsTrack } from "./CollectionsTrack";
import { ItemsTrack } from "./ItemsTrack";

const Container = styled.View`
  width: 100%;
  height: 100%;
`;

const Layer = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const TrackStack = forwardRef(function TrackStack(
  {
    isEditable = false,
    editMode = false,
    dimmedItemIds = [],
    onPressActiveItem = () => {},
    onChangeItem = () => {},
    onAddItem = () => {},
    onCancelAddItem = () => {},
    onViewCollectionCard = () => {},
    onControlsChange = () => {},
    onChangeCollection = () => {},
  },
  ref,
) {
  const [viewingCollectionId, setViewingCollectionId] = useState(null);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [pendingAddItem, setPendingAddItem] = useState(false);
  const [collectionsSoloed, setCollectionsSoloed] = useState(false);
  const [browsingItems, setBrowsingItems] = useState(false);
  const [backVisible, setBackVisible] = useState(true);
  const itemsFade = useSharedValue(0);

  const itemsStyle = useAnimatedStyle(() => ({ opacity: itemsFade.value }));

  const handleFlipSettle = useCallback(
    (flippedIn) => {
      if (flippedIn) {
        itemsFade.value = withTiming(
          1,
          { duration: SLIDE_TRANSITION_DURATION },
          (finished) => {
            if (finished) scheduleOnRN(setBackVisible, false);
          },
        );
      } else {
        setViewingCollectionId(null);
        setCollectionsSoloed(false);
      }
    },
    [itemsFade],
  );

  const handleChooseCollection = useCallback((collectionId, itemId = null) => {
    setViewingCollectionId(collectionId);
    setPendingItemId(itemId);
    setPendingAddItem(false);
    setCollectionsSoloed(true);
    setBrowsingItems(true);
  }, []);

  const handleAddItemToCollection = useCallback((collectionId) => {
    setViewingCollectionId(collectionId);
    setPendingItemId(null);
    setPendingAddItem(true);
    setCollectionsSoloed(true);
    setBrowsingItems(true);
  }, []);

  const handleGoBackToCollections = useCallback(() => {
    setBackVisible(true);
    itemsFade.value = withTiming(0, { duration: SLIDE_TRANSITION_DURATION });
    setBrowsingItems(false);
  }, [itemsFade]);

  const handleResetInstant = useCallback(() => {
    itemsFade.value = 0;
    setBackVisible(true);
    setBrowsingItems(false);
  }, [itemsFade]);

  useImperativeHandle(
    ref,
    () => ({
      viewCollectionItem: handleChooseCollection,
      addItemToCollection: handleAddItemToCollection,
      reset: handleResetInstant,
    }),
    [handleChooseCollection, handleAddItemToCollection, handleResetInstant],
  );

  const handleAddItem = useCallback(
    () => onAddItem(viewingCollectionId),
    [onAddItem, viewingCollectionId],
  );

  const handleViewCollectionCard = useCallback(
    () => onViewCollectionCard(viewingCollectionId),
    [onViewCollectionCard, viewingCollectionId],
  );

  return (
    <Container>
      <Layer
        style={itemsStyle}
        pointerEvents={browsingItems && !backVisible ? "auto" : "none"}
      >
        <ItemsTrack
          key={viewingCollectionId}
          collectionId={viewingCollectionId}
          initialItemId={pendingItemId}
          initialAddItem={pendingAddItem}
          editMode={editMode}
          isEditable={isEditable}
          dimmedItemIds={dimmedItemIds}
          revealed={!backVisible}
          browsingItems={browsingItems}
          onChangeItem={onChangeItem}
          onPressActiveItem={onPressActiveItem}
          onAddItem={handleAddItem}
          onCancelAddItem={onCancelAddItem}
          onPressBack={handleGoBackToCollections}
          onViewCollectionCard={handleViewCollectionCard}
          onControlsChange={onControlsChange}
        />
      </Layer>
      <Layer
        style={{ opacity: backVisible ? 1 : 0 }}
        pointerEvents={
          !browsingItems && viewingCollectionId == null ? "auto" : "none"
        }
      >
        <CollectionsTrack
          soloed={collectionsSoloed}
          isEditable={isEditable}
          viewingCollectionId={viewingCollectionId}
          browsingItems={browsingItems}
          onChangeCollection={onChangeCollection}
          onPressActiveCollection={handleChooseCollection}
          onFlipSettle={handleFlipSettle}
        />
      </Layer>
    </Container>
  );
});
