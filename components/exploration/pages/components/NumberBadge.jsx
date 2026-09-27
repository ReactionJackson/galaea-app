import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import styled from "styled-components/native";

// Styled Components:

const Container = styled.View`
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-width: 2px;
  border-color: ${({ $border }) => $border};
  background-color: ${({ $fill }) => $fill};
`;

// Main Component:

export const NumberBadge = ({ variant = "primary", children }) => {
  const {
    settings: { accentColor },
  } = useApp();
  const fill = variant === "primary" ? accentColor : Colors.transparent;
  const border =
    variant === "primary" ? Colors.transparent : Colors.buttonBorder;
  const color = variant === "primary" ? Colors.white : Colors.black;
  return (
    <Container $fill={fill} $border={border}>
      <ThemedText type="date-number" color={color}>
        {children}
      </ThemedText>
    </Container>
  );
};
