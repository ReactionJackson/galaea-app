import { ThemedText } from "@/components/interface/ThemedText";
import { usePage } from "@/context/PageContext";
import { childrenByType } from "@/utils/childrenByType";
import styled from "styled-components/native";

// Styled Components:

const Container = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const BadgeContainer = styled.View`
  width: 40px;
  height: 40px;
`;

// const BadgeImage = styled.View`
//   justify-content: center;
//   align-items: center;
//   width: ${({ $size }) => $size}px;
//   height: ${({ $size }) => $size}px;
//   border-radius: 12px;
//   overflow: hidden;
//   background-color: ${Colors.surfaceTint};
// `;

const TextContainer = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 5px;
`;

const TitleContainer = styled.View`
  width: 100%;
  height: 28px;
  margin: -3px 0 -2px -2px;
`;

const Meta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  height: 8px;
`;

// Sub Components:

const Badge = ({ children }) => <BadgeContainer>{children}</BadgeContainer>;
// const { fill, border } = badgeColors[variant];
// return (
//   <BadgeCircle
//     $backgroundColor={fill}
//     $borderColor={border}
//     $size={size}
//     {...rest}
//   >
//     {children}
//   </BadgeCircle>
// );

const Title = ({ children, placeholder = "", onChangeText }) => {
  const { isEditing } = usePage();
  return (
    <TitleContainer>
      <ThemedText
        type="title"
        isInput
        isEditable={isEditing}
        placeholder={placeholder}
        onChangeText={onChangeText}
      >
        {children}
      </ThemedText>
    </TitleContainer>
  );
};

const Subtitle = ({ children }) => (
  <ThemedText type="subtitle">{children}</ThemedText>
);

const SubtitleFaded = ({ children }) => (
  <ThemedText type="subtitle" color="faded">
    {children}
  </ThemedText>
);

// Main Component:

export const HeaderBar = ({ children }) => {
  const badge = childrenByType(children, Badge);
  const title = childrenByType(children, Title);
  const subtitle = childrenByType(children, Subtitle);
  const subtitleFaded = childrenByType(children, SubtitleFaded);
  return (
    <Container>
      {badge}
      <TextContainer>
        {title}
        <Meta>
          {subtitle}
          {subtitleFaded}
        </Meta>
      </TextContainer>
    </Container>
  );
};

HeaderBar.Title = Title;
HeaderBar.Subtitle = Subtitle;
HeaderBar.SubtitleFaded = SubtitleFaded;
HeaderBar.Badge = Badge;
