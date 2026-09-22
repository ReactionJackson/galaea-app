import {
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
  SLIDE_TRANSITION_DURATION,
  TRACK_GAP,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { triggerHaptics } from "@/utils/haptics";
import { memo, useEffect, useMemo, useRef } from "react";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";
import { CollectionCard } from "./CollectionCard";
import { AddItemCard, ItemCard } from "./ItemCard";

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

// Component:

export const ItemsTrack = memo(function ItemsTrack({
  collectionId,
  initialItemId = null,
  initialAddItem = false,
  editMode = false,
  isEditable = false,
  revealed = false,
  browsingItems = false,
  dimmedItemIds = [],
  onChangeItem = () => {},
  onPressActiveItem = () => {},
  onAddItem = () => {},
  onCancelAddItem = () => {},
  onPressBack = () => {},
  onViewCollectionCard = () => {},
  onControlsChange = () => {},
}) {
  const locked = isEditable && editMode;
  const { state, dispatch } = useApp();
  const items = useMemo(
    () => state.items.filter((item) => item.collectionId === collectionId),
    [state.items, collectionId],
  );
  const collectionThumbnails = useMemo(
    () => items.slice(0, 4).map((item) => item.cardThumbnail),
    [items],
  );

  const realItemWidths = useItemCardSizes(items, ITEM_HEIGHT);
  const itemWidths = useMemo(
    () => [ITEM_HEIGHT, ...realItemWidths],
    [realItemWidths],
  );
  const itemIds = useMemo(
    () => ["back", ...items.map((it) => it.itemId)],
    [items],
  );

  // Only a deliberate tap on the back card should leave the collection -
  // and only once the scroll has actually got there, not the instant the
  // tap fires (which is otherwise immediate, same as tapping any item).
  // Swiping there instead just settles on it like any other position, so
  // this ref is only ever set by the tap handler itself.
  const pendingBackExitRef = useRef(false);

  const {
    ADD_INDEX,
    activeIndex,
    isScrolling,
    isInternalScroll,
    basePadding,
    paddingEnd,
    offsets,
    initialContentOffset,
    trackRef,
    goToIndex,
    scrollToIndex,
    handleTrackLayout,
    handleContentSizeChange,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
  } = useSnapTrack({
    itemWidths,
    itemIds,
    itemSpacing: TRACK_GAP,
    showAddButton: isEditable,
    addButtonWidth: EMPTY_CARD_WIDTH,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
      if (index === 0) {
        if (pendingBackExitRef.current && !alreadyActive) return;
        if (alreadyActive) onPressBack();
        else onViewCollectionCard();
        return;
      }
      const item = items[index - 1];
      if (!item) return;
      if (alreadyActive) {
        onPressActiveItem(item.itemId);
        triggerHaptics(locked ? "Light" : "Heavy");
      } else {
        onChangeItem(item.itemId);
      }
    },
    onArrive: (index) => {
      if (index === 0 && pendingBackExitRef.current) {
        pendingBackExitRef.current = false;
        onPressBack();
      }
    },
    onAdd: onAddItem,
    onCancelAdd: onCancelAddItem,
  });

  const handlePressBack = () => {
    if (activeIndex !== 0) pendingBackExitRef.current = true;
    goToIndex(0);
  };

  const hasActiveItem = activeIndex >= 1 && activeIndex <= items.length;
  const canSwapLeft = hasActiveItem && activeIndex > 1;
  const canSwapRight = hasActiveItem && activeIndex < items.length;

  const handleSwap = (direction) => {
    const item = items[activeIndex - 1];
    if (!item) return;
    triggerHaptics("Light");
    dispatch({ type: "SWAP_ADJACENT_ITEM", itemId: item.itemId, direction });
  };

  useEffect(() => {
    onControlsChange({
      onCancel: () => goToIndex(activeIndex),
      onSwapLeft: () => handleSwap("left"),
      onSwapRight: () => handleSwap("right"),
      canSwapLeft,
      canSwapRight,
    });
  });

  const wasRevealedRef = useRef(false);

  useEffect(() => {
    const justArrived = revealed && !wasRevealedRef.current;
    wasRevealedRef.current = revealed;
    if (!revealed) return;
    if (justArrived) onViewCollectionCard();
    if (initialAddItem) {
      goToIndex(ADD_INDEX, { haptic: false });
      return;
    }
    let targetIndex = 0;
    if (initialItemId) {
      targetIndex = Math.max(
        0,
        items.findIndex((it) => it.itemId === initialItemId) + 1,
      );
    } else if (justArrived) {
      if (items.length > 0) targetIndex = 1;
      else if (isEditable) targetIndex = ADD_INDEX;
    }
    if (targetIndex !== 0) goToIndex(targetIndex, { haptic: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, initialItemId, initialAddItem]);

  useEffect(() => {
    if (!locked && activeIndex === ADD_INDEX) scrollToIndex(items.length, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  return (
    <ScrollContainer
      horizontal
      ref={trackRef}
      contentOffset={initialContentOffset}
      onLayout={handleTrackLayout}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEnabled={!locked}
      snapToOffsets={offsets}
      decelerationRate="fast"
      onContentSizeChange={handleContentSizeChange}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: TRACK_GAP,
        paddingInlineStart: basePadding,
        paddingInlineEnd: paddingEnd,
        alignItems: "center",
      }}
    >
      <CollectionCard
        thumbnails={collectionThumbnails}
        active={(isScrolling && !isInternalScroll) || activeIndex === 0}
        inactiveOpacity={locked ? 0.5 : 1}
        flipped={browsingItems}
        $showBorder={revealed}
        onPress={handlePressBack}
        disabled={locked}
      />
      {items.map((item, i) => {
        const index = i + 1;
        const dimmed = dimmedItemIds.includes(item.itemId);
        return (
          <Animated.View
            key={item.itemId}
            layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
            entering={FadeIn.duration(SLIDE_TRANSITION_DURATION)}
            style={{ zIndex: activeIndex === index ? 1 : 0 }}
          >
            <ItemCard
              cardImage={item.cardImage}
              active={
                !dimmed &&
                ((isScrolling && !isInternalScroll) || activeIndex === index)
              }
              inactiveOpacity={dimmed || locked ? 0.2 : 1}
              onPress={() => goToIndex(index)}
              disabled={locked}
            />
          </Animated.View>
        );
      })}
      {isEditable && (
        <AddItemCard
          $width={EMPTY_CARD_WIDTH}
          active={activeIndex === ADD_INDEX}
          inactiveOpacity={locked ? 0.5 : 1}
          onPress={() => goToIndex(ADD_INDEX)}
          disabled={locked}
        />
      )}
    </ScrollContainer>
  );
});
