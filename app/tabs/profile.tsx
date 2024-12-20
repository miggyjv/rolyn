// ProfileScreen.tsx

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
  Alert,
} from "react-native";
// Define interfaces for form fields
interface PersonalInfo {
  firstName: string;
  lastName: string;
  age: string;
  religion: string;
  maritalStatus: string;
  numberOfKids: string;
  educationLevel: string;
  currentResidence: string;
}

interface ProfessionalInfo {
  lookingForPosition: string;
  yearsOfExperience: string;
  currentWorkStatus: string;
  jobStartDate: string;
  expectedMonthlySalary: string;
  accommodations: string;
  education: string;
  workingCountry: string;
}

interface Resume {
  uri: string;
  type: string;
  name: string;
}

const ProfileScreen: React.FC = () => {
  // State to toggle between Employee and Employer
  const [isEmployee, setIsEmployee] = useState<boolean>(true);

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    age: "",
    religion: "",
    maritalStatus: "",
    numberOfKids: "",
    educationLevel: "",
    currentResidence: "",
  });

  // Professional Information State
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    lookingForPosition: "",
    yearsOfExperience: "",
    currentWorkStatus: "",
    jobStartDate: "",
    expectedMonthlySalary: "",
    accommodations: "",
    education: "",
    workingCountry: "",
  });

  // About You State
  const [aboutYou, setAboutYou] = useState<string>("");

  // Resume State
  const [resume, setResume] = useState<Resume | null>(null);

  // Handler for toggling profile type
  const toggleSwitch = () => setIsEmployee((previousState) => !previousState);

  // Handler for picking a resume

  // Handler for form submission (placeholder)
  const handleSubmit = () => {
    // Implement form submission logic here
    const profileData = {
      profileType: isEmployee ? "Employee" : "Prospective Employer",
      personalInfo: isEmployee ? personalInfo : {},
      professionalInfo: isEmployee ? professionalInfo : {},
      aboutYou,
      resume,
    };
    console.log("Profile Data:", profileData);
    Alert.alert("Success", "Profile has been submitted successfully.");
    // Reset form or navigate as needed
  };

  // Render Employee Form
  const renderEmployeeForm = () => (
    <>
      {/* Personal Information */}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>First Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your first name"
          placeholderTextColor="#999"
          value={personalInfo.firstName}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, firstName: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Last Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your last name"
          placeholderTextColor="#999"
          value={personalInfo.lastName}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, lastName: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Age</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your age"
          keyboardType="numeric"
          placeholderTextColor="#999"
          value={personalInfo.age}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, age: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Religion</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your religion"
          placeholderTextColor="#999"
          value={personalInfo.religion}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, religion: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Marital Status</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Single, Married"
          placeholderTextColor="#999"
          value={personalInfo.maritalStatus}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, maritalStatus: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Number of Kids</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter number of kids"
          keyboardType="numeric"
          placeholderTextColor="#999"
          value={personalInfo.numberOfKids}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, numberOfKids: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Education Level</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., High School, Bachelor's Degree"
          placeholderTextColor="#999"
          value={personalInfo.educationLevel}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, educationLevel: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Residence</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your current residence"
          placeholderTextColor="#999"
          value={personalInfo.currentResidence}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, currentResidence: text })
          }
        />
      </View>

      {/* Professional Information */}
      <Text style={styles.sectionTitle}>Professional Information</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Looking For Position</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Maid, Cook"
          placeholderTextColor="#999"
          value={professionalInfo.lookingForPosition}
          onChangeText={(text) =>
            setProfessionalInfo({
              ...professionalInfo,
              lookingForPosition: text,
            })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Years of Work Experience</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter years of experience"
          keyboardType="numeric"
          placeholderTextColor="#999"
          value={professionalInfo.yearsOfExperience}
          onChangeText={(text) =>
            setProfessionalInfo({
              ...professionalInfo,
              yearsOfExperience: text,
            })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Work Status</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Employed, Unemployed"
          placeholderTextColor="#999"
          value={professionalInfo.currentWorkStatus}
          onChangeText={(text) =>
            setProfessionalInfo({
              ...professionalInfo,
              currentWorkStatus: text,
            })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Job Start Date</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Immediately, Next Month"
          placeholderTextColor="#999"
          value={professionalInfo.jobStartDate}
          onChangeText={(text) =>
            setProfessionalInfo({ ...professionalInfo, jobStartDate: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Expected Monthly Salary</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter expected salary"
          keyboardType="numeric"
          placeholderTextColor="#999"
          value={professionalInfo.expectedMonthlySalary}
          onChangeText={(text) =>
            setProfessionalInfo({
              ...professionalInfo,
              expectedMonthlySalary: text,
            })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Accommodations</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Provided by employer, Own accommodation"
          placeholderTextColor="#999"
          value={professionalInfo.accommodations}
          onChangeText={(text) =>
            setProfessionalInfo({ ...professionalInfo, accommodations: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Education</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your education details"
          placeholderTextColor="#999"
          value={professionalInfo.education}
          onChangeText={(text) =>
            setProfessionalInfo({ ...professionalInfo, education: text })
          }
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Working Country</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter the country you are working in"
          placeholderTextColor="#999"
          value={professionalInfo.workingCountry}
          onChangeText={(text) =>
            setProfessionalInfo({ ...professionalInfo, workingCountry: text })
          }
        />
      </View>
    </>
  );

  // Render Prospective Employer Form (Placeholder)
  // You can add employer-specific fields here as needed
  const renderEmployerForm = () => (
    <>
      <Text style={styles.sectionTitle}>Prospective Employer Information</Text>
      {/* Add employer-specific fields here */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Company Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your company name"
          placeholderTextColor="#999"
          value=""
          onChangeText={() => {}}
        />
      </View>
      {/* Add more fields as required */}
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Toggle Section */}
        {/* <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {isEmployee ? "Employee Profile" : "Prospective Employer Profile"}
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEmployee ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEmployee}
          />
        </View> */}

        {/* Description */}
        <Text style={styles.descriptionText}>
          {isEmployee
            ? "Fill in your personal and professional details to create your employee profile. This will be used to recommend/promote your job postings to prospective employers."
            : "Fill in your company details to create your prospective employer profile."}
        </Text>

        {/* Conditional Rendering of Forms */}
        {isEmployee ? renderEmployeeForm() : renderEmployerForm()}

        {/* About You Section */}
        <Text style={styles.sectionTitle}>About You</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#999"
            value={aboutYou}
            onChangeText={setAboutYou}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Resume Upload */}
        {isEmployee && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Upload Resume (PDF only)</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>
                {resume ? "Resume Uploaded" : "Upload Resume"}
              </Text>
            </TouchableOpacity>
            {resume && (
              <Text style={styles.uploadedFileText}>{resume.name}</Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Profile</Text>
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 15,
    color: "#4A2D8B",
    marginTop: 10,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: "#4A2D8B",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  uploadedFileText: {
    marginTop: 10,
    fontSize: 14,
    color: "#4A2D8B",
  },
  submitButton: {
    backgroundColor: "#4A2D8B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ProfileScreen;

