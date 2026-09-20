import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { FadeTrack } from "@/components/interface/FadeTrack";
import { CrossIcon } from "@/components/interface/icons/CrossIcon";
import { InteractButton } from "@/components/interface/InteractButton";
import { ThemedText } from "@/components/interface/ThemedText";
import { Tag } from "@/components/tags/Tag";
import { TagEditRow } from "@/components/tags/TagEditRow";
import { useApp } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import styled from "styled-components/native";

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ActiveTags = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

export function Tags({
  tagIds = [],
  editMode = false,
  onToggleTag = () => {},
}) {
  const { state, dispatch } = useApp();
  const tags = state.tags;
  const onAddTag = (name, color) => dispatch({ type: "ADD_TAG", name, color });
  const onUpdateTagColor = (tagId, color) =>
    dispatch({ type: "UPDATE_TAG_COLOR", tagId, color });
  const onReplaceTag = (tagId, name, color) =>
    dispatch({ type: "REPLACE_TAG", tagId, name, color });

  const [editRowOpen, setEditRowOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("default");
  const [prevEditMode, setPrevEditMode] = useState(editMode);
  const editRowRef = useRef(null);
  const tagPickerRef = useRef(null);

  const activeTags = tags.filter((t) => !t.archived);

  if (editMode !== prevEditMode) {
    setPrevEditMode(editMode);
    if (!editMode) {
      setEditRowOpen(false);
      setEditingTagId(null);
      setDraftName("");
      setDraftColor("default");
    }
  }

  useEffect(() => {
    if (!editMode) editRowRef.current?.blur();
  }, [editMode]);

  const openEditRow = (tagId = null) => {
    if (tagId !== null) {
      const tag = tags.find((t) => t.tagId === tagId);
      setEditingTagId(tagId);
      setDraftName(tag.name);
      setDraftColor(tag.color);
    } else {
      setEditingTagId(null);
      setDraftName("");
      setDraftColor("default");
    }
    setEditRowOpen(true);
    setTimeout(() => editRowRef.current?.focus(), 300);
  };

  const handleCancelEditRow = () => {
    editRowRef.current?.blur();
    setEditRowOpen(false);
    setEditingTagId(null);
    setDraftName("");
    setDraftColor("default");
  };

  const handleSave = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) return;

    if (editingTagId === null) {
      onAddTag(trimmedName, draftColor);
      setTimeout(() => tagPickerRef.current?.scrollToStart(), 80);
    } else {
      const original = tags.find((t) => t.tagId === editingTagId);
      if (original.name !== trimmedName) {
        onReplaceTag(editingTagId, trimmedName, draftColor);
      } else if (original.color !== draftColor) {
        onUpdateTagColor(editingTagId, draftColor);
      }
    }

    editRowRef.current?.blur();
    setEditRowOpen(false);
    setEditingTagId(null);
    setDraftName("");
    setDraftColor("default");
  };

  return (
    <View>
      <AnimatedSpacer visible={editMode || !!tagIds.length} height={15} />
      <AnimateHeight visible={editMode}>
        <Row>
          <InteractButton onPress={() => openEditRow(null)}>
            <CrossIcon />
          </InteractButton>

          <FadeTrack ref={tagPickerRef} contentContainerStyle={{ gap: 10 }}>
            {activeTags.map(({ tagId, name, color }, i) => {
              const active = tagIds.includes(tagId);
              const tagColor = active ? "disabled" : color;
              return (
                <Pressable
                  key={`collection-${tagId}-${i}`}
                  onPress={() => onToggleTag(tagId)}
                  onLongPress={() => openEditRow(tagId)}
                  delayLongPress={400}
                >
                  <Tag color={tagColor}>
                    <ThemedText type="tag" color={tagColor}>
                      {name}
                    </ThemedText>
                  </Tag>
                </Pressable>
              );
            })}
          </FadeTrack>
        </Row>
      </AnimateHeight>

      <AnimateHeight visible={editRowOpen && editMode}>
        <TagEditRow
          ref={editRowRef}
          name={draftName}
          color={draftColor}
          onChangeName={setDraftName}
          onChangeColor={setDraftColor}
          onCancel={handleCancelEditRow}
          onSave={handleSave}
        />
      </AnimateHeight>

      <AnimatedSpacer visible={!!tagIds.length && editMode} height={10} />
      <ActiveTags>
        {tagIds.map((id, i) => {
          const tag = tags.find((t) => t.tagId === id);
          if (!tag) return null;
          return (
            <Pressable
              key={`active-${id}-${i}`}
              onPress={() => onToggleTag(id)}
              disabled={!editMode}
            >
              <Tag color={tag.color}>
                <ThemedText type="tag" color={tag.color}>
                  {tag.name}
                </ThemedText>
              </Tag>
            </Pressable>
          );
        })}
      </ActiveTags>
    </View>
  );
}
