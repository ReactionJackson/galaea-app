import { firePressHaptic } from "@/components/interface/shared";
import { Colors } from "@/constants/theme";
import {
  COLOR_TRANSITION_DURATION,
  CONDENSED_BUTTON_HEIGHT,
  FADE_TRANSITION_DURATION,
} from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { Children, cloneElement, isValidElement } from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";

export const InteractCircle = styled.View`
  height: ${CONDENSED_BUTTON_HEIGHT}px;
  border-radius: 13px;
  border-width: 2px;
  border-color: ${({ borderColor }) =>
    borderColor ?? Colors.tags.default.primary};
  justify-content: center;
  align-items: center;
  background-color: ${({ backgroundColor }) =>
    backgroundColor ?? Colors.editButtonBackground};
  width: ${CONDENSED_BUTTON_HEIGHT}px;
`;

export function InteractButton({
  variant = "secondary",
  haptics = "Light",
  disabled = false,
  onPress,
  style,
  children,
}) {
  const { fill, border, icon } = Colors.interactButton[variant];

  const coloredChildren = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child, { color: child.props.color ?? icon })
      : child,
  );

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
          <InteractCircle backgroundColor={fill} borderColor={border}>
            {coloredChildren}
          </InteractCircle>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
