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
  const params = useLocalSearchParams();
  const [results, setResults] = useState<(Professional | JobPost)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'worker' | 'employer' | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        // First get the user's role
        const { data: { user } } = await supabase.auth.getSession();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          setUserRole(profile?.role || null);

          // Search based on user role
          if (profile?.role === 'worker') {
            // Workers see job posts
            const { data, error } = await supabase
              .from('job_posts')
              .select('*')
              .textSearch('position', params.searchQuery as string)
              .eq('status', 'active');

            if (error) throw error;
            setResults(data || []);
          } else {
            // Employers see worker profiles
            const { data, error } = await supabase
              .from('professionals')
              .select('*')
              .textSearch('position', params.searchQuery as string);

            if (error) throw error;
            setResults(data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [params.searchQuery]);

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <RecCards
        cardData={results}
        title="Search Results"
        cardType={userRole === 'worker' ? 'job' : 'worker'}
        vertical={true}
      />
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
