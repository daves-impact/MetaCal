import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web config (used by Expo/React Native Firebase JS SDK)
const firebaseConfig = {
  apiKey: "AIzaSyBrG5z0SYOuva382VzYyMniROlSMkpikD8",
  authDomain: "metacal-965a7.firebaseapp.com",
  projectId: "metacal-965a7",
  storageBucket: "metacal-965a7.firebasestorage.app",
  messagingSenderId: "365712013764",
  appId: "1:365712013764:web:94ab48ef6c6bdfeb250c91",
  measurementId: "G-JG17CGH686",
};

// Expo Go uses the web client ID for Google sign-in
// TODO: paste your Google OAuth "Web client ID" here.
export const googleWebClientId =
  "365712013764-43civmi5otf2eer2p2rssqrbko6hth80.apps.googleusercontent.com";
export const googleAndroidClientId =
  "365712013764-o4kgt9grvd0n7f5s00lm1pratmjvm1gf.apps.googleusercontent.com";
// Set this to your dedicated iOS OAuth client ID when available.
// Fallback to web client ID to avoid iOS runtime invariant crashes in Expo.
export const googleIosClientId = googleWebClientId;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };
