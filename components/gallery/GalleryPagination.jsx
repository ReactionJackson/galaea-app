import { Tag } from "@/components/tags/Tag";
import { FADE_TRANSITION_DURATION } from "@/constants/values";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { InteractButton } from "../interface/InteractButton";
import { ArrowIcon } from "../interface/icons/ArrowIcon";
import { ThemedText } from "../interface/ThemedText";

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
      entering={FadeIn.duration(FADE_TRANSITION_DURATION)}
      exiting={FadeOut.duration(FADE_TRANSITION_DURATION)}
    >
      <InteractButton onPress={onPressLeft} disabled={index === 0}>
        <ArrowIcon rotation={180} />
      </InteractButton>
      <Tag>
        <ThemedText type="tag" color="default">
          Order: {index + 1} / {total}
        </ThemedText>
      </Tag>
      <InteractButton onPress={onPressRight} disabled={index === total - 1}>
        <ArrowIcon />
      </InteractButton>
    </Row>
  );
}
