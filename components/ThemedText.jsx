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
  const fromColor = resolveColor(colorSwitch?.colors[0] ?? Colors.black);
  const toColor = resolveColor(colorSwitch?.colors[1] ?? Colors.black);

  const animatedColorStyle = useAnimatedTransition(
    colorSwitch?.active ?? false,
    { color: [fromColor, toColor] },
    { duration: 300 },
  );

  const baseStyle = [
    styles[TYPE_STYLES[type]],
    type === "tag" && !colorSwitch
      ? { color: Colors.tags[color ?? "default"]?.primary }
      : !colorSwitch && color
        ? { color: resolveColor(color) }
        : null,
    isInput ? styles.inputReset : null,
    isInput && !multiline ? { lineHeight: undefined } : null,
    isInput ? { alignSelf: "stretch" } : null,
    colorSwitch ? animatedColorStyle : null,
    style,
  ];

  if (isInput) {
    return (
      <AnimatedTextInput
        style={baseStyle}
        multiline={multiline}
        value={value}
        editable={editable}
        pointerEvents={editable ? "auto" : "none"}
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
