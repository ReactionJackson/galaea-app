import { Colors, Fonts } from "@/constants/theme";
import { COLOR_TRANSITION_DURATION } from "@/constants/values";
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
    type = "text",
    color,
    isInput = false,
    isEditable,
    onChangeText = () => {},
    style,
    children,
    ...rest
  },
  ref,
) {
  const typeStyle = styles[TYPE_STYLES[type]];
  const textStyle = [
    typeStyle,
    styles.colorTransition,
    color && { color: resolveColor(color) },
    style,
  ];

  return isInput ? (
    <AnimatedTextInput
      ref={ref}
      style={[textStyle, styles.input, { minHeight: typeStyle.lineHeight }]}
      value={children}
      editable={isEditable}
      onChangeText={onChangeText}
      pointerEvents={isEditable ? "auto" : "none"}
      placeholderTextColor={Colors.placeholder}
      scrollEnabled={false}
      spellCheck={false}
      autoCorrect={true}
      {...rest}
    />
  ) : (
    <Animated.Text ref={ref} style={textStyle} {...rest}>
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
    textAlign: "center",
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
    color: Colors.tags.default.primary,
    fontFamily: Fonts.bold,
    fontSize: 12,
    ...webTextStyles,
  },
  input: {
    padding: 0,
    textAlignVertical: "top",
    alignSelf: "stretch",
  },
  colorTransition: {
    transitionProperty: "color",
    transitionDuration: COLOR_TRANSITION_DURATION,
  },
});
