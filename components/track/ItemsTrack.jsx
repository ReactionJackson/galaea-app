import { collectionCardColor } from "@/constants/theme";
import {
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
  SLIDE_TRANSITION_DURATION,
  TRACK_GAP,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import * as Haptics from "expo-haptics";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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

const BookendSlot = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  justify-content: center;
`;

const EmptyRow = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${TRACK_GAP}px;
`;

// Component:

export const ItemsTrack = memo(function ItemsTrack({
  collectionId,
  editMode = false,
  revealed = false,
  onChangeItem = () => {},
  onPressActiveItem = () => {},
  onAddItem = () => {},
  onCancelAddItem = () => {},
  onPressBack = () => {},
  onViewCollectionCard = () => {},
  onControlsChange = () => {},
}) {
  const { state, dispatch } = useApp();
  const collection = state.collections.find(
    (c) => c.collectionId === collectionId,
  );
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

  // null when neither bookend is centred; otherwise which one is.
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
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(
            editMode
              ? Haptics.ImpactFeedbackStyle.Light
              : Haptics.ImpactFeedbackStyle.Heavy,
          );
        }
      } else {
        onChangeItem(item.itemId);
      }
    },
  });

  const handleSwap = (direction) => {
    const item = items[activeIndex];
    if (!item) return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: "SWAP_ADJACENT_ITEM", itemId: item.itemId, direction });
  };

  const canSwapLeft = activeIndex > 0;
  const canSwapRight = activeIndex < items.length - 1;

  useEffect(() => {
    onControlsChange({
      onCancel: () => goToIndex(activeIndex),
      onSwapLeft: () => handleSwap("left"),
      onSwapRight: () => handleSwap("right"),
      canSwapLeft,
      canSwapRight,
    });
  });

  const hasArrivedRef = useRef(false);

  useEffect(() => {
    if (revealed && items.length > 0) {
      onViewCollectionCard();
      hasArrivedRef.current = true;
      setActiveBookend(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  useEffect(() => {
    if (activeBookend !== "collection" || !hasArrivedRef.current) return;
    const timer = setTimeout(onPressBack, SLIDE_TRANSITION_DURATION);
    return () => clearTimeout(timer);
  }, [activeBookend, onPressBack]);

  useEffect(() => {
    if (!editMode) {
      setActiveBookend((current) => (current === "add" ? null : current));
    }
  }, [editMode]);

  const handlePressCollectionCard = () => {
    if (activeBookend === "collection") return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveBookend("collection");
    onViewCollectionCard();
  };

  const handlePressAddBookend = () => {
    if (activeBookend === "add") {
      setActiveBookend(null);
      onCancelAddItem();
      return;
    }
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveBookend("add");
    onAddItem();
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

  const trackShift = useSharedValue(leadingShift);
  const isFirstShift = useRef(true);

  useEffect(() => {
    const target =
      activeBookend === "collection"
        ? leadingShift
        : activeBookend === "add"
          ? -trailingShift
          : 0;
    if (isFirstShift.current) {
      isFirstShift.current = false;
      trackShift.value = target;
      return;
    }
    trackShift.value = withTiming(target, {
      duration: SLIDE_TRANSITION_DURATION,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBookend, leadingShift, trailingShift]);

  const trackShiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackShift.value }],
  }));

  if (items.length === 0) {
    return (
      <EmptyRow>
        <CollectionCard
          thumbnails={collectionThumbnails}
          active
          inactiveOpacity={editMode ? 0.1 : 0.5}
          backgroundColor={collectionCardColor(collection?.color)}
          onPress={onPressBack}
          disabled={editMode}
        />
        <AddItemCard
          width={EMPTY_CARD_WIDTH}
          active={activeBookend === "add"}
          inactiveOpacity={editMode ? 0.1 : 0.5}
          onPress={handlePressAddBookend}
          disabled={editMode}
        />
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
        scrollEnabled={!editMode}
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
        {items.map((item, i) => (
          <Animated.View
            key={item.itemId}
            layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
            entering={FadeIn.duration(SLIDE_TRANSITION_DURATION)}
            style={{ zIndex: activeIndex === i ? 1 : 0 }}
          >
            <ItemCard
              cardImage={item.cardImage}
              active={(isScrolling && !isInternalScroll) || activeIndex === i}
              inactiveOpacity={editMode ? 0.1 : 0.5}
              onPress={() => handlePressItem(i)}
              disabled={editMode}
            />
            {i === 0 && (
              <BookendSlot style={{ right: firstItemWidth + TRACK_GAP }}>
                <CollectionCard
                  thumbnails={collectionThumbnails}
                  active={activeBookend === "collection"}
                  inactiveOpacity={editMode ? 0.1 : 0.5}
                  backgroundColor={collectionCardColor(collection?.color)}
                  onPress={handlePressCollectionCard}
                  disabled={editMode}
                />
              </BookendSlot>
            )}
            {i === items.length - 1 && (
              <BookendSlot style={{ left: lastItemWidth + TRACK_GAP }}>
                <AddItemCard
                  width={EMPTY_CARD_WIDTH}
                  active={activeBookend === "add"}
                  inactiveOpacity={editMode ? 0.1 : 0.5}
                  onPress={handlePressAddBookend}
                  disabled={editMode}
                />
              </BookendSlot>
            )}
          </Animated.View>
        ))}
      </ScrollContainer>
    </TrackShiftWrap>
  );
});
