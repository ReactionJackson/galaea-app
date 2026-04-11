import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function AnimateHeight({ visible, children, duration = 250 }) {
  const heightValue = useSharedValue(0);
  const naturalHeight = useRef(0);
  const measured = useRef(false);
  const [ready, setReady] = useState(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const onLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (!h || measured.current) return;
    measured.current = true;
    naturalHeight.current = h;
    heightValue.value = visibleRef.current ? h : 0;
    setReady(true);
  };

  useEffect(() => {
    if (!measured.current) return;
    heightValue.value = withTiming(visible ? naturalHeight.current : 0, {
      duration,
      easing: Easing.out(Easing.quad),
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
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
