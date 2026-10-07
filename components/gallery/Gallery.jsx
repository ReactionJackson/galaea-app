import { Slide } from "@/components/gallery/Slide";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { ToggleBox } from "@/components/interface/ToggleBox";
import {
  CAPTION_HEIGHT,
  GALLERY_ASPECT_RATIO,
  GALLERY_GUTTERS,
  GALLERY_TRACK_GAP,
  SLIDE_TRANSITION_DURATION,
} from "@/constants/values";
import { usePage } from "@/context/PageContext";
import { useEffect, useRef, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import styled from "styled-components/native";

// Refactor Tasks:
/*
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
  const { draft, isEditing, getById } = usePage();
  const { width: windowWidth } = useWindowDimensions();
  const { slideIds = [] } = getById("galleries", galleryId) ?? {};
  const [activeSlot, setActiveSlot] = useState(0);
  const [showAddSlide, setShowAddSlide] = useState(isEditing);
  const { galleryWidth, slotWidth, scrollInterval } =
    getScrollDimensions(windowWidth);
  const scrollRef = useRef(null);
  const boxHeight = slotWidth / GALLERY_ASPECT_RATIO + CAPTION_HEIGHT;

  // Updates:

  if (isEditing && !showAddSlide) {
    setShowAddSlide(true);
  }

  // Effects:

  useEffect(() => {
    if (isEditing) return;
    if (slideIds.length > 0 && activeSlot === slideIds.length) {
      scrollRef.current?.scrollTo({
        x: (activeSlot - 1) * scrollInterval,
        animated: true,
      });
      return;
    }
    const timeout = setTimeout(
      () => setShowAddSlide(false),
      SLIDE_TRANSITION_DURATION,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Handlers:

  const handleScroll = (e) => {
    const activeSlotIndex = Math.max(
      0,
      Math.min(
        Math.round(e.nativeEvent.contentOffset.x / scrollInterval),
        slideIds.length,
      ),
    );
    setActiveSlot((prev) =>
      prev === activeSlotIndex ? prev : activeSlotIndex,
    );
  };

  const handleScrollEnd = () => {
    if (!isEditing) setShowAddSlide(false);
  };

  const handleViewImage = () => {
    // ...
  };

  // Render:

  return (
    <ToggleBox isVisible={isEditing || slideIds.length > 0} height={boxHeight}>
      <ScrollContainer
        ref={scrollRef}
        $width={galleryWidth}
        horizontal
        snapToInterval={scrollInterval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          gap: GALLERY_TRACK_GAP,
          paddingInlineStart: GALLERY_GUTTERS,
          paddingInlineEnd: GALLERY_GUTTERS,
        }}
      >
        {slideIds.map((id) => (
          <Slide key={`slide-${id}`} width={slotWidth} slideId={id} />
        ))}
        <Slide
          key={`slide-add`}
          width={slotWidth}
          isCollapsed={!showAddSlide}
        />
      </ScrollContainer>
      {isEditing && activeSlot < slideIds.length && (
        <ControlsContainer>
          <InteractionControls onEdit={() => {}} onDelete={() => {}} />
        </ControlsContainer>
      )}
    </ToggleBox>
  );
};
