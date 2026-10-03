import { CoverImage } from "@/components/image/CoverImage";
import { ToggleBox } from "@/components/interface/ToggleBox";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { childrenByType } from "@/utils/childrenByType";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";
import { GALLERY_ITEM_RADIUS } from "./shared";

const CAPTION_HEIGHT = 60;
const GALLERY_ASPECT_RATIO = 3 / 2;

const Container = styled.View`
  width: ${({ $width }) => $width}px;
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  overflow: hidden;
`;

const ImageContainer = styled(Pressable)`
  aspect-ratio: ${GALLERY_ASPECT_RATIO};
  overflow: hidden;
`;

const SlideContainer = styled.View`
  margin-top: -${CAPTION_HEIGHT}px;
`;

const TrayContainer = styled.View`
  z-index: -10;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${CAPTION_HEIGHT + GALLERY_ITEM_RADIUS}px;
  margin-top: -${GALLERY_ITEM_RADIUS}px;
  border: 1px solid ${Colors.border};
  border-top-width: 0px;
  border-bottom-left-radius: ${GALLERY_ITEM_RADIUS}px;
  border-bottom-right-radius: ${GALLERY_ITEM_RADIUS}px;
  background-color: ${Colors.surfaceTint};
`;

const GradientContainer = styled.View`
  z-index: 10;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${CAPTION_HEIGHT}px;
`;

const Gradient = styled(LinearGradient)`
  width: 100%;
  height: 100%;
`;

const TextContainer = styled.View`
  z-index: 20;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${CAPTION_HEIGHT}px;
  padding: 0 5px;
  justify-content: center;
  align-items: center;
`;

// Main Component:

export const GallerySlot = ({ width, caption: initialCaption, children }) => {
  const { isEditing, setIsEditing } = useApp();
  const image = childrenByType(children, CoverImage);
  const [caption, setCaption] = useState(initialCaption);

  // Handlers:

  const handleViewImage = () => {
    console.log("view image");
    setIsEditing((prev) => !prev);
  };

  // Render:

  return (
    <Container $width={width}>
      <ImageContainer onPress={() => handleViewImage()}>{image}</ImageContainer>
      <SlideContainer>
        <ToggleBox
          isVisible={isEditing}
          min={CAPTION_HEIGHT}
          max={CAPTION_HEIGHT * 2}
        />
        <TextContainer>
          <ThemedText
            isInput
            isEditable={isEditing}
            multiline={true}
            type="caption"
            placeholder={isEditing ? "In this image..." : undefined}
            onChangeText={setCaption}
            color={isEditing ? "text" : "white"}
          >
            {caption}
          </ThemedText>
        </TextContainer>
        <GradientContainer>
          <ToggleBox
            isVisible={!isEditing && !!caption}
            min={0}
            max={CAPTION_HEIGHT}
          >
            <Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[Colors.transparent, Colors.black]}
            />
          </ToggleBox>
        </GradientContainer>
        <TrayContainer />
      </SlideContainer>
    </Container>
  );
};

GallerySlot.Image = CoverImage;
