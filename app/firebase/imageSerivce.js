import { db } from "./firebaseService";

// create a function to accept a image and convert it into base64 and upload it to firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImage = async (blob) => {
    const storageRef = ref(storage, `images/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
}