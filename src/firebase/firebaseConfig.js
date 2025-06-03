// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";       // Tambahkan import Auth
import { getFirestore } from "firebase/firestore"; // Tambahkan import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyATmDXCPGQmNU3ckeSwgDsF1LACNDVxf_o",
  authDomain: "news-portal-47272.firebaseapp.com",
  projectId: "news-portal-47272",
  storageBucket: "news-portal-47272.firebasestorage.app",
  messagingSenderId: "423698188243",
  appId: "1:423698188243:web:61b4654124f4c9e4949126",
  measurementId: "G-B6F0TQPTX6"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
