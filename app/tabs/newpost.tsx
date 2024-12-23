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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "../../utils/supabaseClient";
import { decode as atob } from 'base-64';
import * as FileSystem from 'expo-file-system';

// TYPE INTERFACES: Basically use this for reference of what the inputs for everything should look like
interface Tag {
  id: number;
  label: string;
}
interface NewPostScreenProps {}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

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

  // Add this with your other constants
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

  // Add this with your other constants
  const jobTypes = [
    "Select job type",
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "On-call",
    "Other",
  ];

  // Add this with your other constants
  const accommodationTypes = [
    "Select accommodation preference",
    "Live-in Required",
    "Live-out Required",
    "Live-in Preferred",
    "Live-out Preferred",
    "Flexible (Live-in or Live-out)",
    "Accommodation Provided",
    "No Accommodation Provided",
    "Other",
  ];

  // Handlers for adding tags
  const addLanguage = () => {
    if (languageInput.trim() !== "") {
      setLanguages([
        ...languages,
        { id: Date.now(), label: languageInput.trim() },
      ]);
      setLanguageInput("");
    }
  };

  const addSkill = () => {
    if (skillInput.trim() !== "") {
      setSkills([...skills, { id: Date.now(), label: skillInput.trim() }]);
      setSkillInput("");
    }
  };

  // Handlers for removing tags
  const removeLanguage = (id: number) => {
    setLanguages(languages.filter((lang) => lang.id !== id));
  };

  const removeSkill = (id: number) => {
    setSkills(skills.filter((skill) => skill.id !== id));
  };

  // Add this helper function at the top level of your component
  const uploadImageToSupabase = async (uri: string) => {
    try {
      console.log('Starting image upload process...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
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
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // 5. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('professionals')
        .getPublicUrl(filename);

      console.log('Upload successful. Public URL:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Full upload error details:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
      throw error;
    }
  };

  // Then modify the handleSubmit function
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'You must be logged in to create a post');
        return;
      }

      // Upload image first if one is selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImageToSupabase(selectedImage);
      }

      const { data, error } = await supabase
        .from('professionals')
        .insert([
          {
            name,
            position,
            personal_description: description,
            languages: languages.map((lang) => lang.label),
            skills: skills.map((skill) => skill.label),
            phone_number: phoneNumber,
            age: parseInt(age) || null,
            education_level: educationLevel,
            work_experience: workExperience,
            job_type: jobType,
            start_date: startDate,
            curr_status: employmentStatus,
            expected_salary: expectedSalary,
            accommodation_pref: accommodation,
            location,
            user_id: session.user.id,
            image: imageUrl // Add the image URL to the professional's data
          }
        ]);

      if (error) throw error;
      
      console.log("Successfully added professional:", data);
      Alert.alert("Success", "Your service has been posted successfully!");

      // Reset form
      setName("");
      setPosition("");
      setDescription("");
      setLanguages([]);
      setSkills([]);
      setPhoneNumber("");
      setAge("");
      setEducationLevel("");
      setWorkExperience("");
      setJobType("");
      setStartDate("");
      setEmploymentStatus("");
      setExpectedSalary("");
      setAccommodation("");
      setLocation("");
      setSelectedImage(null);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while creating the post');
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
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
        console.log('Selected image URI:', selectedUri);
        
        // Verify the image exists
        const fileInfo = await FileSystem.getInfoAsync(selectedUri);
        console.log('File info:', fileInfo);
        
        if (fileInfo.exists) {
          setSelectedImage(selectedUri);
        } else {
          Alert.alert('Error', 'Selected image file does not exist');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Add this UI component where you want the image upload to appear (probably near the top of your form) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Profile Photo</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={handleImagePick}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.uploadedImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.placeholderText}>Tap to upload photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* COMMENTED OUT: Toggle Section for future use
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {isServiceProvider ? "Posting a Service" : "Posting a Job Offer"}
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isServiceProvider ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isServiceProvider}
          />
        </View>
        */}

        {/* Simple header */}
        <View style={styles.headerContainer}>
          <Text style={styles.toggleLabel}>Posting a Service</Text>
        </View>

        <Text style={styles.descriptionText}>
          Provide a new service you are offering.
        </Text>

        {/* Name Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Employee Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Employee Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={"#767577"}
          />
        </View>

        {/* For the position field, only use servicePositions array */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Position Offered</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPositionModal(true)}
          >
            <Text
              style={
                position === "Select a position"
                  ? styles.placeholderText
                  : styles.dropdownButtonText
              }
            >
              {position || "Select a position"}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showPositionModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPositionModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowPositionModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Position</Text>
                <ScrollView>
                  {servicePositions.map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      style={styles.optionButton}
                      onPress={() => {
                        setPosition(pos);
                        setShowPositionModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          position === pos && styles.selectedOptionText,
                        ]}
                      >
                        {pos}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Location Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            placeholder={"e.g. City, Country"}
            value={location}
            onChangeText={setLocation}
            placeholderTextColor={"#767577"}
          />
        </View>

        {/* Description Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Provide a detailed description..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={"#767577"}
          />
        </View>

        {/* Add new fields after the Description field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor={"#767577"}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor={"#767577"}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Education Level</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowEducationModal(true)}
          >
            <Text
              style={
                educationLevel === "Select education level"
                  ? styles.placeholderText
                  : styles.dropdownButtonText
              }
            >
              {educationLevel || "Select education level"}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showEducationModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowEducationModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowEducationModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Education Level</Text>
                <ScrollView>
                  {educationLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={styles.optionButton}
                      onPress={() => {
                        setEducationLevel(level);
                        setShowEducationModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          educationLevel === level && styles.selectedOptionText,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Years of Work Experience</Text>
          <TextInput
            style={[styles.textInput]}
            placeholder="How many years of experience do you have?"
            value={workExperience}
            onChangeText={setWorkExperience}
            placeholderTextColor={"#767577"}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Job Type</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowJobTypeModal(true)}
          >
            <Text
              style={
                jobType === "Select job type"
                  ? styles.placeholderText
                  : styles.dropdownButtonText
              }
            >
              {jobType || "Select job type"}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showJobTypeModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowJobTypeModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowJobTypeModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Job Type</Text>
                <ScrollView>
                  {jobTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.optionButton}
                      onPress={() => {
                        setJobType(type);
                        setShowJobTypeModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          jobType === type && styles.selectedOptionText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <TouchableOpacity
            style={[styles.textInput, styles.dateInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={startDate ? styles.dateText : styles.placeholderText}>
              {startDate
                ? new Date(startDate).toLocaleDateString()
                : "Select a date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate && event.type !== "dismissed") {
                  setStartDate(selectedDate.toISOString().split("T")[0]);
                }
              }}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Employment Status</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Employed, Unemployed"
            value={employmentStatus}
            onChangeText={setEmploymentStatus}
            placeholderTextColor={"#767577"}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expected Salary (Per Month)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter expected salary"
            value={expectedSalary}
            onChangeText={setExpectedSalary}
            keyboardType="numeric"
            placeholderTextColor={"#767577"}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Accommodation Preferences</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowAccommodationModal(true)}
          >
            <Text
              style={
                accommodation === "Select accommodation preference"
                  ? styles.placeholderText
                  : styles.dropdownButtonText
              }
            >
              {accommodation || "Select accommodation preference"}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showAccommodationModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowAccommodationModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowAccommodationModal(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Select Accommodation Preference
                </Text>
                <ScrollView>
                  {accommodationTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.optionButton}
                      onPress={() => {
                        setAccommodation(type);
                        setShowAccommodationModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          accommodation === type && styles.selectedOptionText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          {/* Languages */}
          <Text style={styles.sectionTitle}>Preferred Languages</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a language"
              value={languageInput}
              onChangeText={setLanguageInput}
            />
            <TouchableOpacity style={styles.addButton} onPress={addLanguage}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={languages}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tag}>
                <Text style={styles.tagLabel}>{item.label}</Text>
                <TouchableOpacity onPress={() => removeLanguage(item.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.tagsList}
          />

          {/* Skills */}
          <Text style={styles.sectionTitle}>Main Skills Offered</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a skill"
              value={skillInput}
              onChangeText={setSkillInput}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={skills}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tag}>
                <Text style={styles.tagLabel}>{item.label}</Text>
                <TouchableOpacity onPress={() => removeSkill(item.id)}>
                  <Text style={styles.removeTag}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.tagsList}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Post Service</Text>
          )}
        </TouchableOpacity>
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
