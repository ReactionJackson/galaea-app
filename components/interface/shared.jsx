import * as Haptics from "expo-haptics";

export function firePressHaptic(haptics) {
  if (haptics && process.env.EXPO_OS === "ios") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle[haptics]);
  }
}
