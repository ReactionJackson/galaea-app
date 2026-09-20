import { EDGE_FADE_DURATION } from "@/constants/values";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { ScrollView } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

const FADE_EASING = Easing.out(Easing.quad);
const FADE_WHITE = "rgba(255,255,255,1)";
const FADE_CLEAR = "rgba(255,255,255,0)";

const TrackOuter = styled.View`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const Scroller = styled(ScrollView)`
  width: 100%;
  height: 26px;
`;

const EdgeFade = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  ${({ side }) => (side === "left" ? "left: 0;" : "right: 0;")}
`;

const GradientFill = styled(LinearGradient)`
  flex: 1;
`;

export const FadeTrack = forwardRef(function FadeTrack(
  { children, contentContainerStyle },
  ref,
) {
  const leftOpacity = useSharedValue(0);
  const rightOpacity = useSharedValue(0);
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const scrollRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToStart: () => scrollRef.current?.scrollTo({ x: 0, animated: true }),
  }));

  const recompute = (scrollX) => {
    scrollXRef.current = scrollX;
    const maxScroll = contentWidthRef.current - containerWidthRef.current;
    const t = (val) =>
      withTiming(val, { duration: EDGE_FADE_DURATION, easing: FADE_EASING });

    if (maxScroll <= 2) {
      leftOpacity.value = t(0);
      rightOpacity.value = t(0);
    } else {
      leftOpacity.value = t(scrollX > 2 ? 1 : 0);
      rightOpacity.value = t(scrollX < maxScroll - 2 ? 1 : 0);
    }
  };

  const leftStyle = useAnimatedStyle(() => ({ opacity: leftOpacity.value }));
  const rightStyle = useAnimatedStyle(() => ({ opacity: rightOpacity.value }));

  return (
    <TrackOuter>
      <Scroller
        ref={scrollRef}
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={16}
        onScroll={(e) => recompute(e.nativeEvent.contentOffset.x)}
        onContentSizeChange={(w) => {
          contentWidthRef.current = w;
          recompute(scrollXRef.current);
        }}
        onLayout={(e) => {
          containerWidthRef.current = e.nativeEvent.layout.width;
          recompute(scrollXRef.current);
        }}
      >
        {children}
      </Scroller>

      <EdgeFade side="left" style={leftStyle}>
        <GradientFill
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[FADE_WHITE, FADE_CLEAR]}
        />
      </EdgeFade>

      <EdgeFade side="right" style={rightStyle}>
        <GradientFill
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[FADE_CLEAR, FADE_WHITE]}
        />
      </EdgeFade>
    </TrackOuter>
  );
});
