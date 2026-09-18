import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { storePickedImage } from "@/utils/imageStorage";
import * as ImagePicker from "expo-image-picker";
import { memo, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Image as RNImage,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import styled, { css } from "styled-components/native";
import { Lightbox } from "../Lightbox";
import { InteractionControls } from "../interface/InteractionControls";
import { ThemedText } from "../interface/ThemedText";
import { GalleryItem } from "./GalleryItem";
import { GalleryPagination } from "./GalleryPagination";
import {
  CAPTION_REVEAL_EASING,
  CAPTION_REVEAL_HEIGHT,
  CaptionTray,
  EditableView,
  GALLERY_ITEM_GAP,
  GallerySlot,
  Item,
  getImageCaption,
  getImageFocus,
  getImageUri,
} from "./shared";

const GalleryScrollView = styled(ScrollView)`
  height: ${({ $height }) => $height}px;
`;

const ControlsOverlay = styled(InteractionControls)`
  position: absolute;
  top: 10px;
  left: 20px;
  width: ${({ $width }) => $width}px;
  align-items: flex-end;
  padding-right: 10px;
`;

const PaginationOverlay = styled(GalleryPagination)`
  position: absolute;
  bottom: ${10 + CAPTION_REVEAL_HEIGHT}px;
  left: 20px;
  width: ${({ $width }) => $width}px;
  justify-content: center;
`;

const RevealContainer = styled(Animated.View)`
  position: relative;
  overflow: ${({ $transitioning, $editMode }) =>
    $transitioning || !$editMode ? "hidden" : "visible"};
  ${({ $transitioning, $editMode, $trackHeight }) =>
    !$transitioning &&
    css`
      height: ${$trackHeight + ($editMode ? CAPTION_REVEAL_HEIGHT : 0)}px;
    `}
`;

export const Gallery = memo(function Gallery({
  images,
  editMode = false,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
  onReorderImages,
  horizontalPadding = 80,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const containerWidth = useWindowDimensions().width - horizontalPadding;
  const scrollRef = useRef(null);
  const revealShift = useSharedValue(0);

  const trackHeight = Math.round(containerWidth / ITEM_ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);
  const scrollInterval = containerWidth + GALLERY_ITEM_GAP;
  const onAddTile = editMode && activeIndex >= images.length;
  const revealContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: trackHeight + revealShift.value,
  }));
  const addTileTrayStyle = useAnimatedStyle(() => ({
    bottom: CAPTION_REVEAL_HEIGHT - revealShift.value,
  }));

  useEffect(() => {
    setTransitioning(true);
    revealShift.value = withTiming(
      editMode ? CAPTION_REVEAL_HEIGHT : 0,
      { duration: 250, easing: CAPTION_REVEAL_EASING },
      (finished) => {
        if (finished) scheduleOnRN(setTransitioning, false);
      },
    );
  }, [editMode, revealShift]);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(itemCount - 1, 0)));
  }, [itemCount]);

  const pickAndOpenLightbox = async (index) => {
    if (!(await ImagePicker.requestMediaLibraryPermissionsAsync()).granted)
      return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    const stored = await storePickedImage(asset);
    setLightboxIndex(index);
    setLightbox({
      mode: "edit",
      uri: stored.uri,
      width: stored.width,
      height: stored.height,
      focus: null,
    });
  };

  const openEditExisting = (item, index) => {
    const uri = getImageUri(item);
    if (!uri) return;
    const focus = getImageFocus(item);
    RNImage.getSize(
      uri,
      (width, height) => {
        setLightboxIndex(index);
        setLightbox({ mode: "edit", uri, width, height, focus });
      },
      () => {
        setLightboxIndex(index);
        setLightbox({ mode: "edit", uri, width: null, height: null, focus });
      },
    );
  };

  const openView = (uri, caption) => {
    if (!uri) return;
    RNImage.getSize(
      uri,
      (width, height) =>
        setLightbox({ mode: "view", uri, width, height, caption }),
      () => setLightbox({ mode: "view", uri, caption }),
    );
  };

  const handleSaveLightbox = (focus) => {
    if (!lightbox) return;
    const caption = getImageCaption(
      lightboxIndex != null ? images[lightboxIndex] : null,
    );
    const item = focus
      ? { uri: lightbox.uri, focus, ...(caption ? { caption } : {}) }
      : caption
        ? { uri: lightbox.uri, caption }
        : lightbox.uri;
    if (lightboxIndex == null) {
      onAddImage?.(item);
    } else {
      onUpdateImage?.(lightboxIndex, item);
    }
    setLightbox(null);
  };

  const handleCloseLightbox = () => {
    setLightbox(null);
  };

  const handleChangeCaption = (index, text) => {
    const item = images[index];
    onUpdateImage?.(index, {
      ...(typeof item === "string" ? { uri: item } : { ...item }),
      caption: text,
    });
  };

  const handleScroll = (e) => {
    const clamped = Math.max(
      0,
      Math.min(
        Math.round(e.nativeEvent.contentOffset.x / scrollInterval),
        itemCount - 1,
      ),
    );
    setActiveIndex((prev) => (prev === clamped ? prev : clamped));
  };

  const moveImage = (toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    onReorderImages?.(activeIndex, toIndex);
    setActiveIndex(toIndex);
    scrollRef.current?.scrollTo({
      x: toIndex * scrollInterval,
      animated: false,
    });
  };

  const handleMoveLeft = () => moveImage(activeIndex - 1);
  const handleMoveRight = () => moveImage(activeIndex + 1);

  return (
    <>
      <RevealContainer
        $transitioning={transitioning}
        $editMode={editMode}
        $trackHeight={trackHeight}
        style={transitioning ? revealContainerAnimatedStyle : undefined}
      >
        <GalleryScrollView
          ref={scrollRef}
          $height={trackHeight + CAPTION_REVEAL_HEIGHT}
          horizontal
          snapToInterval={scrollInterval}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEnabled={itemCount > 1}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            gap: GALLERY_ITEM_GAP,
            paddingInlineStart: 20,
            paddingInlineEnd: 20,
          }}
        >
          {images.map((item, i) => {
            if (!item) return null;
            const uri = getImageUri(item);
            return (
              <GalleryItem
                key={uri}
                item={item}
                index={i}
                containerWidth={containerWidth}
                trackHeight={trackHeight}
                editMode={editMode}
                revealShift={revealShift}
                onPressView={openView}
                onChangeCaption={handleChangeCaption}
              />
            );
          })}
          {editMode && (
            <GallerySlot
              $width={containerWidth}
              $height={trackHeight + CAPTION_REVEAL_HEIGHT}
            >
              <CaptionTray $height={trackHeight / 2} style={addTileTrayStyle} />
              <Item $width={containerWidth}>
                <Pressable
                  onPress={() => pickAndOpenLightbox(null)}
                  style={{ flex: 1 }}
                >
                  <EditableView>
                    <ThemedText>Add Image</ThemedText>
                  </EditableView>
                </Pressable>
              </Item>
            </GallerySlot>
          )}
        </GalleryScrollView>
        {editMode && !onAddTile && (
          <ControlsOverlay
            onEdit={() => openEditExisting(images[activeIndex], activeIndex)}
            onDelete={() => onDeleteImage?.(activeIndex)}
            $width={containerWidth}
          />
        )}
        {editMode && images.length > 1 && !onAddTile && (
          <PaginationOverlay
            index={activeIndex}
            total={images.length}
            onPressLeft={handleMoveLeft}
            onPressRight={handleMoveRight}
            $width={containerWidth}
          />
        )}
      </RevealContainer>
      <Lightbox
        state={lightbox}
        onClose={handleCloseLightbox}
        onSave={handleSaveLightbox}
      />
    </>
  );
});
