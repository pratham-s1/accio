import { View, Text, Button, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Image
        //source={require("/Users/prathamsingh/accio/app/assets/images/PHOTO-2025-04-04-14-47-39.jpg")}
        //source={require("/Users/prathamsingh/accio/app/WhatsApp Image 2025-04-04 at 14.47.39.jpeg")}
        source={require("/Users/sakshiarjun/Desktop/accio/app/WhatsApp Image 2025-04-04 at 14.47.39.jpeg")}
        style={styles.welcomeImage}
      />
      <Button
        title="Login"
        onPress={() => router.push("/screens/LoginScreen")}
      />
      <Button
        title="Register"
        onPress={() => router.push("/screens/RegisterScreen")}
      />
      <Button
        title="Admin Login"
        onPress={() => router.push("../screens/AdminLogin")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf3e9", // Dark background
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 32, // size
    fontWeight: "bold", // bold text
    textAlign: "center", // alignment
    fontFamily: "System", // or any custom font if loaded
    marginTop: 90,
  },
  welcomeImage: {
    width: 400,
    height: 200,
    alignSelf: "center",
    marginTop: 20,
  },
});
