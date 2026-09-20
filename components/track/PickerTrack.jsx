import { Colors } from "@/constants/theme";
import { ITEM_HEIGHT, TRACK_GAP } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { useMemo } from "react";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";
import { ItemCard } from "./ItemCard";

const SCROLL_SLACK = 20;
const CONTAINER_PADDING = 15 - SCROLL_SLACK / 2;

const Container = styled.View`
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${Colors.border};
  background-color: ${Colors.surfaceTint};
  padding: ${CONTAINER_PADDING}px 0;
`;

const ScrollContainer = styled(Animated.ScrollView)`
  width: 100%;
  height: ${ITEM_HEIGHT + SCROLL_SLACK}px;
`;

export function PickerTrack({ attachedItemIds = [], onSelect = () => {} }) {
  const { state } = useApp();
  const items = state.items;
  const itemWidths = useItemCardSizes(items, ITEM_HEIGHT);
  const itemIds = useMemo(() => items.map((it) => it.itemId), [items]);

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
      if (!alreadyActive) return;
      const item = items[index];
      if (item) onSelect(item.itemId);
    },
  });

  return (
    <Container>
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
        {items.map((item, i) => {
          const attached = attachedItemIds.includes(item.itemId);
          return (
            <ItemCard
              key={item.itemId}
              cardImage={item.cardImage}
              active={
                !attached &&
                ((isScrolling && !isInternalScroll) || activeIndex === i)
              }
              inactiveOpacity={attached ? 0.1 : 0.5}
              onPress={() => goToIndex(i)}
              disabled={attached}
            />
          );
        })}
      </ScrollContainer>
    </Container>
  );
}
