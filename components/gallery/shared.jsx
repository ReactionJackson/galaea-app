import { Colors } from "@/constants/theme";
import { ITEM_ASPECT_RATIO } from "@/constants/values";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Easing } from "react-native-reanimated";
import styled from "styled-components/native";

export const GALLERY_ITEM_GAP = 10;
export const DEFAULT_HORIZONTAL_PADDING = 80;
export const CAPTION_REVEAL_HEIGHT = 60;
export const CAPTION_REVEAL_DURATION = 250;
export const CAPTION_REVEAL_EASING = Easing.out(Easing.quad);

export const Item = styled.View`
  flex-shrink: 0;
  aspect-ratio: ${ITEM_ASPECT_RATIO};
  border-radius: 15px;
  overflow: hidden;
  background-color: ${Colors.white};
`;

export const Image = styled(ExpoImage).attrs({ transition: 200 })`
  width: 100%;
  height: 100%;
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

export function getImageUri(item) {
  if (!item) return null;
  return typeof item === "string" ? item : item.uri;
}
export function getImageFocus(item) {
  if (!item) return null;
  return typeof item === "string" ? null : (item.focus ?? null);
}
export function getImageCaption(item) {
  if (!item) return "";
  return typeof item === "string" ? "" : (item.caption ?? "");
}
