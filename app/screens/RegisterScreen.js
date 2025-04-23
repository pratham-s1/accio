import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseService";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // OPTIONAL: Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
      });

      Alert.alert("Success", "Account created successfully!");
      router.replace("/screens/LoginScreen"); // Go to login after successful registration
    } catch (error) {
      console.error(error);
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/")} // Navigate back to LoginScreen.js
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Create a New Account</Text>
          {/* Empty View to balance the header */}
          <View style={styles.placeholder} />
        </View>

        {/* Input Fields and Buttons */}
        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/screens/LoginScreen")}
        >
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef2f5",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40, // Matches backButton width for balance
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4caf50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#4c8bf5",
    fontSize: 14,
    marginTop: 10,
  },
});

export default RegisterScreen;
