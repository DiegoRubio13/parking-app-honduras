import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { updateUserBalance, getUserById } from './userService';
import type { StoredPaymentMethod, StripePaymentIntent } from '../types/payment';

export interface PaymentTransaction {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  type: 'purchase' | 'refund' | 'usage' | 'bonus';
  method: 'transfer' | 'cash' | 'card';
  amount: number; // en Lempiras
  minutes: number; // minutos comprados/usados
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string; // número de referencia bancaria
  processedBy?: string; // UID del guardia/admin que procesó
  createdAt: string;
  completedAt?: string;
  metadata?: {
    package?: 'basic' | 'standard' | 'premium';
    bankName?: string;
    transferReference?: string;
    sessionId?: string;
    // Stripe specific fields
    stripePaymentIntentId?: string;
    stripePaymentMethodId?: string;
    stripeCustomerId?: string;
  };
}

export interface PaymentPackage {
  id: string;
  name: string;
  minutes: number;
  price: number;
  costPerMinute: number;
  savings?: number;
  popular?: boolean;
  description: string;
  isActive: boolean;
}

export interface PaymentStats {
  totalTransactions: number;
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  averageTransactionAmount: number;
  popularPackage: string;
  pendingTransactions: number;
}

// Payment Packages
const defaultPackages: PaymentPackage[] = [
  {
    id: 'basic-60',
    name: 'Básico',
    minutes: 60,
    price: 60,
    costPerMinute: 1.0,
    description: 'Ideal para visitas cortas',
    isActive: true
  },
  {
    id: 'standard-150',
    name: 'Estándar',
    minutes: 150,
    price: 135,
    costPerMinute: 0.9,
    savings: 15,
    popular: true,
    description: 'Perfecto para uso regular',
    isActive: true
  },
  {
    id: 'premium-300',
    name: 'Premium',
    minutes: 300,
    price: 240,
    costPerMinute: 0.8,
    savings: 60,
    description: 'Máximo ahorro para usuarios frecuentes',
    isActive: true
  }
];

// Get available payment packages
export const getPaymentPackages = async (): Promise<PaymentPackage[]> => {
  try {
    const packageSnapshot = await getDocs(collection(db, 'paymentPackages'));

    if (packageSnapshot.empty) {
      // Initialize with default packages if none exist
      for (const pkg of defaultPackages) {
        await addDoc(collection(db, 'paymentPackages'), pkg);
      }
      return defaultPackages;
    }

    return packageSnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as PaymentPackage))
      .filter(pkg => pkg.isActive)
      .sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error('Error getting payment packages:', error);
    return defaultPackages;
  }
};

// Create payment transaction
export const createPaymentTransaction = async (
  transactionData: Omit<PaymentTransaction, 'id' | 'createdAt'>
): Promise<PaymentTransaction> => {
  try {
    const newTransaction = {
      ...transactionData,
      createdAt: new Date().toISOString()
    };

    // Remove undefined fields to prevent Firestore errors
    const cleanTransaction = Object.fromEntries(
      Object.entries(newTransaction).filter(([_, value]) => value !== undefined && value !== null)
    );

    // Also clean nested objects
    if (cleanTransaction.metadata) {
      cleanTransaction.metadata = Object.fromEntries(
        Object.entries(cleanTransaction.metadata).filter(([_, value]) => value !== undefined && value !== null)
      );
    }

    const docRef = await addDoc(collection(db, 'paymentTransactions'), cleanTransaction);
    const createdTransaction = { ...newTransaction, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdTransaction;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

// Process purchase transaction
export const processPurchaseTransaction = async (
  userId: string,
  packageId: string,
  method: 'transfer' | 'cash' | 'card',
  reference?: string,
  processedBy?: string
): Promise<PaymentTransaction> => {
  try {
    // Get user and package info
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const packages = await getPaymentPackages();
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      throw new Error('Paquete no encontrado');
    }

    // Create transaction data without optional fields first
    const baseTransactionData: any = {
      userId,
      userPhone: user.phone,
      userName: user.name,
      type: 'purchase',
      method,
      amount: selectedPackage.price,
      minutes: selectedPackage.minutes,
      status: method === 'transfer' ? 'pending' : 'completed',
      description: `Compra de ${selectedPackage.minutes} minutos - ${selectedPackage.name}`,
      metadata: {
        package: selectedPackage.id as 'basic' | 'standard' | 'premium'
      }
    };

    // Only add optional fields if they have valid values
    if (reference && reference.trim() !== '') {
      baseTransactionData.reference = reference;
    }
    if (processedBy && processedBy.trim() !== '') {
      baseTransactionData.processedBy = processedBy;
    }

    const transactionData = baseTransactionData as Omit<PaymentTransaction, 'id' | 'createdAt'>;

    const transaction = await createPaymentTransaction(transactionData);

    // If cash or card, add minutes to user balance immediately since status is already 'completed'
    if (method === 'cash' || method === 'card') {
      try {
        const user = await getUserById(userId);
        if (user) {
          const newBalance = user.balance + transaction.minutes;
          await updateUserBalance(userId, newBalance);
          console.log(`Added ${transaction.minutes} minutes to user ${userId}. New balance: ${newBalance}`);
        }
      } catch (error) {
        console.error('Error updating user balance for immediate payment:', error);
        // Don't throw error here to prevent transaction rollback
      }
    }

    return transaction;
  } catch (error) {
    console.error('Error processing purchase transaction:', error);
    throw error;
  }
};

// Complete transaction
export const completeTransaction = async (
  transactionId: string,
  processedBy?: string
): Promise<PaymentTransaction> => {
  try {
    const transactionRef = doc(db, 'paymentTransactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transacción no encontrada');
    }

    const transaction = transactionDoc.data() as PaymentTransaction;

    if (transaction.status === 'completed') {
      console.log('Transaction already completed, returning existing transaction:', transactionId);
      return transaction;
    }

    const updates: any = {
      status: 'completed' as const,
      completedAt: new Date().toISOString()
    };

    // Only add processedBy if it's not undefined
    if (processedBy !== undefined && processedBy !== null && processedBy !== '') {
      updates.processedBy = processedBy;
    }

    await updateDoc(transactionRef, updates);

    // Add minutes to user balance for purchase transactions
    if (transaction.type === 'purchase') {
      const user = await getUserById(transaction.userId);
      if (user) {
        const newBalance = user.balance + transaction.minutes;
        await updateUserBalance(transaction.userId, newBalance);
      }
    }

    return { ...transaction, ...updates };
  } catch (error) {
    console.error('Error completing transaction:', error);
    throw error;
  }
};

// Cancel transaction
export const cancelTransaction = async (
  transactionId: string,
  reason?: string
): Promise<PaymentTransaction> => {
  try {
    const transactionRef = doc(db, 'paymentTransactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transacción no encontrada');
    }

    const transaction = transactionDoc.data() as PaymentTransaction;

    if (transaction.status === 'completed') {
      throw new Error('No se puede cancelar una transacción completada');
    }

    const updates = {
      status: 'cancelled' as const,
      completedAt: new Date().toISOString(),
      metadata: {
        ...transaction.metadata,
        cancellationReason: reason
      }
    };

    await updateDoc(transactionRef, updates);

    return { ...transaction, ...updates };
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    throw error;
  }
};

