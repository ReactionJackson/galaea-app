import { ITEM_HEIGHT, SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { useMemo } from "react";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";
import { AddItemCard } from "./ItemCard";
import { CollectionCard } from "./CollectionCard";

// Constants:

const ITEM_SPACING = 10;
const INACTIVE_OPACITY = 0.5;

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

// Component:

export function CollectionsTrack({
  onChangeCollection = () => {},
  onPressActiveCollection = () => {},
  onAddCollection = () => {},
  onCancelAddCollection = () => {},
}) {
  const { state } = useApp();
  const collections = state.collections;
  const itemsByCollection = useMemo(() => {
    const map = {};
    for (const item of state.items) {
      (map[item.collectionId] ??= []).push(item);
    }
    return map;
  }, [state.items]);
  const itemWidths = useMemo(
    () => collections.map(() => ITEM_HEIGHT),
    [collections.length],
  );
  const itemIds = useMemo(
    () => collections.map((c) => c.collectionId),
    [collections],
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
    itemSpacing: ITEM_SPACING,
    showAddButton: true,
    addButtonWidth: ITEM_HEIGHT,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
      const collection = collections[index];
      if (!collection) return;
      if (alreadyActive) {
        onPressActiveCollection(collection.collectionId);
      } else {
        onChangeCollection(collection.collectionId);
      }
    },
    onAdd: onAddCollection,
    onCancelAdd: onCancelAddCollection,
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
      snapToOffsets={offsets}
      decelerationRate="fast"
      onContentSizeChange={handleContentSizeChange}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: ITEM_SPACING,
        paddingInlineStart: basePadding,
        paddingInlineEnd: paddingEnd,
        alignItems: "center",
      }}
    >
      {collections.map((collection, i) => {
        const thumbnails = (itemsByCollection[collection.collectionId] ?? [])
          .map((item) => item.cardThumbnail)
          .filter(Boolean)
          .slice(0, 4);
        return (
          <Animated.View
            key={collection.collectionId}
            layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
            entering={FadeIn.duration(SLIDE_TRANSITION_DURATION)}
          >
            <CollectionCard
              thumbnails={thumbnails}
              active={(isScrolling && !isInternalScroll) || activeIndex === i}
              inactiveOpacity={INACTIVE_OPACITY}
              onPress={() => goToIndex(i)}
            />
          </Animated.View>
        );
      })}
      <AddItemCard
        width={ITEM_HEIGHT}
        active={isScrolling || activeIndex === ADD_INDEX}
        inactiveOpacity={INACTIVE_OPACITY}
        onPress={() => goToIndex(ADD_INDEX)}
      />
    </ScrollContainer>
  );
}
