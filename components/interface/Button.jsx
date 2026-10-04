import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { BUTTON_HEIGHT, DISABLED_OPACITY } from "@/constants/values";
import { triggerHaptics } from "@/utils/haptics";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const StyledButton = styled(Pressable)`
  height: ${BUTTON_HEIGHT}px;
  justify-content: center;
  flex-grow: 0;
  padding: 4px 14px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${({ $borderColor }) => $borderColor};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  opacity: ${({ disabled }) => (disabled ? DISABLED_OPACITY : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

export function Button({
  variant = "secondary",
  haptics = "Light",
  disabled = false,
  onPress,
  children,
  ...props
}) {
  const { text, fill, border } = Colors.button[variant];

  const handlePress = (e) => {
    triggerHaptics(haptics);
    onPress?.(e);
  };

  return (
    <StyledButton
      $backgroundColor={fill}
      $borderColor={border}
      disabled={disabled}
      onPress={handlePress}
      {...props}
    >
      <ThemedText color={text}>{children}</ThemedText>
    </StyledButton>
  );
}
