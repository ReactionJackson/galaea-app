import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import { useWindowDimensions } from "react-native";
import styled from "styled-components/native";
import { ThemedText } from "./ThemedText";

const Track = styled.ScrollView`
  margin: 0 -20px;
`;

const Item = styled.View`
  flex-shrink: 0;
  aspect-ratio: 16/9;
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
const ASPECT_RATIO = 9 / 16;
const HORIZONTAL_PADDING = 80;

export const Gallery = memo(function Gallery({ images, editMode = false }) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - HORIZONTAL_PADDING;
  const trackHeight = Math.round(containerWidth * ASPECT_RATIO);
  const itemCount = images.length + (editMode ? 1 : 0);

  return (
    <Track
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
          <Image contentFit="cover" source={{ uri }} />
        </Item>
      ))}
      {editMode && (
        <Item style={{ width: containerWidth }}>
          <EditableView>
            <ThemedText>Add Image</ThemedText>
          </EditableView>
        </Item>
      )}
    </Track>
  );
});
