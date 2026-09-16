import { Colors } from "@/constants/theme";
import Svg, { Line } from "react-native-svg";

export function CrossIcon({
  size = 12,
  color = Colors.white,
  strokeWidth = 2,
  rotation = 0,
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Line
        x1="6"
        y1="0"
        x2="6"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="0"
        y1="6"
        x2="12"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
