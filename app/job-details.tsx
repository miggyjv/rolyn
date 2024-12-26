import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function JobDetailsScreen() {
  const params = useLocalSearchParams();
  
  // Check if this is a job post by looking for job-specific fields
  const isJobPost = 'position' in params && !('name' in params);

  if (isJobPost) {
    // Job Post View
    const {
      id,
      position,
      jobType,
      languages,
      skills,
      location,
      salaryRange,
      accommodation,
      startDate,
      description,
      householdDetails,
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
          </View>

          {/* Requirements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🗣️ Languages:</Text>
              <Text style={styles.value}>{languages}</Text>
            </View>

            {skills && (
              <View style={styles.infoContainer}>
                <Text style={styles.label}>⭐ Skills:</Text>
                <Text style={styles.value}>{skills}</Text>
              </View>
            )}
          </View>

          {/* Work Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Details</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🗓️ Start Date:</Text>
              <Text style={styles.value}>{startDate}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>💰 Salary Range:</Text>
              <Text style={styles.value}>{salaryRange}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.label}>🏠 Accommodation:</Text>
              <Text style={styles.value}>{accommodation}</Text>
            </View>
          </View>

          {/* Household Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Household Details</Text>
            <Text style={styles.description}>{householdDetails}</Text>
          </View>

          {/* Job Description Section */}
          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.description}>{description}</Text>
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
    positionNeeded,
    languages,
    skills,
    startDate,
    workExperience,
    personalDescription,
    phoneNumber,
    age,
    educationLevel,
    jobType,
    currStatus,
    expectedSalary,
    accommodationPref,
    location,
  } = params;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: image as string }}
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
            <Text style={styles.value}>{positionNeeded}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>📍 Location:</Text>
            <Text style={styles.value}>{location}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>💼 Job Type:</Text>
            <Text style={styles.value}>{jobType}</Text>
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
            <Text style={styles.value}>{educationLevel}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>⏳ Experience:</Text>
            <Text style={styles.value}>{workExperience} years</Text>
          </View>
        </View>

        {/* Work Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>🗓️ Start Date:</Text>
            <Text style={styles.value}>{new Date(startDate as string).toLocaleDateString()}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>💰 Expected Salary:</Text>
            <Text style={styles.value}>${expectedSalary} per month</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>🏠 Accommodation:</Text>
            <Text style={styles.value}>{accommodationPref}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>📊 Current Status:</Text>
            <Text style={styles.value}>{currStatus}</Text>
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
            <Text style={styles.label}>📱 Contact:</Text>
            <Text style={styles.value}>{phoneNumber}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{personalDescription}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F8F8',
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    color: '#4A2D8B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#4A2D8B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A2D8B',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    width: 130,
    fontSize: 15,
    color: '#333',
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: '#666',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
}); 