// Get user transactions
export const getUserTransactions = async (
  userId: string,
  limitCount: number = 20
): Promise<PaymentTransaction[]> => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'paymentTransactions'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    let transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentTransaction));

    // Sort client-side to avoid requiring Firebase index
    transactions = transactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });

    // Apply limit client-side
    return transactions.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting user transactions:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Get all transactions (for admin)
export const getAllTransactions = async (
  limitCount: number = 50
): Promise<PaymentTransaction[]> => {
  try {
    const q = query(collection(db, 'paymentTransactions'));

    const querySnapshot = await getDocs(q);
    let transactions = querySnapshot.docs.map(doc => doc.data() as PaymentTransaction);

    // Sort client-side to avoid index requirement
    transactions = transactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });

    // Apply limit client-side
    return transactions.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};

// Get pending transactions
export const getPendingTransactions = async (): Promise<PaymentTransaction[]> => {
  try {
    const q = query(
      collection(db, 'paymentTransactions'),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    let transactions = querySnapshot.docs.map(doc => doc.data() as PaymentTransaction);

    // Sort client-side to avoid index requirement
    transactions = transactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });

    return transactions;
  } catch (error) {
    console.error('Error getting pending transactions:', error);
    throw error;
  }
};

// Get payment statistics
export const getPaymentStats = async (): Promise<PaymentStats> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all transactions
    const allTransactionsSnapshot = await getDocs(collection(db, 'paymentTransactions'));
    const allTransactions = allTransactionsSnapshot.docs.map(doc => doc.data() as PaymentTransaction);

    // Filter completed transactions
    const completedTransactions = allTransactions.filter(t => t.status === 'completed');

    // Calculate stats
    const totalTransactions = completedTransactions.length;
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const todayTransactions = completedTransactions.filter(t =>
      new Date(t.completedAt || t.createdAt) >= todayStart
    );
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    const monthlyTransactions = completedTransactions.filter(t =>
      new Date(t.completedAt || t.createdAt) >= monthStart
    );
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    const averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Find most popular package
    const packageCounts: { [key: string]: number } = {};
    completedTransactions.forEach(t => {
      if (t.metadata?.package) {
        packageCounts[t.metadata.package] = (packageCounts[t.metadata.package] || 0) + 1;
      }
    });
    const popularPackage = Object.keys(packageCounts).reduce((a, b) =>
      packageCounts[a] > packageCounts[b] ? a : b, 'standard'
    );

    const pendingTransactions = allTransactions.filter(t => t.status === 'pending').length;

    return {
      totalTransactions,
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      averageTransactionAmount,
      popularPackage,
      pendingTransactions
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    throw error;
  }
};

// ============= STRIPE INTEGRATION FUNCTIONS =============

