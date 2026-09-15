import { BlurView } from "@/components/interface/BlurView";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { Children } from "react";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";

const Bar = styled(BlurView)`
  z-index: 100;
  margin: 0 -20px;
  gap: 10px;
  height: 70px;
  padding: 15px 20px;
  flex-direction: row;
  justify-content: flex-start;
`;

const Content = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: ${({ $gap }) => $gap}px;
`;

const TitleContainer = styled.View`
  width: 100%;
  height: 28px;
  margin: -4px 0;
`;

const Meta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  height: 8px;
`;

const BadgeCircle = styled.View`
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${Colors.accent};
`;

function Title({ value, placeholder, onChangeText, editable }) {
  return (
    <TitleContainer>
      <ThemedText
        type="title"
        isInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        editable={editable}
      />
    </TitleContainer>
  );
}

function Badge({ children }) {
  return <BadgeCircle>{children}</BadgeCircle>;
}
Badge.displayName = "PageHeader.Badge";

export function PageHeader({ gap = 5, tint = "light", children }) {
  const { width: screenWidth } = useWindowDimensions();
  const childArray = Children.toArray(children);
  const isBadge = (child) => child.type?.displayName === Badge.displayName;
  const badge = childArray.find(isBadge);
  const content = childArray.filter((child) => !isBadge(child));

  return (
    <Bar tint={tint} style={{ width: screenWidth }}>
      {badge}
      <Content $gap={gap}>{content}</Content>
    </Bar>
  );
}

PageHeader.Title = Title;
PageHeader.Meta = Meta;
PageHeader.Badge = Badge;
