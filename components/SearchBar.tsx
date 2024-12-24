import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from "@expo/vector-icons";

export default function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const handleSearchPress = () => {
    const trimmedSearch = searchText.trim();
    if (trimmedSearch) {
      router.push({
        pathname: "/search-results",
        params: { searchQuery: trimmedSearch },
      });
    }
  };

  return (
    <View style={styles.header}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search jobs..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
        accessibilityLabel="Search input"
        accessibilityHint="Enter text to search for jobs"
      />
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSearchPress}
        accessibilityLabel="Search"
      >
        <FontAwesome size={20} name="search" color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("/tabs/Filter")}
        accessibilityLabel="Filter"
      >
        <FontAwesome size={20} name="filter" color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  searchBar: {
    height: 45,
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: "#6B46C1",
    padding: 12,
    borderRadius: 8,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
}); 