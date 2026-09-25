import { CrossIcon } from "@/components/interface/icons/CrossIcon";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import {
  COLOR_TRANSITION_DURATION,
  DAY_CIRCLE_HEIGHT,
  DAY_CIRCLE_HIGHLIGHT_DURATION,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useFadeStyle } from "@/hooks/useFadeStyle";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

export const Container = styled(Animated.View)`
  width: ${DAY_CIRCLE_HEIGHT}px;
  height: ${DAY_CIRCLE_HEIGHT}px;
  border-radius: 50%;
  border: 2px solid ${Colors.buttonBorder};
  justify-content: center;
  align-items: center;
`;

export function DayCircle({
  dayNumber,
  isActive,
  highlighted,
  isInternalScroll,
  onPress,
}) {
  const {
    state: { editMode },
  } = useApp();
  const fadeStyle = useFadeStyle(!editMode || isActive, 0.1);

  return (
    <Pressable onPress={onPress} disabled={editMode}>
      <Container style={fadeStyle}>
        <ThemedText
          type="date-number"
          colorSwitch={{
            colors: [Colors.black, Colors.white],
            active: highlighted,
            duration: isInternalScroll
              ? DAY_CIRCLE_HIGHLIGHT_DURATION
              : COLOR_TRANSITION_DURATION,
          }}
        >
          {dayNumber}
        </ThemedText>
      </Container>
    </Pressable>
  );
}

export function AddDayCircle({ isActive, highlighted, onPress }) {
  const {
    state: { editMode },
  } = useApp();
  const fadeStyle = useFadeStyle(!editMode || isActive, 0.1);

  return (
    <Pressable onPress={onPress} disabled={editMode}>
      <Container style={fadeStyle}>
        <CrossIcon
          size={16}
          color={highlighted ? Colors.white : Colors.black}
        />
      </Container>
    </Pressable>
  );
}
