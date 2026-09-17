import { Colors, cardShadow } from "@/constants/theme";
import { PAGE_INTRO_FADE } from "@/constants/values";
import {
  getCachedAspectRatio,
  loadAspectRatio,
} from "@/hooks/useImageAspectRatio";
import { useResizedImage } from "@/hooks/useResizedImage";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import styled from "styled-components/native";
import { InteractionControls } from "./interface/InteractionControls";

const DEFAULT_ASPECT_RATIO = 2 / 3;
const BLEED = 20;

const HeroContainer = styled.View`
  height: ${({ height }) => height}px;
  padding: ${({ spacing }) => spacing}px 0;
  margin: 0 -${BLEED}px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`;

const CoverFill = styled.View`
  position: absolute;
  top: 0;
  left: ${({ nestedInCard }) => (nestedInCard ? BLEED : 0)}px;
  right: ${({ nestedInCard }) => (nestedInCard ? BLEED : 0)}px;
  bottom: 0;
  border-top-left-radius: ${({ nestedInCard }) => (nestedInCard ? 30 : 0)}px;
  border-top-right-radius: ${({ nestedInCard }) => (nestedInCard ? 30 : 0)}px;
  overflow: hidden;
`;

const CoverBackground = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-top-left-radius: ${({ nestedInCard }) => (nestedInCard ? 30 : 0)}px;
  border-top-right-radius: ${({ nestedInCard }) => (nestedInCard ? 30 : 0)}px;
  background-color: ${({ nestedInCard }) =>
    nestedInCard ? Colors.surfaceTint : Colors.black};
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

const CardShadow = styled.View`
  width: ${({ cardWidth }) => cardWidth}px;
  height: ${({ cardHeight }) => cardHeight}px;
  border-radius: 4px;
  ${({ shadowRadius, shadowOpacity }) =>
    cardShadow(shadowRadius, shadowOpacity)}
`;

const CardFrame = styled.View`
  width: 100%;
  height: 100%;
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

export function ItemHero({
  height,
  spacing = 0,
  cardImage,
  coverImage,
  coverFocus,
  editable = false,
  animateCoverReveal = false,
  nestedInCard = false,
  shadowRadius = 20,
  shadowOpacity = 0.5,
  onPressCard = () => {},
  onPressCover = () => {},
  onEditCover = () => {},
  onRemoveCover = () => {},
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardHeight = height - spacing * 2;
  const [coverLoaded, setCoverLoaded] = useState(!animateCoverReveal);
  useEffect(() => {
    if (animateCoverReveal) setCoverLoaded(false);
  }, [coverImage, animateCoverReveal]);

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

  // The box art's target box is derived from its own aspect ratio (see
  // cardWidth above), so resizing it down to exactly that box never
  // distorts it. The cover's target box (screenWidth x height) has no
  // relation to the cover photo's own ratio though — pre-resizing it to
  // that exact box would stretch it non-uniformly, so it's left to render
  // at its already-capped stored size via contentFit="cover" instead,
  // which crops to fill without distorting.
  const displayCardImage = useResizedImage(cardImage, cardWidth, cardHeight);

  return (
    <HeroContainer
      height={height}
      spacing={spacing}
      style={{ width: screenWidth }}
    >
      <CoverFill nestedInCard={nestedInCard}>
        <CoverBackground nestedInCard={nestedInCard} />
        {coverImage && !coverLoaded && (
          <CoverImage
            source={{ uri: coverImage }}
            contentFit="cover"
            contentPosition={coverFocus ?? undefined}
            style={{ opacity: 0 }}
            onLoad={() => setCoverLoaded(true)}
          />
        )}
        {coverImage && coverLoaded && (
          <Animated.View
            entering={FadeIn.duration(PAGE_INTRO_FADE)}
            style={{ width: "100%", height: "100%" }}
          >
            <CoverImage
              source={{ uri: coverImage }}
              contentFit="cover"
              contentPosition={coverFocus ?? undefined}
            />
            <CoverOverlay />
          </Animated.View>
        )}
      </CoverFill>

      <CardWrap>
        {cardImage ? (
          <CardShadow
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            shadowRadius={shadowRadius}
            shadowOpacity={shadowOpacity}
          >
            <CardFrame>
              <CardImage source={{ uri: displayCardImage }} />
            </CardFrame>
          </CardShadow>
        ) : (
          <CardPlaceholder cardWidth={cardWidth} cardHeight={cardHeight} />
        )}
        {editable && (
          <EditOverlay>
            <InteractionControls onAdd={onPressCard} />
          </EditOverlay>
        )}
      </CardWrap>

      {editable && (
        <InteractionControls
          onAdd={onPressCover}
          onEdit={coverImage ? onEditCover : undefined}
          onDelete={coverImage ? onRemoveCover : undefined}
          style={{ position: "absolute", top: 10, right: 10 }}
        />
      )}
    </HeroContainer>
  );
}
