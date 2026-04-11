import { useEffect } from "react";
import {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TRANSFORM_PROPS = new Set([
  "translateX",
  "translateY",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skewX",
  "skewY",
  "perspective",
]);

const DEFAULT_DURATION = 300;
const DEFAULT_EASING = Easing.out(Easing.quad);

export function useAnimatedTransition(active, styleMap, config = {}) {
  const duration = config.duration ?? DEFAULT_DURATION;
  const easing = config.easing ?? DEFAULT_EASING;

  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration, easing });
  }, [active]);

  return useAnimatedStyle(() => {
    const style = {};
    const transforms = [];

    for (const [key, [from, to]] of Object.entries(styleMap)) {
      if (typeof from === "string" || typeof to === "string") {
        style[key] = interpolateColor(progress.value, [0, 1], [from, to]);
      } else if (TRANSFORM_PROPS.has(key)) {
        transforms.push({ [key]: from + (to - from) * progress.value });
      } else {
        style[key] = from + (to - from) * progress.value;
      }
    }

    if (transforms.length > 0) {
      style.transform = transforms;
    }

    return style;
  });
}
