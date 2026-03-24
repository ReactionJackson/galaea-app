import { useState } from "react";
import { Button, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function ColourTest({ from = "red", to = "blue" }) {
  const [switchColor, setSwitchColor] = useState(false);
  const progress = useSharedValue(0);

  const toggle = () => {
    const next = !switchColor;
    setSwitchColor(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 400 });
  };

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [from, to]),
  }));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        position: "absolute",
        top: -20,
      }}
    >
      <Animated.Text style={[{ fontSize: 32, fontWeight: "bold" }, textStyle]}>
        Hello World
      </Animated.Text>
      <Button title="Toggle colour" onPress={toggle} />
    </View>
  );
}
