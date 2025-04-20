import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

const router = useRouter();
// Sample data – in real app, fetch from Firebase
const dummyClaimedItems = [
  {
    id: "1",
    itemName: "Black Wallet",
    claimedBy: "John Doe",
    claimedByEmail: "john@example.com",
    postedBy: "Alice Smith",
    postedByEmail: "alice@example.com",
    claimDate: "2025-04-01",
  },
  {
    id: "2",
    itemName: "Red Umbrella",
    claimedBy: "Sam Wilson",
    claimedByEmail: "sam@example.com",
    postedBy: "Leo Thomas",
    postedByEmail: "leo@example.com",
    claimDate: "2025-03-29",
  },
];

const ClaimedItemsScreen = () => {
  const [claimedItems, setClaimedItems] = useState([]);

  useEffect(() => {
    // In a real app, fetch data from Firebase
    setClaimedItems(dummyClaimedItems);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Text>
        Claimed By: {item.claimedBy} ({item.claimedByEmail})
      </Text>
      <Text>
        Posted By: {item.postedBy} ({item.postedByEmail})
      </Text>
      <Text>Claim Date: {item.claimDate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/screens/HomeScreen")}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Claimed Items</Text>
      <FlatList
        data={claimedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
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
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ddd",
    borderRadius: 8,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ClaimedItemsScreen;
