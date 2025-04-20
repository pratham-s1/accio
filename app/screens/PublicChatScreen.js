import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseService";

export default function PublicChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/screens/LoginScreen");
      return;
    }

    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        alert("Failed to load chat messages.");
      }
    );

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    console.log("Current user:", auth.currentUser); // Debug auth state
    if (!auth.currentUser) {
      alert("You must be logged in to send messages.");
      router.replace("/screens/LoginScreen");
      return;
    }

    const senderName =
      auth.currentUser.displayName ||
      auth.currentUser.email.split("@")[0] ||
      "Anonymous";

    try {
      const docRef = await addDoc(collection(db, "messages"), {
        sender: senderName,
        senderId: auth.currentUser.uid,
        text: inputText,
        timestamp: serverTimestamp(),
      });
      console.log("Message added with ID:", docRef.id); // Debug success
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;
    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        <Text style={styles.sender}>{item.sender}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/screens/HomeScreen")}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#f0f0f0",
  },
  chatContainer: {
    padding: 10,
    paddingBottom: 60,
  },
  messageBubble: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  currentUserBubble: {
    backgroundColor: "#4c8bf5",
    alignSelf: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  otherUserBubble: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
  },
  messageText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    paddingHorizontal: 15,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: "#4c8bf5",
    paddingHorizontal: 15,
    justifyContent: "center",
    marginLeft: 10,
    borderRadius: 20,
  },
  sendButtonText: {
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
