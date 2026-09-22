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
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import styled from "styled-components/native";
import { CollectionCard } from "./CollectionCard";
import { AddItemCard, ItemCard } from "./ItemCard";

// Styled Components:

const TrackShiftWrap = styled(Animated.View)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const BookendSlot = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
  justify-content: center;
`;

const EmptyRow = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${TRACK_GAP}px;
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
  const itemWidths = useItemCardSizes(items, ITEM_HEIGHT);
  const itemIds = useMemo(() => items.map((it) => it.itemId), [items]);

  const [activeBookend, setActiveBookend] = useState("collection");

  const {
    activeIndex,
    isScrolling,
    isInternalScroll,
    basePadding,
    paddingEnd,
    offsets,
    initialContentOffset,
    trackRef,
    goToIndex,
    handleTrackLayout,
    handleContentSizeChange,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
  } = useSnapTrack({
    itemWidths,
    itemIds,
    itemSpacing: TRACK_GAP,
    showAddButton: false,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
      setActiveBookend(null);
      const item = items[index];
      if (!item) return;
      if (alreadyActive) {
        onPressActiveItem(item.itemId);
        triggerHaptics(locked ? "Light" : "Heavy");
      } else {
        onChangeItem(item.itemId);
      }
    },
  });

  const handleSwap = (direction) => {
    const item = items[activeIndex];
    if (!item) return;
    triggerHaptics("Light");
    dispatch({ type: "SWAP_ADJACENT_ITEM", itemId: item.itemId, direction });
  };

  const canSwapLeft = activeIndex > 0;
  const canSwapRight = activeIndex < items.length - 1;
  const pendingAfterShiftRef = useRef(null);

  const handleCancelAdd = () => {
    setActiveBookend(null);
    onCancelAddItem();
    if (items.length === 0) pendingAfterShiftRef.current = onPressBack;
  };

  const activateAddBookend = () => {
    const lastIndex = items.length - 1;
    if (lastIndex >= 0 && activeIndex !== lastIndex) {
      goToIndex(lastIndex, { haptic: false });
    }
    setActiveBookend("add");
    onAddItem();
  };

  useEffect(() => {
    onControlsChange({
      onCancel: () => {
        if (activeBookend === "add") {
          handleCancelAdd();
          return;
        }
        goToIndex(activeIndex);
      },
      onSwapLeft: () => handleSwap("left"),
      onSwapRight: () => handleSwap("right"),
      canSwapLeft,
      canSwapRight,
    });
  });

  const hasArrivedRef = useRef(false);

  useEffect(() => {
    if (!revealed) return;
    onViewCollectionCard();
    hasArrivedRef.current = true;
    if (initialAddItem) {
      activateAddBookend();
      return;
    }
    if (items.length === 0) {
      if (isEditable) activateAddBookend();
      return;
    }
    setActiveBookend(null);
    const targetIndex = Math.max(
      0,
      initialItemId ? items.findIndex((it) => it.itemId === initialItemId) : 0,
    );
    if (targetIndex === activeIndex) {
      onChangeItem(items[targetIndex].itemId);
    } else {
      goToIndex(targetIndex, { haptic: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  useEffect(() => {
    if (activeBookend !== "collection" || !hasArrivedRef.current) return;
    const timer = setTimeout(onPressBack, SLIDE_TRANSITION_DURATION);
    return () => clearTimeout(timer);
  }, [activeBookend, onPressBack]);

  useEffect(() => {
    if (!locked) {
      setActiveBookend((current) => (current === "add" ? null : current));
    }
  }, [locked]);

  const handlePressCollectionCard = () => {
    if (activeBookend === "collection") return;
    triggerHaptics("Light");
    if (activeIndex !== 0) goToIndex(0, { haptic: false });
    setActiveBookend("collection");
    onViewCollectionCard();
  };

  const handlePressAddBookend = () => {
    if (activeBookend === "add") {
      handleCancelAdd();
      return;
    }
    triggerHaptics("Light");
    activateAddBookend();
  };

  const handleScrollBeginDragAndReset = () => {
    handleScrollBeginDrag();
    setActiveBookend(null);
  };

  const handlePressItem = (i) => {
    if (activeBookend != null) {
      setActiveBookend(null);
      const item = items[i];
      if (item) onChangeItem(item.itemId);
      return;
    }
    goToIndex(i);
  };

  const firstItemWidth = itemWidths[0] ?? 0;
  const lastItemWidth = itemWidths[itemWidths.length - 1] ?? 0;
  const leadingShift = firstItemWidth / 2 + TRACK_GAP + ITEM_HEIGHT / 2;
  const trailingShift = lastItemWidth / 2 + TRACK_GAP + EMPTY_CARD_WIDTH / 2;

  const itemsSpan =
    itemWidths.reduce((sum, w) => sum + w, 0) +
    TRACK_GAP * Math.max(0, itemWidths.length - 1);

  const emptyCollectionShift = (TRACK_GAP + EMPTY_CARD_WIDTH) / 2;
  const emptyAddShift = (TRACK_GAP + ITEM_HEIGHT) / 2;

  const trackShift = useSharedValue(
    items.length === 0 ? emptyCollectionShift : leadingShift,
  );
  const isFirstShift = useRef(true);

  useEffect(() => {
    const empty = items.length === 0;
    const target = empty
      ? isEditable
        ? activeBookend === "add"
          ? -emptyAddShift
          : emptyCollectionShift
        : 0
      : activeBookend === "collection"
        ? leadingShift
        : activeBookend === "add"
          ? -trailingShift
          : 0;
    const afterShift = pendingAfterShiftRef.current;
    pendingAfterShiftRef.current = null;
    if (isFirstShift.current) {
      isFirstShift.current = false;
      trackShift.value = target;
      if (afterShift) afterShift();
      return;
    }
    trackShift.value = withTiming(
      target,
      { duration: SLIDE_TRANSITION_DURATION },
      (finished) => {
        if (finished && afterShift) scheduleOnRN(afterShift);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeBookend,
    leadingShift,
    trailingShift,
    items.length,
    isEditable,
    emptyCollectionShift,
    emptyAddShift,
  ]);

  const trackShiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackShift.value }],
  }));

  if (items.length === 0) {
    return (
      <EmptyRow style={trackShiftStyle}>
        <CollectionCard
          thumbnails={collectionThumbnails}
          active
          inactiveOpacity={locked ? 0.5 : 1}
          flipped={browsingItems}
          $showBorder={revealed}
          onPress={onPressBack}
          disabled={locked}
        />
        {isEditable && (
          <AddItemCard
            $width={EMPTY_CARD_WIDTH}
            active={activeBookend === "add"}
            inactiveOpacity={locked ? 0.5 : 1}
            onPress={handlePressAddBookend}
            disabled={locked}
          />
        )}
      </EmptyRow>
    );
  }

  return (
    <TrackShiftWrap style={trackShiftStyle}>
      <ScrollContainer
        horizontal
        ref={trackRef}
        contentOffset={initialContentOffset}
        onLayout={handleTrackLayout}
        onScrollBeginDrag={handleScrollBeginDragAndReset}
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
        <BookendSlot
          layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
          style={{ left: basePadding - TRACK_GAP - ITEM_HEIGHT }}
        >
          <CollectionCard
            thumbnails={collectionThumbnails}
            active={activeBookend === "collection"}
            inactiveOpacity={locked ? 0.5 : 1}
            flipped={browsingItems}
            $showBorder={revealed}
            onPress={handlePressCollectionCard}
            disabled={locked}
          />
        </BookendSlot>
        {items.map((item, i) => {
          const dimmed = dimmedItemIds.includes(item.itemId);
          return (
            <Animated.View
              key={item.itemId}
              layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
              entering={FadeIn.duration(SLIDE_TRANSITION_DURATION)}
              style={{ zIndex: activeIndex === i ? 1 : 0 }}
            >
              <ItemCard
                cardImage={item.cardImage}
                active={
                  !dimmed &&
                  activeBookend == null &&
                  ((isScrolling && !isInternalScroll) || activeIndex === i)
                }
                inactiveOpacity={dimmed || locked ? 0.2 : 1}
                onPress={() => handlePressItem(i)}
                disabled={locked}
              />
            </Animated.View>
          );
        })}
        {isEditable && (
          <BookendSlot
            layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
            style={{ left: basePadding + itemsSpan + TRACK_GAP }}
          >
            <AddItemCard
              $width={EMPTY_CARD_WIDTH}
              active={activeBookend === "add"}
              inactiveOpacity={locked ? 0.5 : 1}
              onPress={handlePressAddBookend}
              disabled={locked}
            />
          </BookendSlot>
        )}
      </ScrollContainer>
    </TrackShiftWrap>
  );
});
