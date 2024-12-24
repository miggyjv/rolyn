import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';
import RecCards from '@/components/RecCards';
import Loading from '@/components/Loading';

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

export default function EmployerDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myJobPosts, setMyJobPosts] = useState([]);
  const [recentWorkers, setRecentWorkers] = useState<WorkerProfile[]>([]);
  const [matchingWorkers, setMatchingWorkers] = useState<WorkerProfile[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log("Starting fetchDashboardData");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);
      
      // Even if no user, still fetch professionals
      const { data: workers, error: workersError } = await supabase
        .from('professionals')
        .select('*');

      console.log("Workers data:", workers);
      console.log("Workers error:", workersError);

      if (workersError) {
        console.error('Error fetching workers:', workersError);
        throw workersError;
      }
      
      setRecentWorkers(workers || []);
      setMatchingWorkers(workers || []);

      // Only fetch job posts if we have a user
      if (session?.user) {
        const { data: jobPosts, error: jobsError } = await supabase
          .from('job_posts')
          .select('*')
          .eq('employer_id', session.user.id)
          .order('created_at', { ascending: false });

        console.log("Job posts:", jobPosts, "Error:", jobsError);

        if (jobsError) throw jobsError;
        setMyJobPosts(jobPosts || []);
      }

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
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
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/tabs/newpost')}
      >
        <Text style={styles.createButtonText}>Create New Job Post</Text>
      </TouchableOpacity>

      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text>Job Posts Count: {myJobPosts.length}</Text>
        <Text>Recent Workers Count: {recentWorkers.length}</Text>
        <Text>Matching Workers Count: {matchingWorkers.length}</Text>
      </View>

      {/* My Job Posts */}
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

      {/* Recent Workers */}
      {recentWorkers.length > 0 ? (
        <RecCards
          cardData={recentWorkers}
          title="Recent Workers"
          cardType="worker"
        />
      ) : (
        <Text style={styles.emptyText}>No workers available</Text>
      )}

      {/* Matching Workers */}
      {matchingWorkers.length > 0 ? (
        <RecCards
          cardData={matchingWorkers}
          title="Matching Your Requirements"
          cardType="worker"
        />
      ) : (
        <Text style={styles.emptyText}>No matching workers found</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#6B46C1',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    margin: 15,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontStyle: 'italic',
  },
}); 