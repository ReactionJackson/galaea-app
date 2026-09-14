import { FadeTrack } from "@/components/interface/FadeTrack";
import { Colors, Fonts } from "@/constants/theme";
import { useTagColorTransition } from "@/hooks/useTagColorTransition";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, TextInput } from "react-native";
import Animated from "react-native-reanimated";
import styled from "styled-components/native";

const PICKER_COLORS = [
  "default",
  "green",
  "blue",
  "yellow",
  "purple",
  "red",
  "orange",
  "pink",
  "teal",
  "lime",
];
const MAX_CHARS = 24;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
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

const CancelCircle = styled(CircleButton)`
  border-color: ${Colors.dateBorder};
`;

const SaveCircle = styled(CircleButton)`
  border-color: ${Colors.accent};
  background-color: ${Colors.accent};
`;

const ColorDot = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  ${({ color }) =>
    `background-color: ${Colors.tags[color]?.primary ?? Colors.tags.default.primary};`}
  ${({ selected }) =>
    selected ? "border-width: 2px; border-color: rgba(255,255,255,0.85);" : ""}
`;

const EditRowWrapper = styled.View`
  padding-top: 8px;
`;

const HiddenInput = styled(TextInput)`
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
`;

const NameButton = styled(Pressable)`
  flex-shrink: 0;
`;

const NamePill = styled(Animated.View)`
  align-items: center;
  justify-content: center;
  height: 26px;
  border-radius: 13px;
  padding-horizontal: 10px;
  border-width: 2px;
`;

const NameLabel = styled(Animated.Text)`
  font-family: ${Fonts.bold};
  font-size: 12px;
  opacity: ${({ hasName }) => (hasName ? 1 : 0.45)};
`;

const Glyph = styled(Animated.Text)`
  font-family: ${Fonts.bold};
  font-size: ${({ size = 14 }) => size}px;
  line-height: ${({ size = 14 }) => size + 2}px;
  color: ${({ color }) => color};
`;

// The inline add/rename form for a tag — name field, colour picker, cancel/
// save. Exposes focus()/blur() via ref so the parent can drive the hidden
// text input without reaching into this component's internals.
export const TagEditRow = forwardRef(function TagEditRow(
  { name, color, onChangeName, onChangeColor, onCancel, onSave },
  ref,
) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  const { borderStyle, textStyle } = useTagColorTransition(color);

  return (
    <EditRowWrapper>
      <Row>
        <HiddenInput
          ref={inputRef}
          value={name}
          onChangeText={(text) => onChangeName(text.slice(0, MAX_CHARS))}
          returnKeyType="done"
          onSubmitEditing={onSave}
          blurOnSubmit={false}
        />

        <NameButton onPress={() => inputRef.current?.focus()}>
          <NamePill style={borderStyle}>
            <NameLabel hasName={!!name} style={textStyle}>
              {name || "Tag name"}
            </NameLabel>
          </NamePill>
        </NameButton>

        <FadeTrack
          contentContainerStyle={{
            gap: 8,
            alignItems: "center",
            paddingVertical: 2,
          }}
        >
          {PICKER_COLORS.map((c) => (
            <Pressable key={c} onPress={() => onChangeColor(c)}>
              <ColorDot color={c} selected={color === c} />
            </Pressable>
          ))}
        </FadeTrack>

        <Pressable onPress={onCancel}>
          <CancelCircle>
            <Glyph color={Colors.faded}>×</Glyph>
          </CancelCircle>
        </Pressable>

        <Pressable onPress={onSave}>
          <SaveCircle>
            <Glyph size={12} color={Colors.white}>
              ✓
            </Glyph>
          </SaveCircle>
        </Pressable>
      </Row>
    </EditRowWrapper>
  );
});
