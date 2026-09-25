import { Colors } from "@/constants/theme";
import { ExplorationProvider } from "@/context/ExplorationContext";
import styled from "styled-components/native";

// Styled Components:

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.black};
`;

// Main Component:

function ExplorationScreen() {
  // Render:
  return (
    <ExplorationProvider>
      <Container />
    </ExplorationProvider>
  );
}

export default ExplorationScreen;
