// src/features/profile/services/profileService.js
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const updateProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Jika user belum ada di Firestore, buat dokumen baru
      await setDoc(userRef, profileData);
    } else {
      // Update data user yang sudah ada
      await updateDoc(userRef, profileData);
    }

    // Ambil data terbaru setelah update
    const updatedSnap = await getDoc(userRef);
    return { id: userId, ...updatedSnap.data() };
  } catch (error) {
    console.error("Error updating profile in Firestore:", error);
    throw new Error(error.message || "Failed to update profile");
  }
};
