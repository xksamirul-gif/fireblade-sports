import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db, handleFirestoreError } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  balance: number;
  role: 'admin' | 'player' | 'agent';
  ffIgn?: string;
  ffUid?: string;
  xp?: number;
  level?: number;
  totalWinnings?: number;
  kills?: number;
  matchesPlayed?: number;
  lastCheckIn?: string;
  referralCode?: string;
  referredBy?: string;
  badges?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  login: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'xksamirul@gmail.com',
  'mahi2007raj@gmail.com'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (u) {
        // Sync profile
        const userRef = doc(db, "users", u.uid);
        unsubProfile = onSnapshot(userRef, async (snap) => {
          const isInitialAdmin = ADMIN_EMAILS.includes(u.email || "");
          
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            
            // Proactive admin doc update if missing
            if (isInitialAdmin) {
              if (data.role !== "admin") {
                 // Promote to admin
                 setDoc(userRef, { role: "admin" }, { merge: true });
              }
              await setDoc(doc(db, "admins", u.uid), { email: u.email }, { merge: true });
            }
          } else {
            // Create profile
            const newProfile: UserProfile = {
              userId: u.uid,
              displayName: u.displayName || "Tactical Player",
              email: u.email || "",
              balance: 0,
              role: isInitialAdmin ? "admin" : "player",
              xp: 0,
              level: 1,
              totalWinnings: 0,
              kills: 0,
              matchesPlayed: 0,
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
              badges: ["Recruit"]
            };
            await setDoc(userRef, newProfile);
            
            if (isInitialAdmin) {
              await setDoc(doc(db, "admins", u.uid), { email: u.email });
            }
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, "get", `users/${u.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: !!user?.email && ADMIN_EMAILS.includes(user.email), 
      isAgent: profile?.role === 'agent',
      login, 
      loginEmail,
      registerEmail,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
