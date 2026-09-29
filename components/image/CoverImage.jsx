import { Colors } from "@/constants/theme";
import { fileExists } from "@/utils/images";
import { Image as ExpoImage } from "expo-image";
import { useMemo } from "react";
import styled from "styled-components/native";

const StyledImage = styled(ExpoImage).attrs({
  contentFit: "cover",
  cachePolicy: "memory-disk",
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${({ $radius }) => $radius}px;
  overflow: hidden;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.imageOverlay};
  border-radius: ${({ $radius }) => $radius}px;
  overflow: hidden;
`;

export function CoverImage({
  uri,
  contentPosition,
  radius = 0,
  isDarkened = false,
}) {
  const exists = useMemo(() => fileExists(uri), [uri]);

  if (!uri || !exists) return null;
  return (
    <>
      <StyledImage
        source={{ uri }}
        $radius={radius}
        contentPosition={contentPosition}
      />
      {isDarkened && <Overlay $radius={radius} />}
    </>
  );
}
