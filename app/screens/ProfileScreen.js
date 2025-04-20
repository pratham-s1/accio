import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebase/firebaseService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const user = auth.currentUser;
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName || "");
        setCollege(data.college || "");
        setPhotoBase64(data.photoBase64 || "");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        college,
        email: user.email,
        photoBase64,
      });
      Alert.alert("Success", "Profile updated");
      setEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/screens/LoginScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setUploading(true);
      const base64String = result.assets[0].base64;
      setPhotoBase64(base64String);
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { photoBase64: base64String },
          { merge: true }
        );
        Alert.alert("Success", "Profile picture updated");
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const photoURI = photoBase64
    ? `data:image/jpeg;base64,${photoBase64}`
    : "https://via.placeholder.com/100";

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4c8bf5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/screens/HomeScreen")}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage}>
        {uploading ? (
          <ActivityIndicator size="large" color="#4c8bf5" />
        ) : (
          <Image
            source={{ uri: photoURI }}
            style={styles.avatar}
            onError={() => setPhotoBase64("")}
          />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.info}>{user.email}</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        editable={editing}
      />

      <Text style={styles.label}>College</Text>
      <TextInput
        style={styles.input}
        value={college}
        onChangeText={setCollege}
        editable={editing}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={editing ? saveProfile : () => setEditing(true)}
      >
        <Text style={styles.buttonText}>
          {editing ? "Save Profile" : "Edit Profile"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f5",
    padding: 20,
    alignItems: "center",
    paddingTop: 60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    backgroundColor: "#ccc",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: "#444",
  },
  info: {
    alignSelf: "flex-start",
    marginLeft: 10,
    fontSize: 16,
    marginBottom: 10,
    color: "#000",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4c8bf5",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
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
