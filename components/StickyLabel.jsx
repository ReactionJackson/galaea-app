import { Colors, Fonts } from "@/constants/theme";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import styled from "styled-components/native";

const SNAP_INTERVAL = 40 + 10;
const ITEM_WIDTH = 40;

const LabelText = styled(Animated.Text)`
  font-family: ${Fonts.semibold};
  font-size: 9px;
  letter-spacing: ${({ condensed }) => (condensed ? "1px" : "2px")};
  color: ${Colors.black};
  position: absolute;
`;

export function StickyLabel({
  group,
  scrollX,
  halfTrackWidth,
  trackPaddingLeft,
  condensed = false,
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const firstItemCenter =
      trackPaddingLeft.value +
      group.firstIndex * SNAP_INTERVAL +
      ITEM_WIDTH / 2;
    const lastItemCenter =
      trackPaddingLeft.value + group.lastIndex * SNAP_INTERVAL + ITEM_WIDTH / 2;
    const viewportCenter = scrollX.value + halfTrackWidth.value;

    const labelContentCenter = Math.max(
      firstItemCenter,
      Math.min(viewportCenter, lastItemCenter),
    );
    const translateX =
      labelContentCenter - scrollX.value - halfTrackWidth.value;

    // How far outside its range is the viewport center?
    const distanceOutside = Math.max(
      0,
      Math.max(
        firstItemCenter - viewportCenter,
        viewportCenter - lastItemCenter,
      ),
    );

    // Tween from 1.0 → 0.5 over one snap interval's worth of distance
    const opacity = interpolate(
      distanceOutside,
      [0, SNAP_INTERVAL],
      [1.0, 0.3],
      Extrapolation.CLAMP,
    );

    return { transform: [{ translateX }], opacity };
  });

  return (
    <LabelText condensed={condensed} style={animatedStyle}>
      {group.label}
    </LabelText>
  );
}
