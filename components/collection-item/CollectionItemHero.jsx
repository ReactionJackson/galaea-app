import { CoverImage } from "@/components/image/CoverImage";
import { Image } from "@/components/image/Image";
import { InteractionControls } from "@/components/interface/InteractionControls";
import { Colors } from "@/constants/theme";
import { PAGE_INTRO_FADE } from "@/constants/values";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import styled from "styled-components/native";

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

const CardWrap = styled.View`
  position: relative;
`;

const CardPlaceholder = styled.View`
  height: 100%;
  aspect-ratio: ${DEFAULT_ASPECT_RATIO};
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

export function CollectionItemHero({
  height,
  spacing = 0,
  cardImage,
  coverImage,
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
  const [prevCoverImage, setPrevCoverImage] = useState(coverImage);
  const [prevAnimateCoverReveal, setPrevAnimateCoverReveal] =
    useState(animateCoverReveal);
  if (
    coverImage !== prevCoverImage ||
    animateCoverReveal !== prevAnimateCoverReveal
  ) {
    setPrevCoverImage(coverImage);
    setPrevAnimateCoverReveal(animateCoverReveal);
    if (animateCoverReveal) setCoverLoaded(false);
  }

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
            key={coverImage.uri}
            {...coverImage}
            style={{ opacity: 0 }}
            onLoad={() => setCoverLoaded(true)}
          />
        )}
        {coverImage &&
          coverLoaded &&
          (animateCoverReveal ? (
            <Animated.View
              entering={FadeIn.duration(PAGE_INTRO_FADE)}
              style={{ width: "100%", height: "100%" }}
            >
              <CoverImage key={coverImage.uri} {...coverImage} addOverlay />
            </Animated.View>
          ) : (
            <CoverImage key={coverImage.uri} {...coverImage} addOverlay />
          ))}
      </CoverFill>

      <CardWrap style={{ height: cardHeight }}>
        {cardImage ? (
          <Image
            key={cardImage.uri}
            {...cardImage}
            height={cardHeight}
            shadowRadius={shadowRadius}
            shadowOpacity={shadowOpacity}
            radius={4}
          />
        ) : (
          <CardPlaceholder />
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
