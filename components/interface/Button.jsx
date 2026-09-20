import { firePressHaptic } from "@/components/interface/shared";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const StyledButton = styled(Pressable)`
  height: 36px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${({ borderColor }) => borderColor};
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

export function Button({
  variant = "secondary",
  haptics = "Light",
  onPress,
  children,
  ...props
}) {
  const { text, fill, border } = Colors.button[variant];

  const handlePress = (e) => {
    firePressHaptic(haptics);
    onPress?.(e);
  };

  return (
    <StyledButton
      backgroundColor={fill}
      borderColor={border}
      onPress={handlePress}
      {...props}
    >
      <ThemedText color={text}>{children}</ThemedText>
    </StyledButton>
  );
}
