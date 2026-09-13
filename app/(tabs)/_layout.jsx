import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/theme";
import { AppProvider } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// AppProvider lives here (rather than inside journal.jsx alone) so the
// journal and collection tabs read and write the same games/tags store — a
// game entry saved from the journal must show up on that game's own page
// without needing a reload.
export default function TabLayout() {
  return (
    <AppProvider>
      <Tabs
        initialRouteName="journal"
        screenOptions={{
          tabBarActiveTintColor: Colors.tint,
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
