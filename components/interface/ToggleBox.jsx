import { AnimatedBox } from "@/components/interface/AnimatedBox";
import { useState } from "react";
import styled from "styled-components/native";

// Styled Components:

const Content = styled.View`
  ${({ $isMeasured }) => ($isMeasured ? "position: absolute; width: 100%;" : "")}
`;

// Main Component:

export const ToggleBox = ({ gap = 0, min = 0, max, isVisible, children }) => {
  const [naturalHeight, setNaturalHeight] = useState(0);
  const expandedHeight = max || naturalHeight;

  // Handlers:

  const handleLayout = (e) => setNaturalHeight(e.nativeEvent.layout.height);

  // Render:

  return (
    <AnimatedBox
      trigger={isVisible}
      style={{
        height: isVisible ? expandedHeight : min,
        marginTop: isVisible ? gap : 0,
        overflow: "hidden",
      }}
    >
      <Content $isMeasured={!max} onLayout={max ? undefined : handleLayout}>
        {children}
      </Content>
    </AnimatedBox>
  );
};
