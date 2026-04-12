import { AnimateHeight, AnimatedSpacer } from "@/components/AnimateHeight";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { tagsData } from "@/data/entries";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";
import styled from "styled-components/native";

const TrackOuter = styled.View`
  position: relative;
`;

const Track = styled.ScrollView`
  width: 100%;
  height: 26px;
`;

const Fade = styled(LinearGradient)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
`;

const ActiveTags = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.View`
  align-items: center;
  justify-content: center;
  height: 26px;
  border-radius: 13px;
  padding: 0 10px;
  border-width: 2px;
  border-style: solid;
  ${({ color = "default" }) => `
    border-color: ${Colors.tags[color].primary};
    background-color: ${Colors.tags[color].secondary};
  `}
`;

const FADE_WHITE = "rgba(255,255,255,1)";
const FADE_CLEAR = "rgba(255,255,255,0)";

export function Tags({
  tagIds = [],
  editMode = false,
  onToggleTag = () => {},
}) {
  return (
    <View>
      <AnimateHeight visible={editMode}>
        <TrackOuter>
          <Track
            horizontal
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {tagsData.map(({ tagId, name, color }, i) => {
              const active = tagIds.includes(tagId);
              const tagColor = active ? "disabled" : color;
              return (
                <Pressable
                  key={`tag-${tagId}-${i}`}
                  onPress={() => onToggleTag(tagId)}
                >
                  <Tag color={tagColor}>
                    <ThemedText type="tag" color={tagColor}>
                      {name}
                    </ThemedText>
                  </Tag>
                </Pressable>
              );
            })}
          </Track>
          <Fade
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[FADE_WHITE, FADE_CLEAR]}
            style={{ left: 0 }}
            pointerEvents="none"
          />
          <Fade
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[FADE_CLEAR, FADE_WHITE]}
            style={{ right: 0 }}
            pointerEvents="none"
          />
        </TrackOuter>
      </AnimateHeight>
      <AnimatedSpacer visible={!!tagIds.length && editMode} height={10} />
      <ActiveTags>
        {tagIds.map((id, i) => {
          const { name, color } = tagsData.find((tag) => tag.tagId === id);
          return (
            <Tag key={`tag-${id}-${i}`} color={color}>
              <ThemedText type="tag" color={color}>
                {name}
              </ThemedText>
            </Tag>
          );
        })}
      </ActiveTags>
    </View>
  );
}
