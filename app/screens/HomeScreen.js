import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { getAllLostItems } from "../firebase/firebaseService";
import { useRouter } from "expo-router";

// Sample announcements data
const announcements = [
  {
    id: "1",
    title: "New Auction Feature",
    description: "Bid on lost items! Check out the Auction tab to place bids on unclaimed items before they’re archived.",
  },
  {
    id: "2",
    title: "Claim Process Update",
    description: "Approved claims now show claim timestamps. Visit the Claimed Items tab to see when items were claimed.",
  },
  {
    id: "3",
    title: "Item Submission Reminder",
    description: "Found an item? Submit it via the Upload Item screen to help reunite it with its owner!",
  },
  {
    id: "4",
    title: "App Update",
    description: "Our latest update improves image loading for auction items. Update to version 2.0 for a smoother experience.",
  },
  {
    id: "5",
    title: "Community Notice",
    description: "Join our community forum on X to share tips on recovering lost items and winning auctions!",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme);

  const isDark = theme === "dark";
  const styles = getStyles(isDark);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getAllLostItems();
        //console.log("Fetched approved items:", data);
        setItems(data);
      } catch (error) {
        console.error("Error in fetchItems:", error);
      }
    };
    fetchItems();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Accio</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
            <Feather
              name={isDark ? "sun" : "moon"}
              size={24}
              color={isDark ? "#FCD34D" : "#1E293B"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/screens/ProfileScreen")}
          >
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={isDark ? "#38BDF8" : "#4F46E5"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.replace("/screens/UploadItemScreen")}
        >
          <Text style={styles.cardText}>Upload Lost Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.replace("/screens/PublicChatScreen")}
        >
          <Text style={styles.cardText}>Public Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.replace("/screens/ClaimedItemsScreen")}
        >
          <Text style={styles.cardText}>Claimed Items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.replace("/screens/AuctionScreen")}
        >
          <Text style={styles.cardText}>Auction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, { width: "100%" }]}
          onPress={() => router.replace("/screens/FindItemScreen")}
        >
          <Text style={styles.cardText}>Find Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.sectionTitle}>Announcements</Text>
        {announcements.map((announcement) => (
          <View key={announcement.id} style={styles.announcementCard}>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementDescription}>{announcement.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
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
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: isDark ? "#60A5FA" : "#4F46E5",
    },
    cardContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    card: {
      backgroundColor: isDark ? "#1E293B" : "#E0E7FF",
      width: "48%", // Adjusted to fit more cards
      padding: 20,
      marginVertical: 8,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    cardText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#38BDF8" : "#4F46E5",
    },
    scrollArea: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 12,
      color: isDark ? "#F1F5F9" : "#1E293B",
    },
    announcementCard: {
      backgroundColor: isDark ? "#1E293B" : "#E0E7FF",
      padding: 15,
      marginBottom: 12,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    announcementTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#38BDF8" : "#4F46E5",
      marginBottom: 8,
    },
    announcementDescription: {
      fontSize: 16,
      color: isDark ? "#F1F5F9" : "#1E293B",
      lineHeight: 22,
    },
    itemCard: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: isDark ? "#1E293B" : "#E0E7FF",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    image: {
      width: "100%",
      height: 180,
      borderRadius: 10,
      marginBottom: 8,
    },
    itemText: {
      fontSize: 16,
      color: isDark ? "#F1F5F9" : "#1E293B",
    },
  });