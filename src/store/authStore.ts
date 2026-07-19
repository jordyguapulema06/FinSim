import { create } from 'zustand';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  initialize: () => void;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  initialize: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            set({ user: userDoc.data() as UserProfile, firebaseUser, loading: false });
          } else {
            // Create default profile
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              currency: 'USD',
              language: 'es',
              theme: 'dark'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            set({ user: newProfile, firebaseUser, loading: false });
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
          set({ loading: false });
        }
      } else {
        set({ user: null, firebaseUser: null, loading: false });
      }
    });
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, firebaseUser: null });
  },
  updateProfile: async (updates) => {
    const { user, firebaseUser } = get();
    if (!user || !firebaseUser) return;
    const updatedUser = { ...user, ...updates };
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true });
      set({ user: updatedUser });
    } catch (e) {
      console.error("Error updating profile", e);
    }
  }
}));
