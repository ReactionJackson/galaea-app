import { FADE_TRANSITION_DURATION } from "@/constants/values";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";

export function useFadeStyle(active, inactiveOpacity) {
  return useAnimatedStyle(
    () => ({
      opacity: withTiming(active ? 1 : inactiveOpacity, {
        duration: FADE_TRANSITION_DURATION,
      }),
    }),
    [active, inactiveOpacity],
  );
}
