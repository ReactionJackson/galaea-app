import { GallerySlot } from "@/components/gallery/GallerySlot";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { ToggleBox } from "@/components/interface/ToggleBox";
import {
  CAPTION_HEIGHT,
  GALLERY_ASPECT_RATIO,
  GALLERY_GUTTERS,
  GALLERY_TRACK_GAP,
} from "@/constants/values";
import { useApp } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
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

export const Gallery = ({ galleryId }) => {
  const { getById, isEditing } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const [gallery, setGallery] = useState(getById("galleries", galleryId));
  const [activeSlot, setActiveSlot] = useState(0);
  const { galleryWidth, slotWidth, scrollInterval } =
    getScrollDimensions(windowWidth);

  const scrollRef = useRef(null);
  const sortedSlides = [...(gallery?.slides ?? [])]
    .map(({ caption, image, order }) => ({
      image: getById("images", image) ?? {},
      caption,
      order,
    }))
    .sort((a, b) => a.order - b.order);
  const boxHeight = slotWidth / GALLERY_ASPECT_RATIO + CAPTION_HEIGHT;

  // Effects:

  useEffect(() => {
    if (!isEditing) scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [isEditing]);

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
    // ...
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
    <ToggleBox
      isVisible={isEditing || sortedSlides.length > 0}
      height={boxHeight}
    >
      <ScrollContainer
        ref={scrollRef}
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
        <GallerySlot.Placeholder key={`slot-placeholder`} width={slotWidth} />
      </ScrollContainer>
      {isEditing && activeSlot < sortedSlides.length && (
        <ControlsContainer>
          <InteractionControls onEdit={() => {}} onDelete={() => {}} />
        </ControlsContainer>
      )}
    </ToggleBox>
  );
};
