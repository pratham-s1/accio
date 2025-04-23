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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseService"; // Ensure firebase is configured
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/screens/HomeScreen");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/")} // Navigate to index.tsx
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Accio - Lost & Found</Text>
          {/* Empty View to balance the header */}
          <View style={styles.placeholder} />
        </View>

        {/* Input Fields and Buttons */}
        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
          value={password}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/screens/RegisterScreen")}
        >
          <Text style={styles.linkText}>Don't have an account? Register</Text>
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
    fontSize: 28,
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
    backgroundColor: "#4c8bf5",
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

export default LoginScreen;
