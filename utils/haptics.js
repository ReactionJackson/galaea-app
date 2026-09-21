import * as Haptics from "expo-haptics";

export function triggerHaptics(style) {
  if (!style || process.env.EXPO_OS !== "ios") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
}
