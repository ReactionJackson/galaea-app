import { JournalPage } from "@/components/exploration/pages/JournalPage";
import { Colors } from "@/constants/theme";
import { PageProvider } from "@/context/PageContext";
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
      <PageProvider>
        <JournalPage postId={7} />
      </PageProvider>
    </Container>
  );
}

export default ExplorationScreen;
