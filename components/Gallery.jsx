import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
import { memo, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";
import styled from "styled-components/native";
import { Lightbox } from "./Lightbox";
import { ThemedText } from "./ThemedText";

// Fixed app-wide crop ratio for gallery thumbnails (width : height). Chosen
// as a compromise between modern widescreen (16:9 ≈ 1.78) and older 4:3
// hardware (≈ 1.33) so neither era gets mangled by default. Tapping an
// image opens the Lightbox at its true ratio, so this only has to look good
// as a consistent thumbnail — it never needs to be "accurate". A per-user
// override may live in Settings later; for now it's a single constant.
const ITEM_ASPECT_RATIO = 3 / 2;

const Item = styled.View`
  flex-shrink: 0;
  aspect-ratio: ${ITEM_ASPECT_RATIO};
  border-radius: 10px;
  overflow: hidden;
`;

const Image = styled(ExpoImage)`
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

export const Gallery = memo(function Gallery({ images, editMode = false, onAddImage }) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - HORIZONTAL_PADDING;
  const trackHeight = Math.round(containerWidth / ITEM_ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);
  const [lightboxUri, setLightboxUri] = useState(null);

  const handleAddImage = async () => {
    if (!onAddImage) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (uri) onAddImage(uri);
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
        {images.map((uri, i) => (
          <Item key={`image-${i}`} style={{ width: containerWidth }}>
            <Pressable onPress={() => setLightboxUri(uri)} style={{ flex: 1 }}>
              <Image contentFit="cover" source={{ uri }} />
            </Pressable>
          </Item>
        ))}
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
      <Lightbox uri={lightboxUri} onClose={() => setLightboxUri(null)} />
    </>
  );
});
