import { PAGE_FADE_DURATION } from "@/constants/values";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function FadeInOnMount({
  duration = PAGE_FADE_DURATION,
  style,
  children,
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}
