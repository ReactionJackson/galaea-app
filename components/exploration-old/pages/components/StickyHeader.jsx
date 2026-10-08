import { BlurView } from "@/components/interface/BlurView";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";

const Bar = styled(BlurView)`
  z-index: 100;
  margin: 0 -20px;
  height: 70px;
  padding: 0 20px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export function StickyHeader({ tint = "light", style, children }) {
  const { width: screenWidth } = useWindowDimensions();
  return (
    <Bar tint={tint} style={[{ width: screenWidth }, style]}>
      {children}
    </Bar>
  );
}
