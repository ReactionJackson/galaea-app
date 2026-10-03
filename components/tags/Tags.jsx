import { FadeTrack } from "@/components/interface/FadeTrack";
import { HiddenInput } from "@/components/interface/HiddenInput";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { Spacer } from "@/components/interface/Spacer";
import { ToggleBox } from "@/components/interface/ToggleBox";
import { Tag } from "@/components/tags/Tag";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useRef, useState } from "react";
import styled from "styled-components/native";

// Styled Components:

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

// Helpers:

const emptyTag = () => ({
  title: "",
  color: "default",
});

// Main Component:

export const Tags = ({ tagIds = [] }) => {
  const { tags: initialTags, isEditing } = useApp();
  const [tags, setTags] = useState([...initialTags]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [draftTag, setDraftTag] = useState(emptyTag());
  const inputRef = useRef(null);
  const [activeTags, setActiveTags] = useState(
    tags.filter((tag) => tagIds.includes(tag.id)),
  );
  const colors = Object.keys(Colors.tags).filter(
    (color) => color !== "disabled",
  );

  // Updates:

  if (!isEditing && isCreatingTag) {
    setIsCreatingTag(false);
  }

  // Handlers:

  const resetDraftTag = () => {
    setDraftTag(emptyTag());
  };

  const handleToggleTag = (id) => {
    if (activeTags.find((tag) => tag.id === id)) {
      setActiveTags((prev) => prev.filter((tag) => tag.id !== id));
    } else {
      setActiveTags((prev) => [...prev, tags.find((tag) => tag.id === id)]);
    }
  };

  const handleAddTag = () => {
    const newTag = { ...draftTag, id: tags.length + 1 };
    setTags((prev) => [newTag, ...prev]);
    resetDraftTag();
    setIsCreatingTag(false);
  };

  const handleDiscardTag = () => {
    resetDraftTag();
    setIsCreatingTag(false);
  };

  const handleSelectColor = (color) => {
    setDraftTag((prev) => ({ ...prev, color }));
  };

  //Render:

  return (
    <>
      <ToggleBox isVisible={!!isEditing}>
        <Container>
          <InteractionControls onAdd={() => setIsCreatingTag(true)} />
          <FadeTrack>
            {tags.map(({ id, title, color }) => {
              const isActive = activeTags.find((tag) => tag.id === id);
              return (
                <Tag
                  key={`tag-${id}`}
                  $color={isActive ? "disabled" : color}
                  onPress={() => handleToggleTag(id)}
                >
                  {title}
                </Tag>
              );
            })}
          </FadeTrack>
        </Container>
      </ToggleBox>
      <Spacer isVisible={isEditing && !!activeTags.length} height={10} />
      <ToggleBox isVisible={!!isCreatingTag && isEditing}>
        <Container>
          <Tag
            $color={draftTag.color}
            onPress={() => inputRef.current?.focus()}
          >
            {draftTag.title || "New Tag"}
          </Tag>
          <FadeTrack>
            {colors.map((color) => (
              <Tag
                key={`tag-${color}`}
                $color={color}
                onPress={() => handleSelectColor(color)}
              />
            ))}
          </FadeTrack>
          <InteractionControls
            direction="row-reverse"
            onConfirm={() => handleAddTag()}
            onCancel={() => handleDiscardTag()}
          />
        </Container>
      </ToggleBox>
      <Spacer isVisible={isEditing && isCreatingTag} height={10} />
      <ToggleBox isVisible={!!activeTags.length}>
        <Container>
          {activeTags.map(({ id, title, color }) => (
            <Tag
              key={`tag-${id}`}
              $color={color}
              onPress={() => handleToggleTag(id)}
            >
              {title}
            </Tag>
          ))}
        </Container>
      </ToggleBox>
      <HiddenInput
        ref={inputRef}
        value={draftTag.title}
        onChangeText={(title) => setDraftTag((prev) => ({ ...prev, title }))}
        onSubmit={() => handleAddTag()}
      />
    </>
  );
};
