import {
  Outfit_300Light as Outfit300,
  Outfit_500Medium as Outfit500,
  Outfit_600SemiBold as Outfit600,
  useFonts,
} from "@expo-google-fonts/outfit";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit300,
    Outfit600,
    Outfit500,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
