import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import {
  CONDENSED_BUTTON_HEIGHT,
  DISABLED_OPACITY,
  FADE_TRANSITION_DURATION,
} from "@/constants/values";
import { forwardRef } from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

const FADE_TRANSITION = {
  transitionProperty: "opacity",
  transitionDuration: FADE_TRANSITION_DURATION,
};

// Styled Components:

export const Container = styled(Animated.createAnimatedComponent(Pressable))`
  align-items: center;
  justify-content: center;
  height: ${CONDENSED_BUTTON_HEIGHT}px;
  min-width: ${CONDENSED_BUTTON_HEIGHT}px;
  border-radius: 13px;
  padding: 0 10px;
  border-width: 2px;
  border-style: solid;
`;

// Main Component:

export const Tag = forwardRef(function Tag(
  {
    onPress = () => {},
    $color = "default",
    disabled = false,
    isInput = false,
    placeholder,
    onChangeText,
    onSubmit,
    onFocus,
    children,
  },
  ref,
) {
  const { border, fill } = Colors.tags[$color];

  return (
    <Container
      onPress={onPress}
      style={[
        {
          borderColor: border,
          backgroundColor: fill,
          opacity: disabled ? DISABLED_OPACITY : 1,
        },
        FADE_TRANSITION,
      ]}
    >
      <ThemedText
        ref={ref}
        type="tag"
        style={{ color: border }}
        isInput={isInput}
        isEditable={isInput}
        placeholder={placeholder}
        onChangeText={onChangeText}
        onFocus={onFocus}
        returnKeyType="done"
      >
        {children}
      </ThemedText>
    </Container>
  );
});
