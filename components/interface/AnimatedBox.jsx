import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { forwardRef, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Constants:

const DEFAULT_EASING = Easing.inOut(Easing.quad);

// Helpers:

const splitStyle = (style) => {
  const animated = {};
  const fixed = {};
  Object.entries(StyleSheet.flatten(style) || {}).forEach(([key, value]) => {
    (typeof value === "number" ? animated : fixed)[key] = value;
  });
  return { animated, fixed };
};

const hasSameKeys = (a, b) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => key in b);
};

// Main Component:

export const AnimatedBox = forwardRef(function AnimatedBox(
  { transition = {}, trigger, style, ...rest },
  ref,
) {
  const { duration = SLIDE_TRANSITION_DURATION, easing = DEFAULT_EASING } =
    transition;
  const { animated, fixed } = splitStyle(style);
  const animatedKey = JSON.stringify(animated);
  const values = useSharedValue(animated);
  const lastTrigger = useRef(trigger);
  const animatedStyle = useAnimatedStyle(() => values.get());

  // Hooks:

  useEffect(() => {
    const isTriggered =
      trigger === undefined || trigger !== lastTrigger.current;
    lastTrigger.current = trigger;
    if (!isTriggered || !duration || !hasSameKeys(values.get(), animated)) {
      values.set(animated);
      return;
    }
    values.set(withTiming(animated, { duration, easing }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatedKey, trigger]);

  // Render:

  return <Animated.View ref={ref} style={[fixed, animatedStyle]} {...rest} />;
});
