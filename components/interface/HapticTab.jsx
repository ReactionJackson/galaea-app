import { triggerHaptics } from "@/utils/haptics";
import { PlatformPressable } from "expo-router/react-navigation";

export function HapticTab(props) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        triggerHaptics("Light");
        props.onPressIn?.(ev);
      }}
    />
  );
}
