import { useCallback, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { supabase } from "@/utils/supabaseClient";
import RecCards from "@/components/RecCards";
import SearchBar from "@/components/SearchBar";
import Loading from "@/components/Loading";

interface JobPost {
  id: string;
  employer_id: string;

  // Basic Job Info
  position:
    | "Domestic Helper"
    | "Nanny"
    | "Driver"
    | "Cook"
    | "Gardener"
    | "Elderly Caregiver"
    | "Housekeeper"
    | "All-Around Helper"
    | "Tutor"
    | "Pet Caregiver"
    | "Other";
  job_type: "Live-in" | "Live-out" | "Part-time";

  // Household Details
  household_size?: number;
  has_children: boolean;
  number_of_children?: number;
  children_ages?: string[];
  has_elderly: boolean;
  has_pets: boolean;
  pets_details?: string;

  // Job Requirements
  required_languages: string[];
  required_skills?: string[];
  experience_years?: number;
  education_requirement?: string;

  // Location & Accommodation
  location: string;
  accommodation_provided: boolean;
  accommodation_type?: string;

  // Schedule & Compensation
  work_schedule?: string;
  day_off?: string;
  salary_range: string;
  benefits?: string[];

  // Additional Details
  duties?: string[];
  start_date?: string;
  description?: string;

  // Status Management
  status: "active" | "filled" | "closed" | "draft";
  created_at: string;
  updated_at: string;
}

interface WorkerProfile {
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

interface UserProfile {
  role: "employer" | "worker";
}

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<"employer" | "worker" | null>(null);

  // For employers
  const [recentWorkers, setRecentWorkers] = useState<WorkerProfile[]>([]);
  const [nearbyWorkers, setNearbyWorkers] = useState<WorkerProfile[]>([]);
  const [recommendedWorkers, setRecommendedWorkers] = useState<WorkerProfile[]>(
    []
  );

  // For workers
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([]);
  const [nearbyJobs, setNearbyJobs] = useState<JobPost[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobPost[]>([]);

  const fetchUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setUserRole(profileData.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchWorkers = async () => {
    try {
      // Fetch recent workers
      const { data: recentData, error: recentError } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentWorkers(recentData || []);

      // Fetch nearby workers
      const { data: nearbyData, error: nearbyError } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (nearbyError) throw nearbyError;
      setNearbyWorkers(nearbyData || []);

      // Fetch recommended workers
      const { data: recommendedData, error: recommendedError } = await supabase
        .from("professionals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recommendedError) throw recommendedError;
      setRecommendedWorkers(recommendedData || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      // Fetch recent jobs
      const { data: recentData, error: recentError } = await supabase
        .from("job_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentJobs(recentData || []);

      // Fetch nearby jobs
      const { data: nearbyData, error: nearbyError } = await supabase
        .from("job_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (nearbyError) throw nearbyError;
      setNearbyJobs(nearbyData || []);

      // Fetch recommended jobs
      const { data: recommendedData, error: recommendedError } = await supabase
        .from("job_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recommendedError) throw recommendedError;
      setRecommendedJobs(recommendedData || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      await fetchUserRole();
      if (userRole === "employer") {
        await fetchWorkers();
      } else if (userRole === "worker") {
        await fetchJobs();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <SearchBar />

      {userRole === "employer" ? (
        // Show workers/professionals for employers
        <>
          <RecCards
            cardData={recentWorkers}
            title="Recent Professionals"
            cardType="worker"
          />
          <RecCards
            cardData={nearbyWorkers}
            title="Professionals Near You"
            cardType="worker"
          />
          <RecCards
            cardData={recommendedWorkers}
            title="Recommended Professionals"
            cardType="worker"
          />
        </>
      ) : (
        // Show job postings for workers
        <>
          <RecCards
            cardData={recentJobs}
            title="Recent Job Postings"
            cardType="job"
          />
          <RecCards
            cardData={nearbyJobs}
            title="Jobs Near You"
            cardType="job"
          />
          <RecCards
            cardData={recommendedJobs}
            title="Recommended for You"
            cardType="job"
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
