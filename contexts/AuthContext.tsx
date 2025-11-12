import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { app } from '../src/firebaseConfig';
import { track } from '../utils/analytics';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Track authentication state for analytics
      if (user) {
        track.action('user_login', 'authentication');
      }
    });

    return unsubscribe;
  }, [auth]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      track.action('user_signup', 'authentication');
      return userCredential;
    } catch (error) {
      track.error('signup_error', JSON.stringify(error));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      track.action('user_signin', 'authentication');
      return result;
    } catch (error) {
      track.error('signin_error', JSON.stringify(error));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      track.action('user_logout', 'authentication');
    } catch (error) {
      track.error('logout_error', JSON.stringify(error));
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await updateProfile(currentUser, { displayName });
      // Force refresh the user object
      setCurrentUser({ ...currentUser });
      track.action('profile_update', 'user');
    } catch (error) {
      track.error('profile_update_error', JSON.stringify(error));
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;