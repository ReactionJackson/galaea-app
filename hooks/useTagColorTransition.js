import { Colors } from "@/constants/theme";
import { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";

const COLOR_TIMING = { duration: 200, easing: Easing.out(Easing.quad) };

function resolvePrimary(key) {
  return Colors.tags[key]?.primary ?? Colors.tags.default.primary;
}

function resolveSecondary(key) {
  return Colors.tags[key]?.secondary ?? Colors.tags.default.secondary;
}

export function useTagColorTransition(color) {
  const primary = resolvePrimary(color);
  const secondary = resolveSecondary(color);

  const borderStyle = useAnimatedStyle(
    () => ({
      borderColor: withTiming(primary, COLOR_TIMING),
      backgroundColor: withTiming(secondary, COLOR_TIMING),
    }),
    [primary, secondary],
  );

  const textStyle = useAnimatedStyle(
    () => ({ color: withTiming(primary, COLOR_TIMING) }),
    [primary],
  );

  return { borderStyle, textStyle };
}
