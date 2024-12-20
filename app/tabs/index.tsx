import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

import { FontAwesome } from "@expo/vector-icons";

import RecCards from "@/components/RecCards";
import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

// This is the icon data for each of the "services" provided
const iconData = [
  { id: 1, name: "home", label: "Cleaning" },
  { id: 2, name: "user-circle", label: "Nannying" },
  { id: 3, name: "paper-plane-o", label: "Tutoring" },
  { id: 4, name: "leaf", label: "Gardening" },
  { id: 5, name: "spoon", label: "Cooking" },
  { id: 6, name: "car", label: "Driving" },
  // MORE SERVICES AS NEEDED
];

// const cardData = [
//   {
//     id: 1,
//     image: "https://via.placeholder.com/150",
//     title: "Pat Gelsinger",
//     positionNeeded: "Cleaner, Tutor",
//     skills: "Tagalog, French, Math",
//     distance: "50 km",
//     startDateFlexibility: "~24 Hours",
//   },
//   {
//     id: 2,
//     image: "https://via.placeholder.com/150",
//     title: "Lisa Su",
//     positionNeeded: "Cook",
//     skills: "Mandarin",
//     distance: "100 km",
//     startDateFlexibility: "~2 Days",
//   },
//   {
//     id: 3,
//     image: "https://via.placeholder.com/150",
//     title: "Jensen Huang",
//     positionNeeded: "Driver",
//     skills: "English, Mandarin",
//     distance: "20 km",
//     startDateFlexibility: "~1 Day",
//   },
//   // Add more cards as needed
// ];

export default function HomePage() {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const [allData, setAllData] = useState([]); // all profs (for debugging)

  const [recommendedData, setCardData] = useState([]); // recommended for you professionals
  const [fastestNearYouCardData, setFastestNearYouCardData] = useState([]); // fastest near you professionals
  const [homeCareForYouCardData, setHomeCareForYouCardData] = useState([]); // homecare professionals
  const [mandarinCardData, setMandarinCardData] = useState([]); // mandarin professionals

  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const handleSearchPress = () => {
    if (searchText.trim()) {
      router.push({
        pathname: "/search-results",
        params: { searchQuery: searchText.trim() },
      });
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  // Fetch PROFESSIONALS data from Supabase
  const fetchProfessionals = async () => {
    try {
      // 1. Recommended for You
      let {
        data: recommendedData,
        error: recommendedError,
        status: recommendedStatus,
      } = await supabase
        .from("professionals")
        .select("*")
        .order("work_experience", { ascending: false })
        .limit(5);

      if (recommendedError && recommendedStatus !== 406)
        throw recommendedError;
      if (recommendedData) setCardData(recommendedData);

      // 2. Fastest Near You
      let {
        data: fastestData,
        error: fastestError,
        status: fastestStatus,
      } = await supabase
        .from("professionals")
        .select("*")
        .order("start_date", { ascending: true })
        .lt("distance", 50)
        .limit(5);
      if (fastestError && fastestStatus !== 406) throw fastestError;
      if (fastestData) setFastestNearYouCardData(fastestData);

      // 3. Home Care for You
      let {
        data: homeCareData,
        error: homeCareError,
        status: homeCareStatus,
      } = await supabase
        .from("professionals")
        .select("*")
        .ilike("position", "%Cleaner%")
        .order("distance", { ascending: true })
        .limit(5);
      if (homeCareError && homeCareStatus !== 406) throw homeCareError;
      if (homeCareData) setHomeCareForYouCardData(homeCareData);

      // 4. Mandarin Professionals
      let {
        data: mandarinData,
        error: mandarinError,
        status: mandarinStatus,
      } = await supabase
        .from("professionals")
        .select("*")
        .ilike("languages", "%Mandarin%")
        .order("distance", { ascending: true })
        .limit(5);
      if (mandarinError && mandarinStatus !== 406) throw mandarinError;
      if (mandarinData) setMandarinCardData(mandarinData);

      // 4. ALL (for debugging)
      let {
        data: allData,
        error: allDataError,
        status: allDataStatus,
      } = await supabase.from("professionals").select("*");
      if (allDataError && allDataStatus !== 406) throw allDataError;
      if (allData) setAllData(allData);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  };

  // Add onRefresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProfessionals().then(() => setRefreshing(false));
  }, []);

  // Modify your existing useEffect to use fetchProfessionals
  useEffect(() => {
    fetchProfessionals();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            placeholderTextColor={"#999"}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleSearchPress}
          >
            <FontAwesome size={20} name="search" color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => {
              console.log("Filter button pressed");
              router.push({ pathname: "/tabs/Filter" });
            }}
          >
            <FontAwesome size={20} name="filter" color={"white"} />
          </TouchableOpacity>
        </View>

        {/* RecCards Sections */}
        <View style={styles.section}>
          <RecCards
            cardData={recommendedData}
            title={"Professionals Recommended For You"}
          />
        </View>

        <View style={styles.section}>
          <RecCards
            cardData={fastestNearYouCardData}
            title={"Fastest Near You"}
          />
        </View>

        <View style={styles.section}>
          <RecCards
            cardData={homeCareForYouCardData}
            title={"Home Care Providers for You"}
          />
        </View>

        <View style={styles.section}>
          <RecCards cardData={mandarinCardData} title={"Fluent in Mandarin"} />
        </View>

        <View style={styles.section}>
          <RecCards cardData={allData} title={"All"} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  locationButton: {
    backgroundColor: "#6B46C1",
    padding: 12,
    borderRadius: 8,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 5,
    color: "#2D3748",
  },
  iconContainer: {
    width: 85,
    height: 85,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconLabel: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  card: {
    width: width * 0.6,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 16,
    padding: 10,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // CARD RECOMMENDATION INFO
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#2D3748",
  },
  cardPositionNeeded: {
    fontSize: 15,
    color: "#4A5568",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: "#4A5568",
  },
});
