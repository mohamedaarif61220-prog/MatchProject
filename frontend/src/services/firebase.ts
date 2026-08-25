import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRcx7_FqLG5n2NMGYXKqlue2bUEdjRbf0",
  authDomain: "projectmatch-c7bc9.firebaseapp.com",
  projectId: "projectmatch-c7bc9",
  storageBucket: "projectmatch-c7bc9.firebasestorage.app",
  messagingSenderId: "800007823918",
  appId: "1:800007823918:web:52821f6128d3ba4ae275bf"
};

// Initialize Firebase only once
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export const isFirebaseConfigured = true;

console.log("Firebase client initialized successfully.");

export default app;