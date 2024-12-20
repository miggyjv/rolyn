import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { FontAwesome } from "@expo/vector-icons";
import RecCards from "@/components/RecCards";

interface Professional {
  id: number;
  image: string;
  name: string;
  position: string;
  languages: string[];
  skills: string[];
  start_date: string | Date;
  work_experience: string;
  personal_description: string;
  phone_number: string;
  age: number;
  education_level: string;
  job_type: string;
  curr_status: string;
  expected_salary: string;
  accommodation_pref: string;
  location: string;
}

export default function SearchResults() {
  const { searchQuery } = useLocalSearchParams();
  const [searchResults, setSearchResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Search Query received:", searchQuery);

    const fetchSearchResults = async () => {
      try {
        const query = supabase.from("professionals").select("*");
        console.log("Base query:", query);

        // Test the base query
        const { data: testData, error: testError } = await query;
        console.log(
          "Test query results:",
          testData?.length,
          "professionals found"
        );

        if (testError) {
          console.error("Test query error:", testError);
          return;
        }

        // Process the searchQuery by splitting into words
        const words = String(searchQuery).split(" ").filter(Boolean);

        // Create conditions for each word in multiple columns
        // Columns: languages, skills, position, name, location
        let conditions: string[] = [];
        for (const w of words) {
          const trimmedWord = w.trim();
          if (trimmedWord) {
            conditions.push(`languages.ilike.%${trimmedWord}%`);
            conditions.push(`skills.ilike.%${trimmedWord}%`);
            conditions.push(`position.ilike.%${trimmedWord}%`);
            conditions.push(`name.ilike.%${trimmedWord}%`);
            conditions.push(`location.ilike.%${trimmedWord}%`);
          }
        }

        // Join all conditions with commas (Supabase OR syntax)
        const orQuery = conditions.join(",");

        const { data, error } = await supabase
          .from("professionals")
          .select("*")
          .or(orQuery);

        console.log("Search results:", data?.length, "matches found");

        if (error) {
          console.error("Search query error:", error);
          throw error;
        }

        setSearchResults(data || []);
      } catch (error) {
        console.error("Error details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <FontAwesome name="search" size={20} color="#666" />
          <Text style={styles.headerText}>Searching...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Finding matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="search" size={20} color="#666" />
        <Text style={styles.headerText}>
          Search results for "{searchQuery}"
        </Text>
      </View>

      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {searchResults.length}{" "}
          {searchResults.length === 1 ? "match" : "matches"} found
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          <RecCards cardData={searchResults} title="" vertical={true} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    color: "#333",
  },
  resultCount: {
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  resultCountText: {
    fontSize: 14,
    color: "#666",
  },
  scrollContainer: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});
