import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function ApproveAuctionScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.replace("/screens/AdminDashboard");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Approve Auction Items</Text>
      </View>
      <Text style={styles.message}>
        Functionality to approve auction items will be implemented here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  backButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});