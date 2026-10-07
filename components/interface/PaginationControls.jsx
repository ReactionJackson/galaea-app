import { Tag } from "@/components/tags/Tag";
import { FADE_TRANSITION_DURATION } from "@/constants/values";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { ArrowIcon } from "../interface/icons/ArrowIcon";
import { InteractButton } from "../interface/InteractButton";
import { ThemedText } from "../interface/ThemedText";

const Container = styled(Animated.View)`
  align-self: center;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export function PaginationControls({ activeSlot, totalSlots, onPress }) {
  return (
    <Container
      entering={FadeIn.duration(FADE_TRANSITION_DURATION)}
      exiting={FadeOut.duration(FADE_TRANSITION_DURATION)}
    >
      <InteractButton onPress={() => onPress(-1)} disabled={activeSlot === 0}>
        <ArrowIcon rotation={180} />
      </InteractButton>
      <Tag>
        <ThemedText type="tag">
          Order: {activeSlot + 1} / {totalSlots}
        </ThemedText>
      </Tag>
      <InteractButton
        onPress={() => onPress(1)}
        disabled={activeSlot === totalSlots - 1}
      >
        <ArrowIcon />
      </InteractButton>
    </Container>
  );
}
