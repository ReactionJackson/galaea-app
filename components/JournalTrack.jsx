import { BlurView } from "@/components/BlurView";
import { StickyLabel } from "@/components/StickyLabel";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
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

// Styled Components:

const TrackContainer = styled(Animated.View)`
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Container = styled(BlurView)`
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

const SaveButton = styled.Pressable`
  position: absolute;
  top: 5px;
  right: 20px;
  padding: 4px 14px;
  background-color: ${Colors.accent};
  border-radius: 20px;
`;

// Component:

export function JournalTrack({
  entries = [],
  showAddButton = true,
  onChangeDay = () => {},
  onAdd = () => {},
  onSave = () => {},
  editMode = false,
  setEditMode = () => {},
}) {
  // ADD_INDEX is always entries.length — the slot just past the last real item.
  const ADD_INDEX = entries.length;

  const [activeIndex, setActiveIndex] = useState(entries.length - 1);
  const [isScrolling, setIsScrolling] = useState(false);
  const [basePadding, setBasePadding] = useState(0);
  const [addActive, setAddActive] = useState(false);
  const trackRef = useRef(null);
  // Flagged when a tap on + has expanded the padding but the scroll hasn't
  // fired yet — cleared in onContentSizeChange once layout is ready.
  const scrollToAddAfterResize = useRef(false);
  // Track entries length to detect when a save has committed a new entry.
  const prevEntriesLengthRef = useRef(entries.length);
  // Guard so the initial scroll-to-last fires once only, after layout is ready.
  const hasScrolledToInitial = useRef(false);

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
          x: (entries.length - 1) * SNAP_INTERVAL,
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

  // Animations:

  const trackContainerStyle = useAnimatedTransition(editMode, {
    translateY: [0, -80],
  });

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
    setBasePadding(padding);
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
    const maxIndex =
      showAddButton && addActive ? ADD_INDEX : entries.length - 1;
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
      if (entries[index]) onChangeDay(entries[index].dayId);
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
    } else {
      onChangeDay(entries[index].dayId);
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
    if (entries.length > prevEntriesLengthRef.current) {
      // A new entry was saved — the + slot is now a real date circle.
      // Exit edit mode and scroll to the newly saved entry.
      const newIndex = entries.length - 1;
      prevEntriesLengthRef.current = entries.length;
      setEditMode(false);
      setAddActive(false);
      setActiveIndex(newIndex);
      trackRef.current?.scrollTo({
        x: newIndex * SNAP_INTERVAL,
        animated: true,
      });
    } else {
      prevEntriesLengthRef.current = entries.length;
    }
  }, [entries.length]);

  // Scroll to the most recent entry once basePadding is available (i.e. after
  // onLayout has run and the content is correctly sized). Firing earlier would
  // scroll into an unlaid-out container and land in the wrong position.
  useEffect(() => {
    if (!hasScrolledToInitial.current && basePadding > 0 && trackRef.current) {
      hasScrolledToInitial.current = true;
      trackRef.current.scrollTo({
        x: (entries.length - 1) * SNAP_INTERVAL,
        animated: false,
      });
    }
  }, [basePadding]);

  const paddingEnd =
    showAddButton && !addActive ? basePadding - SNAP_INTERVAL : basePadding;

  // Render:

  return (
    <TrackContainer style={trackContainerStyle}>
      <Container>
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
        {editMode && (
          <SaveButton onPress={onSave}>
            <ThemedText type="subtitle" color="white">
              Save
            </ThemedText>
          </SaveButton>
        )}
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
            paddingInlineStart: basePadding,
            paddingInlineEnd: paddingEnd,
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
          {showAddButton && (
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
          )}
        </Track>
      </Container>
    </TrackContainer>
  );
}
