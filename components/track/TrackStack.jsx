import {
  FADE_TRANSITION_DURATION,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { useCallback, useEffect, useState } from "react";
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

export function TrackStack({
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
}) {
  const [viewingCollectionId, setViewingCollectionId] = useState(null);
  const [collectionsSoloed, setCollectionsSoloed] = useState(false);
  const [browsingItems, setBrowsingItems] = useState(false);
  const [backVisible, setBackVisible] = useState(true);
  const itemsFade = useSharedValue(0);

  const itemsStyle = useAnimatedStyle(() => ({ opacity: itemsFade.value }));

  useEffect(() => {
    if (browsingItems) {
      const timer = setTimeout(
        () => fadeItemsIn(itemsFade, () => setBackVisible(false)),
        FADE_TRANSITION_DURATION,
      );
      return () => clearTimeout(timer);
    }
    fadeItemsOut(itemsFade, () => {
      setViewingCollectionId(null);
      setCollectionsSoloed(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browsingItems]);

  const handleChooseCollection = useCallback((collectionId) => {
    setViewingCollectionId(collectionId);
    setCollectionsSoloed(true);
    setBrowsingItems(true);
  }, []);

  const handleGoBackToCollections = useCallback(() => {
    setBackVisible(true);
    setBrowsingItems(false);
  }, []);

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
          editMode={editMode}
          isEditable={isEditable}
          dimmedItemIds={dimmedItemIds}
          revealed={!backVisible}
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
          onChangeCollection={onChangeCollection}
          onPressActiveCollection={handleChooseCollection}
        />
      </Layer>
    </Container>
  );
}
