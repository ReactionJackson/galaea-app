import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { useEffect, useRef, useState } from "react";
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
  const [shownChildren, setShownChildren] = useState(children);
  const heightValue = useSharedValue(isVisible ? MAX_HEIGHT : 0);
  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.get(),
    overflow: heightValue.get() >= MAX_HEIGHT ? "visible" : "hidden",
  }));

  // Updates:

  if (isVisible && children !== shownChildren) {
    setShownChildren(children);
  }

  // Effects:

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

  // Render:

  return <Animated.View style={animatedStyle}>{shownChildren}</Animated.View>;
};
