import { HapticTab } from "@/components/interface/HapticTab";
import { Colors } from "@/constants/theme";
import { AppProvider } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <AppProvider>
      <Tabs
        initialRouteName="journal"
        screenOptions={{
          tabBarActiveTintColor: Colors.accent,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        {/* Required by Expo Router to resolve the root path — hidden from the tab bar */}
        <Tabs.Screen name="index" options={{ href: null }} />

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
          name="collection"
          options={{
            title: "Collection",
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
      </Tabs>
    </AppProvider>
  );
}
