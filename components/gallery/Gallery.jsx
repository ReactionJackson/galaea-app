import { CoverImage } from "@/components/image/CoverImage";
import { AnimateHeight } from "@/components/interface/AnimateHeight";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { ThemedText } from "@/components/interface/ThemedText";
import { useApp } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";
import styled from "styled-components/native";

// RefactorTasks:
/*
  - Captions UI
  - Viewer Lightbox
  - Edit Lightbox
  - Sticky controls and handlers
  - Add image and cancel handling
*/

// Constants:

const GALLERY_GUTTERS = 20;
const GALLERY_TRACK_GAP = GALLERY_GUTTERS / 2;
const GALLERY_ITEM_RADIUS = 15;
const GALLERY_ASPECT_RATIO = 3 / 2;

// Styled Components:

const ScrollContainer = styled(ScrollView)`
  width: ${({ $width }) => $width}px;
  margin: 0 ${-GALLERY_GUTTERS}px;
`;

const Slot = styled.View`
  width: ${({ $width }) => $width}px;
  aspect-ratio: ${GALLERY_ASPECT_RATIO};
  justify-content: center;
  align-items: center;
`;

const ImageContainer = styled(Pressable)`
  background-color: gold;
`;

const ControlsContainer = styled.View`
  position: absolute;
  top: 10px;
  left: 20px;
`;

// Helpers:

const getScrollDimensions = (screenWidth) => {
  const galleryWidth = screenWidth - GALLERY_GUTTERS * 2;
  const slotWidth = galleryWidth - GALLERY_GUTTERS * 2;
  const scrollInterval = slotWidth + GALLERY_TRACK_GAP;
  return { galleryWidth, slotWidth, scrollInterval };
};

// Main Component:

export const Gallery = ({ gallery, isVisible = false, gap = 0 }) => {
  const { getById, isEditing } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const { galleryWidth, slotWidth, scrollInterval } =
    getScrollDimensions(windowWidth);
  const [activeSlot, setActiveSlot] = useState(0);
  const slides = getById("galleries", gallery)?.slides ?? [];
  const sortedSlides = [...slides]
    .map(({ caption, image, order }) => ({
      image: getById("images", image) ?? {},
      caption,
      order,
    }))
    .sort((a, b) => a.order - b.order);

  // Handlers:

  const handleScroll = (e) => {
    const activeSlotIndex = Math.max(
      0,
      Math.min(
        Math.round(e.nativeEvent.contentOffset.x / scrollInterval),
        sortedSlides.length - 1,
      ),
    );
    setActiveSlot((prev) =>
      prev === activeSlotIndex ? prev : activeSlotIndex,
    );
  };

  const handleViewImage = () => {
    // ...
  };

  // Effects:

  useEffect(() => {
    console.log("activeSlot", activeSlot);
  }, [activeSlot]);

  // Render:

  return (
    <AnimateHeight isVisible={isVisible} gap={gap}>
      <ScrollContainer
        $width={galleryWidth}
        horizontal
        snapToInterval={scrollInterval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          gap: GALLERY_TRACK_GAP,
          paddingInlineStart: GALLERY_GUTTERS,
          paddingInlineEnd: GALLERY_GUTTERS,
        }}
      >
        {sortedSlides.map(
          ({ image: { uri, contentPosition }, caption, order }) => (
            <Slot key={`slot-${order}`} $width={slotWidth}>
              <ImageContainer onPress={() => handleViewImage()}>
                <CoverImage
                  uri={uri}
                  radius={GALLERY_ITEM_RADIUS}
                  contentPosition={contentPosition}
                />
              </ImageContainer>
              {/* <ThemedText>{caption}</ThemedText> */}
            </Slot>
          ),
        )}
        {isEditing && (
          <Slot $width={slotWidth}>
            <ThemedText>Add Image</ThemedText>
          </Slot>
        )}
      </ScrollContainer>
      {isEditing && (
        <ControlsContainer>
          <InteractionControls onEdit={() => {}} onDelete={() => {}} />
        </ControlsContainer>
      )}
    </AnimateHeight>
  );
};
