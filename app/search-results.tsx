import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabaseClient";
import RecCards from "@/components/RecCards";
import { JobPost, WorkerProfile } from "@/types/database";

export default function SearchResults() {
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<(JobPost | WorkerProfile)[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Memoize the filters and userRole to prevent unnecessary re-renders
  const filters = React.useMemo(
    () => JSON.parse(params.filters as string),
    [params.filters]
  );
  const userRole = React.useMemo(
    () => params.userRole as "employer" | "worker",
    [params.userRole]
  );

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query;

      if (userRole === "employer") {
        // Searching for workers (professionals table)
        query = supabase.from("professionals").select("*");

        // Apply filters
        if (filters.position) {
          query = query.eq("position", filters.position);
        }
        if (filters.nationality) {
          query = query.eq("nationality", filters.nationality);
        }
        if (filters.languages?.length) {
          query = query.contains("languages", filters.languages);
        }
        if (filters.skills?.length) {
          query = query.contains("skills", filters.skills);
        }
        if (filters.experience) {
          query = query.gte("work_experience", filters.experience);
        }
        if (filters.age_range?.min && filters.age_range?.max) {
          query = query
            .gte("age", filters.age_range.min)
            .lte("age", filters.age_range.max);
        }
        if (filters.salary_range?.min && filters.salary_range?.max) {
          query = query
            .gte("expected_salary", filters.salary_range.min)
            .lte("expected_salary", filters.salary_range.max);
        }
      } else {
        // Searching for jobs (job_posts table)
        query = supabase.from("job_posts").select("*");

        // Apply filters
        if (filters.position) {
          query = query.eq("position", filters.position);
        }
        if (filters.job_type) {
          query = query.eq("job_type", filters.job_type);
        }
        if (filters.location) {
          query = query.eq("location", filters.location);
        }
        if (filters.accommodation) {
          query = query.eq(
            "accommodation_provided",
            filters.accommodation === "Provided"
          );
        }
        if (filters.salary_range?.min && filters.salary_range?.max) {
          query = query.or(
            `salary_range.gte.${filters.salary_range.min},salary_range.lte.${filters.salary_range.max}`
          );
        }
        if (filters.household_size) {
          query = query.eq("household_size", filters.household_size);
        }

        // Only add status filter for job posts
        query = query.eq("status", "active");
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setResults(data || []);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to fetch results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, userRole]); // Only depend on filters and userRole

  // Run the fetch only once when the component mounts or when filters/userRole change
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A2D8B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.resultsCount}>
          {results.length} {results.length === 1 ? "result" : "results"} found
        </Text>
        <RecCards
          cardData={results}
          title="Search Results"
          vertical={true}
          cardType={userRole === "employer" ? "worker" : "job"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  resultsCount: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    fontWeight: "500",
  },
});
