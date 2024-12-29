import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const width = Dimensions.get("window").width;

interface WorkerProfile {
  id: number;
  name: string;
  age: number;
  number_of_kids: number;
  position: string;
  work_experience: string;
  curr_status: string;
  start_date: string;
  expected_salary: string;
  accommodation_pref: string;
  working_country: string;
  personal_description: string;
  languages: string[];
  skills: string[];
  image: string;
  job_type: string;
  religion: string;
  marital_status: string;
  education_level: string;
  location: string;
  nationality: string;
  gender: string;
  created_at: string;
  updated_at: string;
}

interface JobPost {
  id: string;
  employer_id: string;
  position: string;
  job_type: string;
  required_languages: string[];
  required_skills: string[];
  location: string;
  salary_range: string;
  accommodation_provided: boolean;
  accommodation_type: string;
  accommodation_details: string;
  start_date: string;
  description: string;
  status: string;
  household_size: number;
  has_children: boolean;
  number_of_children: number;
  children_ages: string[];
  has_elderly: boolean;
  has_pets: boolean;
  pets_details: string;
  experience_years: number;
  benefits: string[];
  duties: string[];
  education_requirement: string;
  work_schedule: string;
  day_off: string;
  created_at: string;
  updated_at: string;
  preferred_start_time: string;
  employer_references: string[];
}

interface RecCardsProps {
  cardData: (WorkerProfile | JobPost)[];
  title: string;
  vertical?: boolean;
  cardType: "worker" | "job";
}

