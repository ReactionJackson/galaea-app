import { Colors } from "@/constants/theme";
import {
  DAY_CIRCLE_HEIGHT,
  INDICATOR_DOT_SCALE_DURATION,
  TRACK_GAP,
} from "@/constants/values";
import { resolveEntryGalleryPairs, useApp } from "@/context/AppContext";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { deleteDroppedImages } from "@/utils/images";
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
import { AddDayCircle, DayCircle } from "./DayCircle";
import { StickyLabel } from "./StickyLabel";

// Styled Components:

const ScrollContainer = styled(Animated.ScrollView)`
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
  width: ${DAY_CIRCLE_HEIGHT}px;
  height: ${DAY_CIRCLE_HEIGHT}px;
  border-radius: 50%;
  background-color: ${Colors.accent};
  pointer-events: none;
`;

// Component:

export function JournalTrack({
  onEnterEdit = () => {},
  onCancelEdit = () => {},
  onControlsChange = () => {},
}) {
  const { state, dispatch } = useApp();
  const { entries, editMode } = state;

  const showAddButton = useMemo(() => {
    if (entries.length === 0) return true;
    const latestDate = new Date(entries[entries.length - 1].date);
    const today = new Date();
    return (
      latestDate.getFullYear() !== today.getFullYear() ||
      latestDate.getMonth() !== today.getMonth() ||
      latestDate.getDate() !== today.getDate()
    );
  }, [entries]);

  const itemWidths = useMemo(
    () => entries.map(() => DAY_CIRCLE_HEIGHT),
    [entries.length],
  );
  const itemIds = useMemo(() => entries.map((e) => e.dayId), [entries]);

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
    showAddButton,
    addButtonWidth: DAY_CIRCLE_HEIGHT,
    onSettle: (index, { alreadyActive }) => {
      if (alreadyActive) {
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
      if (entries[index]) {
        const dayId = entries[index].dayId;
        dispatch({ type: "CHANGE_DAY", dayId });
      }
    },
    onAdd: () => dispatch({ type: "ADD_DAY" }),
    onCancelAdd: onCancelEdit,
  });

  useEffect(() => {
    onControlsChange({
      onCancel: () => goToIndex(activeIndex),
      onSave: () => {
        for (const { draftGallery, storedGallery } of resolveEntryGalleryPairs(
          state.items,
          state.draft?.items ?? [],
        )) {
          deleteDroppedImages(storedGallery, draftGallery);
        }
        dispatch({ type: "SAVE_EDIT" });
      },
    });
  });

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

  const indicatorScale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(1);

  useEffect(() => {
    if (isScrolling) {
      const config = {
        duration: INDICATOR_DOT_SCALE_DURATION,
        easing: Easing.in(Easing.quad),
      };
      indicatorScale.value = withTiming(0.6, config);
      indicatorOpacity.value = withTiming(0.2, config);
    } else {
      const config = {
        duration: INDICATOR_DOT_SCALE_DURATION,
        easing: Easing.out(Easing.quad),
      };
      indicatorScale.value = withTiming(1, config);
      indicatorOpacity.value = withTiming(1, config);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolling]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: indicatorScale.value }],
  }));

  // Render:

  return (
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
      <ScrollContainer
        horizontal
        ref={trackRef}
        contentOffset={initialContentOffset}
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
          gap: TRACK_GAP,
          paddingInlineStart: basePadding,
          paddingInlineEnd: paddingEnd,
          alignItems: "center",
        }}
      >
        {dayNumbers.map((dayNumber, i) => (
          <DayCircle
            key={`day-${dayNumber}-${i}`}
            dayNumber={dayNumber}
            isActive={activeIndex === i}
            highlighted={
              activeIndex === i && !(isScrolling && !isInternalScroll)
            }
            isInternalScroll={isInternalScroll}
            editMode={editMode}
            onPress={() => goToIndex(i)}
          />
        ))}
        {showAddButton && (
          <AddDayCircle
            key="add-button"
            isActive={activeIndex === ADD_INDEX}
            highlighted={
              activeIndex === ADD_INDEX && !(isScrolling && !isInternalScroll)
            }
            editMode={editMode}
            onPress={() => goToIndex(ADD_INDEX)}
          />
        )}
      </ScrollContainer>
    </>
  );
}
