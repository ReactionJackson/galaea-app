import { GallerySlot } from "@/components/gallery/GallerySlot";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { ToggleBox } from "@/components/interface/ToggleBox";
import { useApp } from "@/context/AppContext";
import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import styled from "styled-components/native";

// Refactor Tasks:
/*
  - [x] Captions UI
  - [ ] Move drafts responsibiility to the component level, remove from context shape
  - [ ] Viewer Lightbox
  - [ ] Edit Lightbox
  - [ ] Sticky controls and handlers
  - [ ] Add image and cancel handling
*/

// Constants:

const GALLERY_GUTTERS = 20;
const GALLERY_TRACK_GAP = GALLERY_GUTTERS / 2;

// Styled Components:

const ScrollContainer = styled(ScrollView)`
  width: ${({ $width }) => $width}px;
  margin: 0 ${-GALLERY_GUTTERS}px;
`;

const ControlsContainer = styled.View`
  position: absolute;
  top: 10px;
  right: 10px;
`;

// Helpers:

const getScrollDimensions = (screenWidth) => {
  const galleryWidth = screenWidth - GALLERY_GUTTERS * 2;
  const slotWidth = galleryWidth - GALLERY_GUTTERS * 2;
  const scrollInterval = slotWidth + GALLERY_TRACK_GAP;
  return { galleryWidth, slotWidth, scrollInterval };
};

// Main Component:

export const Gallery = ({ galleryId, isVisible = false, gap = 0 }) => {
  const { getById, isEditing } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const [gallery, setGallery] = useState(getById("galleries", galleryId));
  const { galleryWidth, slotWidth, scrollInterval } =
    getScrollDimensions(windowWidth);
  const [activeSlot, setActiveSlot] = useState(0);
  const inputRef = useRef(null);
  const sortedSlides = [...(gallery?.slides ?? [])]
    .map(({ caption, image, order }) => ({
      image: getById("images", image) ?? {},
      caption,
      order,
    }))
    .sort((a, b) => a.order - b.order);

  const [toggle, setToggle] = useState(true);

  // Handlers:

  const handleScroll = (e) => {
    const activeSlotIndex = Math.max(
      0,
      Math.min(
        Math.round(e.nativeEvent.contentOffset.x / scrollInterval),
        sortedSlides.length,
      ),
    );
    setActiveSlot((prev) =>
      prev === activeSlotIndex ? prev : activeSlotIndex,
    );
  };

  const handleViewImage = () => {
    setToggle((prev) => !prev);
  };

  const handleChangeCaption = (index, text) => {
    setGallery((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === index ? { ...slide, caption: text } : slide,
      ),
    }));
  };

  // Render:

  return (
    <ToggleBox isVisible={isVisible} gap={gap}>
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
          ({ image: { uri, contentPosition }, caption, order }, i) => (
            <GallerySlot
              key={`slot-${order}`}
              width={slotWidth}
              caption={caption}
            >
              <GallerySlot.Image uri={uri} contentPosition={contentPosition} />
            </GallerySlot>
          ),
        )}
        {isEditing && (
          <GallerySlot key={`slot-placeholder`} width={slotWidth}>
            <GallerySlot.Placeholder />
          </GallerySlot>
        )}
      </ScrollContainer>
      {isEditing && activeSlot < sortedSlides.length && (
        <ControlsContainer>
          <InteractionControls onEdit={() => {}} onDelete={() => {}} />
        </ControlsContainer>
      )}
    </ToggleBox>
  );
};
