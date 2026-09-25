import { HapticTab } from "@/components/interface/HapticTab";
import { AppProvider } from "@/context/AppContext";
import { useSettings } from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { accent } = useSettings();

  return (
    <AppProvider>
      <Tabs
        initialRouteName="exploration"
        screenOptions={{
          tabBarActiveTintColor: accent,
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
          name="friends"
          options={{
            title: "Friends",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "people" : "people-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="collections"
          options={{
            title: "Collections",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "albums" : "albums-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="journal"
          options={{
            title: "Journal",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "book" : "book-outline"}
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
    </AppProvider>
  );
}
