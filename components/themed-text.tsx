import { Colors, Fonts } from "@/constants/theme";
import { Platform, StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  textColor?: keyof typeof Colors.tags;
  type?:
    | "default"
    | "title"
    | "entry-title"
    | "entry-number"
    | "entry-month"
    | "entry-time"
    | "tag";
};

export function ThemedText({
  style,
  type = "default",
  textColor = "default",
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        type === "title" ? styles.title : undefined,
        type === "default" ? styles.default : undefined,
        type === "entry-title" ? styles.entryTitle : undefined,
        type === "entry-number" ? styles.entryNumber : undefined,
        type === "entry-month" ? styles.entryMonth : undefined,
        type === "entry-time" ? styles.entryTime : undefined,
        type === "tag"
          ? {
              ...styles.tag,
              color: Colors.tags[textColor]?.border || Colors.text,
            }
          : undefined,
        style,
      ]}
      {...rest}
    />
  );
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
    lineHeight: 32,
    ...webTextStyles,
  },
  default: {
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    ...webTextStyles,
  },
  entryTitle: {
    color: Colors.title,
    fontFamily: Fonts.medium,
    fontSize: 22,
    lineHeight: 28,
    height: 28,
    ...webTextStyles,
  },
  entryNumber: {
    color: Colors.white,
    fontFamily: Fonts.semibold,
    fontSize: 18,
    letterSpacing: 1,
    ...webTextStyles,
  },
  entryMonth: {
    color: Colors.black,
    fontFamily: Fonts.medium,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 3,
    opacity: 0.6,
    ...webTextStyles,
  },
  entryTime: {
    color: Colors.black,
    fontFamily: Fonts.medium,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 3,
    opacity: 0.3,
    ...webTextStyles,
  },
  tag: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    ...webTextStyles,
  },
});
