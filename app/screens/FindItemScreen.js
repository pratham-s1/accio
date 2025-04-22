import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView, // Added ScrollView import
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../firebase/firebaseService";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FindItemScreen() {
  const router = useRouter();
  const [itemType, setItemType] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Predefined tags
  const itemTypes = [
    { label: "Select Item Type", value: "" },
    { label: "Wallet", value: "Wallet" },
    { label: "Phone", value: "Phone" },
    { label: "Keys", value: "Keys" },
    { label: "Bag", value: "Bag" },
    { label: "Accessories", value: "Accessories" },
    { label: "Clothing", value: "Clothing" },
    { label: "Electronics", value: "Electronics" },
    { label: "Beverages", value: "Beverages" },
    { label: "Shoes", value: "Shoes" },
    { label: "Stationery", value: "Stationery" },
    { label: "Other", value: "Other" },
  ];

  const colors = [
    { label: "Select Color", value: "" },
    { label: "Black", value: "Black" },
    { label: "Blue", value: "Blue" },
    { label: "Red", value: "Red" },
    { label: "Green", value: "Green" },
    { label: "White", value: "White" },
    { label: "Gold", value: "Gold" },
    { label: "Yellow", value: "Yellow" },
    { label: "Navy Blue", value: "Navy Blue" },
    { label: "Other", value: "Other" },
  ];

  const locations = [
    { label: "Select Location", value: "" },
    { label: "Library", value: "Library" },
    { label: "Cafeteria", value: "Cafeteria" },
    { label: "Classroom", value: "Classroom" },
    { label: "Gym", value: "Gym" },
    { label: "Parking Lot", value: "Parking Lot" },
  ];

  const searchItems = async () => {
    if (!itemType && !color && !location) {
      Alert.alert("Error", "Please select at least one filter to search.");
      return;
    }
    console.log(
      itemType, color, location
    )
    setLoading(true);
    setSelectedItemId(null);
    try {
      let q = query(
        collection(db, "items"),
        where("status", "==", "approved"),
        where("userClaim", "==", false)
      );

      if (itemType) {
        q = query(q, where("category", "==", itemType));
      }
      if (color) {
        q = query(q, where("color", "==", color));
      }
      if (location) {
        q = query(q, where("location", "==", location));
      }

      const snapshot = await getDocs(q);
      console.log("Search snapshot size:", snapshot.size);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Search results:", items);
      setSearchResults(items);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const claimItem = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to claim an item.");
      return;
    }

    if (!selectedItemId) {
      Alert.alert("Error", "Please select an item to claim.");
      return;
    }

    setClaiming(true);
    try {
      const itemRef = doc(db, "items", selectedItemId);
      await updateDoc(itemRef, {
        userClaim: true,
        claimedBy: auth.currentUser.uid,
        claimTimestamp: new Date().toISOString(),
      });
      Alert.alert("Success", "To claim this item, visit the security section.", [
        {
          text: "OK",
          onPress: () => router.replace("/screens/HomeScreen"),
        },
      ]);
    } catch (error) {
      console.error("Claim error:", error);
      Alert.alert("Error", "Failed to claim item: " + error.message);
    } finally {
      setClaiming(false);
    }
  };

  const renderItem = ({ item }) => {
    const imageSource = item.photoBase64
      ? { uri: `data:image/jpeg;base64,${item.photoBase64}` }
      : { uri: "https://via.placeholder.com/180" };
    const isSelected = item.id === selectedItemId;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => setSelectedItemId(item.id)}
      >
        <Image source={imageSource} style={styles.image} />
        <Text style={styles.text}>Name: {item.itemName || "N/A"}</Text>
        <Text style={styles.text}>Location: {item.location || "N/A"}</Text>
        <Text style={styles.text}>Category: {item.category || "N/A"}</Text>
        <Text style={styles.text}>Brand: {item.brandName || "N/A"}</Text>
        <Text style={styles.text}>Color: {item.color || "N/A"}</Text>
        <Text style={styles.text}>Date Found: {item.dateFound || "N/A"}</Text>
      </TouchableOpacity>
    );
  };

  console.log("Rendering FindItemScreen, searchResults length:", searchResults.length);
  console.log("Rendering Claim button:", searchResults.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Ensure taps work when keyboard is open
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/screens/HomeScreen")}
          >
            <Ionicons name="arrow-back" size={28} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.heading}>Find Lost Item</Text>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.label}>What item have you lost?</Text>
          <Picker
            selectedValue={itemType}
            onValueChange={(value) => setItemType(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {itemTypes.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
                style={styles.pickerItem}
              />
            ))}
          </Picker>

          <Text style={styles.label}>What was the color?</Text>
          <Picker
            selectedValue={color}
            onValueChange={(value) => setColor(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {colors.map((c) => (
              <Picker.Item
                key={c.value}
                label={c.label}
                value={c.value}
                style={styles.pickerItem}
              />
            ))}
          </Picker>

          <Text style={styles.label}>Where did you lose it?</Text>
          <Picker
            selectedValue={location}
            onValueChange={(value) => setLocation(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {locations.map((loc) => (
              <Picker.Item
                key={loc.value}
                label={loc.label}
                value={loc.value}
                style={styles.pickerItem}
              />
            ))}
          </Picker>

          <TouchableOpacity
            style={[styles.findButton, loading && styles.disabledButton]}
            onPress={searchItems}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Searching..." : "Find"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              contentContainerStyle={styles.listContent}
              nestedScrollEnabled // Enable nested scrolling for FlatList
            />
            <TouchableOpacity
              style={[
                styles.claimButton,
                (!selectedItemId || claiming) && styles.disabledButton,
              ]}
              onPress={claimItem}
              disabled={!selectedItemId || claiming}
            >
              <Text style={styles.buttonText}>
                {claiming ? "Claiming..." : "Claim"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noResultsText}>
            No items found. Try different filters.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Add padding to ensure content isn't cut off
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginRight: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 8,
    fontWeight: "600",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    color: "#000",
    ...Platform.select({
      ios: {
        padding: 10,
      },
      android: {
        height: 50,
      },
    }),
  },
  pickerItem: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  findButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  claimButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 15,
    minHeight: 50,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resultsList: {
    flex: 0,
    maxHeight: "80%",
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#4F46E5",
    borderWidth: 2,
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
    color: "#2c3e50",
  },
  noResultsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 15,
  },
  loader: {
    marginTop: 20,
  },
});