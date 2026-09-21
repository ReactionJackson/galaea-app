import { useWindowDimensions } from "react-native";

export function usePagedScrollWidth(horizontalPadding, gap) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - horizontalPadding;
  const scrollInterval = containerWidth + gap;
  return { containerWidth, scrollInterval };
}
