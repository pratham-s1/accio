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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseService";
import { useRouter } from "expo-router"; // Use hook instead of direct import
import { Ionicons } from "@expo/vector-icons"; // For back button icon

export default function UploadItemScreen() {
  const router = useRouter(); // Use hook for navigation
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const uploadItem = async () => {
    if (!itemName || !location || !category || !photoBase64) {
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
    marginRight: 15, // Space between button and heading
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333", // Slightly darker for contrast
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
});
