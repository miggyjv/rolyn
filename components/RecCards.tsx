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
const height = Dimensions.get("window").height;

interface CardItem {
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

interface RecCardsProps {
  cardData: CardItem[];
  title: string;
  vertical?: boolean;
}

export default function RecCards({ cardData, title, vertical = false }: RecCardsProps) {
  const router = useRouter();

  const formatArray = (arrayString: string) => {
    try {
      const array = JSON.parse(arrayString);
      return Array.isArray(array) ? array.join(", ") : arrayString;
    } catch (error) {
      console.log("Error parsing array:", error);
      return arrayString;
    }
  };

  const handleCardPress = (item: CardItem) => {
    router.push({
      pathname: "/job-details",
      params: {
        id: item.id,
        name: item.name,
        image: item.image,
        positionNeeded: item.position,
        languages: formatArray(item.languages),
        skills: formatArray(item.skills),
        startDate: typeof item.start_date === 'string' ? item.start_date : item.start_date.toISOString(),
        workExperience: item.work_experience,
        personalDescription: item.personal_description,
        phoneNumber: item.phone_number,
        age: item.age,
        educationLevel: item.education_level,
        jobType: item.job_type,
        currStatus: item.curr_status,
        expectedSalary: item.expected_salary,
        accommodationPref: item.accommodation_pref,
        location: item.location,
      },
    });
  };

  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      {vertical ? (
        <View>
          {cardData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, styles.verticalCard]}
              onPress={() => handleCardPress(item)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPosition}>{item.position}</Text>
                <Text style={styles.cardLocation}>
                  <Text>📍 </Text>
                  <Text>{item.location}</Text>
                </Text>
                <Text style={styles.cardSkills}>
                  🗣️ Languages: {formatArray(item.languages)}
                </Text>
                <Text style={styles.cardSkills}>
                  ⭐ Skills: {formatArray(item.skills)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardStartDate}>
                    🗓️ Available from: {typeof item.start_date === 'string' 
                      ? new Date(item.start_date).toLocaleDateString() 
                      : item.start_date.toLocaleDateString()}
                  </Text>
                  <Text style={styles.cardExperience}>
                    💼 Experience: {item.work_experience} years
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cardData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleCardPress(item)}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPosition}>{item.position}</Text>
                <Text style={styles.cardLocation}>
                  <Text>📍 </Text>
                  <Text>{item.location}</Text>
                </Text>
                <Text style={styles.cardSkills}>
                  🗣️ Languages: {formatArray(item.languages)}
                </Text>
                <Text style={styles.cardSkills}>
                  ⭐ Skills: {formatArray(item.skills)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardStartDate}>
                    🗓️ Available from: {typeof item.start_date === 'string' 
                      ? new Date(item.start_date).toLocaleDateString() 
                      : item.start_date.toLocaleDateString()}
                  </Text>
                  <Text style={styles.cardExperience}>
                    💼 Experience: {item.work_experience} years
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
});
