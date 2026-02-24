import { createContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user ?? null);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return credential.user;
  };

  const signIn = async (email, password) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return credential.user;
  };

  const updateUserProfile = async (payload) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, payload);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  };

  const getFriendlyAuthError = (error) => {
    const code = error?.code || "";
    if (code.includes("auth/invalid-email"))
      return "That email looks invalid. Please check and try again.";
    if (code.includes("auth/user-not-found"))
      return "No account found for this email. Create an account instead.";
    if (code.includes("auth/wrong-password"))
      return "That password is incorrect. Please try again.";
    if (code.includes("auth/too-many-requests"))
      return "Too many attempts. Please wait a few minutes and try again.";
    if (code.includes("auth/email-already-in-use"))
      return "This email is already registered. Try logging in.";
    if (code.includes("auth/weak-password"))
      return "Password is too weak. Use at least 6 characters.";
    if (code.includes("auth/network-request-failed"))
      return "Network error. Check your connection and try again.";
    if (code.includes("auth/popup-closed-by-user"))
      return "Sign‑in was canceled. Please try again.";
    if (code.includes("auth/invalid-credential"))
      return "That email or password didn’t match. Please try again.";
    if (code.includes("auth/operation-not-allowed"))
      return "This sign‑in method isn’t enabled yet.";
    if (code.includes("auth/user-disabled"))
      return "This account has been disabled. Contact support.";
    return error?.message || "Something went wrong. Please try again.";
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await firebaseSignOut(auth);
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      authUser,
      authLoading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateUserProfile,
      sendVerificationEmail,
      getFriendlyAuthError,
    }),
    [authUser, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
