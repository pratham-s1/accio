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

      <ScrollView style={styles.scrollArea}>
        <Text style={styles.sectionTitle}>Approved Lost Items</Text>
        {items.length === 0 ? (
          <Text style={styles.itemText}>No approved items found.</Text>
        ) : (
          items.map((item) => {
            const imageSource = item.photoBase64
              ? { uri: `data:image/jpeg;base64,${item.photoBase64}` }
              : { uri: item.imageUrl || "https://via.placeholder.com/180" };
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image source={imageSource} style={styles.image} />
                <Text style={styles.itemText}>Location: {item.location}</Text>
              </View>
            );
          })
        )}
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
