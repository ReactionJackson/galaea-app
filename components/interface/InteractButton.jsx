import { Colors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";

const Circle = styled.View`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  border: 2px solid ${Colors.dateBorder};
  justify-content: center;
  align-items: center;
  background-color: ${({ variant }) =>
    variant === "danger" ? Colors.accent : Colors.editButtonBackground};
`;

export function InteractButton({
  variant,
  haptic = false,
  onPress,
  style,
  children,
}) {
  const handlePress = () => {
    if (haptic && process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onPress?.();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      <Pressable onPress={handlePress}>
        <Circle variant={variant}>{children}</Circle>
      </Pressable>
    </Animated.View>
  );
}
