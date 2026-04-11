import { Colors, Fonts } from "@/constants/theme";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { Platform, StyleSheet, TextInput } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const TYPE_STYLES = {
  title: "title",
  "title-small": "titleSmall",
  text: "text",
  subtitle: "subtitle",
  "date-number": "dateNumber",
  tag: "tag",
};

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
  const defaultColor =
    type === "tag"
      ? (Colors.tags[color ?? "default"]?.primary ?? Colors.black)
      : color
        ? resolveColor(color)
        : (styles[TYPE_STYLES[type]]?.color ?? Colors.black);

  const fromColor = resolveColor(colorSwitch?.colors[0] ?? defaultColor);
  const toColor = resolveColor(colorSwitch?.colors[1] ?? defaultColor);

  // Always applied — never conditional. Reanimated writes colour values directly
  // to the native node, so conditionally removing this style leaves stale values
  // behind. When no colorSwitch is present, from === to === defaultColor, making
  // it a consistent no-op rather than fighting the native layer.
  const animatedColorStyle = useAnimatedTransition(
    colorSwitch?.active ?? false,
    { color: [fromColor, toColor] },
    { duration: 300 },
  );

  const baseStyle = [
    styles[TYPE_STYLES[type]],
    isInput ? styles.inputReset : null,
    // Single-line inputs: drop explicit height so iOS lays out text and
    // placeholder using the same metrics (misalignment occurs when height is
    // set without a matching lineHeight). Keep lineHeight so both text and
    // placeholder are governed by the same value — removing it causes iOS to
    // calculate them slightly differently, which shifts the placeholder.
    isInput && !multiline ? { height: undefined } : null,
    // Multiline inputs must be at least one line tall even when empty,
    // otherwise the parent AnimateHeight measures 0 and can't animate open.
    isInput && multiline
      ? { minHeight: styles[TYPE_STYLES[type]]?.lineHeight ?? 24 }
      : null,
    isInput ? { alignSelf: "stretch" } : null,
    animatedColorStyle,
    style,
  ];

  if (isInput) {
    return (
      <AnimatedTextInput
        style={baseStyle}
        multiline={multiline}
        scrollEnabled={!multiline}
        value={value}
        editable={editable}
        pointerEvents={editable ? "auto" : "none"}
        placeholderTextColor={Colors.placeholder}
        spellCheck={false}
        autoCorrect={true}
        {...rest}
      />
    );
  }

  return <Animated.Text style={baseStyle} {...rest} />;
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
