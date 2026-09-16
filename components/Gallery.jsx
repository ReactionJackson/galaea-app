import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { memo, useState } from "react";
import {
  Pressable,
  Image as RNImage,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { Lightbox } from "./Lightbox";
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

// Duplicate: same size/border/fade recipe as ItemHero's own edit-circle
// button, just filled solid with the accent colour for a destructive action.
const DeleteCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid ${Colors.dateBorder};
  background-color: ${Colors.accent};
  justify-content: center;
  align-items: center;
`;

function DeleteButton({ onPress, style }) {
  const handlePress = () => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onPress?.();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      <Pressable onPress={handlePress}>
        <DeleteCircle>
          <ThemedText type="date-number" color="white">
            X
          </ThemedText>
        </DeleteCircle>
      </Pressable>
    </Animated.View>
  );
}
// End Duplicate

const GALLERY_ITEM_GAP = 10;
const DEFAULT_HORIZONTAL_PADDING = 80;

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
  onDeleteImage,
  horizontalPadding = DEFAULT_HORIZONTAL_PADDING,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - horizontalPadding;
  const trackHeight = Math.round(containerWidth / ITEM_ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);

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
    setLightboxIndex(null);
    setLightbox({
      mode: "edit",
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      focus: null,
    });
  };

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
              {editMode && (
                <DeleteButton
                  onPress={() => onDeleteImage?.(i)}
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
