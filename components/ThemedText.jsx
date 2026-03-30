import { Colors, Fonts } from "@/constants/theme";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, TextInput } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function resolveColor(color) {
  return Colors.tags[color]?.primary ?? Colors[color] ?? color;
}

export function ThemedText({
  style,
  type = "text",
  color,
  colorSwitch,
  isInput = false,
  multiline = false,
  value,
  editable,
  ...rest
}) {
  const progress = useSharedValue(colorSwitch?.active ? 1 : 0);

  // Capture colors outside worklet to avoid stale closure
  const fromColor = resolveColor(colorSwitch?.colors[0] ?? Colors.black);
  const toColor = resolveColor(colorSwitch?.colors[1] ?? Colors.black);

  useEffect(() => {
    if (!colorSwitch) return;
    progress.value = withTiming(colorSwitch.active ? 1 : 0, { duration: 300 });
  }, [colorSwitch?.active]);

  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [fromColor, toColor]),
  }));

  const baseStyle = [
    type === "title" ? styles.title : undefined,
    type === "title-small" ? styles.titleSmall : undefined,
    type === "text" ? styles.text : undefined,
    type === "subtitle" ? styles.subtitle : undefined,
    type === "date-number" ? styles.dateNumber : undefined,
    type === "tag" ? styles.tag : undefined,
    type === "tag"
      ? { color: Colors.tags[color ?? "default"]?.primary }
      : color
        ? { color: resolveColor(color) }
        : undefined,
    isInput ? styles.inputReset : undefined,
    // lineHeight on a single-line input causes vertical wiggle on focus — strip it
    isInput && !multiline ? { lineHeight: undefined } : undefined,
    isInput ? { alignSelf: "stretch" } : undefined,
    style,
  ];

  if (isInput) {
    const inputProps = {
      multiline,
      value,
      editable,
      pointerEvents: editable ? "auto" : "none",
      spellCheck: false,
      autoCorrect: true,
      ...rest,
    };

    if (colorSwitch) {
      return (
        <AnimatedTextInput
          style={[...baseStyle, animatedStyle]}
          {...inputProps}
        />
      );
    }
    return <TextInput style={baseStyle} {...inputProps} />;
  }

  if (colorSwitch) {
    return <Animated.Text style={[...baseStyle, animatedStyle]} {...rest} />;
  }

  return <Text style={baseStyle} {...rest} />;
}

const webTextStyles = Platform.select({
  web: {
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
});

const styles = StyleSheet.create({
  title: {
    color: Colors.title,
    fontFamily: Fonts.medium,
    fontSize: 22,
    lineHeight: 28,
    height: 28,
    ...webTextStyles,
  },
  titleSmall: {
    color: Colors.text,
    fontFamily: Fonts.medium,
    fontSize: 18,
    lineHeight: 26,
    ...webTextStyles,
  },
  subtitle: {
    color: Colors.black,
    fontFamily: Fonts.semibold,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 2,
    opacity: 0.6,
    ...webTextStyles,
  },
  text: {
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    ...webTextStyles,
  },
  dateNumber: {
    color: Colors.white,
    fontFamily: Fonts.semibold,
    fontSize: 18,
    letterSpacing: 1,
    textAlign: "center",
    ...webTextStyles,
  },
  tag: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    ...webTextStyles,
  },
  inputReset: {
    padding: 0,
    textAlignVertical: "top",
  },
});
