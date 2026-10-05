import { FadeTrack } from "@/components/interface/FadeTrack";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { Spacer } from "@/components/interface/Spacer";
import { ToggleBox } from "@/components/interface/ToggleBox";
import { Tag } from "@/components/tags/Tag";
import { Colors } from "@/constants/theme";
import { TAG_HEIGHT } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { usePage } from "@/context/PageContext";
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

// Main Component:

export const Tags = ({ parent, tagIds = [] }) => {
  const { draft, getById, getAllEntities } = usePage();
  const { isEditing } = useApp();
  const { dynamicHeight, onLayout } = useDynamicHeight(TAG_HEIGHT);
  const { scrollToElement } = useContext(PageScrollContext);
  const inputRef = useRef(null);
  const createRowRef = useRef(null);
  const colors = Object.keys(Colors.tags);
  const tags = getAllEntities("tags").reverse(); // newest first
  const [newTagId, setNewTagId] = useState(null);
  const newTag = getById("tags", newTagId) ?? {};

  // Updates:

  if (!isEditing && !!newTagId) {
    setNewTagId(null);
  }

  // Handlers:

  const leaveAddTag = () => {
    setNewTagId(null);
    inputRef.current?.blur();
  };

  const handleAddTag = () => {
    const id = draft.add("tags", {
      title: "",
      color: "default",
    });
    setNewTagId(id);
    inputRef.current?.focus();
  };

  const handleChangeText = (title) => {
    draft.update("tags", newTagId, { title });
  };

  const handleSelectColor = (color) => {
    draft.update("tags", newTagId, { color });
  };

  const handleToggleTag = (id) => {
    draft.update(parent.key, parent.id, {
      tags: tagIds.includes(id)
        ? tagIds.filter((tagId) => tagId !== id)
        : [...tagIds, id],
    });
  };

  const handleCancelTag = () => {
    draft.remove("tags", newTagId);
    leaveAddTag();
  };

  const handleConfirmTag = () => {
    if (!newTag.title) return handleCancelTag();
    leaveAddTag();
  };

  //Render:

  return (
    <>
      <ToggleBox isVisible={isEditing} height={TAG_HEIGHT}>
        <Container>
          <InteractionControls onAdd={handleAddTag} />
          <FadeTrack>
            {tags.map(({ id, title, color }) => {
              if (id === newTagId) return null;
              const isActive = tagIds.includes(id);
              return (
                <Tag
                  key={`tag-${id}`}
                  $color={color}
                  disabled={!!isActive}
                  onPress={() => handleToggleTag(id, isActive)}
                >
                  {title}
                </Tag>
              );
            })}
          </FadeTrack>
        </Container>
      </ToggleBox>
      <Spacer isVisible={isEditing && !!newTagId} height={10} />
      <ToggleBox isVisible={isEditing && !!newTagId} height={TAG_HEIGHT}>
        <Container ref={createRowRef}>
          <Tag
            ref={inputRef}
            isInput
            $color={newTag.color ?? "default"}
            placeholder="New Tag"
            onPress={() => inputRef.current?.focus()}
            onChangeText={(text) => handleChangeText(text)}
            onFocus={() => scrollToElement(createRowRef, 40)}
          >
            {newTag.title}
          </Tag>
          <FadeTrack>
            {colors.map((color) => (
              <Tag
                key={`tag-${color}`}
                $color={color}
                disabled={color === newTag.color}
                onPress={() => handleSelectColor(color)}
              />
            ))}
          </FadeTrack>
          <InteractionControls
            direction="row-reverse"
            onConfirm={() => handleConfirmTag()}
            onCancel={() => handleCancelTag()}
          />
        </Container>
      </ToggleBox>
      <Spacer isVisible={isEditing && !!tagIds.length} height={10} />
      <ToggleBox isVisible={!!tagIds.length} height={dynamicHeight}>
        <Container onLayout={onLayout}>
          {tagIds.map((id) => {
            const { title, color } = getById("tags", id);
            return (
              <Tag
                key={`tag-${id}`}
                $color={color}
                onPress={() => handleToggleTag(id)}
              >
                {title}
              </Tag>
            );
          })}
        </Container>
      </ToggleBox>
    </>
  );
};
