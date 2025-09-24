import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlusfJ0-y6fCJW_G_Wr9NC08WB4NGfj5I",
  authDomain: "a01252199.firebaseapp.com",
  databaseURL: "https://a01252199-default-rtdb.firebaseio.com",
  projectId: "a01252199",
  storageBucket: "a01252199.firebasestorage.app",
  messagingSenderId: "611634904072",
  appId: "1:611634904072:web:b7da6078cb1230ac8425bd",
  measurementId: "G-H4EPF7LCK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services for React Native
const db = getFirestore(app);

// Initialize Auth with React Native persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

const storage = getStorage(app);

// Export the services for use in other parts of the app
export { app, db, auth, storage };

// Helper function to get auth instance
export const getAuthInstance = () => auth;