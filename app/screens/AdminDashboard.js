import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AdminDashboard() {
  const router = useRouter();

  const navigateToScreen = (screen) => {
    router.push(`/screens/${screen}`);
  };

  const handleLogout = () => {
    router.replace("/screens/AdminLogin");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.actionButton]}
        onPress={() => navigateToScreen("ApprovePendingScreen")}
      >
        <Text style={styles.buttonText}>Approve Pending Uploads</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.actionButton]}
        onPress={() => navigateToScreen("ApproveClaimedScreen")}
      >
        <Text style={styles.buttonText}>Approve Claimed Items</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.actionButton]}
        onPress={() => navigateToScreen("ApproveAuctionScreen")}
      >
        <Text style={styles.buttonText}>Approve Auction Items</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4F46E5",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});