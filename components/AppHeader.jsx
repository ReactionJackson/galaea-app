import { Colors } from "@/constants/theme";
import styled from "styled-components/native";
import { ThemedText } from "./ThemedText";

// SafeAreaView must NOT have a fixed height — it adds paddingTop for the
// status bar inset automatically, so the total rendered height is
// (safe area inset + content height). A fixed height would squeeze the content.
const Container = styled.SafeAreaView`
  z-index: 100;
  width: 100%;
  background-color: ${Colors.background};
  shadow-color: ${Colors.faded};
  shadow-offset: 0px 5px;
  shadow-opacity: 0.12;
  shadow-radius: 4px;
`;

// The fixed-height content row lives inside, separate from the inset padding.
const Inner = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
`;

export function AppHeader() {
  return (
    <Container>
      <Inner>
        <ThemedText type="title">Galaea</ThemedText>
        <ThemedText type="title">O</ThemedText>
      </Inner>
    </Container>
  );
}
