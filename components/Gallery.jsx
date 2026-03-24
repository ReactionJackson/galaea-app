import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { ThemedText } from "./ThemedText";

const Track = styled.ScrollView`
  flex: 1;
  gap: 10px;
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
  padding: 10px;
  border: 2px dashed ${Colors.disabled};
  border-radius: 20px;
  transform: scale(0.9);
`;

const GALLERY_ITEM_GAP = 10;

export function Gallery({ images }) {
  const [containerWidth, setContainerWidth] = useState(0);
  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <Track
        horizontal
        snapToInterval={containerWidth + GALLERY_ITEM_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEnabled={images.length > 1}
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
        <Item style={{ width: containerWidth }}>
          <EditableView>
            <ThemedText>Add Image</ThemedText>
          </EditableView>
        </Item>
      </Track>
    </View>
  );
}
