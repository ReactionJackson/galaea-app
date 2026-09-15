import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useGameBoxArtSizes } from "@/hooks/useGameBoxArtSizes";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";
import { BoxArt, ITEM_HEIGHT, useFadeStyle } from "./CollectionTrack";

// ─────────────────────────────────────────────────────────────────────────────
// GamePickerTrack
//
// Lives inline in the journal entry's own scrolling content (inside an
// AnimateHeight between the last entry and the Add Game button), not in the
// fixed bottom-docked Track shell CollectionTrack uses — so it gets its own
// plain boxed treatment instead. Same item size as CollectionTrack (shares
// ITEM_HEIGHT/BoxArt). No edit-mode locking, no add slot. A game already
// attached to this post fades to 0.1 and stays there — it never brightens
// even if scrolled to centre — while every other game follows the same
// active/inactive fade CollectionTrack uses outside its own edit mode.
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

function PickerBoxArt({ boxArt, itemWidth, active, inactiveOpacity, onPress, disabled }) {
  const style = useFadeStyle(active, inactiveOpacity);
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

export function GamePickerTrack({ attachedGameIds = [], onSelect = () => {} }) {
  const { state } = useApp();
  const games = state.games;

  const itemWidths = useGameBoxArtSizes(games, ITEM_HEIGHT);

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
      const game = games[index];
      if (game) onSelect(game.gameId);
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
        {games.map((game, i) => {
          const attached = attachedGameIds.includes(game.gameId);
          return (
            <PickerBoxArt
              key={game.gameId}
              boxArt={game.boxArt}
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