// Save Stripe payment method
export const saveStripePaymentMethod = async (
  userId: string,
  stripePaymentMethodId: string,
  cardDetails: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  },
  isDefault: boolean = false
): Promise<StoredPaymentMethod> => {
  try {
    // If this is the default, unset all other defaults for this user
    if (isDefault) {
      const existingMethodsSnapshot = await getDocs(
        query(collection(db, 'paymentMethods'), where('userId', '==', userId))
      );

      const updatePromises = existingMethodsSnapshot.docs.map(doc =>
        updateDoc(doc.ref, { isDefault: false })
      );
      await Promise.all(updatePromises);
    }

    const paymentMethod: Omit<StoredPaymentMethod, 'id'> = {
      userId,
      stripePaymentMethodId,
      brand: cardDetails.brand,
      last4: cardDetails.last4,
      expMonth: cardDetails.expMonth,
      expYear: cardDetails.expYear,
      isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'paymentMethods'), paymentMethod);
    return { ...paymentMethod, id: docRef.id };
  } catch (error) {
    console.error('Error saving Stripe payment method:', error);
    throw error;
  }
};

// Get user's saved payment methods
export const getUserPaymentMethods = async (userId: string): Promise<StoredPaymentMethod[]> => {
  try {
    const q = query(
      collection(db, 'paymentMethods'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StoredPaymentMethod));
  } catch (error) {
    console.error('Error getting user payment methods:', error);
    return [];
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'paymentMethods', paymentMethodId);
    await updateDoc(docRef, {
      isDefault: false,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    // Unset all defaults for this user
    const existingMethodsSnapshot = await getDocs(
      query(collection(db, 'paymentMethods'), where('userId', '==', userId))
    );

    const updatePromises = existingMethodsSnapshot.docs.map(doc =>
      updateDoc(doc.ref, { isDefault: false })
    );
    await Promise.all(updatePromises);

    // Set the new default
    const docRef = doc(db, 'paymentMethods', paymentMethodId);
    await updateDoc(docRef, {
      isDefault: true,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

// Create Stripe payment transaction
export const createStripePaymentTransaction = async (
  userId: string,
  packageId: string,
  stripePaymentIntentId: string,
  stripePaymentMethodId: string
): Promise<PaymentTransaction> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const packages = await getPaymentPackages();
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      throw new Error('Paquete no encontrado');
    }

    const transactionData: Omit<PaymentTransaction, 'id' | 'createdAt'> = {
      userId,
      userPhone: user.phone,
      userName: user.name,
      type: 'purchase',
      method: 'card',
      amount: selectedPackage.price,
      minutes: selectedPackage.minutes,
      status: 'pending', // Will be updated by webhook
      description: `Compra de ${selectedPackage.minutes} minutos - ${selectedPackage.name} (Stripe)`,
      metadata: {
        package: selectedPackage.id as 'basic' | 'standard' | 'premium',
        stripePaymentIntentId,
        stripePaymentMethodId
      }
    };

    return await createPaymentTransaction(transactionData);
  } catch (error) {
    console.error('Error creating Stripe payment transaction:', error);
    throw error;
  }
};

// Complete Stripe payment (called by webhook or success confirmation)
export const completeStripePayment = async (
  stripePaymentIntentId: string
): Promise<PaymentTransaction | null> => {
  try {
    // Find transaction by Stripe payment intent ID
    const q = query(
      collection(db, 'paymentTransactions'),
      where('metadata.stripePaymentIntentId', '==', stripePaymentIntentId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.error('Transaction not found for payment intent:', stripePaymentIntentId);
      return null;
    }

    const transactionDoc = snapshot.docs[0];
    const transaction = transactionDoc.data() as PaymentTransaction;

    // Only complete if not already completed
    if (transaction.status !== 'completed') {
      await updateDoc(transactionDoc.ref, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      // Add minutes to user balance
      const user = await getUserById(transaction.userId);
      if (user) {
        const newBalance = user.balance + transaction.minutes;
        await updateUserBalance(transaction.userId, newBalance);
      }
    }

    return { ...transaction, status: 'completed' };
  } catch (error) {
    console.error('Error completing Stripe payment:', error);
    throw error;
  }
};

// Fail Stripe payment (called by webhook)
export const failStripePayment = async (
  stripePaymentIntentId: string,
  errorMessage?: string
): Promise<PaymentTransaction | null> => {
  try {
    const q = query(
      collection(db, 'paymentTransactions'),
      where('metadata.stripePaymentIntentId', '==', stripePaymentIntentId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.error('Transaction not found for payment intent:', stripePaymentIntentId);
      return null;
    }

    const transactionDoc = snapshot.docs[0];
    const transaction = transactionDoc.data() as PaymentTransaction;

    await updateDoc(transactionDoc.ref, {
      status: 'failed',
      completedAt: new Date().toISOString(),
      metadata: {
        ...transaction.metadata,
        errorMessage
      }
    });

    return { ...transaction, status: 'failed' };
  } catch (error) {
    console.error('Error failing Stripe payment:', error);
    throw error;
  }
};