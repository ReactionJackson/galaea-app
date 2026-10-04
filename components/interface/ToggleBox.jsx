import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { useEffect, useRef } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const MAX_HEIGHT = 9999;

const TRANSITION_SETTINGS = {
  duration: SLIDE_TRANSITION_DURATION,
  easing: Easing.inOut(Easing.quad),
};

export const ToggleBox = ({ isVisible, height, children }) => {
  const isFirstRender = useRef(true);
  const heightValue = useSharedValue(isVisible ? MAX_HEIGHT : 0);
  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.get(),
    overflow: heightValue.get() >= MAX_HEIGHT ? "visible" : "hidden",
  }));

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isVisible) {
      heightValue.set(
        withTiming(height, TRANSITION_SETTINGS, (finished) => {
          if (finished) heightValue.set(MAX_HEIGHT);
        }),
      );
    } else {
      heightValue.set(height);
      heightValue.set(withTiming(0, TRANSITION_SETTINGS));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
