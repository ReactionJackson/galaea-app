import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { storePickedImage } from "@/utils/imageStorage";
import * as ImagePicker from "expo-image-picker";
import { memo, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Image as RNImage,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Lightbox } from "../Lightbox";
import { InteractionControls } from "../interface/InteractionControls";
import { ThemedText } from "../interface/ThemedText";
import { GalleryItem } from "./GalleryItem";
import { GalleryPagination } from "./GalleryPagination";
import {
  CAPTION_REVEAL_DURATION,
  CAPTION_REVEAL_EASING,
  CAPTION_REVEAL_HEIGHT,
  DEFAULT_HORIZONTAL_PADDING,
  EditableView,
  GALLERY_ITEM_GAP,
  Item,
  getImageCaption,
  getImageFocus,
  getImageUri,
} from "./shared";

export { CAPTION_REVEAL_HEIGHT, getImageCaption, getImageFocus, getImageUri };

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

  const revealShift = useSharedValue(0);
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    setTransitioning(true);
    revealShift.value = withTiming(
      editMode ? CAPTION_REVEAL_HEIGHT : 0,
      { duration: CAPTION_REVEAL_DURATION, easing: CAPTION_REVEAL_EASING },
      (finished) => {
        if (finished) scheduleOnRN(setTransitioning, false);
      },
    );
  }, [editMode, revealShift]);
  const revealContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: trackHeight + revealShift.value,
  }));
  const revealContainerStyle = transitioning
    ? [{ overflow: "hidden" }, revealContainerAnimatedStyle]
    : {
        height: trackHeight + (editMode ? CAPTION_REVEAL_HEIGHT : 0),
        overflow: editMode ? "visible" : "hidden",
      };
  const addTileTrayStyle = useAnimatedStyle(() => ({
    bottom: CAPTION_REVEAL_HEIGHT - revealShift.value,
  }));

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(itemCount - 1, 0)));
  }, [itemCount]);

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
    const existing = lightboxIndex != null ? images[lightboxIndex] : null;
    const caption = getImageCaption(existing);
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
    const base = typeof item === "string" ? { uri: item } : { ...item };
    onUpdateImage?.(index, { ...base, caption: text });
  };

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / scrollInterval);
    const clamped = Math.max(0, Math.min(index, itemCount - 1));
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
      <Animated.View style={[{ position: "relative" }, revealContainerStyle]}>
        <ScrollView
          ref={scrollRef}
          style={{ height: trackHeight + CAPTION_REVEAL_HEIGHT }}
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
            <View
              style={{
                width: containerWidth,
                height: trackHeight + CAPTION_REVEAL_HEIGHT,
              }}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: trackHeight / 2,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    backgroundColor: Colors.surfaceTint,
                  },
                  addTileTrayStyle,
                ]}
              />
              <Item style={{ width: containerWidth }}>
                <Pressable onPress={handleAddImage} style={{ flex: 1 }}>
                  <EditableView>
                    <ThemedText>Add Image</ThemedText>
                  </EditableView>
                </Pressable>
              </Item>
            </View>
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
              bottom: 10 + CAPTION_REVEAL_HEIGHT,
              left: 20,
              width: containerWidth,
              justifyContent: "center",
            }}
          />
        )}
      </Animated.View>
      <Lightbox
        state={lightbox}
        onClose={handleCloseLightbox}
        onSave={handleSaveLightbox}
      />
    </>
  );
});
