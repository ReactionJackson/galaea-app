import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { ArrowIcon } from "./interface/icons/ArrowIcon";
import { InteractButton } from "./interface/InteractButton";
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
      <InteractButton pill onPress={onPressLeft} disabled={index === 0}>
        <ArrowIcon rotation={180} size={10} />
        <ThemedText type="tag" color="black">
          Shift
        </ThemedText>
      </InteractButton>
      <InteractButton
        pill
        onPress={onPressRight}
        disabled={index === total - 1}
      >
        <ThemedText type="tag" color="black">
          Shift
        </ThemedText>
        <ArrowIcon size={10} />
      </InteractButton>
    </Row>
  );
}
