import { BlurView } from "@/components/interface/BlurView";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";

const Header = styled(BlurView)`
  z-index: 100;
  margin: 0 -20px;
  gap: 10px;
  height: ${({ headerHeight }) => headerHeight}px;
  padding: 15px 20px;
  flex-direction: row;
  justify-content: flex-start;
`;

export function PageHeader({ height = 70, tint = "light", children }) {
  const { width: screenWidth } = useWindowDimensions();
  return (
    <Header tint={tint} headerHeight={height} style={{ width: screenWidth }}>
      {children}
    </Header>
  );
}
