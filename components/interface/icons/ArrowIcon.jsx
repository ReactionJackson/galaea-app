import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

// A right-pointing chevron by default (rotation 0) — pass rotation={180}
// for the same shape reading as "left" instead, same idea as CrossIcon's
// plus/cross pairing.
export function ArrowIcon({
  size = 12,
  color = Colors.tags.default.primary,
  strokeWidth = 2,
  rotation = 0,
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      style={{ transform: [{ rotate: `${rotation}deg` }] }}
    >
      <Path
        d="M4 2L8 6L4 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
