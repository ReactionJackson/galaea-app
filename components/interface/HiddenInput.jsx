import { forwardRef, useImperativeHandle, useRef } from "react";
import { TextInput } from "react-native";
import styled from "styled-components/native";

// Styled Components:

const StyledInput = styled(TextInput)`
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
`;

// Main Component:

export const HiddenInput = forwardRef(function HiddenInput(
  { value, onChangeText, onSubmit, ...props },
  ref,
) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  return (
    <StyledInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      returnKeyType="done"
      {...props}
    />
  );
});
