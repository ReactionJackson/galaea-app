import { JournalPage } from "@/components/exploration/pages/JournalPage";
import { Colors } from "@/constants/theme";
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
  return (
    <Container>
      <JournalPage postId={2} />
    </Container>
  );
}

export default ExplorationScreen;
