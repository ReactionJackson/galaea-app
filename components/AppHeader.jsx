import { Colors } from "@/constants/theme";
import styled from "styled-components/native";
import { ThemedText } from "./interface/ThemedText";

const Container = styled.SafeAreaView`
  z-index: 100;
  width: 100%;
  background-color: ${Colors.background};
  shadow-color: ${Colors.faded};
  shadow-offset: 0px 5px;
  shadow-opacity: 0.12;
  shadow-radius: 4px;
`;

const Inner = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  padding: 0 20px;
`;

export function AppHeader() {
  return (
    <Container>
      <Inner>
        <ThemedText type="title">Galaea</ThemedText>
      </Inner>
    </Container>
  );
}
