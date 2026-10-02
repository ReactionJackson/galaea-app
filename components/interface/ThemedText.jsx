import { Colors, Fonts } from "@/constants/theme";
import { COLOR_TRANSITION_DURATION } from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { forwardRef } from "react";
import { Platform, StyleSheet, TextInput } from "react-native";
import Animated from "react-native-reanimated";

// Constants:

const TYPE_STYLES = {
  title: "title",
  "title-small": "titleSmall",
  text: "text",
  caption: "caption",
  subtitle: "subtitle",
  "date-number": "dateNumber",
  tag: "tag",
};

// Helpers:

const resolveColor = (color) =>
  Colors.tags[color]?.primary ?? Colors[color] ?? color;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Main Component:

export const ThemedText = forwardRef(function ThemedText(
  {
    style,
    type = "text",
    color,
    colorSwitch,
    isInput = false,
    multiline = false,
    value = "???",
    isEditable: editable,
    children,
    ...rest
  },
  ref,
) {
  const defaultColor =
    type === "tag"
      ? (Colors.tags[color ?? "default"]?.primary ?? Colors.black)
      : color
        ? resolveColor(color)
        : (styles[TYPE_STYLES[type]]?.color ?? Colors.black);

  const fromColor = resolveColor(colorSwitch?.colors[0] ?? defaultColor);
  const toColor = resolveColor(colorSwitch?.colors[1] ?? defaultColor);
  const animatedColorStyle = useAnimatedTransition(
    colorSwitch?.active ?? false,
    { color: [fromColor, toColor] },
    { duration: colorSwitch?.duration ?? COLOR_TRANSITION_DURATION },
  );

  const baseStyle = [
    styles[TYPE_STYLES[type]],
    isInput ? styles.inputReset : null,
    isInput && !multiline ? { height: undefined } : null,
    isInput && multiline
      ? { minHeight: styles[TYPE_STYLES[type]]?.lineHeight ?? 24 }
      : null,
    isInput ? { alignSelf: "stretch" } : null,
    animatedColorStyle,
    style,
  ];

  // Render:

  return isInput ? (
    <AnimatedTextInput
      ref={ref}
      style={baseStyle}
      multiline={multiline}
      scrollEnabled={false}
      value={children ?? value}
      editable={editable}
      pointerEvents={editable ? "auto" : "none"}
      placeholderTextColor={Colors.placeholder}
      spellCheck={false}
      autoCorrect={true}
      {...rest}
    />
  ) : (
    <Animated.Text ref={ref} style={baseStyle} {...rest}>
      {children}
    </Animated.Text>
  );
});

// Typography Styles:

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
    lineHeight: 9,
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
  caption: {
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 18,
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
