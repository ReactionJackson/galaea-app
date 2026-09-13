import { ThemedText } from "@/components/ThemedText";
import { TrackChrome } from "@/components/TrackChrome";
import { Colors } from "@/constants/theme";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Image as RNImage } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

// Constants:

const ITEM_HEIGHT = 70;
const ITEM_SPACING = 10;

// Styled Components:
// Ordinary styles (size, border-radius, etc) live in these templates as
// normal — only opacity needs to be animated, so that alone comes in via a
// style prop (see useFadeStyle) rather than the template.

const Track = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

const BoxArt = styled(AnimatedImage).attrs({ transition: 200 })`
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

// Fades between full and half opacity off a single plain boolean — no shared
// values or index comparisons needed, reanimated re-runs this whenever
// `active` itself changes (passed as a dependency, same as useMemo). Still
// has to be its own hook call per item though: React won't allow a variable
// number of hook calls inside the list below.
function useFadeStyle(active) {
  return useAnimatedStyle(
    () => ({ opacity: withTiming(active ? 1 : 0.5, { duration: 200 }) }),
    [active],
  );
}

function CollectionBoxArt({ boxArt, itemWidth, active, onPress, disabled }) {
  const style = useFadeStyle(active);
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

function CollectionAddButton({ active, onPress, disabled }) {
  const style = useFadeStyle(active);
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
  games = [],
  editMode = false,
  onChangeGame = () => {},
  onPressActiveGame = () => {},
  onAddGame = () => {},
  onCancelAddGame = () => {},
  onSave = () => {},
}) {
  // One aspect ratio per game, resolved on demand via RNImage.getSize — same
  // approach as the gallery lightbox, since box art dimensions aren't stored
  // anywhere in the data. Starts square (1:1) until the real value loads.
  const [aspectRatios, setAspectRatios] = useState(() => games.map(() => 1));

  const gameKey = useMemo(() => games.map((g) => g.gameId).join(","), [games]);

  useEffect(() => {
    let cancelled = false;
    games.forEach((game, i) => {
      if (!game.boxArt) return;
      RNImage.getSize(
        game.boxArt,
        (w, h) => {
          if (cancelled) return;
          const ratio = w / h;
          setAspectRatios((prev) => {
            if (prev[i] === ratio) return prev;
            const next = [...prev];
            next[i] = ratio;
            return next;
          });
        },
        () => {
          // Leave the square fallback in place on failure.
        },
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey]);

  const itemWidths = useMemo(
    () => aspectRatios.map((ratio) => ITEM_HEIGHT * ratio),
    [aspectRatios],
  );

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
    onSettle: (index, { alreadyActive }) => {
      const game = games[index];
      if (!game) return;
      if (alreadyActive) onPressActiveGame(game.gameId);
      else onChangeGame(game.gameId);
    },
    onAdd: onAddGame,
    onCancelAdd: onCancelAddGame,
  });

  return (
    <TrackChrome
      editMode={editMode}
      trackHeight={ITEM_HEIGHT + 20}
      trackPaddingTop={6}
      onCancel={() => goToIndex(activeIndex)}
      onSave={onSave}
    >
      <Track
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
            onPress={() => goToIndex(i)}
            disabled={editMode && activeIndex !== i}
          />
        ))}
        <CollectionAddButton
          active={isScrolling || activeIndex === ADD_INDEX}
          onPress={() => goToIndex(ADD_INDEX)}
          disabled={editMode && activeIndex !== ADD_INDEX}
        />
      </Track>
    </TrackChrome>
  );
}
