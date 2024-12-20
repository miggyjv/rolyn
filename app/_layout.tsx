import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen
        name="filter"
        options={{
          title: "Filter",
          headerBackTitle: "Back",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="job-details"
        options={{
          title: "Job Details",
          headerBackTitle: "Back",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="search-results"
        options={{
          title: "Top Results",
          headerBackTitle: "Back",
          presentation: "card",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
