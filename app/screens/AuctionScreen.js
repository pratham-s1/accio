import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebaseService";

export default function AuctionScreen() {
  const router = useRouter();
  const [auctionItems, setAuctionItems] = useState([]);
  const [bids, setBids] = useState({}); // { itemId: bidAmount }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate timestamp for 3 days ago
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const threeDaysAgoTimestamp = Timestamp.fromDate(threeDaysAgo);

    console.log(
      "Querying items on or before:",
      threeDaysAgoTimestamp.toDate().toISOString()
    );

    // Query items: approved, auction active, and within 3 days
    const itemsQuery = query(
      collection(db, "items"),
      where("status", "==", "approved"),
      where("isAuctionActive", "==", true),
      //where("timestamp", "<=", threeDaysAgoTimestamp)
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //console.log("Fetched auction items:", items);
        setAuctionItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching auction items:", error);
        Alert.alert("Error", "Failed to load auction items.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const placeBid = async (itemId, item) => {
    const bidAmount = parseFloat(bids[itemId] || "0");
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      Alert.alert("Invalid Bid", "Please enter a valid positive bid amount.");
      return;
    }

    const currentBid = item.currentBid || item.auctionBasePrice || 0;
    if (bidAmount <= currentBid) {
      Alert.alert("Invalid Bid", "Bid must be higher than the current bid.");
      return;
    }

    try {
      const bidderName = "Anonymous"; // Hardcoded since no authentication
      const itemRef = doc(db, "items", itemId);

      console.log("Placing bid:", { itemId, bidAmount, bidderName });

      await runTransaction(db, async (transaction) => {
        const itemSnap = await transaction.get(itemRef);
        if (!itemSnap.exists()) {
          throw new Error("Item no longer exists.");
        }
        const itemData = itemSnap.data();
        //console.log("Item data:", itemData);

        if (!itemData.isAuctionActive) {
          throw new Error("This auction is no longer active.");
        }

        const currentBid = itemData.currentBid || itemData.auctionBasePrice || 0;
        if (bidAmount <= currentBid) {
          throw new Error("Your bid is no longer higher than the current bid.");
        }

        transaction.update(itemRef, {
          currentBid: bidAmount,
          currentBidderName: bidderName,
        });
      });

      Alert.alert("Success", "Bid placed successfully!");
      setBids((prev) => ({ ...prev, [itemId]: "" })); // Clear input
    } catch (error) {
      console.error("Error placing bid:", error);
      Alert.alert("Error", `Failed to place bid: ${error.message}`);
    }
  };

  const renderItem = ({ item }) => {
    const photoURI = item.photoBase64
      ? `data:image/jpeg;base64,${item.photoBase64}`
      : "https://via.placeholder.com/150";

    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: photoURI }} style={styles.image} />
        <Text style={styles.itemText}>Item: {item.itemName}</Text>
        <Text style={styles.itemText}>Category: {item.category}</Text>
        <Text style={styles.itemText}>
          Base Price: ${item.auctionBasePrice?.toFixed(2) || "N/A"}
        </Text>
        <Text style={styles.itemText}>
          Current Bid: $
          {item.currentBid?.toFixed(2) ||
            item.auctionBasePrice?.toFixed(2) ||
            "N/A"}
        </Text>
        <Text style={styles.itemText}>
          Bidder: {item.currentBidderName || "None"}
        </Text>
        <TextInput
          style={styles.bidInput}
          placeholder="Enter your bid"
          keyboardType="numeric"
          value={bids[item.id] || ""}
          onChangeText={(text) =>
            setBids((prev) => ({ ...prev, [item.id]: text }))
          }
        />
        <Button title="Place Bid" onPress={() => placeBid(item.id, item)} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/screens/HomeScreen")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.heading}>Auction</Text>
      </View>
      {auctionItems.length === 0 ? (
        <Text style={styles.noItemsText}>No items available for auction.</Text>
      ) : (
        <FlatList
          data={auctionItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  list: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: "#E0E7FF",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: "100",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    color: "#1E293B",
    marginBottom: 5,
  },
  bidInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  noItemsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});