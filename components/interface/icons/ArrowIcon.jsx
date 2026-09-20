import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

// A right-pointing arrow by default (rotation 0) — pass rotation={180} for
// the same shape reading as "left" instead, same idea as CrossIcon's
// plus/cross pairing. Drawn as a chevron with a trailing shaft so it reads
// like the ←/→ glyphs rather than a bare "<"/">" chevron.
export function ArrowIcon({
  size = 14,
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
        d="M2.5 6L9.5 6M5.5 2L9.5 6L5.5 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
