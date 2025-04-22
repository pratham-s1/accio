import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { db } from "../firebase/firebaseService";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "expo-router";

export default function ApprovePendingScreen() {
  const router = useRouter();
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingItems = async () => {
    try {
      const q = query(
        collection(db, "items"),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      console.log("Snapshot size:", snapshot.size);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched pending items:", items);
      setPendingItems(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      Alert.alert("Error", "Could not fetch pending items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId, newStatus) => {
    try {
      const itemRef = doc(db, "items", itemId);
      await updateDoc(itemRef, { status: newStatus });
      Alert.alert(
        "Success",
        `Item ${newStatus === "approved" ? "approved" : "rejected"}.`
      );
      fetchPendingItems();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update item status: " + error.message);
    }
  };

  const handleBack = () => {
    router.replace("/screens/AdminDashboard");
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pending Items</Text>
      </View>

      <FlatList
        data={pendingItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const imageSource = item.photoBase64
            ? { uri: `data:image/jpeg;base64,${item.photoBase64}` }
            : { uri: "https://via.placeholder.com/180" };
          return (
            <View style={styles.card}>
              <Image source={imageSource} style={styles.image} />
              <Text style={styles.text}>Name: {item.itemName || "N/A"}</Text>
              <Text style={styles.text}>Location: {item.location || "N/A"}</Text>
              <Text style={styles.text}>Category: {item.category || "N/A"}</Text>
              <Text style={styles.text}>Brand: {item.brandName || "N/A"}</Text>
              <Text style={styles.text}>Color: {item.color || "N/A"}</Text>
              <Text style={styles.text}>
                Date Found: {item.dateFound || "N/A"}
              </Text>
              <View style={styles.buttonRow}>
                <Button
                  title="Approve"
                  onPress={() => updateStatus(item.id, "approved")}
                  color="#4F46E5"
                />
                <Button
                  title="Reject"
                  color="red"
                  onPress={() => updateStatus(item.id, "rejected")}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
            No pending items.
          </Text>
        }
      />
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
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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