export default function RecCards({
  cardData,
  title,
  vertical = false,
  cardType,
}: RecCardsProps) {
  const router = useRouter();

  const isJobPost = (item: WorkerProfile | JobPost): item is JobPost => {
    return "employer_id" in item;
  };

  const formatArray = (arrayString: string | string[]) => {
    if (Array.isArray(arrayString)) return arrayString.join(", ");
    try {
      const array = JSON.parse(arrayString);
      return Array.isArray(array) ? array.join(", ") : arrayString;
    } catch {
      return arrayString;
    }
  };

  const renderJobCard = (job: JobPost) => {
    const handlePress = () => {
      router.push({
        pathname: "/job-details",
        params: {
          id: job.id,
          employer_id: job.employer_id,
          position: job.position,
          job_type: job.job_type,
          required_languages: formatArray(job.required_languages),
          required_skills: job.required_skills
            ? formatArray(job.required_skills)
            : "",
          location: job.location,
          salary_range: job.salary_range,
          accommodation_provided: job.accommodation_provided,
          accommodation_type: job.accommodation_type,
          accommodation_details: job.accommodation_details,
          start_date: job.start_date,
          description: job.description,
          status: job.status,
          household_size: job.household_size,
          has_children: job.has_children,
          number_of_children: job.number_of_children,
          children_ages: job.children_ages
            ? formatArray(job.children_ages)
            : "",
          has_elderly: job.has_elderly,
          has_pets: job.has_pets,
          pets_details: job.pets_details,
          experience_years: job.experience_years,
          benefits: job.benefits ? formatArray(job.benefits) : "",
          duties: job.duties ? formatArray(job.duties) : "",
          education_requirement: job.education_requirement,
          work_schedule: job.work_schedule,
          day_off: job.day_off,
          created_at: job.created_at,
          updated_at: job.updated_at,
          preferred_start_time: job.preferred_start_time,
          employer_references: job.employer_references
            ? formatArray(job.employer_references)
            : "",
        },
      });
    };

    // Helper function to handle arrays or strings
    const formatToArray = (value: string | string[] | undefined): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return value.split(",").map((item) => item.trim());
    };

    return (
      <TouchableOpacity
        key={job.id}
        style={[styles.card, vertical && styles.verticalCard]}
        onPress={handlePress}
      >
        <View style={styles.cardContent}>
          {/* Status Badge */}
          {job.status && (
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor:
                    job.status === "active" ? "#4CAF50" : "#FFA000",
                },
              ]}
            >
              <Text style={styles.statusTagText}>{job.status}</Text>
            </View>
          )}

          {/* Main Info */}
          <Text style={styles.cardTitle}>{job.position}</Text>
          <View style={styles.mainInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>💼</Text>
              <Text style={styles.infoText}>{job.job_type}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{job.location}</Text>
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.sectionLabel}>Required Languages</Text>
            <View style={styles.badgeContainer}>
              {formatToArray(job.required_languages).map((lang, index) => (
                <View key={index} style={styles.smallBadge}>
                  <Text style={styles.smallBadgeText}>{lang}</Text>
                </View>
              ))}
            </View>

            {job.required_skills && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
                  Required Skills
                </Text>
                <View style={styles.badgeContainer}>
                  {formatToArray(job.required_skills).map((skill, index) => (
                    <View
                      key={index}
                      style={[
                        styles.smallBadge,
                        { backgroundColor: "#E8F5E9" },
                      ]}
                    >
                      <Text
                        style={[styles.smallBadgeText, { color: "#2E7D32" }]}
                      >
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Footer Info */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>💰 Salary</Text>
              <Text style={styles.footerValue}>{job.salary_range}</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>🏠 Accommodation</Text>
              <Text style={styles.footerValue}>
                {job.accommodation_provided ? "Provided" : "Not provided"}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>⏰ Start</Text>
              <Text style={styles.footerValue}>
                {job.preferred_start_time || "Flexible"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorkerCard = (worker: WorkerProfile) => {
    const handlePress = () => {
      router.push({
        pathname: "/job-details",
        params: {
          id: worker.id,
          name: worker.name,
          image: worker.image,
          position: worker.position,
          languages: formatArray(worker.languages),
          skills: formatArray(worker.skills),
          start_date: worker.start_date,
          work_experience: worker.work_experience,
          personal_description: worker.personal_description,
          age: worker.age,
          number_of_kids: worker.number_of_kids,
          education_level: worker.education_level,
          job_type: worker.job_type,
          curr_status: worker.curr_status,
          expected_salary: worker.expected_salary,
          accommodation_pref: worker.accommodation_pref,
          working_country: worker.working_country,
          location: worker.location,
          nationality: worker.nationality,
          gender: worker.gender,
          religion: worker.religion,
          marital_status: worker.marital_status,
          created_at: worker.created_at,
          updated_at: worker.updated_at,
        },
      });
    };

    return (
      <TouchableOpacity
        key={worker.id}
        style={[styles.card, vertical && styles.verticalCard]}
        onPress={handlePress}
      >
        <Image source={{ uri: worker.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{worker.name}</Text>
          <Text style={styles.cardPosition}>{worker.position}</Text>
          <Text style={styles.cardLocation}>
            <Text>📍 </Text>
            <Text>{worker.location}</Text>
          </Text>
          <Text style={styles.cardSkills}>
            🗣️ Languages: {formatArray(worker.languages)}
          </Text>
          <Text style={styles.cardSkills}>
            ⭐ Skills: {formatArray(worker.skills)}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardStartDate}>
              🗓️ Available from:{" "}
              {typeof worker.start_date === "string"
                ? new Date(worker.start_date).toLocaleDateString()
                : worker.start_date.toLocaleDateString()}
            </Text>
            <Text style={styles.cardExperience}>
              💼 Experience: {worker.work_experience} years
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {vertical ? (
        <View>
          {cardData.map((item) =>
            isJobPost(item) ? renderJobCard(item) : renderWorkerCard(item)
          )}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cardData.map((item) =>
            isJobPost(item) ? renderJobCard(item) : renderWorkerCard(item)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    // marginVertical: 15,
    // marginBottom: 15,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    marginBottom: 15,
    marginLeft: 15,
    color: "#4A2D8B",
  },
  card: {
    width: width * 0.75,
    marginHorizontal: 8,
    marginVertical: 5,
    marginBottom: 0,
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#4A2D8B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: "contain",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4A2D8B",
  },
  cardPosition: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  cardLocation: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  cardSkills: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    backgroundColor: "#4A2D8B10",
    padding: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  cardStartDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cardExperience: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  verticalCard: {
    width: "100%",
    marginBottom: 20,
    marginHorizontal: 0,
  },
  cardSalary: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cardAccommodation: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
    fontWeight: "500",
  },
  detailText: {
    fontSize: 14,
    color: "#333",
  },
  statusTag: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  mainInfo: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
  },
  requirementsContainer: {
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  smallBadge: {
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  smallBadgeText: {
    color: "#4A2D8B",
    fontSize: 12,
    fontWeight: "500",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
    marginTop: 4,
  },
  footerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  footerLabel: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
  },
  footerValue: {
    color: "#333",
    fontSize: 13,
    fontWeight: "400",
  },
  sectionLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
});
