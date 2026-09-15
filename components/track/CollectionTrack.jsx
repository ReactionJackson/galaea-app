import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useGameBoxArtSizes } from "@/hooks/useGameBoxArtSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";
import { Track } from "./Track";

// Constants:

export const ITEM_HEIGHT = 105;
const ITEM_SPACING = 10;

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export const BoxArt = styled(AnimatedImage).attrs({ transition: 200 })`
  width: ${({ itemWidth }) => itemWidth}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 4px;
`;

const AddButtonBox = styled(Animated.View)`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  border-radius: 8px;
  border: 2px solid ${Colors.dateBorder};
  justify-content: center;
  align-items: center;
`;

// Shared with GamePickerTrack: an item fades to inactiveOpacity unless
// active, in which case it's always fully opaque. Callers work out what
// "active" and "inactiveOpacity" mean for their own context.
export function useFadeStyle(active, inactiveOpacity) {
  return useAnimatedStyle(
    () => ({
      opacity: withTiming(active ? 1 : inactiveOpacity, { duration: 200 }),
    }),
    [active, inactiveOpacity],
  );
}

function CollectionBoxArt({
  boxArt,
  itemWidth,
  active,
  editMode,
  onPress,
  disabled,
}) {
  const style = useFadeStyle(active, editMode ? 0.1 : 0.5);
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <BoxArt
        source={{ uri: boxArt }}
        contentFit="cover"
        itemWidth={itemWidth}
        style={style}
      />
    </Pressable>
  );
}

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
  onChangeGame = () => {},
  onPressActiveGame = () => {},
  onAddGame = () => {},
  onCancelAddGame = () => {},
  onSave = () => {},
}) {
  const { state } = useApp();
  const games = state.games;

  const itemWidths = useGameBoxArtSizes(games, ITEM_HEIGHT);

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
    addButtonWidth: ITEM_HEIGHT,
    startAtEnd: false,
    onSettle: (index, { alreadyActive }) => {
      const game = games[index];
      if (!game) return;
      if (alreadyActive) {
        onPressActiveGame(game.gameId);
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(
            editMode
              ? Haptics.ImpactFeedbackStyle.Light
              : Haptics.ImpactFeedbackStyle.Heavy,
          );
        }
      } else {
        onChangeGame(game.gameId);
      }
    },
    onAdd: onAddGame,
    onCancelAdd: onCancelAddGame,
  });

  return (
    <Track
      editMode={editMode}
      trackHeight={ITEM_HEIGHT + 20}
      trackPaddingTop={6}
      onCancel={() => goToIndex(activeIndex)}
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
        {games.map((game, i) => (
          <CollectionBoxArt
            key={game.gameId}
            boxArt={game.boxArt}
            itemWidth={itemWidths[i]}
            active={isScrolling || activeIndex === i}
            editMode={editMode}
            onPress={() => goToIndex(i)}
            disabled={editMode && activeIndex !== i}
          />
        ))}
        <CollectionAddButton
          active={isScrolling || activeIndex === ADD_INDEX}
          editMode={editMode}
          onPress={() => goToIndex(ADD_INDEX)}
          disabled={editMode && activeIndex !== ADD_INDEX}
        />
      </ScrollContainer>
    </Track>
  );
}
