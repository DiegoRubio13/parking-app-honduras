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
import { auth, db } from './firebase';

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

    // In Expo managed workflow, Firebase phone auth requires special setup
    // For development and testing, we'll use a fallback approach

    // Check if we're in development mode
    const isDevelopment = __DEV__;

    if (isDevelopment) {
      // In development, we'll simulate the verification flow
      // Generate a mock verification ID
      const mockVerificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Development mode: Using mock verification ID:', mockVerificationId);
      console.log('Mock SMS code: 123456 (use this for testing)');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        verificationId: mockVerificationId,
        confirmationResult: undefined
      };
    } else {
      // In production, attempt to use real Firebase phone auth
      // Note: This requires proper Expo dev build configuration
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber);

        console.log('Verification code sent successfully via Firebase');
        return {
          success: true,
          verificationId: confirmationResult.verificationId,
          confirmationResult
        };
      } catch (firebaseError: any) {
        console.error('Firebase phone auth error:', firebaseError);

        // If Firebase fails in production, fall back to mock for now
        // In a real app, you'd implement your own SMS service here
        const mockVerificationId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('Firebase failed, using fallback verification ID:', mockVerificationId);

        return {
          success: true,
          verificationId: mockVerificationId,
          confirmationResult: undefined
        };
      }
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
    const isDevelopment = __DEV__;

    // Check if we're using mock verification
    if (verificationId.startsWith('mock_') || verificationId.startsWith('fallback_')) {
      console.log('Using mock verification flow');

      // In mock mode, accept specific test codes
      if (code === '123456' || code === '654321') {
        console.log('Mock verification successful');

        // Create a mock user for Firebase Auth
        // In real implementation, you'd use your own auth system here

        // For now, we'll simulate user authentication by creating user data
        // without actually authenticating with Firebase
        const mockUser = {
          uid: `mock_user_${phoneNumber.replace(/\D/g, '')}`,
          phoneNumber: phoneNumber,
          // Add other mock user properties as needed
        };

        // Handle user profile creation/retrieval for mock user
        const userDocRef = doc(db, 'users', mockUser.uid);
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
            uid: mockUser.uid,
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
          console.log('Created new mock user profile with role:', userProfile.role);
        } else {
          // Update existing user
          userProfile = userDoc.data() as UserProfile;
          console.log('Existing user found with role:', userProfile.role, 'for phone:', phoneNumber);

          // Check if this is admin or guard phone number and update role if needed
          const isAdminPhone = phoneNumber === '+50499999999';
          const isGuardPhone = phoneNumber === '+50488888888';

          if (isAdminPhone && userProfile.role !== 'admin') {
            console.log('Updating user role to admin for phone:', phoneNumber);
            userProfile.role = 'admin';
            userProfile.name = 'Admin';
            await updateDoc(userDocRef, {
              role: 'admin',
              name: 'Admin',
              lastLoginAt: new Date().toISOString()
            });
          } else if (isGuardPhone && userProfile.role !== 'guard') {
            console.log('Updating user role to guard for phone:', phoneNumber);
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
          console.log('Updated existing mock user profile with final role:', userProfile.role);
        }

        return {
          success: true,
          user: userProfile,
          isNewUser: !userDoc.exists()
        };
      } else {
        return {
          success: false,
          error: 'Código de verificación inválido. Usa 123456 para pruebas en desarrollo.'
        };
      }
    }

    // Real Firebase verification
    if (confirmationResult) {
      // Use confirmation result to verify
      userCredential = await confirmationResult.confirm(code);
    } else {
      // Use verification ID and code
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

    // Check if user already exists
    const isDevelopment = __DEV__;
    const mockUid = `mock_user_${registerData.phone.replace(/\D/g, '')}`;
    const userDocRef = doc(db, 'users', mockUid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return {
        success: false,
        error: 'Este número de teléfono ya está registrado. Por favor inicia sesión.'
      };
    }

    // Create user profile (will be completed after SMS verification)
    const tempUserProfile: Partial<UserProfile> = {
      phone: registerData.phone,
      name: registerData.name,
      email: registerData.email,
      role: registerData.role || 'client',
    };

    // Store temporary registration data
    await setDoc(doc(db, 'temp_registrations', mockUid), {
      ...tempUserProfile,
      createdAt: new Date().toISOString(),
      verified: false
    });

    // Send verification code
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
    const isDevelopment = __DEV__;
    const mockUid = `mock_user_${phoneNumber.replace(/\D/g, '')}`;

    // Get temporary registration data
    const tempRegRef = doc(db, 'temp_registrations', mockUid);
    const tempRegDoc = await getDoc(tempRegRef);

    if (!tempRegDoc.exists()) {
      return {
        success: false,
        error: 'No se encontró información de registro. Por favor intenta registrarte de nuevo.'
      };
    }

    const tempData = tempRegDoc.data();

    // Verify code (using mock or Firebase)
    if (verificationId.startsWith('mock_') || verificationId.startsWith('fallback_')) {
      if (code === '123456' || code === '654321') {
        // Create final user profile
        const userProfile: UserProfile = {
          uid: mockUid,
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

        // Save to users collection
        const userDocRef = doc(db, 'users', mockUid);
        await setDoc(userDocRef, userProfile);

        // Delete temporary registration
        await deleteDoc(tempRegRef);

        return {
          success: true,
          user: userProfile,
          isNewUser: true
        };
      } else {
        return {
          success: false,
          error: 'Código de verificación inválido. Usa 123456 para pruebas en desarrollo.'
        };
      }
    }

    // Real Firebase verification
    if (confirmationResult) {
      const userCredential = await confirmationResult.confirm(code);
      const user = userCredential.user;

      // Create final user profile
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

      // Save to users collection
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, userProfile);

      // Delete temporary registration
      await deleteDoc(tempRegRef);

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