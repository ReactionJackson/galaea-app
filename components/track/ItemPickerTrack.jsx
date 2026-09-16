import { Colors } from "@/constants/theme";
import { ITEM_HEIGHT } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { useMemo } from "react";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";
import { ItemCard } from "./ItemCard";

const ITEM_SPACING = 10;
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

export function ItemPickerTrack({ attachedItemIds = [], onSelect = () => {} }) {
  const { state } = useApp();
  const items = state.items;

  const itemWidths = useItemCardSizes(items, ITEM_HEIGHT);
  // Same order/length as itemWidths — see useSnapTrack's itemIds param.
  const itemIds = useMemo(() => items.map((it) => it.itemId), [items]);

  const {
    activeIndex,
    isScrolling,
    basePadding,
    paddingEnd,
    offsets,
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
        {items.map((item, i) => {
          const attached = attachedItemIds.includes(item.itemId);
          return (
            <ItemCard
              key={item.itemId}
              cardImage={item.cardImage}
              itemWidth={itemWidths[i]}
              active={!attached && (isScrolling || activeIndex === i)}
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
