import { BlurView } from "@/components/BlurView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { daysData } from "@/data/entries";
import { useEffect, useState } from "react";
import Animated, {
  Easing,
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

const Container = styled(BlurView)`
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 90px;
  justify-content: center;
  align-items: center;
`;

const RedIndicator = styled(Animated.View)`
  position: absolute;
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  border-radius: 50%;
  background-color: ${Colors.accent};
  pointer-events: none;
`;

const Track = styled.ScrollView`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const DateCircle = styled.View`
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  border-radius: 50%;
  border: 2px solid ${Colors.dateBorder};
  justify-content: center;
  align-items: center;
`;

// Component:

export function JournalTrack({ onChangeDay = () => {} }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [dayNumbers, setDayNumbers] = useState([]);
  const [trackPadding, setTrackPadding] = useState({
    left: 0,
    right: 0,
  });

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

  const handleTrackPadding = (event) => {
    const { width } = event.nativeEvent.layout;
    const padding = width / 2 - ITEM_WIDTH / 2;
    setTrackPadding({
      left: padding,
      right: padding,
    });
  };

  const getIndexFromEvent = (event) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / SNAP_INTERVAL);
    return Math.max(0, Math.min(index, daysData.length - 1));
  };

  const handleScrollEndDrag = (event) => {
    const { velocity } = event.nativeEvent;
    if (!velocity || Math.abs(velocity.x) < 0.1) {
      setActiveIndex(getIndexFromEvent(event));
      setIsScrolling(false);
      animateIndicatorIn();
    }
  };

  const handleMomentumScrollEnd = (event) => {
    setActiveIndex(getIndexFromEvent(event));
    setIsScrolling(false);
    animateIndicatorIn();
  };

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
    animateIndicatorOut();
  };

  // Helpers:

  const parseDayNumbersFromDates = () => {
    let numbers = daysData.map(({ date }) => {
      const day = new Date(date).getDate();
      return day;
    });
    setDayNumbers(numbers);
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
      <RedIndicator style={indicatorStyle} />
      <Track
        horizontal
        onLayout={handleTrackPadding}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: ITEM_SPACING,
          paddingInlineStart: trackPadding.left,
          paddingInlineEnd: trackPadding.right,
          alignItems: "center",
        }}
      >
        {dayNumbers.map((dayNumber, i) => (
          <DateCircle key={`day-${dayNumber}-${i}`}>
            <ThemedText
              type="date-number"
              color={!isScrolling && activeIndex === i ? "white" : "black"}
            >
              {dayNumber}
            </ThemedText>
          </DateCircle>
        ))}
      </Track>
    </Container>
  );
}
