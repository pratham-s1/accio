import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../firebase/firebaseService";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function ApproveClaimedScreen() {
  const router = useRouter();
  const [claimedItems, setClaimedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    const fetchClaimedItems = async () => {
      try {
        const q = query(
          collection(db, "items"),
          where("userClaim", "==", true)
        );
        const snapshot = await getDocs(q);
        console.log("Claimed items snapshot size:", snapshot.size);
        console.log(doc)
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Claimed items:", items);
        setClaimedItems(items);
      } catch (error) {
        console.error("Error fetching items:", error);
        Alert.alert("Error", "Failed to load claimed items: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimedItems();
  }, []);

  const handleApprove = async (itemId) => {
    setApproving((prev) => ({ ...prev, [itemId]: true }));
    try {
      const itemRef = doc(db, "items", itemId);
      await updateDoc(itemRef, {
        approveClaim: true,
        approveTimestamp: new Date().toISOString(),
      });
      Alert.alert("Success", "Item claim approved.");
      // Refresh list
      const q = query(collection(db, "items"), where("userClaim", "==", true));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClaimedItems(items);
    } catch (error) {
      console.error("Approve error:", error);
      Alert.alert("Error", "Failed to approve item: " + error.message);
    } finally {
      setApproving((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const renderItem = ({ item }) => {
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
        <Text style={styles.text}>Date Found: {item.dateFound || "N/A"}</Text>
        <Text style={styles.text}>Claimed By: {item.claimedBy || "N/A"}</Text>
        <Text style={styles.text}>
          Claim Timestamp: {item.claimTimestamp || "N/A"}
        </Text>
        {item.approveClaim ? (
          <Text style={[styles.text, styles.approvedText]}>Status: Approved</Text>
        ) : (
          <TouchableOpacity
            style={[
              styles.approveButton,
              approving[item.id] && styles.disabledButton,
            ]}
            onPress={() => handleApprove(item.id)}
            disabled={approving[item.id]}
          >
            <Text style={styles.buttonText}>
              {approving[item.id] ? "Approving..." : "Approve"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleBack = () => {
    router.replace("/screens/AdminDashboard");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Approve Claimed Items</Text>
      </View>
      {claimedItems.length > 0 ? (
        <FlatList
          data={claimedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noResultsText}>
          No claimed items awaiting approval.
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  resultsList: {
    flex: 0,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
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
  approvedText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  approveButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    minHeight: 40,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 20,
  },
});