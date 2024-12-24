import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Modal,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabaseClient";
import { decode as atob } from "base-64";
import * as FileSystem from "expo-file-system";

// TYPE INTERFACES: Basically use this for reference of what the inputs for everything should look like
interface Tag {
  id: number;
  label: string;
}
interface NewPostScreenProps {}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

interface JobPostFormData {
  // Job Details
  jobTitle: string;
  jobType: string; // Full-time, Part-time, etc.
  position: string; // Domestic Helper, Nanny, etc.
  salary: string;
  accommodationType: string; // Live-in, Live-out
  startDate: string;
  location: string;

  // Requirements
  experienceRequired: string;
  educationRequired: string;
  languagesRequired: Tag[];
  skillsRequired: Tag[];
  agePreference: string;

  // Additional Details
  numberOfPositions: string;
  jobDescription: string;
  benefits: string;
  employerName: string;
  contactInfo: string;

  // Form Utilities
  languageInput: string;
  skillInput: string;
  image: string | null;
}

// Move all these constants outside the component, near the top of the file after the interfaces
const positionTypes = [
  "Select position",
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
  "Other",
];

const jobTypes = [
  "Select job type",
  "Full-time",
  "Part-time",
  "Temporary",
  "Contract",
  "Other",
];

const accommodationTypes = [
  "Select accommodation type",
  "Live-in Required",
  "Live-out Required",
  "Live-in Preferred",
  "Live-out Preferred",
  "Flexible",
];

const educationLevels = [
  "Select education level",
  "No Specific Requirement",
  "Primary School",
  "Secondary School",
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Other",
];

