import { TEXT_LINE_HEIGHT } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useDynamicHeight } from "@/hooks/useDynamicHeight";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ToggleBox } from "./ToggleBox";

export const MultilineText = ({
  placeholder = "Today I thought...",
  isVisible = true,
  children,
}) => {
  const { isEditing } = useApp();
  const { height, onLayout } = useDynamicHeight(TEXT_LINE_HEIGHT);

  return (
    <ToggleBox isVisible={isVisible} height={height}>
      <View onLayout={onLayout}>
        <ThemedText
          isInput
          multiline={true}
          placeholder={placeholder}
          isEditable={isEditing}
        >
          {children}
        </ThemedText>
      </View>
    </ToggleBox>
  );
};
