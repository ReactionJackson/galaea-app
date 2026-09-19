import { Colors } from "@/constants/theme";
import { fileExists } from "@/utils/images";
import { Image as ExpoImage } from "expo-image";
import { useMemo } from "react";
import styled from "styled-components/native";

const StyledImage = styled(ExpoImage).attrs({
  transition: 200,
  contentFit: "cover",
})`
  width: 100%;
  height: 100%;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.imageOverlay};
`;

export function CoverImage({
  uri,
  focus,
  addOverlay = false,
  style,
  rawWidth,
  rawHeight,
  aspectRatio,
  ...rest
}) {
  const exists = useMemo(() => fileExists(uri), [uri]);

  if (!uri || !exists) return null;
  return (
    <>
      <StyledImage
        source={{ uri }}
        contentPosition={focus ?? undefined}
        style={style}
        {...rest}
      />
      {addOverlay && <Overlay />}
    </>
  );
}
