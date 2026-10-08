import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TRANSITION_SETTINGS = {
  duration: SLIDE_TRANSITION_DURATION,
  easing: Easing.inOut(Easing.quad),
};

export const AnimateHeightOld = ({
  gap = 0,
  min = 0,
  max = 9999,
  style = {},
  isVisible,
  children,
}) => {
  const isFixedHeight = max !== 9999;
  const naturalHeight = useRef(0);
  const isFirstRender = useRef(true);
  const [isMeasured, setIsMeasured] = useState(isFixedHeight || isVisible);
  const heightValue = useSharedValue(isVisible ? max : min);
  const spacingValue = useSharedValue(isVisible ? gap : 0);
  const animatedStyle = useAnimatedStyle(() => ({
    [isFixedHeight ? "height" : "maxHeight"]: heightValue.get(),
    overflow: heightValue.get() >= max ? "visible" : "hidden",
    display: heightValue.get() > 0 ? "flex" : "none",
    marginTop: spacingValue.get(),
  }));
  const measuringStyle = { position: "absolute", width: "100%", opacity: 0 };

  // Handlers:

  const onLayout = (e) => {
    if (isFixedHeight) return;
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
        withTiming(
          isFixedHeight ? max : naturalHeight.current,
          TRANSITION_SETTINGS,
          (finished) => {
            if (finished) heightValue.set(max);
          },
        ),
      );
      spacingValue.set(withTiming(gap, TRANSITION_SETTINGS));
    } else {
      heightValue.set(isFixedHeight ? max : naturalHeight.current);
      heightValue.set(withTiming(min, TRANSITION_SETTINGS));
      spacingValue.set(withTiming(0, TRANSITION_SETTINGS));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <Animated.View style={[isMeasured ? animatedStyle : measuringStyle, style]}>
      <View onLayout={onLayout}>{children}</View>
    </Animated.View>
  );
};
