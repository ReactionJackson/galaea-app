import { CoverImage } from "@/components/image/CoverImage";
import { Spacer } from "@/components/interface/Spacer";
import { ThemedText } from "@/components/interface/ThemedText";
import { Colors } from "@/constants/theme";
import {
  CAPTION_HEIGHT,
  GALLERY_ASPECT_RATIO,
  GALLERY_ITEM_RADIUS,
} from "@/constants/values";
import { usePage } from "@/context/PageContext";
import { PageScrollContext } from "@/context/PageScrollContext";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useRef } from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";

const Container = styled.View`
  width: ${({ $width, $isCollapsed }) => ($isCollapsed ? 0 : $width)}px;
  position: ${({ $isCollapsed }) => ($isCollapsed ? "absolute" : "relative")};
  overflow: ${({ $isCollapsed }) => ($isCollapsed ? "hidden" : "visible")};
`;

const ImageContainer = styled(Pressable)`
  aspect-ratio: ${GALLERY_ASPECT_RATIO};
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  overflow: hidden;
`;

const AddSlideContainer = styled.View`
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

const GradientOffset = styled.View`
  height: ${({ $height }) => $height}px;
`;

const Gradient = styled(LinearGradient)`
  z-index: 10;
  width: 100%;
  height: ${CAPTION_HEIGHT}px;
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

// Main Component:

export const Slide = ({ slideId, width, isCollapsed }) => {
  const { draft, getById, isEditing, setIsEditing } = usePage();
  const { imageId, caption } = getById("slides", slideId) ?? {};
  const image = getById("images", imageId) ?? {};
  const captionRef = useRef(null);
  const { scrollToElement } = useContext(PageScrollContext);
  const isAddSlide = !slideId;

  // Handlers:

  const handleViewImage = () => {
    setIsEditing((prev) => !prev); // placeholder
  };

  const handleChangeCaption = (caption) => {
    draft.update("slides", slideId, { caption });
  };

  // Render:

  return (
    <Container $width={width} $isCollapsed={isCollapsed}>
      <ImageContainer onPress={handleViewImage}>
        {isAddSlide ? (
          <AddSlideContainer>
            <ThemedText color="faded">Add Image</ThemedText>
          </AddSlideContainer>
        ) : (
          <CoverImage {...image} />
        )}
        {!isAddSlide && (
          <>
            <GradientOffset
              $height={width / GALLERY_ASPECT_RATIO - CAPTION_HEIGHT}
            />
            <Spacer isVisible={isEditing || !caption} height={CAPTION_HEIGHT} />
            <Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[Colors.transparent, Colors.black]}
            />
          </>
        )}
      </ImageContainer>
      <Spacer isVisible={isEditing} height={CAPTION_HEIGHT} />
      {!isAddSlide && (
        <TextContainer ref={captionRef}>
          <ThemedText
            isInput
            isEditable={isEditing}
            multiline={true}
            type="caption"
            placeholder="In this image..."
            onChangeText={handleChangeCaption}
            onFocus={() => scrollToElement(captionRef)}
            color={isEditing ? "text" : caption ? "white" : "transparent"}
          >
            {caption}
          </ThemedText>
        </TextContainer>
      )}
      <TrayContainer />
    </Container>
  );
};
