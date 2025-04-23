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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AdminLoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = () => {
    // Hardcoded admin credentials check
    if (email.trim() === "ad" && password === "admin123") {
      // Navigate to AdminDashboard without Firebase Auth
      router.replace("/screens/AdminDashboard");
    } else {
      Alert.alert("Login Failed", "Invalid admin credentials.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/")} // Navigate to LoginScreen.js
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Admin Login</Text>
          {/* Empty View to balance the header */}
          <View style={styles.placeholder} />
        </View>

        {/* Input Fields and Button */}
        <TextInput
          placeholder="Admin Email"
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

        <TouchableOpacity style={styles.button} onPress={handleAdminLogin}>
          <Text style={styles.buttonText}>Login as Admin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminLoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f6fa",
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
    color: "#2f3542",
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
    backgroundColor: "#3742fa",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
