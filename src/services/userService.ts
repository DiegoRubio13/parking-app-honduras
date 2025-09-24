import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface User {
  uid: string;
  phone: string;
  name: string;
  role: 'client' | 'guard' | 'admin';
  balance: number;
  createdAt: string;
  isActive: boolean;
  lastLoginAt?: string;
  profilePicture?: string;
  email?: string;
  settings?: {
    notifications: boolean;
    language: 'es' | 'en';
    theme: 'light' | 'dark';
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  clientsCount: number;
  guardsCount: number;
  adminsCount: number;
}

// Get user by ID
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Get user by phone number
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

// Get all users with pagination
export const getAllUsers = async (limitCount: number = 50): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role: 'client' | 'guard' | 'admin'): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

// Create new user
export const createUser = async (userData: Omit<User, 'uid' | 'createdAt'>): Promise<User> => {
  try {
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users'), newUser);
    const createdUser = { ...newUser, uid: docRef.id };

    // Update the document with the uid
    await updateDoc(docRef, { uid: docRef.id });

    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (uid: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Update user balance
export const updateUserBalance = async (uid: string, newBalance: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      balance: newBalance,
      lastLoginAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
};

// Delete user (soft delete by setting isActive to false)
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: false,
      lastLoginAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all users
    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = allUsersSnapshot.docs.map(doc => doc.data() as User);

    // Calculate stats
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => user.isActive).length;
    const newUsersThisMonth = allUsers.filter(user =>
      new Date(user.createdAt) >= firstDayOfMonth
    ).length;
    const clientsCount = allUsers.filter(user => user.role === 'client' && user.isActive).length;
    const guardsCount = allUsers.filter(user => user.role === 'guard' && user.isActive).length;
    const adminsCount = allUsers.filter(user => user.role === 'admin' && user.isActive).length;

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      clientsCount,
      guardsCount,
      adminsCount
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Search users by name or phone
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that searches by name starting with the term
    const q = query(
      collection(db, 'users'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// For backward compatibility - current user management (for local storage fallback)
export const getCurrentUser = async (): Promise<User | null> => {
  // This function is now handled by the auth service
  // Keeping for backward compatibility
  return null;
};

export const setCurrentUser = async (user: User): Promise<void> => {
  // This function is now handled by the auth service
  // Keeping for backward compatibility
};

export const clearCurrentUser = async (): Promise<void> => {
  // This function is now handled by the auth service
  // Keeping for backward compatibility
};

export const incrementUserBalance = async (
  userId: string,
  amount: number
): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const newBalance = user.balance + amount;
    await updateUserBalance(userId, newBalance);
    return true;
  } catch (error) {
    console.error('Error incrementing balance:', error);
    return false;
  }
};

export const decrementUserBalance = async (
  userId: string,
  amount: number
): Promise<boolean> => {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    if (user.balance < amount) throw new Error('Saldo insuficiente');

    const newBalance = user.balance - amount;
    await updateUserBalance(userId, newBalance);
    return true;
  } catch (error) {
    console.error('Error decrementing balance:', error);
    return false;
  }
};