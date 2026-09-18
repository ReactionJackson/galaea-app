import { Colors } from "@/constants/theme";
import styled from "styled-components/native";

export const GhostButton = styled.Pressable`
  height: 36px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${Colors.overlayBorder};
`;

export const PrimaryButton = styled.Pressable`
  height: 36px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  background-color: ${Colors.accent};
`;
