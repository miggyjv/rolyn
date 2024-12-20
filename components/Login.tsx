import React, { useState } from "react";
import { Alert, StyleSheet, View, AppState, Text } from "react-native";
import { supabase } from "@/utils/supabaseClient";
import { Button, Input } from "@rneui/themed";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Rolyn</Text>
        <MaterialCommunityIcons
          name="human-greeting-variant"
          size={65}
          color="#6B46C1"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ 
            type: "font-awesome", 
            name: "envelope",
            color: "#6B46C1",
            size: 20,
          }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          labelStyle={styles.inputLabel}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ 
            type: "font-awesome", 
            name: "lock",
            color: "#6B46C1",
            size: 20,
          }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          labelStyle={styles.inputLabel}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
          buttonStyle={styles.signInButton}
          titleStyle={styles.buttonTitle}
          disabledStyle={styles.disabledButton}
          loading={loading}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
          buttonStyle={styles.signUpButton}
          titleStyle={styles.buttonTitle}
          type="outline"
          disabledStyle={styles.disabledButton}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 60,
    fontWeight: '700',
    paddingRight: 10,
    color: '#2D3748',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputLabel: {
    color: '#4A5568',
    marginBottom: 8,
  },
  signInButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    padding: 14,
  },
  signUpButton: {
    borderRadius: 8,
    padding: 14,
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    opacity: 0.6,
  },
});

