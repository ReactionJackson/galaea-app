import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export function EditIcon({
  size = 14,
  color = Colors.black,
  strokeWidth = 1.6,
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12.5V18.5C20 19.6 19.1 20.5 18 20.5H5.5C4.4 20.5 3.5 19.6 3.5 18.5V6C3.5 4.9 4.4 4 5.5 4H11.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.4 3.4a1.8 1.8 0 0 1 2.6 2.6L9.8 16.2l-3.4.8.8-3.4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
    </Svg>
  );
}
