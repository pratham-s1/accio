import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../firebase/firebaseService";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const ClaimedItemsScreen = () => {
  const router = useRouter();
  const [claimedItems, setClaimedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedClaimedItems = async () => {
      try {
        // Fetch items where approveClaim is true
        const q = query(
          collection(db, "items"),
          where("approveClaim", "==", true)
        );
        const snapshot = await getDocs(q);
        console.log("Approved claimed items snapshot size:", snapshot.size);

        const items = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const itemData = { id: doc.id, ...doc.data() };

            // Fetch claimedBy email
            let claimedByEmail = "N/A";
            if (itemData.claimedBy) {
              const userDoc = await getDoc(doc(db, "users", itemData.claimedBy));
              if (userDoc.exists()) {
                claimedByEmail = userDoc.data().email || "N/A";
              }
            }

            // Fetch postedBy email (userId is the uploader)
            let postedByEmail = "N/A";
            if (itemData.userId) {
              const userDoc = await getDoc(doc(db, "users", itemData.userId));
              if (userDoc.exists()) {
                postedByEmail = userDoc.data().email || "N/A";
              }
            }

            return {
              ...itemData,
              claimedByEmail,
              postedByEmail,
            };
          })
        );

        console.log("Approved claimed items:", items);
        setClaimedItems(items);
      } catch (error) {
        console.error("Error fetching approved claimed items:", error);
        Alert.alert("Error", "Failed to load claimed items: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedClaimedItems();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.itemName}>{item.itemName || "N/A"}</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Claimed By:</Text>
        <Text style={styles.value}>
          {item.claimedBy || "N/A"} ({item.claimedByEmail})
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Posted By:</Text>
        <Text style={styles.value}>
          {item.userId || "N/A"} ({item.postedByEmail})
        </Text>
      </View>
      <Text style={styles.date}>Claim Date: {item.claimTimestamp || "N/A"}</Text>
      <Text style={styles.date}>Color: {item.color || "N/A"}</Text>
      <Text style={styles.date}>Location: {item.location || "N/A"}</Text>
      <Text style={styles.date}>Category: {item.category || "N/A"}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/screens/HomeScreen")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Approved Claimed Items</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2c3e50" style={styles.loader} />
      ) : claimedItems.length === 0 ? (
        <Text style={styles.emptyText}>No approved claimed items found.</Text>
      ) : (
        <FlatList
          data={claimedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 15,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  section: {
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    marginLeft: 5,
    color: "#333",
  },
  date: {
    marginTop: 6,
    fontStyle: "italic",
    color: "#777",
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 40,
  },
  loader: {
    marginTop: 40,
  },
});

export default ClaimedItemsScreen;