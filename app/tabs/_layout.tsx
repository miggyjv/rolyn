import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/utils/supabaseClient";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState<"employer" | "worker" | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        console.log("Current user role:", profileData.role);
        setUserRole(profileData.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }

    fetchUserRole();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6B46C1",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarInactiveTintColor: "#A0AEC0",
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            //position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  color: "black",
                  fontSize: 23,
                  fontWeight: "bold",
                  paddingRight: 5,
                }}
              >
                Rolyn
              </Text>
              <MaterialCommunityIcons
                name="human-greeting-variant"
                size={40}
                color="purple"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="newpost"
        options={{
          title: "New Posting",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="plus" color={color} />
          ),
          headerShown: true,
          headerTitle: "Make A New Post",
          href: userRole === "employer" ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
          headerShown: true,
          headerTitle: "My Information",
          href: userRole === "worker" ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="dashboard" color={color} />
          ),
          headerShown: true,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  color: "black",
                  fontSize: 23,
                  fontWeight: "bold",
                  paddingRight: 5,
                }}
              >
                Rolyn
              </Text>
              <MaterialCommunityIcons
                name="human-greeting-variant"
                size={40}
                color="purple"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="message" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          headerShown: true,
          headerTitle: "Account Details",
        }}
      />
      <Tabs.Screen
        name="Filter"
        options={{
          href: null,
        }}
      />
      
    </Tabs>
  );
}
