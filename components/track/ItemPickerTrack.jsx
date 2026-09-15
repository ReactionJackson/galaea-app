import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";
import { ITEM_HEIGHT, ItemCard } from "./ItemCard";

// ─────────────────────────────────────────────────────────────────────────────
// ItemPickerTrack
//
// Lives inline in the journal entry's own scrolling content (inside an
// AnimateHeight between the last entry and the Add Item button), not in the
// fixed bottom-docked Track shell CollectionTrack uses — so it gets its own
// plain boxed treatment instead. Same item size as CollectionTrack (shares
// ITEM_HEIGHT and the ItemCard component). No edit-mode locking, no add slot.
// An item already attached to this post fades to 0.1 and stays there — it
// never brightens even if scrolled to centre — while every other item
// follows the same active/inactive fade CollectionTrack uses outside its own
// edit mode.
// ─────────────────────────────────────────────────────────────────────────────

const ITEM_SPACING = 10;

const Container = styled.View`
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${Colors.border};
  background-color: rgba(0, 0, 0, 0.02);
  padding: 15px 0;
`;

const ScrollContainer = styled(Animated.ScrollView)`
  width: 100%;
  height: ${ITEM_HEIGHT}px;
`;

export function ItemPickerTrack({ attachedItemIds = [], onSelect = () => {} }) {
  const { state } = useApp();
  const items = state.items;

  const itemWidths = useItemCardSizes(items, ITEM_HEIGHT);

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
