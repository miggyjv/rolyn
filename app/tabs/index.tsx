import { useCallback, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabaseClient";
import RecCards from "@/components/RecCards";
import SearchBar from "@/components/SearchBar";
import Loading from "@/components/Loading";

interface JobPost {
  id: string;
  employer_id: string;
  
  // Basic Job Info
  position: 'Domestic Helper' | 'Nanny' | 'Driver' | 'Cook' | 'Gardener' | 
           'Elderly Caregiver' | 'Housekeeper' | 'All-Around Helper' | 
           'Tutor' | 'Pet Caregiver' | 'Other';
  job_type: 'Live-in' | 'Live-out' | 'Part-time';
  
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
  status: 'active' | 'filled' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

export default function WorkerHomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([]);
  const [nearbyJobs, setNearbyJobs] = useState<JobPost[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobPost[]>([]);
  
  const fetchJobs = useCallback(async () => {
    try {
      // Fetch recent job postings
      const { data: recentData, error: recentError } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;
      setRecentJobs(recentData || []);

      // Fetch nearby jobs (assuming we have location data)
      const { data: nearbyData, error: nearbyError } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (nearbyError) throw nearbyError;
      setNearbyJobs(nearbyData || []);

      // Fetch recommended jobs (based on worker's skills/preferences)
      const { data: recommendedData, error: recommendedError } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recommendedError) throw recommendedError;
      setRecommendedJobs(recommendedData || []);

    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, [fetchJobs]);

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
      
      {/* Recent Jobs */}
      <RecCards
        cardData={recentJobs}
        title="Recent Job Postings"
        cardType="job"
      />

      {/* Nearby Jobs */}
      <RecCards
        cardData={nearbyJobs}
        title="Jobs Near You"
        cardType="job"
      />

      {/* Recommended Jobs */}
      <RecCards
        cardData={recommendedJobs}
        title="Recommended for You"
        cardType="job"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
