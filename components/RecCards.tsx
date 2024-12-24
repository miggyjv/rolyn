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
  image: string;
  name: string;
  position: string;
  languages: string[];
  skills: string[];
  start_date: string | Date;
  work_experience: string;
  personal_description: string;
  phone_number: string;
  age: number;
  education_level: string;
  job_type: string;
  curr_status: string;
  expected_salary: string;
  accommodation_pref: string;
  location: string;
}

interface JobPost {
  id: string;
  employer_id: string;
  position: string;
  job_type: 'Live-in' | 'Live-out' | 'Part-time';
  required_languages: string[];
  required_skills?: string[];
  location: string;
  salary_range: string;
  accommodation_provided: boolean;
  accommodation_type?: string;
  start_date?: string;
  description?: string;
  household_size?: number;
  has_children: boolean;
  has_elderly: boolean;
  has_pets: boolean;
}

interface RecCardsProps {
  cardData: (WorkerProfile | JobPost)[];
  title: string;
  vertical?: boolean;
  cardType: 'worker' | 'job';
}

export default function RecCards({ cardData, title, vertical = false, cardType }: RecCardsProps) {
  const router = useRouter();

  const isJobPost = (item: WorkerProfile | JobPost): item is JobPost => {
    return 'employer_id' in item;
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
          position: job.position,
          jobType: job.job_type,
          languages: formatArray(job.required_languages),
          skills: job.required_skills ? formatArray(job.required_skills) : '',
          location: job.location,
          salaryRange: job.salary_range,
          accommodation: `${job.accommodation_provided ? 'Provided' : 'Not provided'}${job.accommodation_type ? ` (${job.accommodation_type})` : ''}`,
          startDate: job.start_date || 'Flexible',
          description: job.description || '',
          householdDetails: `${job.household_size || ''} person(s)${job.has_children ? ', with children' : ''}${job.has_elderly ? ', with elderly' : ''}${job.has_pets ? ', with pets' : ''}`,
        },
      });
    };

    return (
      <TouchableOpacity
        key={job.id}
        style={[styles.card, vertical && styles.verticalCard]}
        onPress={handlePress}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{job.position}</Text>
          <Text style={styles.cardPosition}>{job.job_type}</Text>
          <Text style={styles.cardLocation}>
            <Text>📍 </Text>
            <Text>{job.location}</Text>
          </Text>
          <Text style={styles.cardSkills}>
            🗣️ Languages: {formatArray(job.required_languages)}
          </Text>
          {job.required_skills && (
            <Text style={styles.cardSkills}>
              ⭐ Skills: {formatArray(job.required_skills)}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.cardSalary}>
              💰 Salary: {job.salary_range}
            </Text>
            <Text style={styles.cardAccommodation}>
              🏠 {job.accommodation_provided ? 'Accommodation provided' : 'No accommodation'}
            </Text>
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
          positionNeeded: worker.position,
          languages: formatArray(worker.languages),
          skills: formatArray(worker.skills),
          startDate: typeof worker.start_date === 'string' ? worker.start_date : worker.start_date.toISOString(),
          workExperience: worker.work_experience,
          personalDescription: worker.personal_description,
          phoneNumber: worker.phone_number,
          age: worker.age,
          educationLevel: worker.education_level,
          jobType: worker.job_type,
          currStatus: worker.curr_status,
          expectedSalary: worker.expected_salary,
          accommodationPref: worker.accommodation_pref,
          location: worker.location,
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
              🗓️ Available from: {typeof worker.start_date === 'string' 
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
          {cardData.map((item) => (
            isJobPost(item) ? renderJobCard(item) : renderWorkerCard(item)
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cardData.map((item) => (
            isJobPost(item) ? renderJobCard(item) : renderWorkerCard(item)
          ))}
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
    fontStyle: 'italic',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSkills: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    backgroundColor: "#4A2D8B10",
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
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
    width: '100%',
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
});
