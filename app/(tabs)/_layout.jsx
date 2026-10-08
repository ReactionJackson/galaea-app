import { HapticTab } from "@/components/interface/HapticTab";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const {
    settings: { accentColor },
  } = useApp();
  return (
    <Tabs
      initialRouteName="exploration"
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Required by Expo Router to resolve the root path — hidden from the tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "settings" : "settings-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="exploration"
        options={{
          title: "Exploration",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={28}
              name={focused ? "flask" : "flask-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
