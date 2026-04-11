import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const OPEN_MAX_HEIGHT = 9999;

export function AnimatedSpacer({ visible, height = 20, animateOnMount = false }) {
  return (
    <AnimateHeight visible={visible} animateOnMount={animateOnMount}>
      <View style={{ height }} />
    </AnimateHeight>
  );
}

export function AnimateHeight({ visible, children, duration = 250, animateOnMount = false }) {
  const heightValue = useSharedValue(0);
  const naturalHeight = useRef(0);
  const measured = useRef(false);
  const [ready, setReady] = useState(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  // Track whether the component was visible from its very first render.
  // Used to distinguish "has existing content, open immediately" from
  // "visible changed to true before onLayout fired" (race condition).
  // animateOnMount overrides this so newly inserted items animate in even
  // when mounted with visible=true.
  const wasInitiallyVisible = useRef(animateOnMount ? false : visible);

  const onLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (!h) return;
    // Always track current height so collapse animations start from the right
    // value even if content has grown or shrunk since first measurement.
    naturalHeight.current = h;
    if (!measured.current) {
      measured.current = true;
      if (visibleRef.current) {
        if (wasInitiallyVisible.current) {
          // Visible from the start (entry already has content) — snap open,
          // no entrance animation needed.
          heightValue.value = OPEN_MAX_HEIGHT;
        } else {
          // visible became true before onLayout had a chance to fire.
          // Animate the entrance now rather than snapping to full height.
          heightValue.value = withTiming(
            h,
            { duration, easing: Easing.out(Easing.quad) },
            (finished) => { if (finished) heightValue.value = OPEN_MAX_HEIGHT; }
          );
        }
      } else {
        heightValue.value = 0;
      }
      setReady(true);
    }
  };

  useEffect(() => {
    if (!measured.current) return;
    if (visible) {
      // Animate to natural height, then open up to allow free growth.
      heightValue.value = withTiming(
        naturalHeight.current,
        { duration, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) heightValue.value = OPEN_MAX_HEIGHT;
        },
      );
    } else {
      // Capture actual current height before collapsing — content may have
      // grown or shrunk while open.
      heightValue.value = naturalHeight.current;
      heightValue.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.value,
    overflow: "hidden",
  }));

  return (
    <Animated.View
      style={ready ? animatedStyle : { overflow: "hidden", opacity: 0 }}
    >
      <View onLayout={onLayout}>{children}</View>
    </Animated.View>
  );
}
