import { AnimateHeight } from "@/components/interface/AnimateHeight";
import { FadeTrack } from "@/components/interface/FadeTrack";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { Tag } from "@/components/tags/Tag";
import { Colors } from "@/constants/theme";
import { TAG_HEIGHT } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TextInput } from "react-native";
import styled from "styled-components/native";

// Styled Components:

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  height: ${TAG_HEIGHT};
`;

const HiddenInput = styled(TextInput)`
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
`;

// Helpers:

const emptyTag = () => ({
  title: "",
  color: "default",
});

// Main Component:

export const Tags = forwardRef(function Tags(
  { tagIds = [], isVisible = false, gap = 0 },
  ref,
) {
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

  // Hooks:

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  useEffect(() => {
    if (!isEditing) setIsCreatingTag(false);
  }, [isEditing]);

  //Render:

  return (
    <AnimateHeight isVisible={isVisible} gap={gap}>
      <AnimateHeight isVisible={!!isEditing} gap={10}>
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
      </AnimateHeight>
      <AnimateHeight isVisible={!!isCreatingTag && isEditing} gap={10}>
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
      </AnimateHeight>
      <AnimateHeight isVisible={!!activeTags.length}>
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
      </AnimateHeight>
      <HiddenInput
        ref={inputRef}
        value={draftTag.title}
        onChangeText={(title) => setDraftTag((prev) => ({ ...prev, title }))}
        returnKeyType="done"
        onSubmitEditing={() => handleAddTag()}
      />
    </AnimateHeight>
  );
});
