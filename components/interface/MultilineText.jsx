import { useApp } from "@/context/AppContext";
import { ToggleBox } from "./ToggleBox";
import { ThemedText } from "./ThemedText";

export const MultilineText = ({
  placeholder = "Today I thought...",
  isVisible = true,
  gap = 0,
  children,
}) => {
  const { isEditing } = useApp();
  return (
    <ToggleBox isVisible={isVisible} gap={gap}>
      <ThemedText
        isInput
        multiline={true}
        placeholder={placeholder}
        isEditable={isEditing}
      >
        {children}
      </ThemedText>
    </ToggleBox>
  );
};
