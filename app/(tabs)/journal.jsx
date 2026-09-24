import { JournalRow } from "@/components/exploration/rows/JournalRow";
import { Colors } from "@/constants/theme";
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.black};
`;

function JournalScreen() {
  return (
    <Container>
      <JournalRow />
    </Container>
  );
}

export default JournalScreen;
