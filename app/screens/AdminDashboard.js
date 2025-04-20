// screens/AdminDashboard.js
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

export default function AdminDashboard() {
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
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched pending items:", items); // Debug data
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
      fetchPendingItems(); // Refresh the list
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update item status.");
    }
  };

  const handleLogout = () => {
    // No Firebase Auth to sign out, just navigate back
    router.replace("/screens/AdminLoginScreen");
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Items</Text>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pendingItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const imageSource = item.photoBase64
            ? { uri: `data:image/jpeg;base64,${item.photoBase64}` }
            : { uri: item.imageUrl || "https://via.placeholder.com/180" };
          return (
            <View style={styles.card}>
              <Image source={imageSource} style={styles.image} />
              <Text style={styles.text}>Name: {item.itemName}</Text>
              <Text style={styles.text}>Location: {item.location}</Text>
              <Text style={styles.text}>Category: {item.category}</Text>
              <View style={styles.buttonRow}>
                <Button
                  title="Approve"
                  onPress={() => updateStatus(item.id, "approved")}
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
          <Text style={{ textAlign: "center", marginTop: 20 }}>
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
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
  },
  logoutButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
