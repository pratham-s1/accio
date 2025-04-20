// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

//export const storage = getStorage(app);

const firebaseConfig = {
  apiKey: "AIzaSyCwCNM5smpHWsiSTzVnBdYJHay8fVvZDMA",
  authDomain: "accio-9f067.firebaseapp.com",
  projectId: "accio-9f067",
  storageBucket: "accio-9f067.firebasestorage.app",
  messagingSenderId: "508663145969",
  appId: "1:508663145969:web:ec7855d2dad4c34a861050",
  measurementId: "G-VNXS5HVNGK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const getAllLostItems = async () => {
  try {
    const q = query(collection(db, "items"), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Raw query result:", items); // Debug here too
    return items;
  } catch (error) {
    console.error("Error fetching approved lost items:", error);
    return [];
  }
};
//export const getAllLostItems;
//export { auth,db } from '../firebase/firebaseService';
