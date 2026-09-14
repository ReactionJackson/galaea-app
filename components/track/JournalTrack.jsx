import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
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
import { StickyLabel } from "./StickyLabel";
import { Track } from "./Track";

// Constants:

const ITEM_WIDTH = 40;
const ITEM_SPACING = 10;

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
  onEnterEdit = () => {},
  onCancelEdit = () => {},
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
    addButtonWidth: ITEM_WIDTH,
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
      if (entries[index])
        dispatch({ type: "CHANGE_DAY", dayId: entries[index].dayId });
    },
    onAdd: () => dispatch({ type: "ADD_DAY" }),
    onCancelAdd: onCancelEdit,
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
    <Track
      editMode={editMode}
      trackHeight={90}
      trackPaddingTop={25}
      onCancel={() => goToIndex(activeIndex)}
      onSave={() => dispatch({ type: "SAVE_EDIT" })}
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
        <ScrollContainer
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
        </ScrollContainer>
      </>
    </Track>
  );
}
