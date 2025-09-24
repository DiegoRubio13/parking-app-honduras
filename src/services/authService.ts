import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, getRecaptchaVerifier } from './firebase';
import { Platform } from 'react-native';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  verificationId?: string;
  isNewUser?: boolean;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  role?: 'client' | 'admin' | 'guard';
}

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  email?: string;
  role: 'client' | 'admin' | 'guard';
  balance?: number;
  createdAt: string;
  isActive: boolean;
  lastLoginAt: string;
  settings: {
    notifications: boolean;
    language: 'es' | 'en';
    theme: 'light' | 'dark';
  };
}

// Send verification code - Expo compatible version
export const sendVerificationCode = async (phoneNumber: string): Promise<{ success: boolean; verificationId?: string; error?: string; confirmationResult?: ConfirmationResult }> => {
  try {
    console.log('Sending verification code to:', phoneNumber);

    if (Platform.OS === 'web') {
      const recaptchaVerifier = getRecaptchaVerifier();
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);

      console.log('Verification code sent successfully via Firebase (web)');
      return {
        success: true,
        verificationId: confirmationResult.verificationId,
        confirmationResult
      };
    } else {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, null as any);

      console.log('Verification code sent successfully via Firebase (native)');
      return {
        success: true,
        verificationId: confirmationResult.verificationId,
        confirmationResult
      };
    }
  } catch (error: any) {
    console.error('Error sending verification code:', error);

    // Provide more specific error messages
    let errorMessage = 'Error enviando código de verificación';

    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Número de teléfono inválido. Verifica el formato (+504XXXXXXXX)';
    } else if (error.code === 'auth/missing-phone-number') {
      errorMessage = 'Número de teléfono requerido';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'Se ha excedido el límite de SMS. Intenta más tarde';
    } else if (error.code === 'auth/app-not-authorized') {
      errorMessage = 'La aplicación no está autorizada para usar Firebase Auth';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Verify code and sign in
export const verifyCodeAndSignIn = async (
  verificationId: string,
  code: string,
  phoneNumber: string,
  name?: string,
  confirmationResult?: ConfirmationResult
): Promise<AuthResult> => {
  try {
    let userCredential;


    if (confirmationResult) {
      userCredential = await confirmationResult.confirm(code);
    } else {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      userCredential = await signInWithCredential(auth, credential);
    }

    const user = userCredential.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let userProfile: UserProfile;

    if (!userDoc.exists()) {
      // Check if this is admin or guard phone number
      const isAdminPhone = phoneNumber === '+50499999999';
      const isGuardPhone = phoneNumber === '+50488888888';

      let userRole: 'client' | 'admin' | 'guard' = 'client';
      let userName = 'Usuario';

      if (isAdminPhone) {
        userRole = 'admin';
        userName = 'Admin';
      } else if (isGuardPhone) {
        userRole = 'guard';
        userName = 'Guardia';
      }

      // Create new user profile
      userProfile = {
        uid: user.uid,
        phone: phoneNumber,
        name: name || userName,
        role: userRole,
        balance: 0,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        settings: {
          notifications: true,
          language: 'es',
          theme: 'light'
        }
      };

      await setDoc(userDocRef, userProfile);
      console.log('Created new Firebase user profile with role:', userProfile.role);
    } else {
      // Update existing user
      userProfile = userDoc.data() as UserProfile;
      console.log('Existing Firebase user found with role:', userProfile.role, 'for phone:', phoneNumber);

      // Check if this is admin or guard phone number and update role if needed
      const isAdminPhone = phoneNumber === '+50499999999';
      const isGuardPhone = phoneNumber === '+50488888888';

      if (isAdminPhone && userProfile.role !== 'admin') {
        console.log('Updating Firebase user role to admin for phone:', phoneNumber);
        userProfile.role = 'admin';
        userProfile.name = 'Admin';
        await updateDoc(userDocRef, {
          role: 'admin',
          name: 'Admin',
          lastLoginAt: new Date().toISOString()
        });
      } else if (isGuardPhone && userProfile.role !== 'guard') {
        console.log('Updating Firebase user role to guard for phone:', phoneNumber);
        userProfile.role = 'guard';
        userProfile.name = 'Guardia';
        await updateDoc(userDocRef, {
          role: 'guard',
          name: 'Guardia',
          lastLoginAt: new Date().toISOString()
        });
      } else {
        await updateDoc(userDocRef, {
          lastLoginAt: new Date().toISOString()
        });
      }
      console.log('Updated existing Firebase user profile with final role:', userProfile.role);
    }

    return {
      success: true,
      user: userProfile
    };
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      error: error.message || 'Código de verificación inválido'
    };
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Register new user with full profile
export const registerUser = async (
  registerData: RegisterData
): Promise<{ success: boolean; verificationId?: string; error?: string; confirmationResult?: ConfirmationResult }> => {
  try {
    console.log('Registering new user:', registerData.phone);

    const tempUserProfile: Partial<UserProfile> = {
      phone: registerData.phone,
      name: registerData.name,
      email: registerData.email,
      role: registerData.role || 'client',
    };

    const tempUid = `temp_${registerData.phone.replace(/\D/g, '')}_${Date.now()}`;

    await setDoc(doc(db, 'temp_registrations', tempUid), {
      ...tempUserProfile,
      createdAt: new Date().toISOString(),
      verified: false
    });

    return await sendVerificationCode(registerData.phone);
  } catch (error: any) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error.message || 'Error al registrar usuario'
    };
  }
};

// Complete registration after SMS verification
export const completeRegistration = async (
  verificationId: string,
  code: string,
  phoneNumber: string,
  confirmationResult?: ConfirmationResult
): Promise<AuthResult> => {
  try {
    let tempRegDoc;
    let tempRegRef;

    const tempRegsSnapshot = await getDoc(doc(db, 'temp_registrations', `temp_${phoneNumber.replace(/\D/g, '')}`));

    if (!tempRegsSnapshot.exists()) {
      return {
        success: false,
        error: 'No se encontró información de registro. Por favor intenta registrarte de nuevo.'
      };
    }

    const tempData = tempRegsSnapshot.data();

    if (confirmationResult) {
      const userCredential = await confirmationResult.confirm(code);
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        phone: phoneNumber,
        name: tempData.name,
        email: tempData.email,
        role: tempData.role || 'client',
        balance: 0,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        settings: {
          notifications: true,
          language: 'es',
          theme: 'light'
        }
      };

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, userProfile);

      await deleteDoc(tempRegsSnapshot.ref);

      return {
        success: true,
        user: userProfile,
        isNewUser: true
      };
    }

    return {
      success: false,
      error: 'Error en la verificación'
    };
  } catch (error: any) {
    console.error('Error completing registration:', error);
    return {
      success: false,
      error: error.message || 'Error completando el registro'
    };
  }
};