import { BlurView } from "@/components/interface/BlurView";
import { Button } from "@/components/interface/Button";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

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

const MoveButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
`;

const CircleButton = styled.Pressable`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  justify-content: center;
  align-items: center;
  border: 2px solid ${Colors.buttonBorder};
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
`;

export function TrackTray({
  editMode = false,
  trackHeight = 90,
  trackPaddingTop = 25,
  onDelete,
  onCancel,
  onSave,
  onSwapLeft,
  onSwapRight,
  canSwapLeft = true,
  canSwapRight = true,
  children,
}) {
  const containerStyle = useAnimatedTransition(
    editMode,
    { translateY: [60, 0] },
    { duration: SLIDE_TRANSITION_DURATION },
  );

  return (
    <Container style={containerStyle}>
      <BlurView>
        <TrackContainer
          trackHeight={trackHeight}
          trackPaddingTop={trackPaddingTop}
        >
          {children}
        </TrackContainer>
        <ControlsContainer>
          {onSwapLeft && onSwapRight && (
            <MoveButtonsContainer>
              <CircleButton onPress={onSwapLeft} disabled={!canSwapLeft}>
                <ThemedText color="black">←</ThemedText>
              </CircleButton>
              <CircleButton onPress={onSwapRight} disabled={!canSwapRight}>
                <ThemedText color="black">→</ThemedText>
              </CircleButton>
            </MoveButtonsContainer>
          )}
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" haptics="Medium" onPress={onSave}>
            Save
          </Button>
        </ControlsContainer>
      </BlurView>
    </Container>
  );
}
