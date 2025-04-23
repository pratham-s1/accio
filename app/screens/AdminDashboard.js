import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function AdminDashboard() {
  const router = useRouter();
  const systemScheme = useColorScheme();
  const [theme, setTheme] = React.useState(systemScheme);
  const isDark = theme === "dark";
  const styles = getStyles(isDark);

  const navigateToScreen = (screen) => {
    router.push(`/screens/${screen}`);
  };

  const handleLogout = () => {
    router.replace("/screens/AdminLogin");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
            <Feather
              name={isDark ? "sun" : "moon"}
              size={24}
              color={isDark ? "#FCD34D" : "#1E293B"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={32}
              color={isDark ? "#38BDF8" : "#4F46E5"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Container for Action Buttons */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateToScreen("ApprovePendingScreen")}
        >
          <Text style={styles.cardText}>Approve Pending Uploads</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigateToScreen("ApproveClaimedScreen")}
        >
          <Text style={styles.cardText}>Approve Claimed Items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, styles.lowerButton]}
          onPress={() => navigateToScreen("ApproveAuctionScreen")}
        >
          <Text style={styles.cardText}>Approve Auction Items</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: isDark ? "#0F172A" : "#F9FAFB",
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingHorizontal: 10, // Add padding to the top bar for harmony
    },
    title: {
      fontSize: 24, // Reduced from 30 for better balance
      fontWeight: "bold",
      color: isDark ? "#60A5FA" : "#4F46E5",
      paddingLeft: 10, // Add padding to avoid sticking to the left wall
    },
    cardContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: isDark ? "#1E293B" : "#E0E7FF",
      width: "45%",
      padding: 20,
      marginVertical: 10,
      marginHorizontal: 5,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    lowerButton: {
      width: "92%", // Matches the combined width of the two upper buttons plus margins
      marginHorizontal: 0, // Center it without extra horizontal margins
    },
    cardText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#38BDF8" : "#4F46E5",
    },
  });
