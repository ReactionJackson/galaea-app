import { firePressHaptic } from "@/components/interface/shared";
import { Colors } from "@/constants/theme";
import {
  COLOR_TRANSITION_DURATION,
  FADE_TRANSITION_DURATION,
} from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled, { css } from "styled-components/native";

const VARIANTS = {
  default: {
    backgroundColor: Colors.editButtonBackground,
    borderColor: Colors.tags.default.primary,
  },
  danger: {
    backgroundColor: Colors.accent,
    borderColor: Colors.buttonBorder,
  },
};

export const InteractCircle = styled.View`
  height: 26px;
  border-radius: 13px;
  border-width: 2px;
  border-color: ${({ borderColor }) =>
    borderColor ?? Colors.tags.default.primary};
  justify-content: center;
  align-items: center;
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? Colors.editButtonBackground};
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
  variant = "default",
  pill = false,
  haptics = "Light",
  disabled = false,
  onPress,
  style,
  children,
}) {
  const { backgroundColor, borderColor } = VARIANTS[variant];

  const dimmedStyle = useAnimatedTransition(
    !disabled,
    { opacity: [0.35, 1] },
    { duration: COLOR_TRANSITION_DURATION },
  );

  const handlePress = () => {
    if (disabled) return;
    firePressHaptic(haptics);
    onPress?.();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(FADE_TRANSITION_DURATION)}
      exiting={FadeOut.duration(FADE_TRANSITION_DURATION)}
      style={style}
    >
      <Animated.View style={dimmedStyle}>
        <Pressable onPress={handlePress} disabled={disabled}>
          <InteractCircle
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            pill={pill}
          >
            {children}
          </InteractCircle>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
