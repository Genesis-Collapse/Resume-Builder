import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// To make this work, create a .env.local file in the root directory
// and add your Firebase project configuration variables:
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock_domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock_project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock_bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock_sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock_appid"
};

let app;
export let db = null;
export let auth = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch(e) {
  console.error("Firebase Init Error (Ensure .env.local is populated):", e);
}

// ══════════════════════════════════════════════════════════════
//  GOOGLE AUTH HELPERS
// ══════════════════════════════════════════════════════════════

const googleProvider = new GoogleAuthProvider();
// Request Google Calendar read/write scope
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

/**
 * Sign in with Google and request Calendar scopes.
 * Returns the user credential with access token.
 */
export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase Auth not initialized");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    // Store access token for Calendar API calls
    if (credential?.accessToken) {
      sessionStorage.setItem('google_access_token', credential.accessToken);
    }
    return { user: result.user, accessToken: credential?.accessToken };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

/**
 * Sign out the current user.
 */
export async function signOutUser() {
  if (!auth) return;
  sessionStorage.removeItem('google_access_token');
  return signOut(auth);
}

/**
 * Listen for auth state changes.
 */
export function onAuthChange(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the cached Google access token.
 */
export function getAccessToken() {
  return sessionStorage.getItem('google_access_token');
}
