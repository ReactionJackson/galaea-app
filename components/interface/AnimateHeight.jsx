import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const OPEN_MAX_HEIGHT = 9999;

function AnimateHeightActive({
  visible,
  bornVisible,
  duration,
  style,
  children,
}) {
  const heightValue = useSharedValue(0);
  const naturalHeight = useRef(0);
  const measured = useRef(false);
  const isFullyOpen = useRef(false);
  const [ready, setReady] = useState(false);
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  });

  const onLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (!h) return;
    if (!measured.current || isFullyOpen.current) {
      naturalHeight.current = h;
    }
    if (!measured.current) {
      measured.current = true;
      if (visibleRef.current) {
        if (bornVisible) {
          isFullyOpen.current = true;
          heightValue.value = OPEN_MAX_HEIGHT;
        } else {
          heightValue.value = withTiming(
            h,
            { duration, easing: Easing.out(Easing.quad) },
            (finished) => {
              if (finished) {
                isFullyOpen.current = true;
                heightValue.value = OPEN_MAX_HEIGHT;
              }
            },
          );
        }
      } else if (bornVisible) {
        heightValue.value = h;
        heightValue.value = withTiming(0, {
          duration,
          easing: Easing.out(Easing.quad),
        });
      } else {
        heightValue.value = 0;
      }
      setReady(true);
    }
  };

  useEffect(() => {
    if (!measured.current) return;
    if (visible) {
      heightValue.value = withTiming(
        naturalHeight.current,
        { duration, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) {
            isFullyOpen.current = true;
            heightValue.value = OPEN_MAX_HEIGHT;
          }
        },
      );
    } else {
      isFullyOpen.current = false;
      heightValue.value = naturalHeight.current;
      heightValue.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.quad),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: heightValue.value,
    overflow: heightValue.value >= OPEN_MAX_HEIGHT ? "visible" : "hidden",
  }));

  return (
    <Animated.View
      style={[
        ready
          ? animatedStyle
          : { position: "absolute", width: "100%", opacity: 0 },
        style,
      ]}
    >
      <View onLayout={onLayout}>{children}</View>
    </Animated.View>
  );
}

export function AnimateHeight({
  visible,
  children,
  duration = 250,
  animateOnMount = false,
  style,
}) {
  const [activated, setActivated] = useState(animateOnMount);
  const [bornVisible, setBornVisible] = useState(
    animateOnMount ? false : visible,
  );
  const [prevVisible, setPrevVisible] = useState(visible);

  if (!activated && visible !== prevVisible) {
    setActivated(true);
    setBornVisible(prevVisible);
    setPrevVisible(visible);
  }

  if (!activated) {
    return visible ? <View style={style}>{children}</View> : null;
  }

  return (
    <AnimateHeightActive
      visible={visible}
      bornVisible={bornVisible}
      duration={duration}
      style={style}
    >
      {children}
    </AnimateHeightActive>
  );
}

export function AnimatedSpacer({
  visible,
  height = 20,
  animateOnMount = false,
}) {
  const heightValue = useSharedValue(animateOnMount ? 0 : visible ? height : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!animateOnMount) return;
    }
    heightValue.value = withTiming(visible ? height : 0, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({ height: heightValue.value }));

  return <Animated.View style={animatedStyle} />;
}
