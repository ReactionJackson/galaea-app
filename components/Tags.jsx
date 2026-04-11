import { AnimateHeight } from "@/components/AnimateHeight";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { tagsData } from "@/data/entries";
import styled from "styled-components/native";

const Container = styled.View`
  gap: 10px;
`;

const Track = styled.ScrollView`
  width: 100%;
  height: 46px;
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

export function Tags({ tagIds = [], editMode = false }) {
  return (
    <Container>
      <AnimateHeight visible={editMode}>
        <Track
          horizontal
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {tagsData.map(({ tagId, name, color }, i) => (
            <Tag key={`tag-${tagId}-${i}`} color={color}>
              <ThemedText type="tag" color={color}>
                {name}
              </ThemedText>
            </Tag>
          ))}
        </Track>
      </AnimateHeight>
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
    </Container>
  );
}
