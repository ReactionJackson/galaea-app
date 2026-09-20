import { Colors } from "@/constants/theme";
import { CONDENSED_BUTTON_HEIGHT } from "@/constants/values";
import styled from "styled-components/native";

export const Tag = styled.View`
  align-items: center;
  justify-content: center;
  height: ${CONDENSED_BUTTON_HEIGHT}px;
  border-radius: 13px;
  padding: 0 10px;
  border-width: 2px;
  border-style: solid;
  ${({ color = "default" }) => `
    border-color: ${Colors.tags[color].primary};
    background-color: ${Colors.tags[color].secondary};
  `}
`;
