import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const OPEN_MAX_HEIGHT = 9999;
const TRANSITION_SETTINGS = {
  duration: SLIDE_TRANSITION_DURATION,
  easing: Easing.inOut(Easing.quad),
};

export const AnimateHeight = ({ isVisible, gap = 0, children }) => {
  const naturalHeight = useRef(0);
  const isFirstRender = useRef(true);
  const [isMeasured, setIsMeasured] = useState(isVisible);
  const heightValue = useSharedValue(isVisible ? OPEN_MAX_HEIGHT : 0);
  const gapValue = useSharedValue(isVisible ? gap : 0);
  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.get(),
    overflow: heightValue.get() >= OPEN_MAX_HEIGHT ? "visible" : "hidden",
    display: heightValue.get() > 0 ? "flex" : "none",
    marginBottom: gapValue.get(),
  }));
  const measuringStyle = { position: "absolute", width: "100%", opacity: 0 };

  // Handlers:

  const onLayout = (e) => {
    const height = e.nativeEvent.layout.height;
    if (!height) return;
    naturalHeight.current = height;
    if (!isMeasured) setIsMeasured(true);
  };

  // Effects:

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isVisible) {
      heightValue.set(
        withTiming(naturalHeight.current, TRANSITION_SETTINGS, (finished) => {
          if (finished) heightValue.set(OPEN_MAX_HEIGHT);
        }),
      );
      gapValue.set(withTiming(gap, TRANSITION_SETTINGS));
    } else {
      heightValue.set(naturalHeight.current);
      heightValue.set(withTiming(0, TRANSITION_SETTINGS));
      gapValue.set(withTiming(0, TRANSITION_SETTINGS));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <Animated.View style={[isMeasured ? animatedStyle : measuringStyle]}>
      <View onLayout={onLayout}>{children}</View>
    </Animated.View>
  );
};
