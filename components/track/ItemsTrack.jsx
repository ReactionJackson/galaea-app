import {
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
  SLIDE_TRANSITION_DURATION,
  TRACK_GAP,
} from "@/constants/values";
import { collectionCardColor } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import * as Haptics from "expo-haptics";
import { memo, useEffect, useMemo } from "react";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";
import { CollectionCard } from "./CollectionCard";
import { AddItemCard, ItemCard } from "./ItemCard";

// Constants:

const COLLECTION_CARD_ID = "__collection__";

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

// Component:

export const ItemsTrack = memo(function ItemsTrack({
  collectionId,
  editMode = false,
  onChangeItem = () => {},
  onPressActiveItem = () => {},
  onAddItem = () => {},
  onCancelAddItem = () => {},
  onPressBack = () => {},
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
    () =>
      items
        .map((item) => item.cardThumbnail)
        .filter(Boolean)
        .slice(0, 4),
    [items],
  );
  const realItemWidths = useItemCardSizes(items, ITEM_HEIGHT);
  const itemWidths = useMemo(
    () => [ITEM_HEIGHT, ...realItemWidths],
    [realItemWidths],
  );
  const itemIds = useMemo(
    () => [COLLECTION_CARD_ID, ...items.map((it) => it.itemId)],
    [items],
  );

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
    handleTrackLayout,
    handleContentSizeChange,
    handleScrollBeginDrag,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
  } = useSnapTrack({
    itemWidths,
    itemIds,
    itemSpacing: TRACK_GAP,
    showAddButton: true,
    addButtonWidth: EMPTY_CARD_WIDTH,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
      if (index === 0) {
        if (alreadyActive) onPressBack();
        return;
      }
      const item = items[index - 1];
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
    // A tap "from afar" on the leading CollectionCard doesn't go back until
    // the jump to centre it actually finishes - a swipe that happens to
    // settle there never reaches here, only a genuine tap does (see
    // useSnapTrack).
    onArrive: (index) => {
      if (index === 0) onPressBack();
    },
    onAdd: onAddItem,
    onCancelAdd: onCancelAddItem,
  });

  const handleSwap = (direction) => {
    const item = items[activeIndex - 1];
    if (!item) return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: "SWAP_ADJACENT_ITEM", itemId: item.itemId, direction });
  };

  const canSwapLeft = activeIndex !== ADD_INDEX && activeIndex > 1;
  const canSwapRight = activeIndex !== ADD_INDEX && activeIndex < items.length;

  useEffect(() => {
    onControlsChange({
      onCancel: () => goToIndex(activeIndex),
      onSwapLeft: () => handleSwap("left"),
      onSwapRight: () => handleSwap("right"),
      canSwapLeft,
      canSwapRight,
    });
  });

  return (
    <ScrollContainer
      horizontal
      ref={trackRef}
      contentOffset={initialContentOffset}
      onLayout={handleTrackLayout}
      onScrollBeginDrag={handleScrollBeginDrag}
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
      <Animated.View style={{ zIndex: activeIndex === 0 ? 1 : 0 }}>
        <CollectionCard
          thumbnails={collectionThumbnails}
          active={(isScrolling && !isInternalScroll) || activeIndex === 0}
          inactiveOpacity={editMode ? 0.1 : 0.5}
          backgroundColor={collectionCardColor(collection?.color)}
          onPress={() => goToIndex(0)}
          disabled={editMode}
        />
      </Animated.View>
      {items.map((item, i) => (
        <Animated.View
          key={item.itemId}
          layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
          entering={FadeIn.duration(SLIDE_TRANSITION_DURATION)}
          style={{ zIndex: activeIndex === i + 1 ? 1 : 0 }}
        >
          <ItemCard
            cardImage={item.cardImage}
            active={(isScrolling && !isInternalScroll) || activeIndex === i + 1}
            inactiveOpacity={editMode ? 0.1 : 0.5}
            onPress={() => goToIndex(i + 1)}
            disabled={editMode}
          />
        </Animated.View>
      ))}
      <AddItemCard
        width={EMPTY_CARD_WIDTH}
        active={isScrolling || activeIndex === ADD_INDEX}
        inactiveOpacity={editMode ? 0.1 : 0.5}
        onPress={() => goToIndex(ADD_INDEX)}
        disabled={editMode}
      />
    </ScrollContainer>
  );
});
