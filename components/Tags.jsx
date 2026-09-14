import {
  AnimateHeight,
  AnimatedSpacer,
} from "@/components/interface/AnimateHeight";
import { FadeTrack } from "@/components/interface/FadeTrack";
import { ThemedText } from "@/components/interface/ThemedText";
import { TagEditRow } from "@/components/TagEditRow";
import { Colors, Fonts } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
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

const CircleButton = styled.View`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  flex-shrink: 0;
`;

const PlusCircle = styled(CircleButton)`
  border-color: ${Colors.tags.default.primary};
  background-color: ${Colors.tags.default.secondary};
`;

const PlusGlyph = styled(Animated.Text)`
  font-family: ${Fonts.bold};
  font-size: 14px;
  line-height: 16px;
  color: ${Colors.tags.default.primary};
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
  const editRowRef = useRef(null);
  const tagPickerRef = useRef(null);

  const activeTags = tags.filter((t) => !t.archived);

  useEffect(() => {
    if (!editMode) {
      editRowRef.current?.blur();
      setEditRowOpen(false);
      setEditingTagId(null);
      setDraftName("");
      setDraftColor("default");
    }
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
      <AnimateHeight visible={editMode}>
        <Row>
          <Pressable onPress={() => openEditRow(null)}>
            <PlusCircle>
              <PlusGlyph>+</PlusGlyph>
            </PlusCircle>
          </Pressable>

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
