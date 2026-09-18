import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing } from "react-native-reanimated";
import styled from "styled-components/native";

export const GALLERY_ITEM_GAP = 10;
export const GALLERY_ITEM_RADIUS = 15;
export const CAPTION_REVEAL_HEIGHT = 60;
export const CAPTION_REVEAL_EASING = Easing.out(Easing.quad);

export const Item = styled.View`
  width: ${({ $width }) => $width}px;
  flex-shrink: 0;
  aspect-ratio: ${ITEM_ASPECT_RATIO};
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  overflow: hidden;
  background-color: ${Colors.white};
`;

export const GallerySlot = styled.View`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
`;

export const EditableView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  border: 2px dashed ${Colors.disabled};
  border-radius: 10px;
  background-color: ${Colors.white};
`;

export const CaptionGradient = styled(LinearGradient)`
  flex: 1;
`;

export const CaptionTray = styled(Animated.View).attrs({
  pointerEvents: "none",
})`
  position: absolute;
  left: 0px;
  right: 0px;
  height: ${({ $height }) => $height}px;
  border-radius: ${GALLERY_ITEM_RADIUS}px;
  border-width: 1px;
  border-color: ${Colors.border};
  background-color: ${Colors.surfaceTint};
`;
