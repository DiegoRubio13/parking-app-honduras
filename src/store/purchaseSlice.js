// src/store/purchaseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, updateDoc, addDoc, collection, increment, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
// import { db } from '../services/firebase';

// DEMO MODE - Mock data for presentation
let mockUsers = {
  '50488889999': {
    phone: '50488889999',
    full_name: 'Usuario Demo',
    minutes_balance: 150,
    total_spent: 80,
    created_at: '2024-01-15T10:00:00.000Z'
  },
  '50477771234': {
    phone: '50477771234',
    full_name: 'María García',
    minutes_balance: 300,
    total_spent: 120,
    created_at: '2024-01-10T15:30:00.000Z'
  }
};

let mockTransactions = [
  {
    id: 'trans_001',
    user_phone: '50488889999',
    package_id: 'package_360',
    minutes_purchased: 360,
    amount_paid: 360,
    currency: 'HNL',
    payment_method: 'cash',
    admin_id: 'admin',
    timestamp: '2024-01-20T14:30:00.000Z',
    status: 'completed'
  },
  {
    id: 'trans_002',
    user_phone: '50477771234',
    package_id: 'package_1800',
    minutes_purchased: 1800,
    amount_paid: 1700,
    currency: 'HNL',
    payment_method: 'transfer',
    admin_id: 'admin',
    timestamp: '2024-01-19T09:15:00.000Z',
    status: 'completed'
  }
];

let mockTransactionIdCounter = 3;

// Definir paquetes de minutos
export const MINUTE_PACKAGES = [
  {
    id: 'package_60',
    minutes: 60,
    price: 60,
    currency: 'HNL',
    discount: 0,
    popular: false,
    description: '1 hora de estacionamiento',
    label: 'Por Hora'
  },
  {
    id: 'package_360',
    minutes: 360,
    price: 360,
    currency: 'HNL',
    discount: 0,
    popular: false,
    description: '6 horas de estacionamiento',
    label: 'Diario'
  },
  {
    id: 'package_1800',
    minutes: 1800,
    price: 1700,
    currency: 'HNL',
    discount: 6,
    popular: false,
    description: '30 horas de estacionamiento',
    label: 'Semanal',
    savings: 'Ahorra L100'
  },
  {
    id: 'package_10000',
    minutes: 10000,
    price: 6800,
    currency: 'HNL',
    discount: 32,
    popular: true,
    description: '166.7 horas de estacionamiento',
    label: 'Mensual',
    savings: 'Ahorra L3,200'
  },
  {
    id: 'package_30000',
    minutes: 30000,
    price: 16500,
    currency: 'HNL',
    discount: 45,
    popular: false,
    description: '500 horas de estacionamiento',
    label: 'Trimestral',
    savings: 'Ahorra L13,500'
  },
  {
    id: 'package_60000',
    minutes: 60000,
    price: 28000,
    currency: 'HNL',
    discount: 53,
    popular: false,
    description: '1000 horas de estacionamiento',
    label: 'Semestral',
    savings: 'Ahorra L32,000',
    bestValue: true
  }
];

