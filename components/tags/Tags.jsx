import { FadeTrack } from "@/components/interface/FadeTrack";
import { HiddenInput } from "@/components/interface/HiddenInput";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { Spacer } from "@/components/interface/Spacer";
import { ToggleBox } from "@/components/interface/ToggleBox";
import { Tag } from "@/components/tags/Tag";
import { Colors } from "@/constants/theme";
import { TAG_HEIGHT } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { PageScrollContext } from "@/context/PageScrollContext";
import { useDynamicHeight } from "@/hooks/useDynamicHeight";
import { useContext, useRef, useState } from "react";
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
  const { dynamicHeight, onLayout } = useDynamicHeight(TAG_HEIGHT);
  const [tags, setTags] = useState([...initialTags]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [draftTag, setDraftTag] = useState(emptyTag());
  const [activeTags, setActiveTags] = useState(
    tags.filter((tag) => tagIds.includes(tag.id)),
  );
  const [shownTags, setShownTags] = useState(activeTags);
  const inputRef = useRef(null);
  const createRowRef = useRef(null);
  const colors = Object.keys(Colors.tags);
  const { scrollToElement } = useContext(PageScrollContext);

  // Updates:

  if (!isEditing && isCreatingTag) {
    setIsCreatingTag(false);
  }

  if (activeTags.length && activeTags !== shownTags) {
    setShownTags(activeTags);
  }

  // Handlers:

  const handleToggleTag = (id) => {
    if (activeTags.find((tag) => tag.id === id)) {
      setActiveTags((prev) => prev.filter((tag) => tag.id !== id));
    } else {
      setActiveTags((prev) => [...prev, tags.find((tag) => tag.id === id)]);
    }
  };

  const handleStartCreating = () => {
    setDraftTag(emptyTag());
    setIsCreatingTag(true);
    handleFocusDraft();
  };

  const handleFocusDraft = () => {
    inputRef.current?.focus();
    scrollToElement(createRowRef, 40);
  };

  const handleChangeDraft = (title) => {
    setDraftTag((prev) => ({ ...prev, title }));
  };

  const handleEndCreating = () => {
    setIsCreatingTag(false);
    inputRef.current?.blur();
  };

  const handleAddTag = () => {
    const newTag = { ...draftTag, id: tags.length + 1 };
    setTags((prev) => [newTag, ...prev]);
    handleEndCreating();
  };

  const handleSelectColor = (color) => {
    setDraftTag((prev) => ({ ...prev, color }));
  };

  //Render:

  return (
    <>
      <ToggleBox isVisible={isEditing} height={TAG_HEIGHT}>
        <Container>
          <InteractionControls onAdd={handleStartCreating} />
          <FadeTrack>
            {tags.map(({ id, title, color }) => {
              const isActive = activeTags.find((tag) => tag.id === id);
              return (
                <Tag
                  key={`tag-${id}`}
                  $color={color}
                  disabled={!!isActive}
                  onPress={() => handleToggleTag(id)}
                >
                  {title}
                </Tag>
              );
            })}
          </FadeTrack>
        </Container>
      </ToggleBox>
      <Spacer isVisible={isEditing && isCreatingTag} height={10} />
      <ToggleBox isVisible={isEditing && isCreatingTag} height={TAG_HEIGHT}>
        <Container ref={createRowRef}>
          <HiddenInput
            ref={inputRef}
            value={draftTag.title}
            onChangeText={(text) => handleChangeDraft(text)}
            onSubmit={() => handleAddTag()}
          />
          <Tag
            $color={draftTag.color}
            placeholder="New Tag"
            onPress={() => handleFocusDraft()}
          >
            {draftTag.title}
          </Tag>
          <FadeTrack>
            {colors.map((color) => (
              <Tag
                key={`tag-${color}`}
                $color={color}
                disabled={color === draftTag.color}
                onPress={() => handleSelectColor(color)}
              />
            ))}
          </FadeTrack>
          <InteractionControls
            direction="row-reverse"
            onConfirm={() => handleAddTag()}
            onCancel={() => handleEndCreating()}
          />
        </Container>
      </ToggleBox>
      <Spacer isVisible={isEditing && !!activeTags.length} height={10} />
      <ToggleBox isVisible={!!activeTags.length} height={dynamicHeight}>
        <Container onLayout={onLayout}>
          {shownTags.map(({ id, title, color }) => (
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
    </>
  );
};
