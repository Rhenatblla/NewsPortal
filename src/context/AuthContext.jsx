import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "../firebase/firebaseConfig";
import { login, register, logout, signInWithGoogle } from "../features/auth/services/authService";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          const finalUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.displayName || "",
            profilePicture: userData.profilePicture || firebaseUser.photoURL || null,
            about: userData.about || "",
            role: userData.role || "user",
          };

          setUser(finalUser);

          // 🚀 Auto redirect jika admin
          if (finalUser.role === "admin" && window.location.pathname === "/login") {
            window.location.href = "/admin-dashboard";
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await register(name, email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await signInWithGoogle();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || "Google sign-in failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      signInWithGoogle: handleGoogleLogin,
      setUser,
    }),
    [user, loading, error, handleLogin, handleRegister, handleLogout, handleGoogleLogin]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
