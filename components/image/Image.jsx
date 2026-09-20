import { cardShadow } from "@/constants/theme";
import { FADE_TRANSITION_DURATION } from "@/constants/values";
import { fileExists } from "@/utils/images";
import { Image as ExpoImage } from "expo-image";
import { useMemo } from "react";
import styled from "styled-components/native";

const toDimension = (value) =>
  typeof value === "number" ? `${value}px` : value;

const ShadowWrap = styled.View`
  ${({ width }) => width != null && `width: ${toDimension(width)};`}
  ${({ height }) => height != null && `height: ${toDimension(height)};`}
  ${({ aspectRatio }) => aspectRatio && `aspect-ratio: ${aspectRatio};`}
  border-radius: ${({ radius }) => radius ?? 0}px;
  ${({ shadowRadius, shadowOpacity }) =>
    cardShadow(shadowRadius, shadowOpacity)}
`;

const StyledImage = styled(ExpoImage).attrs({
  transition: FADE_TRANSITION_DURATION,
  contentFit: "contain",
  cachePolicy: "memory-disk",
})`
  width: 100%;
  height: 100%;
  border-radius: ${({ radius }) => radius ?? 0}px;
`;

export function Image({
  uri,
  aspectRatio,
  width,
  height,
  radius,
  shadowRadius,
  shadowOpacity,
  style,
  ...rest
}) {
  const exists = useMemo(() => fileExists(uri), [uri]);

  if (!uri) return null;

  return (
    <ShadowWrap
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      radius={radius}
      shadowRadius={shadowRadius}
      shadowOpacity={shadowOpacity}
      style={style}
    >
      {exists && <StyledImage source={{ uri }} radius={radius} {...rest} />}
    </ShadowWrap>
  );
}
