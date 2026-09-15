import { Colors } from "@/constants/theme";
import { getCachedAspectRatio, loadAspectRatio } from "@/hooks/useImageAspectRatio";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import styled from "styled-components/native";
import { ThemedText } from "./interface/ThemedText";

const CARD_HEIGHT = 180;
const DEFAULT_CARD_WIDTH = 120;

const HeroContainer = styled.View`
  height: 250px;
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
  height: ${CARD_HEIGHT}px;
  border-radius: 4px;
  overflow: hidden;
`;

const CardImage = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
`;

const CardPlaceholder = styled.View`
  width: ${DEFAULT_CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
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
  cardImage,
  coverImage,
  editable = false,
  onPressCard = () => {},
  onPressCover = () => {},
}) {
  const { width: screenWidth } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(() => {
    const cachedRatio = getCachedAspectRatio(cardImage);
    return cachedRatio ? Math.round(CARD_HEIGHT * cachedRatio) : DEFAULT_CARD_WIDTH;
  });

  useEffect(() => {
    if (!cardImage) {
      setCardWidth(DEFAULT_CARD_WIDTH);
      return;
    }
    // If this image's ratio is already known (it's been shown elsewhere this
    // session), size correctly straight away instead of flashing back to the
    // default width and re-fetching.
    const cachedRatio = getCachedAspectRatio(cardImage);
    setCardWidth(
      cachedRatio ? Math.round(CARD_HEIGHT * cachedRatio) : DEFAULT_CARD_WIDTH,
    );
    let cancelled = false;
    loadAspectRatio(cardImage, (ratio) => {
      if (!cancelled) setCardWidth(Math.round(CARD_HEIGHT * ratio));
    });
    return () => {
      cancelled = true;
    };
  }, [cardImage]);

  return (
    <HeroContainer style={{ width: screenWidth }}>
      <CoverFill>
        {coverImage && (
          <CoverImage source={{ uri: coverImage }} contentFit="cover" />
        )}
        <CoverOverlay />
      </CoverFill>

      <CardWrap>
        {cardImage ? (
          <CardFrame cardWidth={cardWidth}>
            <CardImage source={{ uri: cardImage }} contentFit="cover" />
          </CardFrame>
        ) : (
          <CardPlaceholder />
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
