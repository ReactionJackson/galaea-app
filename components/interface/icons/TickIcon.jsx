import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export function TickIcon({
  size = 12,
  color = Colors.white,
  strokeWidth = 2,
  style,
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      style={style}
    >
      <Path
        d="M1 6.5L4 9.5L10 2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
