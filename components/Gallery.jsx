import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import styled from "styled-components/native";

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

const GALLERY_ITEM_GAP = 10;

export function Gallery({ images }) {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <View onLayout={handleLayout}>
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
      </Track>
    </View>
  );
}
