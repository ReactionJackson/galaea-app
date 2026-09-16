import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { storePickedImage } from "@/utils/imageStorage";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { memo, useState } from "react";
import {
  Pressable,
  Image as RNImage,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import styled from "styled-components/native";
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
  horizontalPadding = DEFAULT_HORIZONTAL_PADDING,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - horizontalPadding;
  const trackHeight = Math.round(containerWidth / ITEM_ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);

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
  const handleReplaceImage = (index) => pickAndOpenLightbox(index);

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
              {editMode && (
                <InteractionControls
                  onAdd={() => handleReplaceImage(i)}
                  onEdit={() => openEditExisting(item, i)}
                  onDelete={() => onDeleteImage?.(i)}
                  style={{ position: "absolute", top: 10, right: 10 }}
                />
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
      <Lightbox
        state={lightbox}
        onClose={handleCloseLightbox}
        onSave={handleSaveLightbox}
      />
    </>
  );
});
