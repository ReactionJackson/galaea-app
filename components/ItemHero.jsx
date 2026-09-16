import { Colors } from "@/constants/theme";
import {
  getCachedAspectRatio,
  loadAspectRatio,
} from "@/hooks/useImageAspectRatio";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { ThemedText } from "./interface/ThemedText";

const DEFAULT_ASPECT_RATIO = 2 / 3;

const HeroContainer = styled.View`
  height: ${({ height }) => height}px;
  padding: ${({ spacing }) => spacing}px 0;
  margin: 0 -20px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.border};
`;

const CoverFill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const CoverImage = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

const CoverOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.imageOverlay};
`;

const CardWrap = styled.View`
  position: relative;
`;

const CardFrame = styled.View`
  width: ${({ cardWidth }) => cardWidth}px;
  height: ${({ cardHeight }) => cardHeight}px;
  border-radius: 4px;
  overflow: hidden;
`;

const CardImage = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

const CardPlaceholder = styled.View`
  width: ${({ cardWidth }) => cardWidth}px;
  height: ${({ cardHeight }) => cardHeight}px;
  border: 2px dashed ${Colors.disabled};
  border-radius: 4px;
`;

const EditOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`;

const EditCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid ${Colors.dateBorder};
  background-color: rgba(255, 255, 255, 0.8);
  justify-content: center;
  align-items: center;
`;

function EditButton({ onPress, style }) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      <Pressable onPress={onPress}>
        <EditCircle>
          <ThemedText type="date-number" color="black">
            +
          </ThemedText>
        </EditCircle>
      </Pressable>
    </Animated.View>
  );
}

export function ItemHero({
  height,
  spacing = 0,
  cardImage,
  coverImage,
  editable = false,
  onPressCard = () => {},
  onPressCover = () => {},
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardHeight = height - spacing * 2;

  const [aspectRatio, setAspectRatio] = useState(
    () => getCachedAspectRatio(cardImage) ?? DEFAULT_ASPECT_RATIO,
  );

  useEffect(() => {
    if (!cardImage) {
      setAspectRatio(DEFAULT_ASPECT_RATIO);
      return;
    }
    // If this image's ratio is already known (it's been shown elsewhere this
    // session), size correctly straight away instead of flashing back to the
    // default ratio and re-fetching.
    const cachedRatio = getCachedAspectRatio(cardImage);
    setAspectRatio(cachedRatio ?? DEFAULT_ASPECT_RATIO);
    let cancelled = false;
    loadAspectRatio(cardImage, (ratio) => {
      if (!cancelled) setAspectRatio(ratio);
    });
    return () => {
      cancelled = true;
    };
  }, [cardImage]);

  const cardWidth = Math.round(cardHeight * aspectRatio);

  return (
    <HeroContainer
      height={height}
      spacing={spacing}
      style={{ width: screenWidth }}
    >
      <CoverFill>
        {coverImage && (
          <CoverImage source={{ uri: coverImage }} contentFit="cover" />
        )}
        <CoverOverlay />
      </CoverFill>

      <CardWrap>
        {cardImage ? (
          <CardFrame cardWidth={cardWidth} cardHeight={cardHeight}>
            <CardImage source={{ uri: cardImage }} />
          </CardFrame>
        ) : (
          <CardPlaceholder cardWidth={cardWidth} cardHeight={cardHeight} />
        )}
        {editable && (
          <EditOverlay>
            <EditButton onPress={onPressCard} />
          </EditOverlay>
        )}
      </CardWrap>

      {editable && (
        <EditButton
          onPress={onPressCover}
          style={{ position: "absolute", top: 10, right: 10 }}
        />
      )}
    </HeroContainer>
  );
}
