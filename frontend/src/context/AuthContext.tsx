import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser 
} from 'firebase/auth';
import type { User } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  clearError: () => void;
  loginWithDemoProfile: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserProfile: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEMO_LEAD: User = {
  userId: "demo_user",
  name: "Demo Project Lead",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoLead",
  bio: "Lead Project Engineer and organizer for hackathons, research sprints, and startup launches.",
  primaryRole: "Product Manager",
  skills: [
    { name: "Agile", level: "Advanced" },
    { name: "Communication", level: "Advanced" }
  ],
  experience: "Advanced",
  interests: ["AI", "Strategy", "Collaboration"],
  preferredProjectTypes: ["Hackathon", "Startup"],
  availabilityHoursPerWeek: 12,
  preferredRoles: ["Product Manager", "Domain Expert"],
  portfolioLinks: ["https://linkedin.com/in/demo-lead"],
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Monitor Firebase Auth state if configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Offline/Demo Mode check on initial load
      const savedDemoUser = localStorage.getItem('pm_demo_active');
      if (savedDemoUser) {
        setIsDemoMode(true);
        dbService.getUserProfile('demo_user').then(profile => {
          setUser(profile || DEFAULT_DEMO_LEAD);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsDemoMode(false);
        try {
          // Load profile users/{auth.currentUser.uid}
          const profile = await dbService.getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
          } else {
            // Create a default initial user profile if logged in but no profile document exists
            const initialProfile: User = {
              userId: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || "New User",
              avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
              bio: "",
              primaryRole: "Full Stack Developer",
              skills: [],
              experience: "Intermediate",
              interests: [],
              preferredProjectTypes: [],
              availabilityHoursPerWeek: 10,
              preferredRoles: [],
              portfolioLinks: [],
              createdAt: new Date().toISOString()
            };
            await dbService.saveUserProfile(initialProfile);
            setUser(initialProfile);
          }
        } catch (err: any) {
          console.error("Error loading authenticated user profile:", err?.message || "Unknown error");
          setError("Failed to load user profile from Firestore.");
        }
      } else {
        // Double check local storage if user logged out of firebase but has local demo active
        const savedDemoUser = localStorage.getItem('pm_demo_active');
        if (savedDemoUser) {
          setIsDemoMode(true);
          const profile = await dbService.getUserProfile('demo_user');
          setUser(profile || DEFAULT_DEMO_LEAD);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithDemoProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      setIsDemoMode(true);
      localStorage.setItem('pm_demo_active', 'true');
      // Save/persist lead profile locally
      await dbService.saveUserProfile(DEFAULT_DEMO_LEAD);
      setUser(DEFAULT_DEMO_LEAD);
    } catch (e: any) {
      setError(e?.message || "Failed to login with demo profile");
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      const msg = err?.code ? `Firebase: Error (${err.code}) ${err.message}` : (err?.message || "Authentication failed.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = res.user.uid;
      const initialProfile: User = {
        userId: uid,
        name: name || email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
        bio: "",
        primaryRole: "Full Stack Developer",
        skills: [],
        experience: "Intermediate",
        interests: [],
        preferredProjectTypes: [],
        availabilityHoursPerWeek: 10,
        preferredRoles: [],
        portfolioLinks: [],
        createdAt: new Date().toISOString()
      };
      await dbService.saveUserProfile(initialProfile);
      setUser(initialProfile);
    } catch (err: any) {
      const msg = err?.code ? `Firebase: Error (${err.code}) ${err.message}` : (err?.message || "Registration failed.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        // Fall back to redirect if popup is blocked or fails on mobile/certain browsers
        if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/popup-closed-by-user' || popupErr?.code === 'auth/cancelled-popup-request') {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      const msg = err?.code ? `Firebase: Error (${err.code}) ${err.message}` : (err?.message || "Google Authentication failed.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      localStorage.removeItem('pm_demo_active');
      setIsDemoMode(false);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error("Error signing out:", err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      isDemoMode, 
      error, 
      clearError, 
      loginWithDemoProfile, 
      loginWithEmail, 
      registerWithEmail, 
      loginWithGoogle, 
      updateUserProfile,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
