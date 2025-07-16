// src/features/auth/services/authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { auth } from '../../../firebase/firebaseConfig';
import { db } from '../../../firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// 🔐 Fungsi login
export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Ambil data user dari Firestore
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Jika belum ada, buat user baru di Firestore (optional)
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || '',
      profilePicture: user.photoURL || null,
      about: '',
      role: email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user', // ✅ auto assign role
    });
  }

  return {
    uid: user.uid,
    email: user.email,
    name: userSnap.data()?.name || user.displayName || '',
    profilePicture: userSnap.data()?.profilePicture || user.photoURL || null,
    about: userSnap.data()?.about || '',
    role: userSnap.data()?.role || (email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user'),
  };
};

// 🔐 Fungsi register
export const register = async (name, email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Tambahkan user ke Firestore
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    name,
    email,
    profilePicture: user.photoURL || null,
    about: '',
    role: email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user',
  });

  return {
    uid: user.uid,
    email: user.email,
    name,
    profilePicture: user.photoURL || null,
    about: '',
    role: email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user',
  };
};

// 🔓 Logout
export const logout = async () => {
  await signOut(auth);
};

// 🔐 Google Sign In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || '',
      email: user.email,
      profilePicture: user.photoURL || null,
      about: '',
      role: user.email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user',
    });
  }

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || '',
    profilePicture: user.photoURL || null,
    about: '',
    role: user.email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user',
  };
};
