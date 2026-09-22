import { TickIcon } from "@/components/interface/icons/TickIcon";
import { ThemedText } from "@/components/interface/ThemedText";
import { ACCENT_SWATCHES, Colors } from "@/constants/theme";
import { useSettings } from "@/context/SettingsContext";
import { triggerHaptics } from "@/utils/haptics";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const SWATCH_SIZE = 44;

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
  padding: 70px 20px;
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
  const { accent, setAccent } = useSettings();

  return (
    <Container>
      <ThemedText type="title">Settings</ThemedText>
      <ThemedText type="subtitle">Accent Colour</ThemedText>
      <SwatchRow>
        {ACCENT_SWATCHES.map((color) => (
          <Pressable
            key={color}
            onPress={() => {
              triggerHaptics("Light");
              setAccent(color);
            }}
          >
            <Swatch $color={color} $selected={color === accent}>
              {color === accent && <TickIcon color={Colors.white} />}
            </Swatch>
          </Pressable>
        ))}
      </SwatchRow>
    </Container>
  );
}
