import { cardShadow } from "@/constants/theme";
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
  cachePolicy: "memory-disk",
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${({ radius }) => radius ?? 0}px;
`;

export function Image({
  uri,
  width = null,
  height = null,
  aspectRatio,
  radius,
  shadowRadius,
  shadowOpacity,
}) {
  const exists = useMemo(() => fileExists(uri), [uri]);
  const visualWidth = width ?? height * aspectRatio;
  const visualHeight = height ?? width / aspectRatio;

  if (!uri) return null;

  return (
    <ShadowWrap
      width={visualWidth}
      height={visualHeight}
      aspectRatio={aspectRatio}
      radius={radius}
      shadowRadius={shadowRadius}
      shadowOpacity={shadowOpacity}
    >
      {exists && (
        <StyledImage
          source={{ uri }}
          radius={radius}
          width={visualWidth}
          height={visualHeight}
        />
      )}
    </ShadowWrap>
  );
}
