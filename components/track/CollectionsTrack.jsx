import {
  ITEM_HEIGHT,
  SLIDE_TRANSITION_DURATION,
  TRACK_GAP,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { triggerHaptics } from "@/utils/haptics";
import { memo, useMemo } from "react";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";
import { CollectionCard } from "./CollectionCard";
import { AddItemCard } from "./ItemCard";

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

// Component:

export const CollectionsTrack = memo(function CollectionsTrack({
  soloed = false,
  isEditable = false,
  viewingCollectionId = null,
  browsingItems = false,
  onChangeCollection = () => {},
  onPressActiveCollection = () => {},
  onAddCollection = () => {},
  onCancelAddCollection = () => {},
  onFlipSettle,
}) {
  const inactiveOpacity = soloed ? 0 : 1;
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
    itemSpacing: TRACK_GAP,
    showAddButton: isEditable,
    addButtonWidth: ITEM_HEIGHT,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
      const collection = collections[index];
      if (!collection) return;
      if (alreadyActive) {
        triggerHaptics("Light");
        onPressActiveCollection(collection.collectionId);
      } else {
        onChangeCollection(collection.collectionId);
      }
    },
    onArrive: (index) => {
      const collection = collections[index];
      if (!collection) return;
      if (!isEditable) onPressActiveCollection(collection.collectionId);
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
        gap: TRACK_GAP,
        paddingInlineStart: basePadding,
        paddingInlineEnd: paddingEnd,
        alignItems: "center",
      }}
    >
      {collections.map((collection, i) => {
        const thumbnails = (itemsByCollection[collection.collectionId] ?? [])
          .slice(0, 4)
          .map((item) => item.cardThumbnail);
        return (
          <Animated.View
            key={collection.collectionId}
            layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
            entering={FadeIn.duration(SLIDE_TRANSITION_DURATION)}
          >
            <CollectionCard
              thumbnails={thumbnails}
              active={(isScrolling && !isInternalScroll) || activeIndex === i}
              inactiveOpacity={inactiveOpacity}
              flipped={
                collection.collectionId === viewingCollectionId && browsingItems
              }
              onFlipSettle={
                collection.collectionId === viewingCollectionId
                  ? onFlipSettle
                  : undefined
              }
              onPress={() => goToIndex(i)}
            />
          </Animated.View>
        );
      })}
      {isEditable && (
        <AddItemCard
          $width={ITEM_HEIGHT}
          $radius={20}
          active={isScrolling || activeIndex === ADD_INDEX}
          inactiveOpacity={inactiveOpacity}
          onPress={() => goToIndex(ADD_INDEX)}
        />
      )}
    </ScrollContainer>
  );
});
