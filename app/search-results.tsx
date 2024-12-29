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
import Loading from "@/components/Loading";

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
  gender: string;
  nationality: string;
}

interface JobPost {
  id: string;
  employer_id: string;
  position: string;
  job_type: "Live-in" | "Live-out" | "Part-time";
  required_languages: string[];
  required_skills?: string[];
  location: string;
  salary_range: string;
  accommodation_provided: boolean;
  accommodation_type?: string;
  start_date?: string;
  description?: string;
  household_size?: number;
  has_children: boolean;
  has_elderly: boolean;
  has_pets: boolean;
  employer_references?: string[];
  preferred_start_time?: string;
}

export default function SearchResults() {
  const params = useLocalSearchParams();
  const [results, setResults] = useState<(Professional | JobPost)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"worker" | "employer" | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log("Auth check - User:", user?.id);
      console.log("Auth check - Error:", error);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchResults() {
      console.log("\n=== SEARCH STARTED ===");
      console.log("Search query:", params.searchQuery);

      try {
        // Get current user directly
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        console.log("User from auth:", user?.id);

        if (userError || !user) {
          console.log("Auth error or no user found:", userError);
          return;
        }

        // Get user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.log("Profile fetch error:", profileError);
          return;
        }

        console.log("Profile data:", profile);
        console.log("User role:", profile?.role);
        setUserRole(profile?.role || null);

        const searchQuery = params.searchQuery as string;
        console.log("Processing search for:", searchQuery);

        if (profile?.role === "worker") {
          console.log("=== WORKER SEARCH ===");
          // Split search query into words
          const searchTerms = searchQuery
            .split(" ")
            .filter((term) => term.length > 0);

          // Start with base query
          let query = supabase
            .from("job_posts")
            .select("*")
            .eq("status", "active");

          // Add filters for each search term (AND logic)
          searchTerms.forEach((term) => {
            query = query.or(
              `position.ilike.%${term}%,
               description.ilike.%${term}%,
               job_type.ilike.%${term}%,
               location.ilike.%${term}%,
               accommodation_details.ilike.%${term}%,
               pets_details.ilike.%${term}%,
               education_requirement.ilike.%${term}%,
               accommodation_type.ilike.%${term}%,
               work_schedule.ilike.%${term}%,
               day_off.ilike.%${term}%,
               salary_range.ilike.%${term}%,
               preferred_start_time.ilike.%${term}%,
               employer_references.cs.{${term}},
               benefits.cs.{${term}},
               duties.cs.{${term}},
               children_ages.cs.{${term}},
               required_languages.cs.{${term}},
               required_skills.cs.{${term}}`
            );
          });

          console.log("Query built:", query.toString());
          const { data, error } = await query;

          console.log("Job posts query completed");
          console.log("Error:", error);
          console.log("Results:", data);

          if (error) {
            console.error("Job posts search error:", error);
            throw error;
          }

          // Filter results to ensure ALL terms match
          const filteredResults = data?.filter((job) => {
            return searchTerms.every((term) => {
              const termLower = term.toLowerCase();
              return (
                job.position?.toLowerCase().includes(termLower) ||
                job.description?.toLowerCase().includes(termLower) ||
                job.job_type?.toLowerCase().includes(termLower) ||
                job.location?.toLowerCase().includes(termLower) ||
                job.accommodation_details?.toLowerCase().includes(termLower) ||
                job.pets_details?.toLowerCase().includes(termLower) ||
                job.education_requirement?.toLowerCase().includes(termLower) ||
                job.accommodation_type?.toLowerCase().includes(termLower) ||
                job.work_schedule?.toLowerCase().includes(termLower) ||
                job.day_off?.toLowerCase().includes(termLower) ||
                job.salary_range?.toLowerCase().includes(termLower) ||
                job.preferred_start_time?.toLowerCase().includes(termLower) ||
                job.employer_references?.some((ref) =>
                  ref.toLowerCase().includes(termLower)
                ) ||
                job.benefits?.some((benefit) =>
                  benefit.toLowerCase().includes(termLower)
                ) ||
                job.duties?.some((duty) =>
                  duty.toLowerCase().includes(termLower)
                ) ||
                job.children_ages?.some((age) =>
                  age.toString().toLowerCase().includes(termLower)
                ) ||
                job.required_languages?.some((lang) =>
                  lang.toLowerCase().includes(termLower)
                ) ||
                job.required_skills?.some((skill) =>
                  skill.toLowerCase().includes(termLower)
                )
              );
            });
          });

          setResults(filteredResults || []);
        } else {
          console.log("=== EMPLOYER SEARCH ===");
          const searchTerms = searchQuery
            .split(" ")
            .filter((term) => term.length > 0);

          let query = supabase.from("professionals").select("*");

          // Add filters for each search term
          searchTerms.forEach((term) => {
            query = query.or(
              `position.ilike.%${term}%,
               name.ilike.%${term}%,
               personal_description.ilike.%${term}%,
               location.ilike.%${term}%,
               education_level.ilike.%${term}%,
               work_experience.ilike.%${term}%,
               curr_status.ilike.%${term}%,
               expected_salary.ilike.%${term}%,
               accommodation_pref.ilike.%${term}%,
               working_country.ilike.%${term}%,
               job_type.ilike.%${term}%,
               religion.ilike.%${term}%,
               marital_status.ilike.%${term}%,
               gender.ilike.%${term}%,
               nationality.ilike.%${term}%,
               languages.cs.{${term}},
               skills.cs.{${term}}`
            );
          });

          console.log("Query built:", query.toString());
          const { data, error } = await query;

          if (error) {
            console.error("Professionals search error:", error);
            throw error;
          }

          // Filter results to ensure ALL terms match
          const filteredResults = data?.filter((professional) => {
            return searchTerms.every((term) => {
              const termLower = term.toLowerCase();
              return (
                professional.position?.toLowerCase().includes(termLower) ||
                professional.name?.toLowerCase().includes(termLower) ||
                professional.personal_description
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.location?.toLowerCase().includes(termLower) ||
                professional.education_level
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.work_experience
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.curr_status?.toLowerCase().includes(termLower) ||
                professional.expected_salary
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.accommodation_pref
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.working_country
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.job_type?.toLowerCase().includes(termLower) ||
                professional.religion?.toLowerCase().includes(termLower) ||
                professional.marital_status
                  ?.toLowerCase()
                  .includes(termLower) ||
                professional.gender?.toLowerCase().includes(termLower) ||
                professional.nationality?.toLowerCase().includes(termLower) ||
                professional.languages?.some((lang) =>
                  lang.toLowerCase().includes(termLower)
                ) ||
                professional.skills?.some((skill) =>
                  skill.toLowerCase().includes(termLower)
                )
              );
            });
          });

          setResults(filteredResults || []);
        }
        console.log("=== SEARCH COMPLETED ===\n");
      } catch (error) {
        console.error("=== SEARCH ERROR ===");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.searchQuery) {
      console.log("Search triggered with query:", params.searchQuery);
      fetchResults();
    } else {
      console.log("No search query provided");
      setResults([]);
      setIsLoading(false);
    }
  }, [params.searchQuery]);

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {results.length > 0 ? (
          <RecCards
            cardData={results}
            title={`Search Results for "${params.searchQuery}"`}
            cardType={userRole === "worker" ? "job" : "worker"}
            vertical={true}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No results found for "{params.searchQuery}"
            </Text>
          </View>
        )}
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
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
});
