import { ThemedText } from "@/components/interface/ThemedText";
import {
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";
import { EmptyCard, ItemCard, useFadeStyle } from "./ItemCard";
import { TrackTray } from "./TrackTray";

// Constants:

const ITEM_SPACING = 10;

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

// Component:

export function ItemsTrack({
  editMode = false,
  onChangeItem = () => {},
  onPressActiveItem = () => {},
  onAddItem = () => {},
  onCancelAddItem = () => {},
  onDelete = () => {},
  onSave = () => {},
}) {
  const { state, dispatch } = useApp();
  const items = state.items;
  const itemWidths = useItemCardSizes(items, ITEM_HEIGHT);
  const itemIds = useMemo(() => items.map((it) => it.itemId), [items]);

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
    addButtonWidth: EMPTY_CARD_WIDTH,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
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
    onAdd: onAddItem,
    onCancelAdd: onCancelAddItem,
  });

  const handleSwap = (direction) => {
    const item = items[activeIndex];
    if (!item) return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: "SWAP_ADJACENT_ITEM", itemId: item.itemId, direction });
  };

  const canSwapLeft = activeIndex !== ADD_INDEX && activeIndex > 0;
  const canSwapRight =
    activeIndex !== ADD_INDEX && activeIndex < items.length - 1;

  const addButtonStyle = useFadeStyle(
    isScrolling || activeIndex === ADD_INDEX,
    editMode ? 0.1 : 0.5,
  );

  return (
    <TrackTray
      editMode={editMode}
      trackHeight={ITEM_HEIGHT + 20}
      trackPaddingTop={6}
      onCancel={() => goToIndex(activeIndex)}
      onDelete={onDelete}
      onSave={onSave}
      onSwapLeft={() => handleSwap("left")}
      onSwapRight={() => handleSwap("right")}
      canSwapLeft={canSwapLeft}
      canSwapRight={canSwapRight}
    >
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
          gap: ITEM_SPACING,
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
          >
            <ItemCard
              cardImage={item.cardImage}
              active={(isScrolling && !isInternalScroll) || activeIndex === i}
              inactiveOpacity={editMode ? 0.1 : 0.5}
              onPress={() => goToIndex(i)}
              disabled={editMode}
            />
          </Animated.View>
        ))}
        <Animated.View
          layout={LinearTransition.duration(SLIDE_TRANSITION_DURATION)}
        >
          <Pressable onPress={() => goToIndex(ADD_INDEX)} disabled={editMode}>
            <EmptyCard style={addButtonStyle}>
              <ThemedText type="date-number" color="black">
                +
              </ThemedText>
            </EmptyCard>
          </Pressable>
        </Animated.View>
      </ScrollContainer>
    </TrackTray>
  );
}
