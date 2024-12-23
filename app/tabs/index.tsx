import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from '@/hooks/useColorScheme';
import RecCards from "@/components/RecCards";
import { supabase } from "@/utils/supabaseClient";

// TypeScript interfaces
interface Professional {
  id: string;
  image?: string;
  title: string;
  position?: string;
  skills?: string[];
  distance?: number;
  start_date?: string;
  languages?: string[];
  work_experience?: number;
}

interface FetchResponse {
  data: Professional[] | null;
  error: Error | null;
}

export default function HomePage() {
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [recommendedData, setRecommendedData] = useState<Professional[]>([]);
  const [fastestNearYouData, setFastestNearYouData] = useState<Professional[]>([]);
  const [homeCareData, setHomeCareData] = useState<Professional[]>([]);
  const [mandarinData, setMandarinData] = useState<Professional[]>([]);

  const handleSearchPress = useCallback(() => {
    const trimmedSearch = searchText.trim();
    if (trimmedSearch) {
      router.push({
        pathname: "/search-results",
        params: { searchQuery: trimmedSearch },
      });
    }
  }, [searchText, router]);

  const fetchProfessionals = useCallback(async (): Promise<void> => {
    try {
      // Fetch recommended professionals
      const { data: recommendedData, error: recommendedError } = await supabase
        .from("professionals")
        .select("*")
        .order("work_experience", { ascending: false })
        .limit(5);

      if (recommendedError) throw recommendedError;
      setRecommendedData(recommendedData || []);

      // Fetch fastest near you
      const { data: fastestData, error: fastestError } = await supabase
        .from("professionals")
        .select("*")
        .order("start_date", { ascending: true })
        .lt("distance", 50)
        .limit(5);

      if (fastestError) throw fastestError;
      setFastestNearYouData(fastestData || []);

      // Fetch home care providers
      const { data: homeCareData, error: homeCareError } = await supabase
        .from("professionals")
        .select("*")
        .ilike("position", "%Cleaner%")
        .order("distance", { ascending: true })
        .limit(5);

      if (homeCareError) throw homeCareError;
      setHomeCareData(homeCareData || []);

      // Fetch Mandarin speakers
      const { data: mandarinData, error: mandarinError } = await supabase
        .from("professionals")
        .select("*")
        .ilike("languages", "%Mandarin%")
        .order("distance", { ascending: true })
        .limit(5);

      if (mandarinError) throw mandarinError;
      setMandarinData(mandarinData || []);

    } catch (error) {
      console.error("Error fetching professionals:", error);
      // Here you would use proper error logging service like Sentry
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchProfessionals();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProfessionals]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
        accessibilityLabel="Search input"
        accessibilityHint="Enter text to search for professionals"
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
        </View>
      );
    }

    return (
      <>
        <View style={styles.section}>
          <RecCards
            cardData={recommendedData}
            title="Professionals Recommended For You"
          />
        </View>

        <View style={styles.section}>
          <RecCards
            cardData={fastestNearYouData}
            title="Fastest Near You"
          />
        </View>

        <View style={styles.section}>
          <RecCards
            cardData={homeCareData}
            title="Home Care Providers for You"
          />
        </View>

        <View style={styles.section}>
          <RecCards
            cardData={mandarinData}
            title="Fluent in Mandarin"
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' && styles.darkMode]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? '#fff' : '#6B46C1'}
            colors={['#6B46C1']}
            progressBackgroundColor={colorScheme === 'dark' ? '#1A1A1A' : '#fff'}
          />
        }
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  darkMode: {
    backgroundColor: "#1A1A1A",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 20,
  },
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
  section: {
    marginVertical: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
