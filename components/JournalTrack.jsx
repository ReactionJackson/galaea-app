import { StickyLabel } from "@/components/StickyLabel";
import { ThemedText } from "@/components/ThemedText";
import { TrackChrome } from "@/components/TrackChrome";
import { Colors } from "@/constants/theme";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo } from "react";
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

// Constants:

const ITEM_WIDTH = 40;
const ITEM_SPACING = 10;

// Styled Components:

const Track = styled(Animated.ScrollView)`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const LabelsRow = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  align-items: center;
`;

const YearLabels = styled(LabelsRow)`
  top: 10px;
  opacity: 0.4;
`;

const MonthLabels = styled(LabelsRow)`
  top: 20px;
`;

const RedIndicator = styled(Animated.View)`
  position: absolute;
  bottom: 12px;
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  border-radius: 50%;
  background-color: ${Colors.accent};
  pointer-events: none;
`;

const DateCircle = styled.Pressable`
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  border-radius: 50%;
  border: 2px solid ${Colors.dateBorder};
  justify-content: center;
  align-items: center;
`;

// Component:

export function JournalTrack({
  entries = [],
  showAddButton = true,
  onChangeDay = () => {},
  onAdd = () => {},
  onSave = () => {},
  onEnterEdit = () => {},
  onCancelEdit = () => {},
  editMode = false,
}) {
  // All items are the same width here, but the shared snap-track engine
  // works off a widths array regardless (see CollectionTrack for the
  // irregular-width case) — this just gives it a uniform one.
  const itemWidths = useMemo(
    () => entries.map(() => ITEM_WIDTH),
    [entries.length],
  );

  // Derived values:

  const dayNumbers = useMemo(
    () => entries.map(({ date }) => new Date(date).getDate()),
    [entries],
  );

  const monthGroups = useMemo(() => {
    const groups = {};
    entries.forEach((day, index) => {
      const date = new Date(day.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          label: date
            .toLocaleString("default", { month: "short" })
            .toUpperCase(),
          year: String(date.getFullYear()),
          firstIndex: index,
          lastIndex: index,
        };
      } else {
        groups[key].lastIndex = index;
      }
    });
    return Object.values(groups);
  }, [entries]);

  const yearGroups = useMemo(() => {
    const groups = {};
    entries.forEach((day, index) => {
      const date = new Date(day.date);
      const key = date.getFullYear();
      if (!groups[key]) {
        groups[key] = {
          key,
          label: String(date.getFullYear()),
          year: String(date.getFullYear()),
          firstIndex: index,
          lastIndex: index,
        };
      } else {
        groups[key].lastIndex = index;
      }
    });
    return Object.values(groups);
  }, [entries]);

  // Shared snap/centre-load engine — see useSnapTrack for the scroll math and
  // the "+" gating; everything below this is specific to how a date-circle
  // track presents that (sticky year/month labels, the red indicator).

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
    showAddButton,
    // Explicit rather than relying on the hook's itemWidths[0] fallback —
    // that fallback breaks if entries is ever empty (no item 0 to fall back
    // to), whereas the + button's size should never depend on entry count.
    addButtonWidth: ITEM_WIDTH,
    onSettle: (index, { alreadyActive }) => {
      if (alreadyActive) {
        // Pressing the already-active circle toggles edit mode for it,
        // rather than moving anywhere.
        if (editMode) {
          onCancelEdit();
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } else {
          onEnterEdit();
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
        return;
      }
      if (entries[index]) onChangeDay(entries[index].dayId);
    },
    onAdd,
    onCancelAdd: onCancelEdit,
  });

  // Sticky-label plumbing: scrollX (continuous) and the two layout shared
  // values StickyLabel needs — mirrors of the hook's own basePadding/track
  // width, kept as shared values since StickyLabel reads them on the UI
  // thread. The centring/snapping math itself all still lives in the hook;
  // this is just wiring for a Journal-only decoration.

  const scrollX = useSharedValue(0);
  const halfTrackWidth = useSharedValue(0);
  const trackPaddingLeft = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    trackPaddingLeft.value = basePadding;
  }, [basePadding, trackPaddingLeft]);

  const handleTrackLayoutAndWidth = (event) => {
    handleTrackLayout(event);
    halfTrackWidth.value = event.nativeEvent.layout.width / 2;
  };

  // Red indicator — purely decorative, animates out while scrolling and back
  // in once settled.

  const indicatorScale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(1);
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: indicatorScale.value }],
  }));

  useEffect(() => {
    if (isScrolling) {
      const config = { duration: 150, easing: Easing.in(Easing.quad) };
      indicatorScale.value = withTiming(0.6, config);
      indicatorOpacity.value = withTiming(0.2, config);
    } else {
      const config = { duration: 200, easing: Easing.out(Easing.quad) };
      indicatorScale.value = withTiming(1, config);
      indicatorOpacity.value = withTiming(1, config);
    }
  }, [isScrolling, indicatorScale, indicatorOpacity]);

  // Render:

  return (
    <TrackChrome
      editMode={editMode}
      trackHeight={90}
      trackPaddingTop={25}
      onCancel={() => goToIndex(activeIndex)}
      onSave={onSave}
    >
      <>
        <YearLabels>
          {yearGroups.map((group) => (
            <StickyLabel
              key={group.key}
              group={group}
              scrollX={scrollX}
              halfTrackWidth={halfTrackWidth}
              trackPaddingLeft={trackPaddingLeft}
              condensed={true}
            />
          ))}
        </YearLabels>
        <MonthLabels>
          {monthGroups.map((group) => (
            <StickyLabel
              key={group.key}
              group={group}
              scrollX={scrollX}
              halfTrackWidth={halfTrackWidth}
              trackPaddingLeft={trackPaddingLeft}
            />
          ))}
        </MonthLabels>
        <RedIndicator style={indicatorStyle} />
        <Track
          horizontal
          ref={trackRef}
          onScroll={scrollHandler}
          onLayout={handleTrackLayoutAndWidth}
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
          {dayNumbers.map((dayNumber, i) => (
            <DateCircle
              key={`day-${dayNumber}-${i}`}
              onPress={() => goToIndex(i)}
              disabled={editMode && activeIndex !== i}
            >
              <ThemedText
                type="date-number"
                colorSwitch={
                  activeIndex !== i || isScrolling
                    ? {
                        colors: [Colors.black, Colors.disabled],
                        active: editMode,
                      }
                    : undefined
                }
              >
                {dayNumber}
              </ThemedText>
            </DateCircle>
          ))}
          {showAddButton && (
            <DateCircle
              key="add-button"
              onPress={() => goToIndex(ADD_INDEX)}
              disabled={editMode && activeIndex !== ADD_INDEX}
            >
              <ThemedText
                type="date-number"
                colorSwitch={
                  activeIndex !== ADD_INDEX || isScrolling
                    ? {
                        colors: [Colors.black, Colors.disabled],
                        active: editMode,
                      }
                    : undefined
                }
              >
                +
              </ThemedText>
            </DateCircle>
          )}
        </Track>
      </>
    </TrackChrome>
  );
}
