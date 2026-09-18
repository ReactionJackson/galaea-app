import { Colors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
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
  if (!uri) return null;
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
