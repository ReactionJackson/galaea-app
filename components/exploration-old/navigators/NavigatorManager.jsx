import { CollectionsNavigator } from "@/components/exploration/navigators/CollectionsNavigator";
import { ItemsNavigator } from "@/components/exploration/navigators/ItemsNavigator";
import { BlurView } from "@/components/interface/BlurView";
import { Button } from "@/components/interface/Button";
import { ArrowIcon } from "@/components/interface/icons/ArrowIcon";
import { Colors } from "@/constants/theme";
import {
  FADE_TRANSITION_DURATION,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import styled from "styled-components/native";

const Container = styled(Animated.View)`
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`;

const TrackContainer = styled.View`
  height: ${({ trackHeight }) => trackHeight}px;
  padding-top: ${({ trackPaddingTop }) => trackPaddingTop}px;
  align-items: center;
`;

const ControlsContainer = styled.View`
  padding: 20px;
  padding-top: 10px;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

const MoveButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
`;

const CircleButton = styled.Pressable`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  justify-content: center;
  align-items: center;
  border: 2px solid ${Colors.buttonBorder};
`;

// Fades in/out smoothly on disable rather than snapping, since a plain
// CSS opacity interpolation on a Pressable has no transition in RN.
function SwapButton({ onPress, disabled, children }) {
  const dimmedStyle = useAnimatedTransition(
    !disabled,
    { opacity: [0.3, 1] },
    { duration: FADE_TRANSITION_DURATION },
  );

  return (
    <Animated.View style={dimmedStyle}>
      <CircleButton onPress={onPress} disabled={disabled}>
        {children}
      </CircleButton>
    </Animated.View>
  );
}

export function NavigatorManager({
  editMode = false,
  trackHeight = 90,
  trackPaddingTop = 25,
  onDelete,
  onCancel,
  onSave,
  onSwapLeft,
  onSwapRight,
  canSwapLeft = true,
  canSwapRight = true,
  children,
}) {
  const containerStyle = useAnimatedTransition(
    editMode,
    { translateY: [60, 0] },
    { duration: SLIDE_TRANSITION_DURATION },
  );

  return (
    <Container style={containerStyle}>
      <BlurView>
        <TrackContainer
          trackHeight={trackHeight}
          trackPaddingTop={trackPaddingTop}
        >
          {children}
        </TrackContainer>
        <ControlsContainer>
          {onSwapLeft && onSwapRight && (
            <MoveButtonsContainer>
              <SwapButton onPress={onSwapLeft} disabled={!canSwapLeft}>
                <ArrowIcon
                  rotation={180}
                  color={Colors.button.secondary.text}
                />
              </SwapButton>
              <SwapButton onPress={onSwapRight} disabled={!canSwapRight}>
                <ArrowIcon color={Colors.button.secondary.text} />
              </SwapButton>
            </MoveButtonsContainer>
          )}
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" haptics="Medium" onPress={onSave}>
            Save
          </Button>
        </ControlsContainer>
      </BlurView>
    </Container>
  );
}

// Manages which of the two Collections/Items navigators is showing and the
// flip transition between them, for the journal entry item-picker feature.

const PickerContainer = styled.View`
  width: 100%;
  height: 100%;
`;

const PickerLayer = styled(Animated.View)`
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
    onAddCollection = () => {},
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
        // eslint-disable-next-line react-hooks/immutability
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
    // eslint-disable-next-line react-hooks/immutability
    itemsFade.value = withTiming(0, { duration: SLIDE_TRANSITION_DURATION });
    setBrowsingItems(false);
    onChangeCollection(viewingCollectionId);
  }, [itemsFade, onChangeCollection, viewingCollectionId]);

  const handleResetInstant = useCallback(() => {
    // eslint-disable-next-line react-hooks/immutability
    itemsFade.value = 0;
    setBackVisible(true);
    setBrowsingItems(false);
    if (viewingCollectionId != null) onChangeCollection(viewingCollectionId);
    setViewingCollectionId(null);
    setCollectionsSoloed(false);
  }, [itemsFade, onChangeCollection, viewingCollectionId]);

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
    <PickerContainer>
      <PickerLayer
        style={itemsStyle}
        pointerEvents={browsingItems && !backVisible ? "auto" : "none"}
      >
        <ItemsNavigator
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
      </PickerLayer>
      <PickerLayer
        style={{ opacity: backVisible ? 1 : 0 }}
        pointerEvents={
          !browsingItems && viewingCollectionId == null ? "auto" : "none"
        }
      >
        <CollectionsNavigator
          soloed={collectionsSoloed}
          isEditable={isEditable}
          viewingCollectionId={viewingCollectionId}
          browsingItems={browsingItems}
          onChangeCollection={onChangeCollection}
          onPressActiveCollection={handleChooseCollection}
          onAddCollection={onAddCollection}
          onFlipSettle={handleFlipSettle}
        />
      </PickerLayer>
    </PickerContainer>
  );
});
