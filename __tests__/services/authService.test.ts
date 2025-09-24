import {
  sendVerificationCode,
  verifyCodeAndSignIn,
  signOutUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  registerUser,
  completeRegistration,
} from '../../src/services/authService';
import { auth, db } from '../../src/services/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  signInWithPhoneNumber: jest.fn(),
  PhoneAuthProvider: {
    credential: jest.fn(),
  },
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock __DEV__ to be true for development mode
    global.__DEV__ = true;
  });

  describe('sendVerificationCode', () => {
    it('should successfully send verification code in development mode', async () => {
      const phoneNumber = '+50412345678';
      const result = await sendVerificationCode(phoneNumber);

      expect(result.success).toBe(true);
      expect(result.verificationId).toBeDefined();
      expect(result.verificationId).toContain('mock_');
    });

    it('should handle invalid phone number format', async () => {
      const phoneNumber = 'invalid-number';
      const result = await sendVerificationCode(phoneNumber);

      expect(result.success).toBe(true); // In dev mode, it still returns success
      expect(result.verificationId).toBeDefined();
    });

    it('should generate unique verification IDs', async () => {
      const phoneNumber = '+50412345678';
      const result1 = await sendVerificationCode(phoneNumber);
      const result2 = await sendVerificationCode(phoneNumber);

      expect(result1.verificationId).not.toBe(result2.verificationId);
    });
  });

  describe('verifyCodeAndSignIn', () => {
    const mockPhoneNumber = '+50412345678';
    const mockVerificationId = 'mock_123456789';

    beforeEach(() => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });
    });

    it('should successfully verify code and create new user in mock mode', async () => {
      const result = await verifyCodeAndSignIn(
        mockVerificationId,
        '123456',
        mockPhoneNumber,
        'Test User'
      );

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.phone).toBe(mockPhoneNumber);
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('client');
      expect(setDoc).toHaveBeenCalled();
    });

    it('should create admin user for admin phone number', async () => {
      const adminPhone = '+50499999999';
      const result = await verifyCodeAndSignIn(
        mockVerificationId,
        '123456',
        adminPhone,
        'Admin User'
      );

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('admin');
      expect(result.user.name).toBe('Admin');
    });

    it('should create guard user for guard phone number', async () => {
      const guardPhone = '+50488888888';
      const result = await verifyCodeAndSignIn(
        mockVerificationId,
        '123456',
        guardPhone,
        'Guard User'
      );

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('guard');
      expect(result.user.name).toBe('Guardia');
    });

    it('should reject invalid verification code', async () => {
      const result = await verifyCodeAndSignIn(
        mockVerificationId,
        '999999',
        mockPhoneNumber
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Código de verificación inválido');
    });

    it('should update existing user on login', async () => {
      const existingUser = {
        uid: 'mock_user_50412345678',
        phone: mockPhoneNumber,
        name: 'Existing User',
        role: 'client',
        balance: 100,
        isActive: true,
        createdAt: '2024-01-01',
        lastLoginAt: '2024-01-01',
        settings: {
          notifications: true,
          language: 'es',
          theme: 'light',
        },
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => existingUser,
      });

      const result = await verifyCodeAndSignIn(
        mockVerificationId,
        '123456',
        mockPhoneNumber
      );

      expect(result.success).toBe(true);
      expect(result.user.name).toBe('Existing User');
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('registerUser', () => {
    beforeEach(() => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });
    });

    it('should successfully register new user', async () => {
      const registerData = {
        name: 'New User',
        phone: '+50412345678',
        email: 'test@example.com',
        role: 'client' as const,
      };

      const result = await registerUser(registerData);

      expect(result.success).toBe(true);
      expect(result.verificationId).toBeDefined();
      expect(setDoc).toHaveBeenCalled();
    });

    it('should prevent duplicate registration', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
      });

      const registerData = {
        name: 'New User',
        phone: '+50412345678',
        email: 'test@example.com',
      };

      const result = await registerUser(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('ya está registrado');
    });
  });

  describe('completeRegistration', () => {
    const mockVerificationId = 'mock_123456789';
    const mockPhoneNumber = '+50412345678';

    it('should successfully complete registration with valid code', async () => {
      const tempRegData = {
        name: 'New User',
        email: 'test@example.com',
        phone: mockPhoneNumber,
        role: 'client',
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => tempRegData,
      });

      const result = await completeRegistration(
        mockVerificationId,
        '123456',
        mockPhoneNumber
      );

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.isNewUser).toBe(true);
      expect(setDoc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should fail if temporary registration not found', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await completeRegistration(
        mockVerificationId,
        '123456',
        mockPhoneNumber
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No se encontró información de registro');
    });
  });

  describe('getUserProfile', () => {
    it('should retrieve user profile successfully', async () => {
      const mockProfile = {
        uid: 'test-uid',
        phone: '+50412345678',
        name: 'Test User',
        role: 'client',
        balance: 100,
        isActive: true,
        createdAt: '2024-01-01',
        lastLoginAt: '2024-01-01',
        settings: {
          notifications: true,
          language: 'es',
          theme: 'light',
        },
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockProfile,
      });

      const profile = await getUserProfile('test-uid');

      expect(profile).toEqual(mockProfile);
      expect(doc).toHaveBeenCalledWith(db, 'users', 'test-uid');
    });

    it('should return null for non-existent user', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const profile = await getUserProfile('non-existent-uid');

      expect(profile).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Database error'));

      const profile = await getUserProfile('test-uid');

      expect(profile).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = {
        name: 'Updated Name',
        settings: {
          notifications: false,
          language: 'en' as const,
          theme: 'dark' as const,
        },
      };

      await updateUserProfile('test-uid', updates);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        updates
      );
    });

    it('should throw error on update failure', async () => {
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(
        updateUserProfile('test-uid', { name: 'New Name' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('signOutUser', () => {
    it('should sign out user successfully', async () => {
      const mockSignOut = require('firebase/auth').signOut;
      mockSignOut.mockResolvedValue(undefined);

      await signOutUser();

      expect(mockSignOut).toHaveBeenCalledWith(auth);
    });

    it('should throw error on sign out failure', async () => {
      const mockSignOut = require('firebase/auth').signOut;
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(signOutUser()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      const mockUser = { uid: 'test-uid', phoneNumber: '+50412345678' };
      (auth as any).currentUser = mockUser;

      const user = getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null when not authenticated', () => {
      (auth as any).currentUser = null;

      const user = getCurrentUser();

      expect(user).toBeNull();
    });
  });
});