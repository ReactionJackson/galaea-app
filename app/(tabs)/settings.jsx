import { Button } from "@/components/interface/Button";
import { HeaderText } from "@/components/interface/HeaderText";
import { TickIcon } from "@/components/interface/icons/TickIcon";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { triggerHaptics } from "@/utils/haptics";
import { runLegacyMigration } from "@/utils/migrateLegacyContent";
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
  const {
    settings: { accentColor },
    updateSettings,
    replaceContent,
  } = useApp();

  // Handlers:

  const handleMigrate = async () => {
    const content = await runLegacyMigration();
    if (content) replaceContent(content);
  };

  // Render:

  return (
    <Container>
      <HeaderText>
        <HeaderText.Title>Settings</HeaderText.Title>
      </HeaderText>

      <Section>
        <ThemedText type="subtitle">Accent Colour</ThemedText>
        <SwatchRow>
          {Object.values(Colors.accents).map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                triggerHaptics("Light");
                updateSettings({ accentColor: color });
              }}
            >
              <Swatch $color={color} $selected={color === accentColor}>
                {color === accentColor && <TickIcon color={Colors.white} />}
              </Swatch>
            </Pressable>
          ))}
        </SwatchRow>
      </Section>

      <Section>
        <ThemedText type="subtitle">Legacy Content</ThemedText>
        <Button onPress={handleMigrate}>Migrate Legacy Content</Button>
      </Section>
    </Container>
  );
}
