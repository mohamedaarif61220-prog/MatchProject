import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration with environment variable support & safe default fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBRcx7_FqLG5n2NMGYXKqlue2bUEdjRbf0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "projectmatch-c7bc9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "projectmatch-c7bc9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "projectmatch-c7bc9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "800007823918",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:800007823918:web:52821f6128d3ba4ae275bf"
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