import { TEXT_LINE_HEIGHT } from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { PageScrollContext } from "@/context/PageScrollContext";
import { useDynamicHeight } from "@/hooks/useDynamicHeight";
import { useRef, useContext } from "react";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ToggleBox } from "./ToggleBox";

export const MultilineText = ({
  placeholder = "Today I thought...",
  children,
}) => {
  const { isEditing } = useApp();
  const { dynamicHeight, onLayout } = useDynamicHeight(TEXT_LINE_HEIGHT);
  const ref = useRef(null);
  const { scrollToElement } = useContext(PageScrollContext);

  return (
    <ToggleBox isVisible={isEditing || !!children} height={dynamicHeight}>
      <View ref={ref} onLayout={onLayout}>
        <ThemedText
          isInput
          multiline={true}
          placeholder={placeholder}
          isEditable={isEditing}
          onFocus={() => scrollToElement(ref)}
        >
          {children}
        </ThemedText>
      </View>
    </ToggleBox>
  );
};
