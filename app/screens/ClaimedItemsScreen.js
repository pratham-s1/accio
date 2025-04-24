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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../firebase/firebaseService";
import { collection, query, where, getDocs } from "firebase/firestore";
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
        //console.log("Approved claimed items snapshot size:", snapshot.size);

        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            itemName: data.itemName || "N/A",
            category: data.category || "N/A",
            brandName: data.brandName || "N/A",
            photoBase64: data.photoBase64 || null,
            /*claimTimestamp: data.claimTimestamp
              ? data.claimTimestamp.toDate().toLocaleDateString()
              : "N/A",*/
          };
        });

        //console.log("Approved claimed items:", items);
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

  const renderItem = ({ item }) => {
    const photoURI = item.photoBase64
      ? `data:image/jpeg;base64,${item.photoBase64}`
      : "https://via.placeholder.com/150";

    return (
      <View style={styles.card}>
        <Image source={{ uri: photoURI }} style={styles.image} />
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.detail}>Category: {item.category}</Text>
        <Text style={styles.detail}>Brand: {item.brandName}</Text>
        <Text style={styles.timestamp}>Claim Date: {item.claimTimestamp}</Text>
      </View>
    );
  };

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
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  detail: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    fontStyle: "italic",
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