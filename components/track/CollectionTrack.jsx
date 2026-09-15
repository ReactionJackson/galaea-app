import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useItemCardSizes } from "@/hooks/useItemCardSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import styled from "styled-components/native";
import {
  EMPTY_CARD_WIDTH,
  ITEM_HEIGHT,
  ItemCard,
  useFadeStyle,
} from "./ItemCard";
import { Track } from "./Track";

// Constants:

const ITEM_SPACING = 10;

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const AddButtonBox = styled(Animated.View)`
  width: ${EMPTY_CARD_WIDTH}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  border: 2px solid ${Colors.dateBorder};
  justify-content: center;
  align-items: center;
`;

function CollectionAddButton({ active, editMode, onPress, disabled }) {
  const style = useFadeStyle(active, editMode ? 0.1 : 0.5);
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <AddButtonBox style={style}>
        <ThemedText type="date-number" color="black">
          +
        </ThemedText>
      </AddButtonBox>
    </Pressable>
  );
}

// Component:

export function CollectionTrack({
  editMode = false,
  onChangeItem = () => {},
  onPressActiveItem = () => {},
  onAddItem = () => {},
  onCancelAddItem = () => {},
  onDelete = () => {},
  onSave = () => {},
}) {
  const { state } = useApp();
  const items = state.items;

  const itemWidths = useItemCardSizes(items, ITEM_HEIGHT);

  const {
    ADD_INDEX,
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

  return (
    <Track
      editMode={editMode}
      trackHeight={ITEM_HEIGHT + 20}
      trackPaddingTop={6}
      onCancel={() => goToIndex(activeIndex)}
      onDelete={onDelete}
      onSave={onSave}
    >
      <ScrollContainer
        horizontal
        ref={trackRef}
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
            layout={LinearTransition.duration(220)}
            entering={FadeIn.duration(220)}
          >
            <ItemCard
              cardImage={item.cardImage}
              itemWidth={itemWidths[i]}
              active={isScrolling || activeIndex === i}
              inactiveOpacity={editMode ? 0.1 : 0.5}
              onPress={() => goToIndex(i)}
              disabled={editMode && activeIndex !== i}
            />
          </Animated.View>
        ))}
        <Animated.View layout={LinearTransition.duration(220)}>
          <CollectionAddButton
            active={isScrolling || activeIndex === ADD_INDEX}
            editMode={editMode}
            onPress={() => goToIndex(ADD_INDEX)}
            disabled={editMode && activeIndex !== ADD_INDEX}
          />
        </Animated.View>
      </ScrollContainer>
    </Track>
  );
}
