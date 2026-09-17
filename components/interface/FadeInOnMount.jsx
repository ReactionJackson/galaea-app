import { PAGE_INTRO_FADE } from "@/constants/values";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// A page landing on new content (e.g. switching journal days) should read as
// one distinct, freshly-arrived page, not a smooth interpolation between the
// old and new values — that's what was causing layout mid-reflow (tags
// sliding, text appearing half-built) to show through the fade. Pairing a
// remount (parent uses a `key` so this mounts fresh every time) with this
// component gets the best of both: the new page lays itself out once, fully
// formed, off-screen, and only then fades in as a single settled block.
export function FadeInOnMount({ duration = PAGE_INTRO_FADE, style, children }) {
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
