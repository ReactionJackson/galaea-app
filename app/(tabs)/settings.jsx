import { HeaderText } from "@/components/interface/HeaderText";
import { TickIcon } from "@/components/interface/icons/TickIcon";
import { ThemedText } from "@/components/interface/ThemedText";
import { ACCENT_SWATCHES, Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { triggerHaptics } from "@/utils/haptics";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const SWATCH_SIZE = 33;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const Section = styled.View`
  gap: 10px;
`;

const SwatchRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 14px;
`;

const Swatch = styled.View`
  width: ${SWATCH_SIZE}px;
  height: ${SWATCH_SIZE}px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  background-color: ${({ $color }) => $color};
  border-width: 2px;
  border-color: ${({ $selected }) =>
    $selected ? Colors.selectedBorder : Colors.transparent};
`;

export default function SettingsScreen() {
  const { accentColor, setAccentColor } = useApp();
  return (
    <Container>
      <HeaderText>
        <HeaderText.Title>Settings</HeaderText.Title>
      </HeaderText>

      <Section>
        <ThemedText type="subtitle">Accent Colour</ThemedText>
        <SwatchRow>
          {ACCENT_SWATCHES.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                triggerHaptics("Light");
                setAccentColor(color);
              }}
            >
              <Swatch $color={color} $selected={color === accentColor}>
                {color === accentColor && <TickIcon color={Colors.white} />}
              </Swatch>
            </Pressable>
          ))}
        </SwatchRow>
      </Section>
    </Container>
  );
}
