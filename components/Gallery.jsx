import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { storePickedImage } from "@/utils/imageStorage";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { memo, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Image as RNImage,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import styled from "styled-components/native";
import { GalleryPagination } from "./GalleryPagination";
import { Lightbox } from "./Lightbox";
import { InteractionControls } from "./interface/InteractionControls";
import { ThemedText } from "./interface/ThemedText";

const Item = styled.View`
  flex-shrink: 0;
  aspect-ratio: ${ITEM_ASPECT_RATIO};
  border-radius: 10px;
  overflow: hidden;
`;

const Image = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

const EditableView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  border: 2px dashed ${Colors.disabled};
  border-radius: 10px;
  transform: scale(0.99);
`;

const GALLERY_ITEM_GAP = 10;
const DEFAULT_HORIZONTAL_PADDING = 80;

export function getImageUri(item) {
  if (!item) return null;
  return typeof item === "string" ? item : item.uri;
}
export function getImageFocus(item) {
  if (!item) return null;
  return typeof item === "string" ? null : (item.focus ?? null);
}

export const Gallery = memo(function Gallery({
  images,
  editMode = false,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
  onReorderImages,
  horizontalPadding = DEFAULT_HORIZONTAL_PADDING,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - horizontalPadding;
  const trackHeight = Math.round(containerWidth / ITEM_ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);
  const scrollInterval = containerWidth + GALLERY_ITEM_GAP;

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep the current position in bounds if an image is added/removed
  // elsewhere (e.g. the delete button) rather than via the paging arrows.
  // Allowed to sit one past the last image — that slot is the "add image"
  // tile in edit mode, which is a valid (if unreorderable) place to land.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(itemCount - 1, 0)));
  }, [itemCount]);

  // True once the gallery has scrolled onto the trailing "add image" tile
  // rather than an actual photo — reordering doesn't apply there.
  const onAddTile = editMode && activeIndex >= images.length;

  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const pickAndOpenLightbox = async (index) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

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

  const handleAddImage = () => pickAndOpenLightbox(null);

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

  const openView = (uri) => {
    if (!uri) return;
    RNImage.getSize(
      uri,
      (width, height) => setLightbox({ mode: "view", uri, width, height }),
      () => setLightbox({ mode: "view", uri }),
    );
  };

  const handleSaveLightbox = (focus) => {
    if (!lightbox) return;
    const item = focus ? { uri: lightbox.uri, focus } : lightbox.uri;
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

  // Tracked continuously (not just on momentum end) so the pagination/
  // interaction controls update the moment the track visually settles on a
  // new image, rather than lagging until the deceleration fully stops.
  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / scrollInterval);
    const clamped = Math.max(0, Math.min(index, itemCount - 1));
    setActiveIndex((prev) => (prev === clamped ? prev : clamped));
  };

  // Swaps the currently-viewed image with its neighbour and scrolls the
  // track to follow it, so the photo you were looking at stays in view at
  // its new position rather than appearing to jump away.
  const moveImage = (toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    onReorderImages?.(activeIndex, toIndex);
    setActiveIndex(toIndex);
    scrollRef.current?.scrollTo({
      x: toIndex * scrollInterval,
      animated: true,
    });
  };

  const handleMoveLeft = () => moveImage(activeIndex - 1);
  const handleMoveRight = () => moveImage(activeIndex + 1);

  return (
    <>
      <View style={{ position: "relative" }}>
        <ScrollView
          ref={scrollRef}
          style={{ height: trackHeight }}
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
              <Item key={`image-${i}`} style={{ width: containerWidth }}>
                {editMode ? (
                  <Image
                    contentFit="cover"
                    contentPosition={getImageFocus(item) ?? undefined}
                    source={{ uri }}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Pressable onPress={() => openView(uri)} style={{ flex: 1 }}>
                    <Image
                      contentFit="cover"
                      contentPosition={getImageFocus(item) ?? undefined}
                      source={{ uri }}
                    />
                  </Pressable>
                )}
              </Item>
            );
          })}
          {editMode && (
            <Item style={{ width: containerWidth }}>
              <Pressable onPress={handleAddImage} style={{ flex: 1 }}>
                <EditableView>
                  <ThemedText>Add Image</ThemedText>
                </EditableView>
              </Pressable>
            </Item>
          )}
        </ScrollView>
        {editMode && !onAddTile && (
          <InteractionControls
            onEdit={() => openEditExisting(images[activeIndex], activeIndex)}
            onDelete={() => onDeleteImage?.(activeIndex)}
            style={{
              position: "absolute",
              top: 10,
              left: 20,
              width: containerWidth,
              alignItems: "flex-end",
              paddingRight: 10,
            }}
          />
        )}
        {editMode && images.length > 1 && !onAddTile && (
          <GalleryPagination
            index={activeIndex}
            total={images.length}
            onPressLeft={handleMoveLeft}
            onPressRight={handleMoveRight}
            style={{
              position: "absolute",
              bottom: 10,
              left: 20,
              width: containerWidth,
              justifyContent: "center",
            }}
          />
        )}
      </View>
      <Lightbox
        state={lightbox}
        onClose={handleCloseLightbox}
        onSave={handleSaveLightbox}
      />
    </>
  );
});
