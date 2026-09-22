import { ThemedText } from "@/components/interface/ThemedText";
import { BUTTON_HEIGHT } from "@/constants/values";
import { useSettings } from "@/context/SettingsContext";
import { triggerHaptics } from "@/utils/haptics";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const StyledButton = styled(Pressable)`
  height: ${BUTTON_HEIGHT}px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${({ $borderColor }) => $borderColor};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export function Button({
  variant = "secondary",
  haptics = "Light",
  onPress,
  children,
  ...props
}) {
  const { buttonColors } = useSettings();
  const { text, fill, border } = buttonColors[variant];

  const handlePress = (e) => {
    triggerHaptics(haptics);
    onPress?.(e);
  };

  return (
    <StyledButton
      $backgroundColor={fill}
      $borderColor={border}
      onPress={handlePress}
      {...props}
    >
      <ThemedText color={text}>{children}</ThemedText>
    </StyledButton>
  );
}
