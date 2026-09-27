import { View } from "react-native";
import { AnimateHeight } from "./AnimateHeight";

export const Spacer = ({ isVisible, height = 15 }) => {
  return (
    <AnimateHeight isVisible={isVisible}>
      <View style={{ height }} />
    </AnimateHeight>
  );
};
