import { useApp } from "@/context/AppContext";
import { AnimateHeight } from "./AnimateHeight";
import { ThemedText } from "./ThemedText";

export const MultilineText = ({
  placeholder = "Today I thought...",
  isVisible = true,
  gap = 0,
  children,
}) => {
  const { isEditing } = useApp();
  return (
    <AnimateHeight isVisible={isVisible} gap={gap}>
      <ThemedText
        isInput
        multiline={true}
        placeholder={placeholder}
        isEditable={isEditing}
      >
        {children}
      </ThemedText>
    </AnimateHeight>
  );
};
