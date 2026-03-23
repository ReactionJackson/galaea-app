import { BlurView } from "@/components/BlurView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useState } from "react";
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

const RedIndicator = styled.View`
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

export function JournalTrack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackPadding, setTrackPadding] = useState({
    left: 0,
    right: 0,
  });

  const handleTrackPadding = (event) => {
    const { width } = event.nativeEvent.layout;
    const padding = width / 2 - ITEM_WIDTH / 2;
    setTrackPadding({
      left: padding,
      right: padding,
    });
  };

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  return (
    <Container>
      <RedIndicator />
      <Track
        horizontal
        onLayout={handleTrackPadding}
        onScrollEndDrag={handleScroll}
        onMomentumScrollEnd={handleScroll}
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
        {Array.from({ length: 20 }).map((_, index) => (
          <DateCircle key={index}>
            <ThemedText
              type="date-number"
              color={activeIndex === index ? "white" : "black"}
            >
              {index + 1}
            </ThemedText>
          </DateCircle>
        ))}
      </Track>
    </Container>
  );
}
