import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

interface JobPost {
  employer_references: string[];
  preferred_start_time: string;
}

interface Professional {
  gender: string;
  nationality: string;
}

export default function JobDetailsScreen() {
  const params = useLocalSearchParams();

  // Check if this is a job post by looking for job-specific fields
  const isJobPost = "position" in params && !("name" in params);

  if (isJobPost) {
    // Job Post View
    const {
      id,
      position,
      jobType,
      required_languages,
      required_skills,
      location,
      salary_range,
      accommodation_provided,
      accommodation_type,
      accommodation_details,
      start_date,
      description,
      status,
      household_size,
      has_children,
      number_of_children,
      children_ages,
      has_elderly,
      has_pets,
      pets_details,
      experience_years,
      benefits,
      duties,
      education_requirement,
      work_schedule,
      day_off,
      preferred_start_time,
      employer_references,
    } = params;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{position}</Text>

          {/* Main Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Main Information</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>📋 Position:</Text>
              <Text style={styles.value}>{position}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>📍 Location:</Text>
              <Text style={styles.value}>{location}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>💼 Job Type:</Text>
              <Text style={styles.value}>{jobType}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>📊 Status:</Text>
              <Text style={styles.value}>{status}</Text>
            </View>
          </View>

          {/* Requirements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🗣️ Languages:</Text>
              <Text style={styles.value}>{required_languages}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>⭐ Skills:</Text>
              <Text style={styles.value}>{required_skills}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>📚 Education:</Text>
              <Text style={styles.value}>{education_requirement}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>⏳ Experience:</Text>
              <Text style={styles.value}>
                {experience_years} years required
              </Text>
            </View>
          </View>

          {/* Work Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Details</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🗓️ Start Date:</Text>
              <Text style={styles.value}>{start_date}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>🕒 Work Hours:</Text>
              <Text style={styles.value}>{work_schedule}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>📅 Day Off:</Text>
              <Text style={styles.value}>{day_off}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>💰 Salary Range:</Text>
              <Text style={styles.value}>{salary_range}</Text>
            </View>
          </View>

          {/* Accommodation Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accommodation</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🏠 Status:</Text>
              <Text style={styles.value}>
                {accommodation_provided ? "Provided" : "Not provided"}
              </Text>
            </View>
            {accommodation_provided && (
              <>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>🏘️ Type:</Text>
                  <Text style={styles.value}>{accommodation_type}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>📝 Details:</Text>
                  <Text style={styles.value}>{accommodation_details}</Text>
                </View>
              </>
            )}
          </View>

          {/* Household Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Household Details</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>👥 Size:</Text>
              <Text style={styles.value}>{household_size} person(s)</Text>
            </View>
            {has_children && (
              <>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>👶 Children:</Text>
                  <Text style={styles.value}>{number_of_children}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>🎈 Ages:</Text>
                  <Text style={styles.value}>{children_ages?.join(", ")}</Text>
                </View>
              </>
            )}
            {has_elderly && (
              <View style={styles.infoContainer}>
                <Text style={styles.label}>👴 Elderly:</Text>
                <Text style={styles.value}>Yes</Text>
              </View>
            )}
            {has_pets && (
              <View style={styles.infoContainer}>
                <Text style={styles.label}>🐾 Pets:</Text>
                <Text style={styles.value}>{pets_details}</Text>
              </View>
            )}
          </View>

          {/* Duties and Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duties and Benefits</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>📋 Duties:</Text>
              <Text style={styles.value}>{duties?.join(", ")}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>✨ Benefits:</Text>
              <Text style={styles.value}>{benefits?.join(", ")}</Text>
            </View>
          </View>

          {/* Description Section */}
          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}

          {/* References Section */}
          {employer_references && employer_references.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>References</Text>
              {employer_references.map((reference, index) => (
                <Text key={index} style={styles.value}>
                  {reference}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Worker Profile View (existing code)
  const {
    name,
    image,
    position,
    languages,
    skills,
    start_date,
    work_experience,
    personal_description,
    age,
    number_of_kids,
    education_level,
    job_type,
    curr_status,
    expected_salary,
    accommodation_pref,
    working_country,
    location,
    nationality,
    gender,
    religion,
    marital_status,
    created_at,
    updated_at,
  } = params;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>

        {/* Main Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Information</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>📋 Position:</Text>
            <Text style={styles.value}>{position}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>📍 Location:</Text>
            <Text style={styles.value}>{location}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>🌍 Working Country:</Text>
            <Text style={styles.value}>{working_country}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>💼 Job Type:</Text>
            <Text style={styles.value}>{job_type}</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Experience</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>🗣️ Languages:</Text>
            <Text style={styles.value}>{languages}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>⭐ Skills:</Text>
            <Text style={styles.value}>{skills}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>📚 Education:</Text>
            <Text style={styles.value}>{education_level}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>⏳ Experience:</Text>
            <Text style={styles.value}>{work_experience} years</Text>
          </View>
        </View>

        {/* Work Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>🗓️ Start Date:</Text>
            <Text style={styles.value}>
              {new Date(start_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>💰 Expected Salary:</Text>
            <Text style={styles.value}>{expected_salary}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>🏠 Accommodation:</Text>
            <Text style={styles.value}>{accommodation_pref}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>📊 Current Status:</Text>
            <Text style={styles.value}>{curr_status}</Text>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>👤 Age:</Text>
            <Text style={styles.value}>{age} years old</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>👥 Gender:</Text>
            <Text style={styles.value}>{gender}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>🌍 Nationality:</Text>
            <Text style={styles.value}>{nationality}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>✝️ Religion:</Text>
            <Text style={styles.value}>{religion}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>💑 Marital Status:</Text>
            <Text style={styles.value}>{marital_status}</Text>
          </View>
          {number_of_kids > 0 && (
            <View style={styles.infoContainer}>
              <Text style={styles.label}>👶 Children:</Text>
              <Text style={styles.value}>{number_of_kids}</Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        {personal_description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{personal_description}</Text>
          </View>
        )}

        {/* Member Since Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Information</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>📅 Member Since:</Text>
            <Text style={styles.value}>
              {new Date(created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#F8F8F8",
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 16,
    color: "#4A2D8B",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#4A2D8B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#4A2D8B",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 8,
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  label: {
    fontWeight: "500",
    width: 130,
    fontSize: 15,
    color: "#333",
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: "#666",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
});
