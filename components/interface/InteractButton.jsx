import { Colors } from "@/constants/theme";
import {
  CONDENSED_BUTTON_HEIGHT,
  FADE_TRANSITION_DURATION,
} from "@/constants/values";
import { triggerHaptics } from "@/utils/haptics";
import { Children, cloneElement, isValidElement, useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  transition = true,
  onPress,
  style,
  children,
}) {
  const { fill, border, icon } = Colors.interactButton[variant];
  const opacity = useSharedValue(disabled ? 0.35 : 1);
  const dimmedStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  useEffect(() => {
    opacity.set(
      withTiming(disabled ? 0.35 : 1, { duration: FADE_TRANSITION_DURATION }),
    );
  }, [disabled, opacity]);

  const coloredChildren = Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child, { color: child.props.color ?? icon })
      : child,
  );

  const handlePress = () => {
    if (disabled) return;
    triggerHaptics(haptics);
    onPress?.();
  };

  return (
    <Animated.View
      entering={
        transition ? FadeIn.duration(FADE_TRANSITION_DURATION) : undefined
      }
      exiting={
        transition ? FadeOut.duration(FADE_TRANSITION_DURATION) : undefined
      }
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
