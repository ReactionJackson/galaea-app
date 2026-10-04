import { CoverImage } from "@/components/image/CoverImage";
import { Spacer } from "@/components/interface/Spacer";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import {
  CAPTION_HEIGHT,
  GALLERY_ASPECT_RATIO,
  GALLERY_ITEM_RADIUS,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { childrenByType } from "@/utils/childrenByType";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const Container = styled.View`
  width: ${({ $width }) => $width}px;
`;

const Collapsible = styled.View`
  width: ${({ $width, $collapsed }) => ($collapsed ? 0 : $width)}px;
  position: ${({ $collapsed }) => ($collapsed ? "absolute" : "relative")};
  overflow: hidden;
`;

const ImageContainer = styled(Pressable)`
  aspect-ratio: ${GALLERY_ASPECT_RATIO};
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  overflow: hidden;
`;

const PlaceholderContainer = styled.View`
  justify-content: center;
  align-items: center;
  aspect-ratio: ${GALLERY_ASPECT_RATIO};
  border: 1px solid ${Colors.border};
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  background-color: #fafafa;
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

const GradientContainer = styled(LinearGradient)`
  z-index: 10;
  position: absolute;
  left: 0;
  width: 100%;
  height: ${CAPTION_HEIGHT}px;
  bottom: ${-CAPTION_HEIGHT * 0}px;
`;

const TextContainer = styled.View`
  z-index: 20;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${CAPTION_HEIGHT}px;
  padding: 0 5px 3px 5px;
  justify-content: center;
  align-items: center;
`;

// Sub Components:

const Placeholder = ({ width }) => {
  const { isEditing } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(!isEditing);

  if (isEditing && isCollapsed) {
    setIsCollapsed(false);
  }

  useEffect(() => {
    if (isEditing) return;
    const timeout = setTimeout(
      () => setIsCollapsed(true),
      SLIDE_TRANSITION_DURATION,
    );
    return () => clearTimeout(timeout);
  }, [isEditing]);

  return (
    <Collapsible $width={width} $collapsed={isCollapsed}>
      <GallerySlot width={width}>
        <PlaceholderContainer>
          <ThemedText color="faded">Add Image</ThemedText>
        </PlaceholderContainer>
      </GallerySlot>
    </Collapsible>
  );
};

// Main Component:

export const GallerySlot = ({ width, caption: initialCaption, children }) => {
  const { isEditing, setIsEditing } = useApp();
  const image = childrenByType(children, CoverImage);
  const placeholder = childrenByType(children, PlaceholderContainer);
  const [caption, setCaption] = useState(initialCaption);

  // Handlers:

  const handleViewImage = () => {
    console.log("view image");
    setIsEditing((prev) => !prev);
  };

  // Render:

  return (
    <Container $width={width}>
      <ImageContainer onPress={() => handleViewImage()}>
        {image}
        {placeholder}
        {!placeholder && (
          <GradientContainer
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            colors={[Colors.transparent, Colors.black]}
          />
        )}
      </ImageContainer>
      <Spacer isVisible={isEditing} height={CAPTION_HEIGHT} />
      {!placeholder && (
        <TextContainer>
          <ThemedText
            isInput
            isEditable={isEditing}
            multiline={true}
            type="caption"
            placeholder="In this image..."
            onChangeText={setCaption}
            color={isEditing ? "text" : "white"}
          >
            {caption}
          </ThemedText>
        </TextContainer>
      )}
      <TrayContainer />
    </Container>
  );
};

GallerySlot.Image = CoverImage;
GallerySlot.Placeholder = Placeholder;
