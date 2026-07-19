import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyApO88GRz0TIqW8I7LjyVi_TtTWJ8LgBZ8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "finsim-76a1e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "finsim-76a1e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "finsim-76a1e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "184015303988",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:184015303989:web:8c57978f23b1757766087c"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
