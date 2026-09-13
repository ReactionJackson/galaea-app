import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import { memo, useState } from "react";
import {
  Image as RNImage,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import styled from "styled-components/native";
import { Lightbox } from "./Lightbox";
import { ThemedText } from "./ThemedText";

// Fixed app-wide crop ratio for gallery thumbnails (width : height). Chosen
// as a compromise between modern widescreen (16:9 ≈ 1.78) and older 4:3
// hardware (≈ 1.33) so neither era gets mangled by default. Tapping an
// image opens the Lightbox at its true ratio, so this only has to look good
// as a consistent thumbnail — it never needs to be "accurate". A per-user
// override may live in Settings later; for now it's a single constant.
export const ITEM_ASPECT_RATIO = 3 / 2;

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
const HORIZONTAL_PADDING = 80;

// Gallery items are plain URI strings for legacy/placeholder data, or
// { uri, focus } objects for anything with a focal point set — focus is an
// expo-image contentPosition object ({ top, left } as percentages). Exported
// so GameEntry.jsx can apply an updated focus without duplicating this.
export function getImageUri(item) {
  return typeof item === "string" ? item : item.uri;
}
export function getImageFocus(item) {
  return typeof item === "string" ? null : (item.focus ?? null);
}

export const Gallery = memo(function Gallery({
  images,
  editMode = false,
  onAddImage,
  onUpdateImage,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - HORIZONTAL_PADDING;
  const trackHeight = Math.round(containerWidth / ITEM_ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);

  // Unified Lightbox state — see Lightbox.jsx for the two mode shapes.
  // `index` is this component's own bookkeeping (not passed to Lightbox):
  // null means "not in the gallery yet", otherwise it's the position to
  // update in place on Save, rather than append.
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const handleAddImage = async () => {
    if (!onAddImage) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    // Nothing is added to the gallery yet — the Lightbox's edit step
    // confirms (optionally with a focal point) or cancels.
    setLightboxIndex(null);
    setLightbox({ mode: "edit", uri: asset.uri, width: asset.width, height: asset.height, focus: null });
  };

  // Tapping an existing image while editing the entry re-opens it for focal
  // point adjustment rather than just viewing it — needs its native pixel
  // size first, which (unlike a freshly picked image) was never stored.
  const openEditExisting = (item, index) => {
    const uri = getImageUri(item);
    const focus = getImageFocus(item);
    RNImage.getSize(
      uri,
      (width, height) => {
        setLightboxIndex(index);
        setLightbox({ mode: "edit", uri, width, height, focus });
      },
      () => {
        // Couldn't measure it (e.g. a network hiccup) — still let Cancel/
        // Reset/Save work, tap-to-move just won't do anything without a rect.
        setLightboxIndex(index);
        setLightbox({ mode: "edit", uri, width: null, height: null, focus });
      },
    );
  };

  const handleSaveLightbox = (focus) => {
    if (lightboxIndex == null) {
      onAddImage?.(focus ? { uri: lightbox.uri, focus } : lightbox.uri);
    } else {
      onUpdateImage?.(lightboxIndex, focus);
    }
    setLightbox(null);
  };

  const handleCloseLightbox = () => {
    setLightbox(null);
  };

  return (
    <>
      <ScrollView
        style={{ height: trackHeight }}
        horizontal
        snapToInterval={containerWidth + GALLERY_ITEM_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEnabled={itemCount > 1}
        contentContainerStyle={{
          gap: GALLERY_ITEM_GAP,
          paddingInlineStart: 20,
          paddingInlineEnd: 20,
        }}
      >
        {images.map((item, i) => {
          const uri = getImageUri(item);
          return (
            <Item key={`image-${i}`} style={{ width: containerWidth }}>
              <Pressable
                onPress={() =>
                  editMode
                    ? openEditExisting(item, i)
                    : setLightbox({ mode: "view", uri })
                }
                style={{ flex: 1 }}
              >
                <Image
                  contentFit="cover"
                  contentPosition={getImageFocus(item) ?? undefined}
                  source={{ uri }}
                />
              </Pressable>
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
      <Lightbox
        state={lightbox}
        onClose={handleCloseLightbox}
        onSave={handleSaveLightbox}
      />
    </>
  );
});
