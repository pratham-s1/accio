import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView, // Added ScrollView import
  SafeAreaView, // Added SafeAreaView for better layout
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseService";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UploadItemScreen() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const GEMINI_API_KEY = "AIzaSyA8H0AAddbrJRYo-Oho1dbHrxVGrIY_DUY";

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Gallery access is required to upload an image."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64String = result.assets[0].base64;
      const base64SizeMB = (base64String.length * 3) / 4 / 1024 / 1024;
      if (base64SizeMB > 0.8) {
        Alert.alert(
          "Image Too Large",
          "Please select a smaller image (max ~800KB)."
        );
        return;
      }
      setPhotoBase64(base64String);
      analyzeImageWithGemini(base64String);
    }
  };

  const analyzeImageWithGemini = async (base64String) => {
    if (!base64String) return;

    setAnalyzing(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this image of a lost item and return JSON with predicted fields: itemName, category, color, brandName.
                    category should be one of the following: Electronics, Clothing, Accessories, Books, Stationery, Sports Equipment, Other.
                    color should be one of the following: Red, Blue, Green, Yellow, Black, White, Brown, Purple, Pink, Orange, Other. 
                    Example: {"itemName": "Wallet", "category": "Accessories", "color": "Black", "brandName": "Gucci"}`,
                  },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64String,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      const responseText = data.candidates[0].content.parts[0].text;
      const cleanedText = responseText.replace(/```json\n|\n```/g, "").trim();
      const predictedFields = JSON.parse(cleanedText);

      setItemName(predictedFields.itemName || "");
      setCategory(predictedFields.category || "");
      setColor(predictedFields.color || "");
      setBrandName(predictedFields.brandName || "");
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "AI Analysis Failed",
        "Could not auto-fill fields. Please enter details manually."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const validateDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const uploadItem = async () => {
    if (
      !itemName ||
      !location ||
      !category ||
      !color ||
      !brandName ||
      !dateFound ||
      !photoBase64
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill all fields and select a photo."
      );
      return;
    }

    if (!validateDate(dateFound)) {
      Alert.alert(
        "Invalid Date",
        "Please enter a valid date in YYYY-MM-DD format (e.g., 2025-04-21)."
      );
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to upload an item.");
      return;
    }

    setUploading(true);

    try {
      console.log("Uploading item for user:", auth.currentUser.uid);
      await addDoc(collection(db, "items"), {
        userId: auth.currentUser.uid,
        itemName,
        location,
        category,
        brandName,
        color,
        dateFound,
        photoBase64,
        status: "pending",
        userClaim: false,
        approveClaim: false,
        isAuctionActive: false,
        auctionBasePrice: 10,
        currentBid: 11,
        currentBidderName: "",
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success", "Item uploaded and awaiting admin approval.");
      router.replace("/screens/HomeScreen");
    } catch (error) {
      console.error("Upload failed:", error);
      if (error.message.includes("bytes")) {
        Alert.alert(
          "Error",
          "Image size exceeds Firestore limit. Try a smaller image."
        );
      } else {
        Alert.alert(
          "Error",
          "Something went wrong during upload: " + error.message
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const photoURI = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/screens/HomeScreen")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.heading}>Upload Lost Item</Text>
        </View>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {photoURI ? (
            <Image source={{ uri: photoURI }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imageText}>Click to select a picture</Text>
          )}
        </TouchableOpacity>
        {analyzing && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.analyzingText}>Analyzing image...</Text>
          </View>
        )}

        <TextInput
          placeholder="Item Name"
          value={itemName}
          onChangeText={setItemName}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Location Found"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Brand Name"
          value={brandName}
          onChangeText={setBrandName}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Color"
          value={color}
          onChangeText={setColor}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Date Found (YYYY-MM-DD)"
          value={dateFound}
          onChangeText={setDateFound}
          style={styles.input}
          placeholderTextColor="#888"
          // Removed keyboardType="numeric" to allow string input
        />

        <Button
          title={uploading ? "Uploading..." : "Submit"}
          onPress={uploadItem}
          disabled={uploading || analyzing}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding for scrollable content
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
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: "#000",
    fontSize: 16,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  imageText: {
    color: "#888",
  },
  analyzingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  analyzingText: {
    marginLeft: 10,
    color: "#333",
  },
});
