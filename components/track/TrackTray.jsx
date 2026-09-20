import { BlurView } from "@/components/interface/BlurView";
import { Button } from "@/components/interface/Button";
import { ArrowIcon } from "@/components/interface/icons/ArrowIcon";
import { Colors } from "@/constants/theme";
import {
  FADE_TRANSITION_DURATION,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
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
`;

// Fades in/out smoothly on disable rather than snapping, since a plain
// CSS opacity interpolation on a Pressable has no transition in RN.
function SwapButton({ onPress, disabled, children }) {
  const dimmedStyle = useAnimatedTransition(
    !disabled,
    { opacity: [0.3, 1] },
    { duration: FADE_TRANSITION_DURATION },
  );

  return (
    <Animated.View style={dimmedStyle}>
      <CircleButton onPress={onPress} disabled={disabled}>
        {children}
      </CircleButton>
    </Animated.View>
  );
}

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
              <SwapButton onPress={onSwapLeft} disabled={!canSwapLeft}>
                <ArrowIcon
                  rotation={180}
                  color={Colors.button.secondary.text}
                />
              </SwapButton>
              <SwapButton onPress={onSwapRight} disabled={!canSwapRight}>
                <ArrowIcon color={Colors.button.secondary.text} />
              </SwapButton>
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
