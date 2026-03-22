import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
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
        name="index"
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
    </Tabs>
  );
}
