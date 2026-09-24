import {
  DAY_CIRCLE_HEIGHT,
  INDICATOR_DOT_SCALE_DURATION,
  TRACK_GAP,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useSettings } from "@/context/SettingsContext";
import { useEditModeActions } from "@/hooks/useEditModeActions";
import { useRowManager } from "@/hooks/useRowManager";
import { useSnapTrack } from "@/hooks/useSnapTrack";
import { triggerHaptics } from "@/utils/haptics";
import { useEffect, useMemo, useState } from "react";
import Animated, {
  Easing,
  scrollTo,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import styled from "styled-components/native";
import {
  AddDayCircle,
  DayCircle,
} from "@/components/exploration/navigators/components/DayCircle";
import { StickyLabel } from "@/components/exploration/navigators/components/StickyLabel";
import { NavigatorManager } from "@/components/exploration/navigators/NavigatorManager";

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
  background-color: ${({ $accent }) => $accent};
  pointer-events: none;
`;

// Component:

export function JournalNavigator() {
  const { progress, activeDriver, setDriver, setProgress, settleDriver } =
    useRowManager();
  const { state, activeEntry, dispatch } = useApp();
  const { accent } = useSettings();
  const { entries, editMode } = state;
  const { onEnterEdit, onCancelEdit, onSaveEdit } = useEditModeActions();

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
    isInternalScroll,
    basePadding,
    paddingEnd,
    offsets,
    initialContentOffset,
    trackRef,
    goToIndex,
    syncActiveIndex,
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
          triggerHaptics("Light");
        } else {
          onEnterEdit();
          triggerHaptics("Heavy");
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

  const syncActiveDay = (index) => {
    const entry = entries[index];
    if (!entry) return;
    syncActiveIndex(index);
    if (entry.dayId !== activeEntry.dayId) {
      dispatch({ type: "CHANGE_DAY", dayId: entry.dayId });
    }
  };

  const [isPaginating, setIsPaginating] = useState(false);

  const handleDriverChange = (dragging, settledIndex) => {
    if (!dragging && settledIndex !== null) {
      syncActiveDay(settledIndex);
    }
    setIsPaginating(dragging);
  };

  useAnimatedReaction(
    () => activeDriver.value !== null,
    (dragging, previous) => {
      if (dragging === previous) return;
      const settledIndex = dragging ? null : Math.round(progress.value);
      scheduleOnRN(handleDriverChange, dragging, settledIndex);
    },
  );

  const scrollX = useSharedValue(0);
  const halfTrackWidth = useSharedValue(0);
  const trackPaddingLeft = useSharedValue(0);
  const itemStride = DAY_CIRCLE_HEIGHT + TRACK_GAP;

  const hasScrolledSinceTouch = useSharedValue(false);

  const handleTrackTouchStart = () => {
    if (editMode) return;
    hasScrolledSinceTouch.value = false;
    setDriver("bottom");
  };

  const handleTrackTouchEnd = () => {
    if (activeDriver.value === "bottom" && !hasScrolledSinceTouch.value) {
      settleDriver("bottom");
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      hasScrolledSinceTouch.value = true;
      scrollX.value = event.contentOffset.x;
      if (activeDriver.value === "bottom") {
        setProgress(event.contentOffset.x / itemStride);
      }
    },
    onBeginDrag: () => {
      setDriver("bottom");
    },
    onMomentumEnd: () => {
      settleDriver("bottom");
    },
  });

  useAnimatedReaction(
    () => progress.value,
    (value) => {
      if (activeDriver.value !== "bottom") {
        scrollTo(trackRef, value * itemStride, 0, false);
      }
    },
  );

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
    if (isPaginating) {
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
  }, [isPaginating]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: indicatorScale.value }],
  }));

  // Render:

  return (
    <NavigatorManager
      editMode={editMode}
      trackHeight={90}
      trackPaddingTop={25}
      onCancel={onCancelEdit}
      onSave={onSaveEdit}
    >
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
      <RedIndicator $accent={accent} style={indicatorStyle} />
      <ScrollContainer
        horizontal
        ref={trackRef}
        contentOffset={initialContentOffset}
        onScroll={scrollHandler}
        onLayout={handleTrackLayoutAndWidth}
        onTouchStart={handleTrackTouchStart}
        onTouchEnd={handleTrackTouchEnd}
        onTouchCancel={handleTrackTouchEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={(event) => {
          if (activeDriver.value === "bottom") handleScrollEndDrag(event);
        }}
        onMomentumScrollEnd={(event) => {
          if (activeDriver.value === "bottom") handleMomentumScrollEnd(event);
        }}
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
            highlighted={activeIndex === i && !isPaginating}
            isInternalScroll={isInternalScroll}
            onPress={() => goToIndex(i)}
          />
        ))}
        {showAddButton && (
          <AddDayCircle
            key="add-button"
            isActive={activeIndex === ADD_INDEX}
            highlighted={activeIndex === ADD_INDEX && !isPaginating}
            onPress={() => goToIndex(ADD_INDEX)}
          />
        )}
      </ScrollContainer>
    </NavigatorManager>
  );
}
