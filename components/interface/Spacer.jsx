import { View } from "react-native";
import { ToggleBox } from "./ToggleBox";

export const Spacer = ({ isVisible, height = 15 }) => {
  return (
    <ToggleBox isVisible={isVisible}>
      <View style={{ height }} />
    </ToggleBox>
  );
};
