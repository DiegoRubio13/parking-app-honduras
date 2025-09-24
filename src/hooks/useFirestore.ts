import { useState, useEffect, useCallback } from 'react';
import { 
  getUserTransactions, 
  getPendingTransactions, 
  getPaymentStats, 
  createPurchaseTransaction,
  confirmTransaction,
  rejectTransaction,
  PaymentTransaction,
  PaymentStats 
} from '../services/paymentService';
import { 
  getUserParkingHistory,
  getActiveSessions,
  getParkingStats,
  startParkingSession,
  endParkingSession,
  getSessionByQR,
  ParkingSession,
  ParkingStats 
} from '../services/parkingService';
import { 
  getAllUsers,
  getUsersByRole,
  getUserStats,
  User,
  UserStats,
  incrementUserBalance,
  decrementUserBalance
} from '../services/userService';
import { useAuth } from './useAuth';

// Payment hooks
export const useUserTransactions = () => {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!userData?.uid) return;
    
    try {
      setLoading(true);
      const userTransactions = await getUserTransactions(userData.uid);
      setTransactions(userTransactions);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userData?.uid]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
};

export const usePendingTransactions = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const pending = await getPendingTransactions();
      setTransactions(pending);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const confirmPayment = async (transactionId: string, processedBy: string) => {
    const result = await confirmTransaction(transactionId, processedBy);
    if (result.success) {
      await fetchTransactions();
    }
    return result;
  };

  const rejectPayment = async (transactionId: string, processedBy: string) => {
    const result = await rejectTransaction(transactionId, processedBy);
    if (result.success) {
      await fetchTransactions();
    }
    return result;
  };

  return { 
    transactions, 
    loading, 
    error, 
    refetch: fetchTransactions,
    confirmPayment,
    rejectPayment
  };
};

export const useCreateTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = async (
    userId: string,
    userPhone: string,
    userName: string,
    packageId: string,
    paymentMethod: 'transfer' | 'cash' | 'card',
    reference?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createPurchaseTransaction(
        userId,
        userPhone,
        userName,
        packageId,
        paymentMethod,
        reference
      );
      
      if (!result.success) {
        setError(result.error || 'Error creating transaction');
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createTransaction, loading, error };
};

// Parking hooks
export const useUserParkingHistory = () => {
  const { userData } = useAuth();
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userData?.uid) return;
    
    try {
      setLoading(true);
      const history = await getUserParkingHistory(userData.uid);
      setSessions(history);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userData?.uid]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { sessions, loading, error, refetch: fetchHistory };
};

export const useActiveSessions = () => {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const active = await getActiveSessions();
      setSessions(active);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
};

export const useParkingSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async (
    userId: string,
    userPhone: string,
    userName: string,
    location: string,
    spot?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await startParkingSession(userId, userPhone, userName, location, spot);
      
      if (!result.success) {
        setError(result.error || 'Error starting session');
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: string, guardId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await endParkingSession(sessionId, guardId);
      
      if (!result.success) {
        setError(result.error || 'Error ending session');
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getSessionByQRCode = async (qrCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const session = await getSessionByQR(qrCode);
      return session;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { startSession, endSession, getSessionByQRCode, loading, error };
};

// User management hooks
export const useUsers = (role?: User['role']) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = role ? await getUsersByRole(role) : await getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};

export const useUserBalance = () => {
  const { userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBalance = async (userId: string, amount: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await incrementUserBalance(userId, amount);
      if (success) {
        await refreshUserData();
      } else {
        setError('Error adding balance');
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deductBalance = async (userId: string, amount: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await decrementUserBalance(userId, amount);
      if (success) {
        await refreshUserData();
      } else {
        setError('Error deducting balance');
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    balance: userData?.balance || 0, 
    addBalance, 
    deductBalance, 
    loading, 
    error 
  };
};

// Statistics hooks
export const usePaymentStats = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const paymentStats = await getPaymentStats();
      setStats(paymentStats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useParkingStats = () => {
  const [stats, setStats] = useState<ParkingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const parkingStats = await getParkingStats();
      setStats(parkingStats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const userStats = await getUserStats();
      setStats(userStats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};