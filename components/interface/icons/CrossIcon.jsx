import { Colors } from "@/constants/theme";
import Svg, { Rect } from "react-native-svg";

// Drawn as two filled, rounded-end bars (rather than stroked lines with
// strokeLinecap) since react-native-svg doesn't reliably round the caps of
// a plain stroked line across platforms — a rounded Rect always renders
// correctly.
export function CrossIcon({
  size = 12,
  color = Colors.white,
  strokeWidth = 2,
  rotation = 0,
}) {
  const radius = strokeWidth / 2;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Rect
        x={(12 - strokeWidth) / 2}
        y={0}
        width={strokeWidth}
        height={12}
        rx={radius}
        ry={radius}
        fill={color}
      />
      <Rect
        x={0}
        y={(12 - strokeWidth) / 2}
        width={12}
        height={strokeWidth}
        rx={radius}
        ry={radius}
        fill={color}
      />
    </Svg>
  );
}
