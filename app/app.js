// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import UploadItemScreen from "./screens/UploadItemScreen";
import PublicChatScreen from "./screens/PublicChatScreen";
import ClaimedItemsScreen from "./screens/ClaimedItemsScreen";
import AuctionScreen from "./screens/AuctionScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminLogin from "./screens/AdminLogin"; // Import your AdminLogin component
//import Navigation from './Navigation'; // or your root component

const Stack = createStackNavigator();

function app() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="UploadItem" component={UploadItemScreen} />
        <Stack.Screen name="PublicChat" component={PublicChatScreen} />
        <Stack.Screen name="ClaimedItems" component={ClaimedItemsScreen} />
        <Stack.Screen name="Auction" component={AuctionScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </NavigationContainer>
  );
}

export default app;
