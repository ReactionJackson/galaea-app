import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { InteractButton, InteractCircle } from "./interface/InteractButton";
import { ThemedText } from "./interface/ThemedText";

const Row = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export function GalleryPagination({
  index,
  total,
  onPressLeft,
  onPressRight,
  style,
}) {
  return (
    <Row
      style={style}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      <InteractButton onPress={onPressLeft} disabled={index === 0}>
        <ThemedText type="tag" color="black">
          ←
        </ThemedText>
      </InteractButton>
      <InteractCircle pill>
        <ThemedText type="tag" color="black">
          Order: {index + 1} / {total}
        </ThemedText>
      </InteractCircle>
      <InteractButton onPress={onPressRight} disabled={index === total - 1}>
        <ThemedText type="tag" color="black">
          →
        </ThemedText>
      </InteractButton>
    </Row>
  );
}
