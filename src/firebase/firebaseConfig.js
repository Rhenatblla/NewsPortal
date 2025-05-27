// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";       // Tambahkan import Auth
import { getFirestore } from "firebase/firestore"; // Tambahkan import Firestore

const firebaseConfig = {

  apiKey: "AIzaSyAm93kUyp3xlQqQaR7pv_bMJxQ59gd02CE",
  authDomain: "troom-app-ac9dd.firebaseapp.com",
  projectId: "troom-app-ac9dd",
  storageBucket: "troom-app-ac9dd.firebasestorage.app",
  messagingSenderId: "897310389452",
  appId: "1:897310389452:web:51927aac8e9a9ff58d3e69",
  measurementId: "G-F6V69773WY"
};


// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
