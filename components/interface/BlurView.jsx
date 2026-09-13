import { Colors } from "@/constants/theme";
import { BlurView as ExpoBlurView } from "expo-blur";
import { Platform } from "react-native";
import styled from "styled-components/native";

const WebBlur = styled.View`
  background-color: ${Colors.backgroundBlurTint};
  ${Platform.select({
    web: `backdrop-filter: saturate(180%) blur(20px);`,
    default: ``,
  })}
`;

export function BlurView({
  intensity = 40,
  tint = "light",
  style,
  children,
  ...props
}) {
  if (Platform.OS === "web") {
    return (
      <WebBlur style={style} {...props}>
        {children}
      </WebBlur>
    );
  }
  return (
    <ExpoBlurView
      intensity={intensity}
      tint={tint}
      style={[{ backgroundColor: Colors.backgroundBlurTint }, style]}
      {...props}
    >
      {children}
    </ExpoBlurView>
  );
}
