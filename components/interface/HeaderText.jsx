import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useSettings } from "@/context/SettingsContext";
import { Children } from "react";
import styled from "styled-components/native";

const Container = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const TextContainer = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: ${({ $gap }) => $gap}px;
`;

const Meta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  height: 8px;
`;

const TitleContainer = styled.View`
  width: 100%;
  height: 28px;
  margin: -3px 0 -2px -2px;
`;

const BadgeCircle = styled.View`
  justify-content: center;
  align-items: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  border-width: 2px;
  border-color: ${({ $borderColor }) => $borderColor};
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

const BadgeImage = styled.View`
  justify-content: center;
  align-items: center;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${Colors.surfaceTint};
`;

function Title({
  value,
  placeholder,
  onChangeText,
  editable = false,
  children,
  ...rest
}) {
  if (onChangeText) {
    return (
      <TitleContainer>
        <ThemedText
          type="title"
          isInput
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          editable={editable}
          {...rest}
        />
      </TitleContainer>
    );
  }
  return (
    <TitleContainer>
      <ThemedText type="title" {...rest}>
        {children ?? value}
      </ThemedText>
    </TitleContainer>
  );
}
Title.displayName = "HeaderText.Title";

function Subtitle({ children, ...rest }) {
  return (
    <ThemedText type="subtitle" {...rest}>
      {children}
    </ThemedText>
  );
}
Subtitle.displayName = "HeaderText.Subtitle";

function SubtitleFaded({ children, ...rest }) {
  return (
    <ThemedText type="subtitle" color="faded" {...rest}>
      {children}
    </ThemedText>
  );
}
SubtitleFaded.displayName = "HeaderText.SubtitleFaded";

function Badge({
  variant = "primary",
  shape = "circle",
  size = 40,
  children,
  ...rest
}) {
  const { badgeColors } = useSettings();
  if (shape === "image") {
    return (
      <BadgeImage $size={size} {...rest}>
        {children}
      </BadgeImage>
    );
  }
  const { fill, border } = badgeColors[variant];
  return (
    <BadgeCircle
      $backgroundColor={fill}
      $borderColor={border}
      $size={size}
      {...rest}
    >
      {children}
    </BadgeCircle>
  );
}
Badge.displayName = "HeaderText.Badge";

export function HeaderText({ gap = 5, children }) {
  const childArray = Children.toArray(children);
  const isBadge = (child) => child.type?.displayName === Badge.displayName;
  const isTitle = (child) => child.type?.displayName === Title.displayName;
  const badge = childArray.find(isBadge);
  const title = childArray.find(isTitle);
  const subtitles = childArray.filter(
    (child) => child !== badge && child !== title,
  );

  return (
    <Container>
      {badge}
      <TextContainer $gap={gap}>
        {title}
        {subtitles.length > 0 && <Meta>{subtitles}</Meta>}
      </TextContainer>
    </Container>
  );
}

HeaderText.Title = Title;
HeaderText.Subtitle = Subtitle;
HeaderText.SubtitleFaded = SubtitleFaded;
HeaderText.Badge = Badge;
