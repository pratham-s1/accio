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
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseService";

export default function AuctionScreen() {
  const router = useRouter();
  const [auctionItems, setAuctionItems] = useState([]);
  const [bids, setBids] = useState({}); // { itemId: bidAmount }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate timestamp for 3 days ago
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const threeDaysAgoTimestamp = Timestamp.fromDate(threeDaysAgo);

    // Log readable date
    console.log(
      "Querying items on or before:",
      threeDaysAgoTimestamp.toDate().toISOString()
    );

    // Query items: approved and auction active
    const itemsQuery = query(
      collection(db, "items"),
      where("status", "==", "approved"),
      where("isAuctionActive", "==", true)
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            console.log("Document data:", JSON.stringify(data, null, 2));
            return { id: doc.id, ...data };
          })
          .filter((item) => {
            let itemDate;
            if (typeof item.timestamp === "string") {
              itemDate = new Date(item.timestamp);
            } else if (
              item.timestamp &&
              typeof item.timestamp.toDate === "function"
            ) {
              itemDate = item.timestamp.toDate();
            } else {
              console.log(
                `Item ${item.id} has invalid timestamp:`,
                item.timestamp
              );
              return false;
            }
            const isBeforeOrOnThreeDaysAgo =
              itemDate <= threeDaysAgoTimestamp.toDate();
            console.log(
              `Item ${item.id} timestamp ${item.timestamp} is before or on 3 days ago: ${isBeforeOrOnThreeDaysAgo}, isAuctionActive: ${item.isAuctionActive}`
            );
            return isBeforeOrOnThreeDaysAgo;
          });
        console.log("Fetched auction items:", JSON.stringify(items, null, 2));
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
    if (!bidAmount || isNaN(bidAmount)) {
      Alert.alert("Invalid Bid", "Please enter a valid bid amount.");
      return;
    }

    const currentBid = item.currentBid || item.auctionBasePrice || 0;
    if (bidAmount <= currentBid) {
      Alert.alert("Invalid Bid", "Bid must be higher than the current bid.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to bid.");
        return;
      }

      const bidderName = user.displayName || user.email.split("@")[0];

      const response = await fetch(
        "https://us-central1-accio-9f067.cloudfunctions.net/placeBid",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            bidAmount,
            bidderName,
            userId: user.uid,
          }),
        }
      );

      const text = await response.text(); // Log raw response
      console.log("Raw response:", text);
      let result;
      try {
        result = await response.json(); // Attempt to parse JSON
      } catch (parseError) {
        console.error(
          "JSON Parse error:",
          parseError.message,
          "Raw text:",
          text
        );
        Alert.alert(
          "Error",
          "Invalid response from server. Check console for details."
        );
        return;
      }

      if (result.error) {
        throw new Error(result.error);
      }

      Alert.alert("Success", "Bid placed successfully!");
      setBids((prev) => ({ ...prev, [itemId]: "" })); // Clear input
    } catch (error) {
      console.error("Error placing bid:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to place bid. Check console for details."
      );
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