// Thunk para comprar minutos (registro manual por admin)
export const addMinutesToUser = createAsyncThunk(
  'purchase/addMinutesToUser',
  async ({ userPhone, packageId, paymentMethod = 'cash', adminId = 'admin' }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Encontrar el paquete seleccionado
      const selectedPackage = MINUTE_PACKAGES.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error('Paquete de minutos no válido');
      }

      // DEMO MODE - Check if user exists in mock data
      if (!mockUsers[userPhone]) {
        throw new Error('Usuario no encontrado');
      }

      // Crear registro de transacción
      const transactionData = {
        user_phone: userPhone,
        package_id: packageId,
        minutes_purchased: selectedPackage.minutes,
        amount_paid: selectedPackage.price,
        currency: selectedPackage.currency,
        payment_method: paymentMethod,
        admin_id: adminId,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // DEMO MODE - Add transaction to mock data
      const transactionId = `trans_${String(mockTransactionIdCounter++).padStart(3, '0')}`;
      const newTransaction = {
        id: transactionId,
        ...transactionData
      };
      mockTransactions.unshift(newTransaction);
      
      // DEMO MODE - Update user balance in mock data
      mockUsers[userPhone].minutes_balance += selectedPackage.minutes;
      const newBalance = mockUsers[userPhone].minutes_balance;

      /* ORIGINAL FIREBASE CODE - commented out for demo
      // Verificar que el usuario existe
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }

      // Agregar transacción a Firestore
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
      
      // Actualizar saldo del usuario
      await updateDoc(userRef, {
        minutes_balance: increment(selectedPackage.minutes)
      });

      // Obtener datos actualizados del usuario
      const updatedUserSnap = await getDoc(userRef);
      const updatedUser = updatedUserSnap.data();
      */

      return {
        transaction_id: transactionId,
        ...transactionData,
        user_new_balance: newBalance
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para obtener historial de transacciones de un usuario
export const getUserTransactions = createAsyncThunk(
  'purchase/getUserTransactions',
  async ({ userPhone, limitCount = 10 }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // DEMO MODE - Filter and return mock transactions
      const userTransactions = mockTransactions
        .filter(transaction => transaction.user_phone === userPhone)
        .slice(0, limitCount)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      /* ORIGINAL FIREBASE CODE - commented out for demo
      const q = query(
        collection(db, 'transactions'),
        where('user_phone', '==', userPhone),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      */
      
      return userTransactions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para obtener estadísticas de ventas (admin)
export const getSalesStats = createAsyncThunk(
  'purchase/getSalesStats',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // DEMO MODE - Filter transactions based on date range
      let filteredTransactions;
      
      if (startDate && endDate) {
        filteredTransactions = mockTransactions.filter(t => 
          t.timestamp >= startDate && 
          t.timestamp <= endDate && 
          t.status === 'completed'
        );
      } else {
        // Estadísticas del día actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayString = today.toISOString();
        
        filteredTransactions = mockTransactions.filter(t => 
          t.timestamp >= todayString && 
          t.status === 'completed'
        );
      }
      
      /* ORIGINAL FIREBASE CODE - commented out for demo
      let q;
      
      if (startDate && endDate) {
        q = query(
          collection(db, 'transactions'),
          where('timestamp', '>=', startDate),
          where('timestamp', '<=', endDate),
          where('status', '==', 'completed')
        );
      } else {
        // Estadísticas del día actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayString = today.toISOString();
        
        q = query(
          collection(db, 'transactions'),
          where('timestamp', '>=', todayString),
          where('status', '==', 'completed')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => doc.data());
      */
      
      // Calcular estadísticas
      const stats = {
        total_transactions: filteredTransactions.length,
        total_revenue: filteredTransactions.reduce((sum, t) => sum + t.amount_paid, 0),
        total_minutes_sold: filteredTransactions.reduce((sum, t) => sum + t.minutes_purchased, 0),
        payment_methods: {
          cash: filteredTransactions.filter(t => t.payment_method === 'cash').length,
          transfer: filteredTransactions.filter(t => t.payment_method === 'transfer').length,
          card: filteredTransactions.filter(t => t.payment_method === 'card').length
        },
        package_breakdown: {
          package_60: filteredTransactions.filter(t => t.package_id === 'package_60').length,
          package_360: filteredTransactions.filter(t => t.package_id === 'package_360').length,
          package_1800: filteredTransactions.filter(t => t.package_id === 'package_1800').length,
          package_10000: filteredTransactions.filter(t => t.package_id === 'package_10000').length
        }
      };
      
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState: {
    packages: MINUTE_PACKAGES,
    userTransactions: [],
    salesStats: null,
    isLoading: false,
    error: null,
    lastPurchase: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastPurchase: (state) => {
      state.lastPurchase = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Minutes to User
      .addCase(addMinutesToUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMinutesToUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastPurchase = action.payload;
      })
      .addCase(addMinutesToUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get User Transactions
      .addCase(getUserTransactions.fulfilled, (state, action) => {
        state.userTransactions = action.payload;
      })
      // Get Sales Stats
      .addCase(getSalesStats.fulfilled, (state, action) => {
        state.salesStats = action.payload;
      });
  }
});

export const { clearError, clearLastPurchase } = purchaseSlice.actions;
export default purchaseSlice.reducer;