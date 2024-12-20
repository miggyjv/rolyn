import React, { useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Filter() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("");

  // State for filter values
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedPayRange, setSelectedPayRange] = useState({
    min: "",
    max: "",
  });
  const [selectedExperience, setSelectedExperience] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const positions = [
    "Chef",
    "Cleaner",
    "Driver",
    "Gardener",
    "Nanny",
    "Security Guard",
    "Tutor",
    "Maid",
    "Cook",
    "Chauffeur",
    "Housekeeper",
    "Caregiver",
    "Butler",
  ];

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "On-call",
  ];

  const languages = [
    "English",
    "Mandarin",
    "Malay",
    "Tamil",
    "Hindi",
    "Filipino",
    "Thai",
    "Indonesian",
  ];

  const experienceLevels = [
    "Entry Level (0-1 years)",
    "Junior (1-3 years)",
    "Mid-Level (3-5 years)",
    "Senior (5-10 years)",
    "Expert (10+ years)",
  ];

  const filterOptions = [
    { id: 1, title: "Position", value: selectedPosition },
    { id: 2, title: "Job Type", value: selectedJobType },
    { id: 3, title: "Languages", value: selectedLanguages.join(", ") },
    { id: 4, title: "Skills Required", value: selectedSkills.join(", ") },
  ];

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

      case "Pay Range":
        return (
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Minimum salary"
              value={selectedPayRange.min}
              onChangeText={(text) =>
                setSelectedPayRange((prev) => ({ ...prev, min: text }))
              }
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Maximum salary"
              value={selectedPayRange.max}
              onChangeText={(text) =>
                setSelectedPayRange((prev) => ({ ...prev, max: text }))
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

      case "Experience Level":
        return (
          <ScrollView>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedExperience(level);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedExperience === level && styles.selectedOption,
                  ]}
                >
                  {level}
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
    setSelectedPosition("");
    setSelectedJobType("");
    setSelectedLanguages([]);
    setSelectedSkills([]);
    setSelectedPayRange({ min: "", max: "" });
    setSelectedExperience("");
    setSkillInput("");
  };

  const applyFilters = () => {
    // Combine all filters into a single spaced string
    const filtersArray = [
      selectedPosition,
      selectedJobType,
      ...selectedLanguages,
      ...selectedSkills,
      selectedPayRange.min && selectedPayRange.max
        ? `${selectedPayRange.min}-${selectedPayRange.max}`
        : "",
      selectedExperience,
    ].filter(Boolean); // remove empty strings

    const searchQuery = filtersArray.join(" ");

    // Navigate to search-results with the combined query
    router.push({
      pathname: "/search-results",
      params: { searchQuery },
    });
  };

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
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.filterItem}
              onPress={() => {
                handleFilterPress(option.title);
              }}
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

          {/* APPLY FILTERS BUTTON */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters
            </Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  doneButton: {
    backgroundColor: "#4A2D8B",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mainContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: 20,
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
    shadowColor: "#4A2D8B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
