import { BlurView } from "@/components/BlurView";
import { StickyLabel } from "@/components/StickyLabel";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { daysData } from "@/data/entries";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
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
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;
const ADD_INDEX = daysData.length;

// Styled Components:

const Container = styled(BlurView)`
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 90px;
  padding-top: 25px;
  align-items: center;
`;

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

// Utils:

const getMonthGroups = () => {
  const groups = {};
  daysData.forEach((day, index) => {
    const date = new Date(day.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        label: date.toLocaleString("default", { month: "short" }).toUpperCase(),
        year: String(date.getFullYear()),
        firstIndex: index,
        lastIndex: index,
      };
    } else {
      groups[key].lastIndex = index;
    }
  });
  return Object.values(groups);
};

const MONTH_GROUPS = getMonthGroups();

const getYearGroups = () => {
  const groups = {};
  daysData.forEach((day, index) => {
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
};

const YEAR_GROUPS = getYearGroups();

// Component:

export function JournalTrack({ onChangeDay = () => {}, onAdd = () => {} }) {
  const [editMode, setEditMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [dayNumbers, setDayNumbers] = useState([]);
  const [trackPadding, setTrackPadding] = useState({
    left: 0,
    right: 0,
  });
  const [addActive, setAddActive] = useState(false);
  const trackRef = useRef(null);
  // Flagged when a tap on + has expanded the padding but the scroll hasn't
  // fired yet — cleared in onContentSizeChange once layout is ready.
  const scrollToAddAfterResize = useRef(false);

  // Helpers:

  const scrollToIndex = (index) => {
    if (index === activeIndex) {
      if (index === ADD_INDEX) {
        // Cancel create: exit edit mode and navigate back to the last real entry.
        setEditMode(false);
        animateIndicatorOut();
        setIsScrolling(true);
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        trackRef.current?.scrollTo({
          x: (daysData.length - 1) * SNAP_INTERVAL,
          animated: true,
        });
        return;
      }
      setEditMode((prev) => !prev);
      if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(
          editMode
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Heavy,
        );
      }
      return;
    }
    animateIndicatorOut();
    setIsScrolling(true);
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (index === ADD_INDEX) {
      // Expand right padding so the content is wide enough to scroll there,
      // then wait for onContentSizeChange to fire the actual scrollTo.
      setAddActive(true);
      scrollToAddAfterResize.current = true;
      return;
    }
    trackRef.current?.scrollTo({ x: index * SNAP_INTERVAL, animated: true });
  };

  const parseDayNumbersFromDates = () => {
    let numbers = daysData.map(({ date }) => {
      const day = new Date(date).getDate();
      return day;
    });
    setDayNumbers(numbers);
  };

  // Animations:

  const indicatorScale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(1);
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: indicatorScale.value }],
  }));

  const animateIndicatorIn = () => {
    const config = { duration: 200, easing: Easing.out(Easing.quad) };
    indicatorScale.value = withTiming(1, config);
    indicatorOpacity.value = withTiming(1, config);
  };

  const animateIndicatorOut = () => {
    const config = { duration: 150, easing: Easing.in(Easing.quad) };
    indicatorScale.value = withTiming(0.6, config);
    indicatorOpacity.value = withTiming(0.2, config);
  };

  // Handlers:

  const scrollX = useSharedValue(0);
  const halfTrackWidth = useSharedValue(0);
  const trackPaddingLeft = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleTrackPadding = (event) => {
    const { width } = event.nativeEvent.layout;
    const padding = width / 2 - ITEM_WIDTH / 2;
    halfTrackWidth.value = width / 2;
    trackPaddingLeft.value = padding;
    // Right padding is one SNAP_INTERVAL shorter than left so the content's
    // maximum scroll position lands exactly on the last real item — the +
    // button is visible peeking to the right but the range stops there.
    setTrackPadding({ left: padding, right: padding - SNAP_INTERVAL });
  };

  const handleContentSizeChange = () => {
    if (scrollToAddAfterResize.current) {
      scrollToAddAfterResize.current = false;
      trackRef.current?.scrollTo({
        x: ADD_INDEX * SNAP_INTERVAL,
        animated: true,
      });
    }
  };

  const getIndexFromScrollEnd = (event) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / SNAP_INTERVAL);
    // When addActive the content is expanded and ADD_INDEX is a valid landing
    // position; otherwise clamp to the last real entry.
    const maxIndex = addActive ? ADD_INDEX : daysData.length - 1;
    return Math.max(0, Math.min(index, maxIndex));
  };

  const handleScrollEndDrag = (event) => {
    const { velocity } = event.nativeEvent;
    if (!velocity || Math.abs(velocity.x) < 0.1) {
      const index = getIndexFromScrollEnd(event);
      // Only clear addActive once settled on a real entry — clearing it while
      // the scroll is still at ADD_INDEX * SNAP_INTERVAL would shrink the
      // content and trigger a snap-back.
      if (addActive && index !== ADD_INDEX) setAddActive(false);
      setActiveIndex(index);
      setIsScrolling(false);
      animateIndicatorIn();
    }
  };

  const handleMomentumScrollEnd = (event) => {
    const index = getIndexFromScrollEnd(event);
    if (addActive && index !== ADD_INDEX) setAddActive(false);
    if (index === ADD_INDEX) {
      setEditMode(true);
      onAdd();
    }
    setActiveIndex(index);
    setIsScrolling(false);
    animateIndicatorIn();
  };

  const handleScrollBeginDrag = () => {
    scrollToAddAfterResize.current = false;
    setIsScrolling(true);
    animateIndicatorOut();
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Effects:

  useEffect(() => {
    parseDayNumbersFromDates();
  }, []);

  useEffect(() => {
    if (daysData[activeIndex]) {
      onChangeDay(daysData[activeIndex].dayId);
    }
  }, [activeIndex, onChangeDay]);

  // Render:

  return (
    <Container>
      <YearLabels>
        {YEAR_GROUPS.map((group) => (
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
        {MONTH_GROUPS.map((group) => (
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
        onLayout={handleTrackPadding}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEnabled={!editMode}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        onContentSizeChange={handleContentSizeChange}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: ITEM_SPACING,
          paddingInlineStart: trackPadding.left,
          paddingInlineEnd: addActive ? trackPadding.left : trackPadding.right,
          alignItems: "center",
        }}
      >
        {dayNumbers.map((dayNumber, i) => (
          <DateCircle
            key={`day-${dayNumber}-${i}`}
            onPress={() => scrollToIndex(i)}
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
        <DateCircle
          key="add-button"
          onPress={() => scrollToIndex(ADD_INDEX)}
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
      </Track>
    </Container>
  );
}
