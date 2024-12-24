import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { Button, Input } from "@rneui/themed";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
// import { decode as atob } from 'base-64'; // If needed for base64 decoding

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [role, setRole] = useState("");

  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`email, role`)
        .eq("id", session.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setRole(data.role);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({ username, full_name, website, avatar_url }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session.user.id,
        username,
        full_name,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
      // After updating, re-fetch the profile to reflect changes
      await getProfile();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function pickImageAndUpload() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        // console.log("Image selection canceled");
        return;
      }

      const pickedAsset = result.assets[0];
      if (!pickedAsset?.uri) {
        Alert.alert("Failed to pick an image. Please try again.");
        return;
      }

      setLoading(true);

      // 1. Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(pickedAsset.uri, {
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

      // 3. Directly upload the Uint8Array to Supabase
      const filePath = `${session.user.id}.jpg`;
      console.log("Uploading to filePath:", filePath);

      const { data, error: uploadError } = await supabase.storage
        .from("professionals")
        .upload(filePath, byteArray, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log("Upload successful:", data);
      await getProfile();
    } catch (error) {
      console.error("Error during image upload:", error);
      Alert.alert(
        "An error occurred while uploading the image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          value={session?.user?.email}
          disabled
          labelStyle={styles.inputLabel}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
      </View>
      <View style={[styles.verticallySpaced]}>
        <Input
          label="Account Type"
          value={role || "Not specified"}
          disabled
          labelStyle={styles.inputLabel}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Loading ..." : "Update"}
          onPress={() => getProfile()}
          disabled={loading}
          buttonStyle={styles.updateButton}
          titleStyle={styles.buttonTitle}
          disabledStyle={styles.disabledButton}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          title="Sign Out"
          onPress={() => {
            supabase.auth.signOut();
            router.replace("/");
          }}
          buttonStyle={styles.signOutButton}
          titleStyle={styles.buttonTitle}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  cardImage: {
    resizeMode: "contain",
    width: "100%",
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  inputLabel: {
    color: "#4A2D8B",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F8F8F8",
    height: 48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  updateButton: {
    backgroundColor: "#4A2D8B",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signOutButton: {
    backgroundColor: "#eb3a34",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9D94BC",
  },
});
