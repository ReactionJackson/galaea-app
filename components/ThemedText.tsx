import { Colors, Fonts } from "@/constants/theme";
import { Platform, StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  color?: string;
  type?: "title" | "title-small" | "text" | "subtitle" | "date-number" | "tag";
};

function resolveColor(color: string): string {
  return (
    Colors.tags[color as keyof typeof Colors.tags]?.primary ??
    Colors[color as keyof typeof Colors] ??
    color
  );
}

export function ThemedText({
  style,
  type = "text",
  color,
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        type === "title" ? styles.title : undefined,
        type === "title-small" ? styles.titleSmall : undefined,
        type === "text" ? styles.text : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "date-number" ? styles.dateNumber : undefined,
        type === "tag" ? styles.tag : undefined,
        type === "tag"
          ? {
              color:
                Colors.tags[(color as keyof typeof Colors.tags) ?? "default"]
                  ?.primary,
            }
          : color
            ? { color: resolveColor(color) }
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
});
