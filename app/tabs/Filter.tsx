import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabaseClient";

export default function Filter() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("");
  const [userRole, setUserRole] = useState<"employer" | "worker" | null>(null);
  const [skillInput, setSkillInput] = useState("");

  // Fetch user role on component mount
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

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
    }

    fetchUserRole();
  }, []);

  // Employer filters (searching for workers)
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedAge, setSelectedAge] = useState({ min: "", max: "" });
  const [selectedSalary, setSelectedSalary] = useState({ min: "", max: "" });

  // Worker filters (searching for jobs)
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAccommodation, setSelectedAccommodation] = useState("");
  const [selectedHouseholdSize, setSelectedHouseholdSize] = useState("");

  const positions = [
    "Domestic Helper",
    "Nanny",
    "Driver",
    "Cook",
    "Gardener",
    "Elderly Caregiver",
    "Housekeeper",
    "All-Around Helper",
    "Tutor",
    "Pet Caregiver",
  ];

  const nationalities = [
    "Filipino",
    "Indonesian",
    "Malaysian",
    "Indian",
    "Bangladeshi",
    "Sri Lankan",
    "Myanmar",
    "Thai",
  ];

  const languages = [
    "English",
    "Mandarin",
    "Cantonese",
    "Filipino",
    "Indonesian",
    "Hindi",
    "Thai",
    "Malay",
  ];

  const jobTypes = ["Live-in", "Live-out", "Part-time"];

  const locations = [
    "Hong Kong Island",
    "Kowloon",
    "New Territories",
    "Lantau Island",
  ];

  // Define filter options based on user role
  const getFilterOptions = () => {
    if (userRole === "employer") {
      return [
        { id: 1, title: "Position", value: selectedPosition },
        { id: 2, title: "Nationality", value: selectedNationality },
        { id: 3, title: "Languages", value: selectedLanguages.join(", ") },
        { id: 4, title: "Skills", value: selectedSkills.join(", ") },
        { id: 5, title: "Experience", value: selectedExperience },
        {
          id: 6,
          title: "Age Range",
          value:
            selectedAge.min && selectedAge.max
              ? `${selectedAge.min}-${selectedAge.max}`
              : "",
        },
        {
          id: 7,
          title: "Expected Salary",
          value:
            selectedSalary.min && selectedSalary.max
              ? `${selectedSalary.min}-${selectedSalary.max}`
              : "",
        },
      ];
    } else {
      return [
        { id: 1, title: "Position", value: selectedPosition },
        { id: 2, title: "Job Type", value: selectedJobType },
        { id: 3, title: "Location", value: selectedLocation },
        { id: 4, title: "Accommodation", value: selectedAccommodation },
        {
          id: 5,
          title: "Salary Range",
          value:
            selectedSalary.min && selectedSalary.max
              ? `${selectedSalary.min}-${selectedSalary.max}`
              : "",
        },
        { id: 6, title: "Household Size", value: selectedHouseholdSize },
      ];
    }
  };

  const handleFilterPress = (filterTitle: string) => {
    setCurrentFilter(filterTitle);
    setShowModal(true);
  };

  const renderModalContent = () => {
    switch (currentFilter) {
      case "Position":
        return (
          <ScrollView>
            {positions.map((pos) => (
              <TouchableOpacity
                key={pos}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedPosition(pos);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedPosition === pos && styles.selectedOption,
                  ]}
                >
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "Job Type":
        return (
          <ScrollView>
            {jobTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedJobType(type);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedJobType === type && styles.selectedOption,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "Location":
        return (
          <ScrollView>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedLocation(loc);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedLocation === loc && styles.selectedOption,
                  ]}
                >
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "Languages":
        return (
          <ScrollView>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedLanguages((prev) =>
                    prev.includes(lang)
                      ? prev.filter((l) => l !== lang)
                      : [...prev, lang]
                  );
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedLanguages.includes(lang) && styles.selectedOption,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case "Skills":
      case "Skills Required":
        return (
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter skills (comma separated)"
              value={skillInput}
              onChangeText={setSkillInput}
            />
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setSelectedSkills(
                  skillInput
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                );
                setSkillInput("");
                setShowModal(false);
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        );

      case "Experience":
        return (
          <ScrollView>
            {["1+", "2+", "3+", "5+", "10+"].map((exp) => (
              <TouchableOpacity
                key={exp}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedExperience(exp);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedExperience === exp && styles.selectedOption,
                  ]}
                >
                  {exp} years
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "Age Range":
        return (
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Minimum age"
              value={selectedAge.min}
              onChangeText={(text) =>
                setSelectedAge((prev) => ({ ...prev, min: text }))
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Maximum age"
              value={selectedAge.max}
              onChangeText={(text) =>
                setSelectedAge((prev) => ({ ...prev, max: text }))
              }
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        );

      case "Salary Range":
      case "Expected Salary":
        return (
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Minimum salary"
              value={selectedSalary.min}
              onChangeText={(text) =>
                setSelectedSalary((prev) => ({ ...prev, min: text }))
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Maximum salary"
              value={selectedSalary.max}
              onChangeText={(text) =>
                setSelectedSalary((prev) => ({ ...prev, max: text }))
              }
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        );

      case "Accommodation":
        return (
          <ScrollView>
            {["Provided", "Not Provided"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedAccommodation(option);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedAccommodation === option && styles.selectedOption,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "Household Size":
        return (
          <ScrollView>
            {["1-2", "3-4", "5-6", "7+"].map((size) => (
              <TouchableOpacity
                key={size}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedHouseholdSize(size);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedHouseholdSize === size && styles.selectedOption,
                  ]}
                >
                  {size} persons
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const resetFilters = () => {
    if (userRole === "employer") {
      setSelectedPosition("");
      setSelectedNationality("");
      setSelectedLanguages([]);
      setSelectedSkills([]);
      setSelectedExperience("");
      setSelectedAge({ min: "", max: "" });
      setSelectedSalary({ min: "", max: "" });
    } else {
      setSelectedPosition("");
      setSelectedJobType("");
      setSelectedLocation("");
      setSelectedAccommodation("");
      setSelectedSalary({ min: "", max: "" });
      setSelectedHouseholdSize("");
    }
  };

  const applyFilters = () => {
    const filters =
      userRole === "employer"
        ? {
            position: selectedPosition,
            nationality: selectedNationality,
            languages: selectedLanguages,
            skills: selectedSkills,
            experience: selectedExperience,
            age_range: selectedAge,
            salary_range: selectedSalary,
          }
        : {
            position: selectedPosition,
            job_type: selectedJobType,
            location: selectedLocation,
            accommodation: selectedAccommodation,
            salary_range: selectedSalary,
            household_size: selectedHouseholdSize,
          };

    router.push({
      pathname: "/search-results",
      params: {
        filters: JSON.stringify(filters),
        userRole,
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
      shadowColor: "#4A2D8B",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    backButton: {
      fontSize: 24,
      marginRight: 16,
      color: "#4A2D8B",
      fontWeight: "600",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: "#4A2D8B",
    },
    mainContainer: {
      flex: 1,
      display: "flex",
      justifyContent: "space-between",
      paddingBottom: 20,
    },
    filterList: {
      flex: 1,
      paddingTop: 10,
    },
    filterItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      marginHorizontal: 12,
      marginVertical: 6,
      backgroundColor: "#F8F8F8",
      borderRadius: 12,
      shadowColor: "#4A2D8B",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    filterItemContent: {
      flex: 1,
    },
    filterText: {
      fontSize: 16,
      marginBottom: 4,
      color: "#4A2D8B",
      fontWeight: "500",
    },
    selectedValue: {
      fontSize: 14,
      color: "#666",
      marginTop: 2,
    },
    chevron: {
      fontSize: 20,
      color: "#4A2D8B",
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(74, 45, 139, 0.3)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "70%",
      shadowColor: "#4A2D8B",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 16,
      textAlign: "center",
      color: "#4A2D8B",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
      paddingBottom: 16,
    },
    modalOption: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    modalOptionText: {
      fontSize: 16,
      color: "#333",
    },
    selectedOption: {
      color: "#4A2D8B",
      fontWeight: "600",
    },
    modalInputContainer: {
      padding: 16,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: "#F8F8F8",
    },
    resetButton: {
      backgroundColor: "#fff",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#4A2D8B",
    },
    resetButtonText: {
      color: "#4A2D8B",
      fontSize: 16,
      fontWeight: "600",
    },
    applyButton: {
      backgroundColor: "#4A2D8B",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 8,
    },
    applyButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    doneButton: {
      backgroundColor: "#4A2D8B",
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 16,
    },
    doneButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  // Rest of your component remains the same...
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Filter</Text>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.filterList}>
          {getFilterOptions().map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.filterItem}
              onPress={() => handleFilterPress(option.title)}
            >
              <View style={styles.filterItemContent}>
                <Text style={styles.filterText}>{option.title}</Text>
                {option.value ? (
                  <Text style={styles.selectedValue}>{option.value}</Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentFilter}</Text>
            {renderModalContent()}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