const NewPostScreen: React.FC<NewPostScreenProps> = () => {
  // COMMENTED OUT: Toggle functionality for future use
  /*
  // IMPORTANT: THIS TOGGLES BETWEEN WHETHER YOU ARE A PROVIDER OR A POSTER
  const [isServiceProvider, setIsServiceProvider] = useState<boolean>(true);
  */

  // Form Fields
  const [name, setName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Tags
  const [languageInput, setLanguageInput] = useState<string>("");
  const [skillInput, setSkillInput] = useState<string>("");
  const [languages, setLanguages] = useState<Tag[]>([]);
  const [skills, setSkills] = useState<Tag[]>([]);

  // Add new state variables after the existing ones
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [workExperience, setWorkExperience] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [employmentStatus, setEmploymentStatus] = useState<string>("");
  const [expectedSalary, setExpectedSalary] = useState<string>("");
  const [accommodation, setAccommodation] = useState<string>("");

  // Custom input fields
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);

  // Define available positions
  const servicePositions = [
    "Select a position",
    "Chef",
    "Cleaner",
    "Driver",
    "Gardener",
    "Nanny",
    "Security Guard",
    "Tutor",
    "Other",
  ];

  /* COMMENTED OUT: Job positions for future use
  const jobPositions = [
    "Select a position",
    "Maid",
    "Cook",
    "Chauffeur",
    "Housekeeper",
    "Caregiver",
    "Butler",
    "Other",
  ];
  */

  /* COMMENTED OUT: Toggle handler for future use
  const toggleSwitch = () =>
    setIsServiceProvider((previousState) => !previousState);
  */

  // Add formData state
  const [formData, setFormData] = useState<JobPostFormData>({
    jobTitle: "",
    jobType: "",
    position: "",
    salary: "",
    accommodationType: "",
    startDate: "",
    location: "",
    experienceRequired: "",
    educationRequired: "",
    languagesRequired: [],
    skillsRequired: [],
    agePreference: "",
    numberOfPositions: "",
    jobDescription: "",
    benefits: "",
    employerName: "",
    contactInfo: "",
    languageInput: "",
    skillInput: "",
    image: null,
  });

  // Handlers for adding tags
  const addLanguage = () => {
    if (formData.languageInput?.trim()) {
      setFormData((prev) => ({
        ...prev,
        languagesRequired: [
          ...prev.languagesRequired,
          { id: Date.now(), label: formData.languageInput.trim() },
        ],
        languageInput: "",
      }));
    }
  };

  const addSkill = () => {
    if (formData.skillInput?.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [
          ...prev.skillsRequired,
          { id: Date.now(), label: formData.skillInput.trim() },
        ],
        skillInput: "",
      }));
    }
  };

  // Handlers for removing tags
  const removeLanguage = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      languagesRequired: prev.languagesRequired.filter(
        (lang) => lang.id !== id
      ),
    }));
  };

  const removeSkill = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((skill) => skill.id !== id),
    }));
  };

  // Add this helper function at the top level of your component
  const uploadImageToSupabase = async (uri: string) => {
    try {
      console.log("Starting image upload process...");

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No authenticated session");
      }

      // 1. Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64) {
        throw new Error("Failed to read the selected image file.");
      }

      // 2. Convert base64 to binary (Uint8Array)
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 3. Generate a unique filename with user ID
      const timestamp = new Date().getTime();
      const filename = `${session.user.id}/${timestamp}.jpg`;
      console.log("Uploading to filename:", filename);

      // 4. Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from("professionals")
        .upload(filename, byteArray, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // 5. Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("professionals").getPublicUrl(filename);

      console.log("Upload successful. Public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Full upload error details:", error);
      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
      throw error;
    }
  };

  // Then modify the handleSubmit function
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      const jobData = {
        employer_id: session.user.id,
        title: formData.jobTitle,
        position: formData.position,
        job_type: formData.jobType,
        salary: formData.salary,
        location: formData.location,
        accommodation_type: formData.accommodationType,
        start_date: formData.startDate,
        experience_required: formData.experienceRequired,
        education_required: formData.educationRequired,
        languages_required: formData.languagesRequired.map(
          (lang) => lang.label
        ),
        skills_required: formData.skillsRequired.map((skill) => skill.label),
        age_preference: formData.agePreference,
        number_of_positions: parseInt(formData.numberOfPositions) || 1,
        job_description: formData.jobDescription,
        benefits: formData.benefits,
        employer_name: formData.employerName,
        contact_info: formData.contactInfo,
        image: formData.image,
        created_at: new Date().toISOString(),
        status: "active",
      };

      const { error } = await supabase.from("job_posts").insert([jobData]);

      if (error) throw error;
      Alert.alert("Success", "Job posted successfully");
      // Add navigation or reset form here
    } catch (error) {
      console.error("Error posting job:", error);
      Alert.alert("Error", "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  // Add these state variables
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Add this function to handle image selection
  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedUri = result.assets[0].uri;
        console.log("Selected image URI:", selectedUri);

        // Verify the image exists
        const fileInfo = await FileSystem.getInfoAsync(selectedUri);
        console.log("File info:", fileInfo);

        if (fileInfo.exists) {
          setSelectedImage(selectedUri);
        } else {
          Alert.alert("Error", "Selected image file does not exist");
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Job Details</Text>

        {/* Job Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Job Title</Text>
          <TextInput
            style={styles.textInput}
            value={formData.jobTitle}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, jobTitle: text }))
            }
            placeholder="Enter job title"
          />
        </View>

        {/* Position Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Position</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowPositionModal(true)}
          >
            <Text
              style={
                formData.position ? styles.optionText : styles.placeholderText
              }
            >
              {formData.position || "Select position"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Job Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Job Type</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowJobTypeModal(true)}
          >
            <Text
              style={
                formData.jobType ? styles.optionText : styles.placeholderText
              }
            >
              {formData.jobType || "Select job type"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Salary */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Monthly Salary (HKD)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.salary}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, salary: text }))
            }
            placeholder="Enter monthly salary"
            keyboardType="numeric"
          />
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Job Location</Text>
          <TextInput
            style={styles.textInput}
            value={formData.location}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, location: text }))
            }
            placeholder="Enter job location"
          />
        </View>

        <Text style={styles.sectionTitle}>Requirements</Text>

        {/* Experience Required */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Experience Required</Text>
          <TextInput
            style={styles.textInput}
            value={formData.experienceRequired}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, experienceRequired: text }))
            }
            placeholder="e.g., 2 years minimum"
          />
        </View>

        {/* Languages Required */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Languages Required</Text>
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.textInput, styles.tagInputField]}
              value={formData.languageInput}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, languageInput: text }))
              }
              placeholder="Add required language"
            />
            <TouchableOpacity style={styles.addButton} onPress={addLanguage}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsList}>
            {formData.languagesRequired?.map((lang) => (
              <View key={lang.id} style={styles.tag}>
                <Text style={styles.tagLabel}>{lang.label}</Text>
                <TouchableOpacity onPress={() => removeLanguage(lang.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Additional sections... */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A2D8B",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#4A2D8B",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
  },
  tagsSection: {
    marginBottom: 25,
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#4A2D8B",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#4A2D8B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  tagsList: {
    marginBottom: 15,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A2D8B20",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 14,
    color: "#4A2D8B",
    fontWeight: "500",
  },
  removeTag: {
    marginLeft: 8,
    fontSize: 18,
    color: "#4A2D8B",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4A2D8B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  imageUploadButton: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F8F8",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#4A2D8B40",
    margin: 8,
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8F8F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#4A2D8B",
  },
  optionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#4A2D8B",
    fontWeight: "600",
  },
  dateInput: {
    justifyContent: "center",
    height: 48,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default NewPostScreen;
