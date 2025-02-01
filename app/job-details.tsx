import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/utils/supabaseClient";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }

  async function handleStartConversation(otherUserId: string) {
    if (!currentUserId) return;
    setIsLoading(true);

    try {
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${currentUserId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${currentUserId})`
        )
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingConversation) {
        // Conversation exists, navigate to it
        router.push(`/chat/${existingConversation.id}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          participant_1: currentUserId,
          participant_2: otherUserId,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Navigate to new conversation
      router.push(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  }

  const MessageButton = ({ otherUserId }: { otherUserId: string }) => (
    <Pressable
      style={styles.messageButton}
      onPress={() => handleStartConversation(otherUserId)}
      disabled={isLoading}
    >
      <MaterialIcons name="chat" size={24} color="white" />
      <Text style={styles.messageButtonText}>
        {isLoading ? "Starting chat..." : "Start Conversation"}
      </Text>
    </Pressable>
  );

  // Check if this is a job post by looking for job-specific fields
  const isJobPost = "position" in params && !("name" in params);

  if (isJobPost) {
    const {
      id,
      position,
      job_type,
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
      employer_id,
    } = params;

    return (
      <>
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{position}</Text>

            {status && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      status === "active" ? "#4CAF50" : "#FFA000",
                  },
                ]}
              >
                <Text style={styles.statusText}>{status}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Main Information</Text>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>📋 Position</Text>
                <Text style={styles.value}>{position}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>📍 Location</Text>
                <Text style={styles.value}>{location}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>💼 Job Type</Text>
                <Text style={styles.value}>{job_type}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>⏰ Start Time</Text>
                <Text style={styles.value}>{preferred_start_time}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <Text style={styles.label}>Languages</Text>
              <View style={styles.badgeContainer}>
                {required_languages?.split(",").map((lang, index) => (
                  <Badge key={index} text={lang.trim()} />
                ))}
              </View>

              {required_skills && (
                <>
                  <Text style={[styles.label, { marginTop: 16 }]}>Skills</Text>
                  <View style={styles.badgeContainer}>
                    {required_skills?.split(",").map((skill, index) => (
                      <Badge key={index} text={skill.trim()} />
                    ))}
                  </View>
                </>
              )}

              <View style={[styles.infoContainer, { marginTop: 12 }]}>
                <Text style={styles.label}>📚 Education</Text>
                <Text style={styles.value}>{education_requirement}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>⏳ Experience</Text>
                <Text style={styles.value}>
                  {experience_years} years required
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Schedule</Text>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>🗓️ Start Date</Text>
                <Text style={styles.value}>
                  {new Date(start_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>⌚ Work Hours</Text>
                <Text style={styles.value}>{work_schedule}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>📅 Day Off</Text>
                <Text style={styles.value}>{day_off}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>💰 Salary Range</Text>
                <Text style={styles.value}>{salary_range}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accommodation</Text>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>🏠 Status</Text>
                <Text style={styles.value}>
                  {accommodation_provided ? "Provided" : "Not provided"}
                </Text>
              </View>
              {accommodation_provided && (
                <>
                  <View style={styles.infoContainer}>
                    <Text style={styles.label}>🏘️ Type</Text>
                    <Text style={styles.value}>{accommodation_type}</Text>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.label}>📝 Details</Text>
                    <Text style={styles.value}>{accommodation_details}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Household Details</Text>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>👥 Household Size</Text>
                <Text style={styles.value}>{household_size} person(s)</Text>
              </View>
              {has_children && (
                <>
                  <View style={styles.infoContainer}>
                    <Text style={styles.label}>👶 Children</Text>
                    <Text style={styles.value}>{number_of_children}</Text>
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.label}>🎈 Ages</Text>
                    <Text style={styles.value}>
                      {children_ages
                        ?.split(",")
                        .map((age) => age.trim())
                        .join(", ")}
                    </Text>
                  </View>
                </>
              )}
              {has_elderly && (
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>👴 Elderly</Text>
                  <Text style={styles.value}>Yes</Text>
                </View>
              )}
              {has_pets && (
                <View style={styles.infoContainer}>
                  <Text style={styles.label}>🐾 Pets</Text>
                  <Text style={styles.value}>{pets_details}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duties and Benefits</Text>
              <Text style={styles.label}>Duties</Text>
              <View style={styles.badgeContainer}>
                {duties?.split(",").map((duty, index) => (
                  <Badge key={index} text={duty.trim()} />
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>Benefits</Text>
              <View style={styles.badgeContainer}>
                {benefits?.split(",").map((benefit, index) => (
                  <Badge key={index} text={benefit.trim()} />
                ))}
              </View>
            </View>

            {employer_references && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>References</Text>
                <View style={styles.badgeContainer}>
                  {employer_references.split(",").map((reference, index) => (
                    <Badge key={index} text={reference.trim()} />
                  ))}
                </View>
              </View>
            )}

            {description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Details</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            )}
          </View>
        </ScrollView>
        {currentUserId && employer_id && currentUserId !== employer_id && (
          <MessageButton otherUserId={employer_id as string} />
        )}
      </>
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
    <>
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
          <Image
            source={{ uri: image }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{name}</Text>

          {curr_status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{curr_status}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Main Information</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>📋 Position</Text>
              <Text style={styles.value}>{position}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>📍 Location</Text>
              <Text style={styles.value}>{location}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🌍 Working in</Text>
              <Text style={styles.value}>{working_country}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>💼 Job Type</Text>
              <Text style={styles.value}>{job_type}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Languages</Text>
            <Text style={styles.label}>Languages</Text>
            <View style={styles.badgeContainer}>
              {languages?.split(",").map((lang, index) => (
                <Badge key={index} text={lang.trim()} />
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Skills</Text>
            <View style={styles.badgeContainer}>
              {skills?.split(",").map((skill, index) => (
                <Badge key={index} text={skill.trim()} />
              ))}
            </View>
          </View>

          {/* Work Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Details</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🗓️ Start Date</Text>
              <Text style={styles.value}>
                {new Date(start_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>💰 Salary</Text>
              <Text style={styles.value}>{expected_salary} USD / month</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🏠 Accommodation</Text>
              <Text style={styles.value}>{accommodation_pref}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>⏳ Experience</Text>
              <Text style={styles.value}>{work_experience} years</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>📚 Education</Text>
              <Text style={styles.value}>{education_level}</Text>
            </View>
          </View>

          {/* Personal Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>👤 Age</Text>
              <Text style={styles.value}>{age} years old</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>👥 Gender</Text>
              <Text style={styles.value}>{gender}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>🌍 Nationality</Text>
              <Text style={styles.value}>{nationality}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>✝️ Religion</Text>
              <Text style={styles.value}>{religion}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>💑 Marital Status</Text>
              <Text style={styles.value}>{marital_status}</Text>
            </View>
            {number_of_kids > 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.label}>👶 Children</Text>
                <Text style={styles.value}>{number_of_kids}</Text>
              </View>
            )}
          </View>

          {/* Member Since Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Information</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>📅 Member Since</Text>
              <Text style={styles.value}>
                {new Date(created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {personal_description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{personal_description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {currentUserId && params.id && currentUserId !== params.id && (
        <MessageButton otherUserId={params.id as string} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: "#F8F8F8",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#4A2D8B",
    textAlign: "center",
    marginVertical: 16,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#4A2D8B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4A2D8B",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 12,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  label: {
    width: 150,
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "400",
    paddingRight: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#444",
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  badge: {
    backgroundColor: "#4A2D8B15",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  badgeText: {
    color: "#4A2D8B",
    fontSize: 14,
    fontWeight: "500",
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 4,
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginTop: -60,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#F0F0F0",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  messageButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6B46C1",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

// Add a Badge component for reusability
const Badge = ({ text }: { text: string }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);
