import React, { useState, useEffect } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseService";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DatePicker from "react-native-date-picker"; // For date selection

export default function UploadItemScreen() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("");
  const [dateFound, setDateFound] = useState(new Date()); // Default to today
  const [photoBase64, setPhotoBase64] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false); // For AI analysis
  const [datePickerOpen, setDatePickerOpen] = useState(false); // Control date picker visibility

  // Analyze image with AI when a new image is picked
  useEffect(() => {
    if (photoBase64) {
      analyzeImageWithAI();
    }
  }, [photoBase64]);

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
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64String = result.assets[0].base64;
      setPhotoBase64(base64String);
    }
  };

  const analyzeImageWithAI = async () => {
    if (!photoBase64) return;

    setAnalyzing(true);
    try {
      // Call Firebase Cloud Function to analyze image
      const response = await fetch(
        "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/analyzeImage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: photoBase64 }),
        }
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update fields with AI predictions (user can still edit)
      setItemName(data.itemName || "");
      setCategory(data.category || "");
      setColor(data.color || "");
      setBrandName(data.brandName || "");
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "AI Analysis Failed",
        "Could not auto-fill fields. Please enter manually."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadItem = async () => {
    if (
      !itemName ||
      !location ||
      !category ||
      !color ||
      !brandName ||
      !photoBase64
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill all fields and select a photo."
      );
      return;
    }

    setUploading(true);

    try {
      await addDoc(collection(db, "items"), {
        userId: auth.currentUser.uid,
        itemName,
        location,
        category,
        brandName,
        color,
        dateFound: dateFound.toISOString(), // Store as ISO string
        photoBase64,
        status: "pending",
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
        Alert.alert("Error", "Something went wrong during upload.");
      }
    } finally {
      setUploading(false);
    }
  };

  const photoURI = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;

  return (
    <View style={styles.container}>
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
      />
      <TextInput
        placeholder="Location Found"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <TextInput
        placeholder="Brand Name"
        value={brandName}
        onChangeText={setBrandName}
        style={styles.input}
      />
      <TextInput
        placeholder="Color"
        value={color}
        onChangeText={setColor}
        style={styles.input}
      />
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setDatePickerOpen(true)}
      >
        <Text style={styles.datePickerText}>
          Date Found: {dateFound.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={datePickerOpen}
        date={dateFound}
        onConfirm={(date) => {
          setDatePickerOpen(false);
          setDateFound(date);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />

      <Button
        title={uploading ? "Uploading..." : "Submit"}
        onPress={uploadItem}
        disabled={uploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
});
