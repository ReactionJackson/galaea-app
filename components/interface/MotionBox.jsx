import { SLIDE_TRANSITION_DURATION } from "@/constants/values";
import Animated from "react-native-reanimated";

export const MotionBox = ({
  style,
  duration = SLIDE_TRANSITION_DURATION,
  property = "all",
  ...props
}) => (
  <Animated.View
    style={[
      style,
      {
        transitionProperty: property,
        transitionDuration: duration,
        transitionTimingFunction: "ease-in-out",
      },
    ]}
    {...props}
  />
);
