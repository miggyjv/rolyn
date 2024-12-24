// ProfileScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Image,
} from "react-native";
import { supabase } from "@/utils/supabaseClient";
import Loading from "@/components/Loading";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { decode as atob } from "base-64";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  age: string;
  religion: string;
  maritalStatus: string;
  numberOfKids: string;
  educationLevel: string;
  currentResidence: string;
  position: string;
  yearsOfExperience: string;
  currentWorkStatus: string;
  jobStartDate: string;
  expectedMonthlySalary: string;
  accommodations: string;
  workingCountry: string;
  aboutYou: string;
  languageInput: string;
  skillInput: string;
  languages: Tag[];
  skills: Tag[];
  image: string | null;
  jobType: string;
}

interface Tag {
  id: number;
  label: string;
}

const positionOptions = [
  "Select a position",
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

const educationLevels = [
  "Select education level",
  "Primary School",
  "Secondary School",
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

const accommodationTypes = [
  "Select accommodation preference",
  "Live-in Required",
  "Live-out Required",
  "Live-in Preferred",
  "Live-out Preferred",
  "Flexible (Live-in or Live-out)",
  "Other",
];

const workStatusOptions = [
  "Select work status",
  "Available",
  "Currently Employed",
  "Available Next Month",
  "Other",
];

const maritalStatusOptions = [
  "Select marital status",
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Other",
];

const jobTypeOptions = [
  "Select job type",
  "Full-time",
  "Part-time",
  "Temporary",
  "Contract",
  "Freelance",
  "Other",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
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
  },
  submitButton: {
    backgroundColor: "#4A2D8B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  // Modal styles
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
  // Image upload styles
  imageUploadButton: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F8F8",
    marginBottom: 20,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
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
  // Tag styles
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
    padding: 10,
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
    marginRight: 5,
  },
  removeTag: {
    fontSize: 18,
    color: "#4A2D8B",
    fontWeight: "600",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: "#4A2D8B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

// Add Modal components
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
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
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
    </TouchableOpacity>
  </Modal>
);

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"worker" | "employer" | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    age: "",
    religion: "",
    maritalStatus: "",
    numberOfKids: "",
    educationLevel: "",
    currentResidence: "",
    position: "",
    yearsOfExperience: "",
    currentWorkStatus: "",
    jobStartDate: "",
    expectedMonthlySalary: "",
    accommodations: "",
    workingCountry: "",
    aboutYou: "",
    languageInput: "",
    skillInput: "",
    languages: [],
    skills: [],
    image: null,
    jobType: "",
  });
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [showWorkStatusModal, setShowWorkStatusModal] = useState(false);
  const [showMaritalStatusModal, setShowMaritalStatusModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setUserRole(null);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          setError("Failed to load profile");
          return;
        }

        setUserRole(profile?.role || null);

        if (profile?.role === "worker") {
          const { data: professional, error: professionalError } =
            await supabase
              .from("professionals")
              .select("*")
              .eq("user_id", session.user.id)
              .single();

          if (!professionalError && professional) {
            setFormData({
              firstName: professional.name?.split(" ")[0] || "",
              lastName: professional.name?.split(" ")[1] || "",
              age: professional.age?.toString() || "",
              religion: professional.religion || "",
              maritalStatus: professional.marital_status || "",
              numberOfKids: professional.number_of_kids?.toString() || "",
              educationLevel: professional.education_level || "",
              currentResidence: professional.location || "",
              position: professional.position || "",
              yearsOfExperience: professional.work_experience || "",
              currentWorkStatus: professional.curr_status || "",
              jobStartDate: professional.start_date || "",
              expectedMonthlySalary: professional.expected_salary || "",
              accommodations: professional.accommodation_pref || "",
              workingCountry: professional.working_country || "",
              aboutYou: professional.personal_description || "",
              image: professional.image || null,
              languages: (professional.languages || []).map((lang) => ({
                id: Date.now() + Math.random(),
                label: lang,
              })),
              skills: (professional.skills || []).map((skill) => ({
                id: Date.now() + Math.random(),
                label: skill,
              })),
              languageInput: "",
              skillInput: "",
              jobType: professional.job_type || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const validateForm = () => {
    const required = [
      "firstName",
      "lastName",
      "age",
      "position",
      "currentWorkStatus",
      "expectedMonthlySalary",
    ];

    const missing = required.filter((field) => !formData[field]);
    if (missing.length > 0) {
      Alert.alert("Required Fields", "Please fill in all required fields");
      return false;
    }

    if (formData.languages.length === 0) {
      Alert.alert("Languages Required", "Please add at least one language");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert("Error", "Please log in to update your profile");
        return;
      }

      if (userRole === "worker") {
        const professionalData = {
          user_id: session.user.id,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          age: parseInt(formData.age) || null,
          religion: formData.religion,
          marital_status: formData.maritalStatus,
          number_of_kids:
            formData.numberOfKids === ""
              ? null
              : parseInt(formData.numberOfKids),
          education_level: formData.educationLevel,
          location: formData.currentResidence,
          position: formData.position,
          job_type: formData.jobType,
          work_experience: formData.yearsOfExperience,
          curr_status: formData.currentWorkStatus,
          start_date: formData.jobStartDate,
          expected_salary: formData.expectedMonthlySalary,
          accommodation_pref: formData.accommodations,
          working_country: formData.workingCountry,
          personal_description: formData.aboutYou,
          languages: formData.languages.map((lang) => lang.label),
          skills: formData.skills.map((skill) => skill.label),
          image: formData.image,
        };

        const { error } = await supabase
          .from("professionals")
          .upsert([professionalData], {
            onConflict: "user_id",
          });

        if (error) throw error;
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUrl = await uploadImageToSupabase(result.assets[0].uri);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const addLanguage = () => {
    if (formData.languageInput?.trim()) {
      setFormData((prev) => ({
        ...prev,
        languages: [
          ...(prev.languages || []),
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
        skills: [
          ...(prev.skills || []),
          { id: Date.now(), label: formData.skillInput.trim() },
        ],
        skillInput: "",
      }));
    }
  };

  const removeLanguage = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  };

  const removeSkill = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  const onDateChange = (event: any, selected: Date | undefined) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
      const formattedDate = selected.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, jobStartDate: formattedDate }));
    }
  };

  if (loading) return <Loading />;

  if (!userRole) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Please log in to access your profile.
        </Text>
      </View>
    );
  }

  if (userRole !== "worker") {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          This profile section is only available for workers.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            loadProfile();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={pickImage}
          disabled={uploadingImage}
        >
          {formData.image ? (
            <Image
              source={{ uri: formData.image }}
              style={styles.uploadedImage}
            />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.placeholderText}>
                {uploadingImage ? "Uploading..." : "Upload Profile Picture"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.firstName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, firstName: text }))
            }
            placeholder="Enter your first name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.lastName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, lastName: text }))
            }
            placeholder="Enter your last name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.textInput}
            value={formData.age}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, age: text }))
            }
            placeholder="Enter your age"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Religion</Text>
          <TextInput
            style={styles.textInput}
            value={formData.religion}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, religion: text }))
            }
            placeholder="Enter your religion"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Marital Status</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowMaritalStatusModal(true)}
          >
            <Text
              style={
                formData.maritalStatus
                  ? styles.optionText
                  : styles.placeholderText
              }
            >
              {formData.maritalStatus || "Select marital status"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Number of Kids</Text>
          <TextInput
            style={styles.textInput}
            value={formData.numberOfKids}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, numberOfKids: text }))
            }
            placeholder="Enter number of kids"
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.sectionTitle}>Professional Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Position Looking For</Text>
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Years of Experience</Text>
          <TextInput
            style={styles.textInput}
            value={formData.yearsOfExperience}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, yearsOfExperience: text }))
            }
            placeholder="Enter years of experience"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Work Status</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowWorkStatusModal(true)}
          >
            <Text
              style={
                formData.currentWorkStatus
                  ? styles.optionText
                  : styles.placeholderText
              }
            >
              {formData.currentWorkStatus || "Select work status"}
            </Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Preferred Start Date</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={
                formData.jobStartDate
                  ? styles.optionText
                  : styles.placeholderText
              }
            >
              {formData.jobStartDate || "Select start date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expected Monthly Salary</Text>
          <TextInput
            style={styles.textInput}
            value={formData.expectedMonthlySalary}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, expectedMonthlySalary: text }))
            }
            placeholder="Enter expected salary"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Accommodation Preference</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowAccommodationModal(true)}
          >
            <Text
              style={
                formData.accommodations
                  ? styles.optionText
                  : styles.placeholderText
              }
            >
              {formData.accommodations || "Select accommodation preference"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Education Level</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowEducationModal(true)}
          >
            <Text
              style={
                formData.educationLevel
                  ? styles.optionText
                  : styles.placeholderText
              }
            >
              {formData.educationLevel || "Select education level"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Location</Text>
          <TextInput
            style={styles.textInput}
            value={formData.currentResidence}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, currentResidence: text }))
            }
            placeholder="Enter your current location"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Preferred Working Country</Text>
          <TextInput
            style={styles.textInput}
            value={formData.workingCountry}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, workingCountry: text }))
            }
            placeholder="Enter preferred working country"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>About You</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={formData.aboutYou}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, aboutYou: text }))
            }
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Languages</Text>
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.textInput, styles.tagInputField]}
              value={formData.languageInput}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, languageInput: text }))
              }
              placeholder="Add a language"
            />
            <TouchableOpacity style={styles.addButton} onPress={addLanguage}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsList}>
            {formData.languages?.map((lang) => (
              <View key={lang.id} style={styles.tag}>
                <Text style={styles.tagLabel}>{lang.label}</Text>
                <TouchableOpacity onPress={() => removeLanguage(lang.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Skills</Text>
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.textInput, styles.tagInputField]}
              value={formData.skillInput}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, skillInput: text }))
              }
              placeholder="Add a skill"
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsList}>
            {formData.skills?.map((skill) => (
              <View key={skill.id} style={styles.tag}>
                <Text style={styles.tagLabel}>{skill.label}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || isSaving) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading || isSaving}
        >
          <Text style={styles.submitButtonText}>
            {isSaving ? "Saving..." : "Update Profile"}
          </Text>
        </TouchableOpacity>

        <SelectionModal
          visible={showMaritalStatusModal}
          onClose={() => setShowMaritalStatusModal(false)}
          title="Select Marital Status"
          options={maritalStatusOptions}
          selectedValue={formData.maritalStatus}
          onSelect={(value) =>
            setFormData((prev) => ({ ...prev, maritalStatus: value }))
          }
        />

        <SelectionModal
          visible={showPositionModal}
          onClose={() => setShowPositionModal(false)}
          title="Select Position"
          options={positionOptions}
          selectedValue={formData.position}
          onSelect={(value) =>
            setFormData((prev) => ({ ...prev, position: value }))
          }
        />

        <SelectionModal
          visible={showEducationModal}
          onClose={() => setShowEducationModal(false)}
          title="Select Education Level"
          options={educationLevels}
          selectedValue={formData.educationLevel}
          onSelect={(value) =>
            setFormData((prev) => ({ ...prev, educationLevel: value }))
          }
        />

        <SelectionModal
          visible={showAccommodationModal}
          onClose={() => setShowAccommodationModal(false)}
          title="Select Accommodation Preference"
          options={accommodationTypes}
          selectedValue={formData.accommodations}
          onSelect={(value) =>
            setFormData((prev) => ({ ...prev, accommodations: value }))
          }
        />

        <SelectionModal
          visible={showWorkStatusModal}
          onClose={() => setShowWorkStatusModal(false)}
          title="Select Work Status"
          options={workStatusOptions}
          selectedValue={formData.currentWorkStatus}
          onSelect={(value) =>
            setFormData((prev) => ({ ...prev, currentWorkStatus: value }))
          }
        />

        <SelectionModal
          visible={showJobTypeModal}
          onClose={() => setShowJobTypeModal(false)}
          title="Select Job Type"
          options={jobTypeOptions}
          selectedValue={formData.jobType}
          onSelect={(value) =>
            setFormData((prev) => ({ ...prev, jobType: value }))
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
