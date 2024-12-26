import { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabaseClient";
import RecCards from "@/components/RecCards";
import Loading from "@/components/Loading";

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

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<"employer" | "worker" | null>(null);
  const [myJobPosts, setMyJobPosts] = useState([]);
  const [myProfile, setMyProfile] = useState<WorkerProfile | null>(null);
  const [recentWorkers, setRecentWorkers] = useState<WorkerProfile[]>([]);
  const [matchingWorkers, setMatchingWorkers] = useState<WorkerProfile[]>([]);

  const fetchUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setUserRole(profileData.role);
      return profileData.role;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const role = await fetchUserRole();

      if (role === "employer") {
        // Fetch employer's job posts
        const { data: jobPosts, error: jobsError } = await supabase
          .from("job_posts")
          .select("*")
          .eq("employer_id", user.id)
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;
        setMyJobPosts(jobPosts || []);

        // Fetch workers for employer view
        const { data: workers, error: workersError } = await supabase
          .from("professionals")
          .select("*");

        if (workersError) throw workersError;
        setRecentWorkers(workers || []);
        setMatchingWorkers(workers || []);
      } else if (role === "worker") {
        // Fetch worker's own profile
        const { data: workerProfile, error: profileError } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;
        setMyProfile(workerProfile);
      }
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      {userRole === "employer" ? (
        // Employer View
        <>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/tabs/newpost")}
          >
            <Text style={styles.createButtonText}>Create New Job Post</Text>
          </TouchableOpacity>

          {myJobPosts.length > 0 ? (
            <RecCards
              cardData={myJobPosts}
              title="My Job Posts"
              cardType="job"
              vertical={true}
            />
          ) : (
            <Text style={styles.emptyText}>No job posts yet</Text>
          )}

          {recentWorkers.length > 0 ? (
            <RecCards
              cardData={recentWorkers}
              title="Recent Workers"
              cardType="worker"
            />
          ) : (
            <Text style={styles.emptyText}>No workers available</Text>
          )}

          {matchingWorkers.length > 0 ? (
            <RecCards
              cardData={matchingWorkers}
              title="Matching Your Requirements"
              cardType="worker"
            />
          ) : (
            <Text style={styles.emptyText}>No matching workers found</Text>
          )}
        </>
      ) : (
        // Worker View
        <>
          {myProfile ? (
            <RecCards
              cardData={[myProfile]}
              title="My Profile"
              cardType="worker"
              vertical={true}
            />
          ) : (
            <Text style={styles.emptyText}>Profile not found</Text>
          )}
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
  createButton: {
    backgroundColor: "#6B46C1",
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  debugContainer: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    margin: 15,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
    fontStyle: "italic",
  },
});
