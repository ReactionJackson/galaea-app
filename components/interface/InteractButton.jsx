import { Colors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import styled, { css } from "styled-components/native";

export const InteractCircle = styled.View`
  height: 26px;
  border-radius: 13px;
  border: 2px solid
    ${({ variant }) =>
      variant === "danger" ? Colors.dateBorder : Colors.tags.default.primary};
  justify-content: center;
  align-items: center;
  background-color: ${({ variant }) =>
    variant === "danger" ? Colors.accent : Colors.editButtonBackground};
  ${({ pill }) =>
    pill
      ? css`
          flex-direction: row;
          gap: 6px;
          padding: 0 10px;
        `
      : css`
          width: 26px;
        `}
`;

export function InteractButton({
  variant,
  pill = false,
  haptic = true,
  hapticStyle = "light",
  disabled = false,
  onPress,
  style,
  children,
}) {
  const dimmedOpacity = useSharedValue(disabled ? 0.35 : 1);
  useEffect(() => {
    dimmedOpacity.value = withTiming(disabled ? 0.35 : 1, { duration: 200 });
  }, [disabled, dimmedOpacity]);
  const dimmedStyle = useAnimatedStyle(() => ({
    opacity: dimmedOpacity.value,
  }));

  const handlePress = () => {
    if (disabled) return;
    if (haptic && process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(
        hapticStyle === "heavy"
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Light,
      );
    }
    onPress?.();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      <Animated.View style={dimmedStyle}>
        <Pressable onPress={handlePress} disabled={disabled}>
          <InteractCircle variant={variant} pill={pill}>
            {children}
          </InteractCircle>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
