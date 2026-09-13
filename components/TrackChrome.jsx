import { BlurView } from "@/components/BlurView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

// ─────────────────────────────────────────────────────────────────────────────
// TrackChrome
//
// The bottom-docked shell shared by the horizontal tracks: a blurred panel
// that slides fully into view when editMode is on (revealing the Delete /
// Cancel / Save controls) and mostly off-screen otherwise, leaving just the
// track itself visible. JournalTrack owns this exact chrome inline today —
// this is the reusable extraction, currently used by CollectionTrack.
// ─────────────────────────────────────────────────────────────────────────────

const Container = styled(Animated.View)`
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`;

const TrackContainer = styled.View`
  height: ${({ trackHeight }) => trackHeight}px;
  padding-top: ${({ trackPaddingTop }) => trackPaddingTop}px;
  align-items: center;
`;

const ControlsContainer = styled.View`
  padding: 20px;
  padding-top: 10px;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`;

export const Button = styled.Pressable`
  height: 36px;
  justify-content: center;
  padding: 4px 14px;
  border-radius: 20px;
  border: 2px solid ${Colors.dateBorder};
`;

export const SaveButton = styled(Button)`
  background-color: ${Colors.accent};
`;

export function TrackChrome({
  editMode = false,
  trackHeight = 90,
  trackPaddingTop = 25,
  onDelete,
  onCancel,
  onSave,
  children,
}) {
  const containerStyle = useAnimatedTransition(editMode, { translateY: [60, 0] });

  return (
    <Container style={containerStyle}>
      <BlurView>
        <TrackContainer trackHeight={trackHeight} trackPaddingTop={trackPaddingTop}>
          {children}
        </TrackContainer>
        <ControlsContainer>
          <Button onPress={onDelete}>
            <ThemedText color="black">Delete</ThemedText>
          </Button>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button onPress={onCancel}>
              <ThemedText color="black">Cancel</ThemedText>
            </Button>
            <SaveButton onPress={onSave}>
              <ThemedText color="white">Save</ThemedText>
            </SaveButton>
          </View>
        </ControlsContainer>
      </BlurView>
    </Container>
  );
}
