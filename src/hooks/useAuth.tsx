import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  sendVerificationCode,
  verifyCodeAndSignIn,
  signOutUser,
  onAuthStateChange,
  getUserProfile,
  UserProfile,
  ConfirmationResult
} from '../services/authService';

interface AuthUser {
  uid: string;
  phoneNumber: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  userData: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendCode: (phoneNumber: string) => Promise<{ success: boolean; verificationId?: string; error?: string; confirmationResult?: ConfirmationResult }>;
  verifyCode: (verificationId: string, code: string, phoneNumber: string, name?: string, confirmationResult?: ConfirmationResult) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for persisted session on app start
  useEffect(() => {
    const loadPersistedSession = async () => {
      try {
        console.log('Loading persisted session...');
        const persistedUser = await AsyncStorage.getItem('currentUser');
        const persistedUserData = await AsyncStorage.getItem('userData');

        if (persistedUser && persistedUserData) {
          const user = JSON.parse(persistedUser) as AuthUser;
          const userData = JSON.parse(persistedUserData) as UserProfile;

          console.log('Found persisted session for user:', user.uid);
          setUser(user);
          setUserData(userData);
        } else {
          console.log('No persisted session found');
        }
      } catch (error) {
        console.error('Error loading persisted session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedSession();
  }, []);

  // Set up Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          emailVerified: firebaseUser.emailVerified
        };
        setUser(authUser);

        // Get user profile from Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserData(profile);

          // Persist session for real Firebase users
          await AsyncStorage.setItem('currentUser', JSON.stringify(authUser));
          await AsyncStorage.setItem('userData', JSON.stringify(profile));
        } catch (error) {
          console.error('Error getting user profile:', error);
        }
      } else {
        // User is signed out - only clear if it's a real Firebase signout
        // Don't clear on app initialization
        if (user && !user.uid.startsWith('mock_user_')) {
          console.log('Firebase user signed out, clearing session');
          setUser(null);
          setUserData(null);
          await AsyncStorage.removeItem('currentUser');
          await AsyncStorage.removeItem('userData');
        }
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const sendCode = async (phoneNumber: string) => {
    try {
      return await sendVerificationCode(phoneNumber);
    } catch (error) {
      console.error('Error sending code:', error);
      return { success: false, error: 'Error enviando código' };
    }
  };

  const verifyCode = async (
    verificationId: string,
    code: string,
    phoneNumber: string,
    name?: string,
    confirmationResult?: ConfirmationResult
  ) => {
    try {
      const result = await verifyCodeAndSignIn(
        verificationId,
        code,
        phoneNumber,
        name,
        confirmationResult
      );

      if (result.success) {
        console.log('Verification successful, updating auth state manually');

        // For mock authentication, we need to manually update the auth state
        // since Firebase Auth state listener won't be triggered
        if (result.user) {
          // Create auth user object
          const authUser: AuthUser = {
            uid: result.user.uid,
            phoneNumber: result.user.phone,
            emailVerified: false
          };

          // Update state manually
          setUser(authUser);
          setUserData(result.user);
          setIsLoading(false);

          // Persist session for mock users
          try {
            await AsyncStorage.setItem('currentUser', JSON.stringify(authUser));
            await AsyncStorage.setItem('userData', JSON.stringify(result.user));
            console.log('Mock user session persisted');
          } catch (error) {
            console.error('Error persisting mock user session:', error);
          }

          console.log('Auth state updated manually for user:', result.user.uid);
        }

        return { success: true };
      } else {
        return { success: false, error: result.error || 'Error en la verificación' };
      }
    } catch (error) {
      console.error('Error in verifyCode:', error);
      return { success: false, error: 'Error en la verificación' };
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();

      // Clear AsyncStorage data from legacy auth system
      try {
        await AsyncStorage.multiRemove([
          'authToken',
          'userData',
          'userRole',
          'mockAuthState',
          'currentUser',
          'userPhone',
          'adminAuth',
          'guardAuth'
        ]);
        console.log('Cleared AsyncStorage auth data');
      } catch (storageError) {
        console.error('Error clearing AsyncStorage:', storageError);
      }

      // For mock authentication, we need to manually clear the auth state
      // since Firebase Auth state listener won't be triggered
      if (user?.uid?.startsWith('mock_user_')) {
        console.log('Clearing mock auth state manually');
        setUser(null);
        setUserData(null);
        setIsLoading(false);
      }

      // Auth state will be updated by the listener for real Firebase users
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (user?.uid) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserData(profile);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user && !!userData,
    sendCode,
    verifyCode,
    signOut,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};