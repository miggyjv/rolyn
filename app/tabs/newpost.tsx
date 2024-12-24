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
  employer_id: string;
  position: string;
  job_type: "Full-time" | "Part-time" | "Temporary" | "Contract" | "Other";
  required_languages: Tag[];
  required_skills: Tag[];
  location: string;
  salary_range: string;
  accommodation_provided: boolean;
  accommodation_type: string;
  accommodation_details: string;
  start_date: string;
  description: string;
  household_size: number;
  has_children: boolean;
  has_elderly: boolean;
  has_pets: boolean;
  education_required: string;
  // Form utilities
  languageInput: string;
  skillInput: string;
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
    employer_id: "",
    position: "",
    job_type: "Select job type" as
      | "Full-time"
      | "Part-time"
      | "Temporary"
      | "Contract"
      | "Other",
    required_languages: [],
    required_skills: [],
    location: "",
    salary_range: "",
    accommodation_provided: false,
    accommodation_type: "",
    accommodation_details: "",
    start_date: "",
    description: "",
    household_size: 0,
    has_children: false,
    has_elderly: false,
    has_pets: false,
    education_required: "",
    languageInput: "",
    skillInput: "",
  });

  // Handlers for adding tags
  const addLanguage = () => {
    if (formData.languageInput?.trim()) {
      setFormData((prev) => ({
        ...prev,
        required_languages: [
          ...prev.required_languages,
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
        required_skills: [
          ...prev.required_skills,
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
      required_languages: prev.required_languages.filter(
        (lang) => lang.id !== id
      ),
    }));
  };

  const removeSkill = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((skill) => skill.id !== id),
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
      // Validate job type before submitting
      if (formData.job_type === "Select job type") {
        Alert.alert("Error", "Please select a job type");
        return;
      }

      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      const jobData = {
        employer_id: session.user.id,
        position: formData.position,
        job_type: formData.job_type,
        required_languages: formData.required_languages.map(
          (lang) => lang.label
        ),
        required_skills: formData.required_skills.map((skill) => skill.label),
        location: formData.location,
        salary_range: formData.salary_range,
        accommodation_provided: formData.accommodation_provided,
        accommodation_type: formData.accommodation_type,
        accommodation_details: formData.accommodation_details,
        start_date: formData.start_date,
        description: formData.description,
        household_size: formData.household_size,
        has_children: formData.has_children,
        has_elderly: formData.has_elderly,
        has_pets: formData.has_pets,
        created_at: new Date().toISOString(),
        status: "active",
      };

      const { error } = await supabase.from("job_posts").insert([jobData]);

      if (error) throw error;
      Alert.alert("Success", "Job posted successfully");
      // Reset form after successful post
      setFormData({
        employer_id: "",
        position: "",
        job_type: "Select job type" as
          | "Full-time"
          | "Part-time"
          | "Temporary"
          | "Contract"
          | "Other",
        required_languages: [],
        required_skills: [],
        location: "",
        salary_range: "",
        accommodation_provided: false,
        accommodation_type: "",
        accommodation_details: "",
        start_date: "",
        description: "",
        household_size: 0,
        has_children: false,
        has_elderly: false,
        has_pets: false,
        education_required: "",
        languageInput: "",
        skillInput: "",
      });
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
  const [selectedDate, setSelectedDate] = useState(new Date());

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

        {/* Position */}
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
                formData.job_type ? styles.optionText : styles.placeholderText
              }
            >
              {formData.job_type || "Select job type"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Salary Range */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Salary Range (HKD) Per Month</Text>
          <TextInput
            style={styles.textInput}
            value={formData.salary_range}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, salary_range: text }))
            }
            placeholder="e.g., 5000-7000"
            keyboardType="numeric"
          />
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={formData.location}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, location: text }))
            }
            placeholder="Enter job location"
          />
        </View>

        {/* Start Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={
                formData.start_date ? styles.optionText : styles.placeholderText
              }
            >
              {formData.start_date || "Select start date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  setSelectedDate(selected);
                  const formattedDate = selected.toISOString().split("T")[0];
                  setFormData((prev) => ({
                    ...prev,
                    start_date: formattedDate,
                  }));
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Languages Required */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Required Languages</Text>
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
            {formData.required_languages?.map((lang) => (
              <View key={lang.id} style={styles.tag}>
                <Text style={styles.tagLabel}>{lang.label}</Text>
                <TouchableOpacity onPress={() => removeLanguage(lang.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Skills Required */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Required Skills</Text>
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.textInput, styles.tagInputField]}
              value={formData.skillInput}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, skillInput: text }))
              }
              placeholder="Add required skill"
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsList}>
            {formData.required_skills?.map((skill) => (
              <View key={skill.id} style={styles.tag}>
                <Text style={styles.tagLabel}>{skill.label}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Job Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Describe the job responsibilities, requirements, and any other important details..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Household Details */}
        <Text style={styles.sectionTitle}>Household Details</Text>

        {/* Household Size */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Household Size</Text>
          <TextInput
            style={styles.textInput}
            value={formData.household_size?.toString()}
            onChangeText={(text) =>
              setFormData((prev) => ({
                ...prev,
                household_size: parseInt(text) || 0,
              }))
            }
            placeholder="Number of people in household"
            keyboardType="numeric"
          />
        </View>

        {/* Household Composition */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Household Composition</Text>
          <View style={styles.switchesContainer}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Children Present</Text>
                <Text style={styles.switchSubLabel}>
                  Select if there are children in the household
                </Text>
              </View>
              <Switch
                value={formData.has_children}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, has_children: value }))
                }
                trackColor={{ false: "#E0E0E0", true: "#4A2D8B40" }}
                thumbColor={formData.has_children ? "#4A2D8B" : "#f4f3f4"}
                ios_backgroundColor="#E0E0E0"
              />
            </View>

            <View style={styles.switchDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Elderly Present</Text>
                <Text style={styles.switchSubLabel}>
                  Select if there are elderly people in the household
                </Text>
              </View>
              <Switch
                value={formData.has_elderly}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, has_elderly: value }))
                }
                trackColor={{ false: "#E0E0E0", true: "#4A2D8B40" }}
                thumbColor={formData.has_elderly ? "#4A2D8B" : "#f4f3f4"}
                ios_backgroundColor="#E0E0E0"
              />
            </View>

            <View style={styles.switchDivider} />

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Pets Present</Text>
                <Text style={styles.switchSubLabel}>
                  Select if there are pets in the household
                </Text>
              </View>
              <Switch
                value={formData.has_pets}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, has_pets: value }))
                }
                trackColor={{ false: "#E0E0E0", true: "#4A2D8B40" }}
                thumbColor={formData.has_pets ? "#4A2D8B" : "#f4f3f4"}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>
        </View>

        {/* Accommodation */}
        <Text style={styles.sectionTitle}>Accommodation Details</Text>

        <View style={styles.inputContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Accommodation Provided</Text>
            <Switch
              value={formData.accommodation_provided}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  accommodation_provided: value,
                }))
              }
              trackColor={{ false: "#E0E0E0", true: "#4A2D8B40" }}
              thumbColor={
                formData.accommodation_provided ? "#4A2D8B" : "#f4f3f4"
              }
            />
          </View>
        </View>

        {formData.accommodation_provided && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Accommodation Type</Text>
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => setShowAccommodationModal(true)}
              >
                <Text
                  style={
                    formData.accommodation_type
                      ? styles.optionText
                      : styles.placeholderText
                  }
                >
                  {formData.accommodation_type || "Select accommodation type"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Accommodation Details</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.accommodation_details}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    accommodation_details: text,
                  }))
                }
                placeholder="Describe the accommodation (e.g., private room, shared bathroom, amenities provided)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Posting..." : "Post Job"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <SelectionModal
        visible={showPositionModal}
        onClose={() => setShowPositionModal(false)}
        title="Select Position"
        options={positionTypes}
        selectedValue={formData.position}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, position: value }))
        }
      />

      <SelectionModal
        visible={showJobTypeModal}
        onClose={() => setShowJobTypeModal(false)}
        title="Select Job Type"
        options={jobTypes}
        selectedValue={formData.job_type}
        onSelect={(value) =>
          setFormData((prev) => ({
            ...prev,
            job_type: value as
              | "Full-time"
              | "Part-time"
              | "Temporary"
              | "Contract"
              | "Other",
          }))
        }
      />

      <SelectionModal
        visible={showAccommodationModal}
        onClose={() => setShowAccommodationModal(false)}
        title="Select Accommodation Type"
        options={accommodationTypes}
        selectedValue={formData.accommodation_type}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, accommodation_type: value }))
        }
      />

      <SelectionModal
        visible={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        title="Select Education Level"
        options={educationLevels}
        selectedValue={formData.education_required}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, education_required: value }))
        }
      />
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
    paddingTop: 12,
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
    fontSize: 20,
    fontWeight: "600",
    color: "#4A2D8B",
    marginTop: 24,
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagInputField: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#4A2D8B",
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A2D8B20",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 14,
    color: "#4A2D8B",
    marginRight: 4,
  },
  removeTag: {
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
    color: "#999",
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchesContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  switchSubLabel: {
    fontSize: 14,
    color: "#666",
  },
  switchDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
});

const SelectionModal = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    option === selectedValue && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NewPostScreen;
