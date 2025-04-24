# Accio - Lost and Found App for College Campuses 🧙‍♂️

**Accio** is a mobile application designed to streamline the process of identifying, claiming, and managing lost items on college campuses. By integrating with campus security systems, Accio provides an intuitive platform for students, staff, and security personnel to report, search for, and recover lost items efficiently. The app leverages AI-powered image analysis, real-time communication, and an auction system for unclaimed items, making it a comprehensive solution for campus lost-and-found needs. 🚀

Built with **React Native** and **Firebase**, Accio ensures a seamless user experience across iOS and Android devices, with real-time updates and secure data management. The app uses the **Gemini 1.5** model for AI-driven image analysis to enhance item identification. 🖼️


## Features ✨
Accio offers a robust set of features tailored to the needs of college campuses:

1. **Upload an Item** 📤:
   - Users can report lost or found items by uploading details such as item name, category, brand, color, location, and a photo.
   - The upload process is streamlined via the `UploadItemScreen`, allowing quick submissions for review by campus security.

2. **AI Analysis of Images** 🧠:
   - Powered by the **Gemini 1.5** model, Accio analyzes uploaded item images to extract metadata (e.g., item type, color, brand) and improve search accuracy.
   - Enhances the ability to match lost items with user queries automatically.

3. **Find an Item** 🔍:
   - The `FindItemScreen` enables users to search for lost items using keywords, categories, or filters (e.g., location, date).
   - Displays item details, including images, to help users identify their belongings.

4. **Claim an Item** ✅:
   - Users can submit claims for items via the `ClaimedItemsScreen`, which displays approved claims with details like item name, category, brand, and claim timestamp.
   - Campus security reviews claims, and approved claims are tracked with `approveClaim` and `claimTimestamp` fields.

5. **Real-Time Public Chat** 💬:
   - The `PublicChatScreen` provides a real-time chat feature for users to discuss lost items, coordinate with security, or share information.
   - Integrated with Firebase Firestore for instant messaging and notifications.

6. **Auction Feature** 💸:
   - Unclaimed items are listed for auction via the `AuctionScreen`, where users can bid on items after a set period (e.g., 3 days).
   - Features real-time bid updates, base price display, and bidder information, ensuring a transparent bidding process.


- **Home Screen**: Displays navigation cards and announcements. 🏠
- **Upload Item**: Form for submitting lost/found items with image upload. 📷
- **Find Item**: Search interface with filters and item previews. 🔎
- **Claimed Items**: List of approved claims with item details and images. ✔️
- **Public Chat**: Real-time chat for community interaction. 🗣️
- **Auction**: Bidding interface with current bids and item images. 🛒

## Installation 🔧
To run Accio locally, follow these steps:

### Prerequisites
- **Node.js** (v16 or higher) 🟢
- **npm** or **yarn** 📦
- **React Native CLI** ⚛️
- **Firebase account** (for Firestore, Authentication, and Storage) 🔥
- **Gemini 1.5 API key** (for AI image analysis) 🤖

### Steps
1. **Clone the Repository** 📥:
   ```bash
   git clone https://github.com/yourusername/accio.git
   cd accio
2. **Install Dependencies** ⚙️:
   ```bash
   npm install
   or
   yarn install
3. **Set Up Firebase** 🔥:
   - Create a Firebase project at console.firebase.google.com.
   - Enable Firestore, Authentication (Email/Password), and Storage.
   - Download the Firebase configuration file (google-services.json for Android, GoogleService-Info.plist for iOS).
   - Place the configuration file in the project root or update firebaseService.js with your Firebase config:
   ```bash
   const firebaseConfig = {
   apiKey: "YOUR_API_KEY",
   authDomain: "YOUR_AUTH_DOMAIN",
   projectId: "YOUR_PROJECT_ID",
   storageBucket: "YOUR_STORAGE_BUCKET",
   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
   appId: "YOUR_APP_ID",
   };
4. **Set Up Gemini 1.5** 🤖:
   - Obtain an API key for Gemini 1.5 from the provider.
   - Configure the API key in your project.
5. **Run the App** 🚀:
   - for iOS:
     ```bash
     cd ios && pod install
     npx react-native run-ios
   - for Android
     ```bash
     npx react-native run-android
6. **Firestore Security Rules** 🔒:
   Update Firestore security rules to match the app’s requirements (e.g., allow public reads for items, restricted writes):
   ```bash
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if true;
      allow update: if request.resource.data.currentBid is number
        && request.resource.data.currentBid > 0
        && request.resource.data.currentBidderName is string;
      allow create, delete: if false;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
   }
   }


## Technologies 🛠️
- **Frontend:** React Native, Expo Router ⚛️
- **Backend:** Firebase (Firestore, Authentication, Storage) 🔥
- **AI Model:** Gemini 1.5 (for image analysis) 🤖
- **Icons:** @expo/vector-icons (Ionicons, Feather) 🖌️
- **Styling:** StyleSheet with light/dark theme support 🌗
- **Navigation:** Expo Router for screen transitions 🧭
