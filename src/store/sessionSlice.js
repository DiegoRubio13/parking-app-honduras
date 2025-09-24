// src/store/sessionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, limit, getDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../services/firebase';

// DEMO MODE - Mock data for presentation
let mockUsers = {
  '50488889999': {
    phone: '50488889999',
    full_name: 'Usuario Demo',
    minutes_balance: 150,
    total_spent: 80,
    current_session: null,
    created_at: '2024-01-15T10:00:00.000Z'
  },
  '50477771234': {
    phone: '50477771234',
    full_name: 'María García',
    minutes_balance: 300,
    total_spent: 120,
    current_session: {
      session_id: 'session_002',
      entry_time: '2024-01-20T16:30:00.000Z',
      location: 'Estacionamiento Principal'
    },
    created_at: '2024-01-10T15:30:00.000Z'
  }
};

let mockSessions = [
  {
    id: 'session_001',
    user_phone: '50488889999',
    entry_time: '2024-01-20T14:00:00.000Z',
    exit_time: '2024-01-20T16:00:00.000Z',
    minutes_used: 120,
    cost_per_minute: 0.83,
    total_cost: 99.6,
    status: 'completed',
    created_at: '2024-01-20T14:00:00.000Z'
  },
  {
    id: 'session_002',
    user_phone: '50477771234',
    entry_time: '2024-01-20T16:30:00.000Z',
    exit_time: null,
    minutes_used: 0,
    cost_per_minute: 0.83,
    total_cost: 0,
    status: 'active',
    created_at: '2024-01-20T16:30:00.000Z',
    minutes_elapsed: 45
  }
];

let mockSessionIdCounter = 3;

// Thunk para iniciar sesión de parqueo (entrada)
export const startParkingSession = createAsyncThunk(
  'session/startParkingSession',
  async ({ userPhone }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // DEMO MODE - Check if user exists in mock data
      if (!mockUsers[userPhone]) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = mockUsers[userPhone];
      
      if (userData.minutes_balance <= 0) {
        throw new Error('Saldo insuficiente. Necesitas comprar minutos antes de ingresar.');
      }

      if (userData.current_session) {
        throw new Error('Ya tienes una sesión activa. Primero debes salir del estacionamiento.');
      }

      // Crear nueva sesión
      const sessionData = {
        user_phone: userPhone,
        entry_time: new Date().toISOString(),
        exit_time: null,
        minutes_used: 0,
        cost_per_minute: 0.83, // $20 MXN / 60min ≈ $0.33, ajustando a $0.83 para Honduras
        total_cost: 0,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // DEMO MODE - Add session to mock data
      const sessionId = `session_${String(mockSessionIdCounter++).padStart(3, '0')}`;
      const newSession = {
        id: sessionId,
        ...sessionData
      };
      mockSessions.push(newSession);
      
      // DEMO MODE - Update user with current session
      mockUsers[userPhone].current_session = {
        session_id: sessionId,
        entry_time: sessionData.entry_time,
        location: 'Estacionamiento Principal'
      };

      /* ORIGINAL FIREBASE CODE - commented out for demo
      // Verificar que el usuario tenga saldo
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = userSnap.data();

      // Agregar sesión a Firestore
      const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
      
      // Actualizar usuario con sesión actual
      await updateDoc(userRef, {
        current_session: {
          session_id: sessionRef.id,
          entry_time: sessionData.entry_time,
          location: 'Estacionamiento Principal'
        }
      });
      */

      return {
        session_id: sessionId,
        ...sessionData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para terminar sesión de parqueo (salida)
export const endParkingSession = createAsyncThunk(
  'session/endParkingSession',
  async ({ userPhone }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // DEMO MODE - Check if user exists in mock data
      if (!mockUsers[userPhone]) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = mockUsers[userPhone];
      
      if (!userData.current_session) {
        throw new Error('No tienes una sesión activa');
      }

      // DEMO MODE - Find session in mock data
      const sessionIndex = mockSessions.findIndex(s => s.id === userData.current_session.session_id);
      
      if (sessionIndex === -1) {
        throw new Error('Sesión no encontrada');
      }

      const sessionData = mockSessions[sessionIndex];
      const entryTime = new Date(sessionData.entry_time);
      const exitTime = new Date();
      
      // Calcular minutos usados
      const minutesUsed = Math.ceil((exitTime - entryTime) / (1000 * 60));
      const totalCost = minutesUsed * sessionData.cost_per_minute;
      
      // Verificar que tenga saldo suficiente
      if (userData.minutes_balance < minutesUsed) {
        // Usar todos los minutos disponibles
        const availableMinutes = userData.minutes_balance;
        const partialTime = availableMinutes * 60 * 1000; // minutos a milisegundos
        const adjustedExitTime = new Date(entryTime.getTime() + partialTime);
        
        // DEMO MODE - Update session in mock data
        mockSessions[sessionIndex] = {
          ...sessionData,
          exit_time: adjustedExitTime.toISOString(),
          minutes_used: availableMinutes,
          total_cost: availableMinutes * sessionData.cost_per_minute,
          status: 'completed_insufficient_balance'
        };
        
        // DEMO MODE - Update user in mock data
        mockUsers[userPhone] = {
          ...userData,
          current_session: null,
          minutes_balance: 0,
          total_spent: userData.total_spent + (availableMinutes * sessionData.cost_per_minute)
        };
        
        return {
          session_id: userData.current_session.session_id,
          minutes_used: availableMinutes,
          total_cost: availableMinutes * sessionData.cost_per_minute,
          insufficient_balance: true,
          overstay_minutes: minutesUsed - availableMinutes
        };
      }

      // DEMO MODE - Update session in mock data
      mockSessions[sessionIndex] = {
        ...sessionData,
        exit_time: exitTime.toISOString(),
        minutes_used: minutesUsed,
        total_cost: totalCost,
        status: 'completed'
      };
      
      // DEMO MODE - Update user in mock data
      const newBalance = userData.minutes_balance - minutesUsed;
      mockUsers[userPhone] = {
        ...userData,
        current_session: null,
        minutes_balance: Math.max(0, newBalance),
        total_spent: userData.total_spent + totalCost
      };

      /* ORIGINAL FIREBASE CODE - commented out for demo
      const userRef = doc(db, 'users', userPhone);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = userSnap.data();
      
      if (!userData.current_session) {
        throw new Error('No tienes una sesión activa');
      }

      // Obtener datos de la sesión
      const sessionRef = doc(db, 'sessions', userData.current_session.session_id);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        throw new Error('Sesión no encontrada');
      }

      const sessionData = sessionSnap.data();
      const entryTime = new Date(sessionData.entry_time);
      const exitTime = new Date();
      
      // Calcular minutos usados
      const minutesUsed = Math.ceil((exitTime - entryTime) / (1000 * 60));
      const totalCost = minutesUsed * sessionData.cost_per_minute;

      // Actualizar sesión
      await updateDoc(sessionRef, {
        exit_time: exitTime.toISOString(),
        minutes_used: minutesUsed,
        total_cost: totalCost,
        status: 'completed'
      });
      
      // Actualizar usuario
      const newBalance = userData.minutes_balance - minutesUsed;
      await updateDoc(userRef, {
        current_session: null,
        minutes_balance: Math.max(0, newBalance),
        total_spent: userData.total_spent + totalCost
      });
      */

      return {
        session_id: userData.current_session.session_id,
        minutes_used: minutesUsed,
        total_cost: totalCost,
        new_balance: newBalance,
        insufficient_balance: false
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para obtener sesiones activas (para guardia)
export const getActiveSessions = createAsyncThunk(
  'session/getActiveSessions',
  async () => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // DEMO MODE - Filter active sessions from mock data
      const activeSessions = mockSessions
        .filter(session => session.status === 'active')
        .sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time))
        .map(sessionData => {
          // Add user data to each session
          const userData = mockUsers[sessionData.user_phone];
          return {
            ...sessionData,
            user_data: userData || null,
            // Calculate elapsed minutes for active sessions
            minutes_elapsed: sessionData.status === 'active' 
              ? Math.ceil((new Date() - new Date(sessionData.entry_time)) / (1000 * 60))
              : sessionData.minutes_elapsed || 0
          };
        });
      
      /* ORIGINAL FIREBASE CODE - commented out for demo
      const q = query(
        collection(db, 'sessions'),
        where('status', '==', 'active'),
        orderBy('entry_time', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const activeSessions = [];
      
      for (const docSnap of querySnapshot.docs) {
        const rawSessionData = docSnap.data();
        const sessionData = { 
          id: docSnap.id, 
          ...rawSessionData,
          // Convert Firestore timestamps to serializable strings
          last_update: rawSessionData.last_update?.toDate ? rawSessionData.last_update.toDate().toISOString() : rawSessionData.last_update,
          created_at: rawSessionData.created_at?.toDate ? rawSessionData.created_at.toDate().toISOString() : rawSessionData.created_at
        };
        
        // Obtener datos del usuario
        const userRef = doc(db, 'users', sessionData.user_phone);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          sessionData.user_data = userSnap.data();
        }
        
        activeSessions.push(sessionData);
      }
      */
      
      return activeSessions;
    } catch (error) {
      throw error;
    }
  }
);

// Thunk para obtener historial de sesiones de un usuario
export const getUserSessions = createAsyncThunk(
  'session/getUserSessions',
  async ({ userPhone, limitCount = 10 }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // DEMO MODE - Filter and return user sessions from mock data
      const userSessions = mockSessions
        .filter(session => session.user_phone === userPhone)
        .sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time))
        .slice(0, limitCount);
      
      /* ORIGINAL FIREBASE CODE - commented out for demo
      const q = query(
        collection(db, 'sessions'),
        where('user_phone', '==', userPhone),
        orderBy('entry_time', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      */
      
      return userSessions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para actualizar sesiones activas con tiempo transcurrido
export const updateActiveSessionTime = createAsyncThunk(
  'session/updateActiveSessionTime',
  async (_, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // DEMO MODE - Update active sessions from mock data
      const updatedSessions = [];
      const now = new Date();
      
      for (let i = 0; i < mockSessions.length; i++) {
        const sessionData = { ...mockSessions[i] };
        
        if (sessionData.status === 'active') {
          const entryTime = new Date(sessionData.entry_time);
          const minutesElapsed = Math.ceil((now - entryTime) / (1000 * 60));
          
          // Get user data to check balance
          const userData = mockUsers[sessionData.user_phone];
          
          if (userData) {
            // Check if user has exceeded their balance
            if (minutesElapsed > userData.minutes_balance) {
              const overstayMinutes = minutesElapsed - userData.minutes_balance;
              
              // DEMO MODE - Update session to mark as overstay
              sessionData.status = 'overstay';
              sessionData.overstay_minutes = overstayMinutes;
              sessionData.last_update = new Date().toISOString();
              
              // Update in mock data
              mockSessions[i] = { ...sessionData };
            } else {
              // Update elapsed time
              sessionData.last_update = new Date().toISOString();
              mockSessions[i] = { ...sessionData };
            }
            
            sessionData.minutes_elapsed = minutesElapsed;
            sessionData.user_data = userData;
          }
          
          updatedSessions.push(sessionData);
        }
      }
      
      /* ORIGINAL FIREBASE CODE - commented out for demo
      const q = query(
        collection(db, 'sessions'),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      const updatedSessions = [];
      const now = new Date();
      
      for (const docSnap of querySnapshot.docs) {
        const rawSessionData = docSnap.data();
        const sessionData = { 
          id: docSnap.id, 
          ...rawSessionData,
          // Convert Firestore timestamps to serializable strings
          last_update: rawSessionData.last_update?.toDate ? rawSessionData.last_update.toDate().toISOString() : rawSessionData.last_update
        };
        const entryTime = new Date(sessionData.entry_time);
        const minutesElapsed = Math.ceil((now - entryTime) / (1000 * 60));
        
        // Get user data to check balance
        const userRef = doc(db, 'users', sessionData.user_phone);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Check if user has exceeded their balance
          if (minutesElapsed > userData.minutes_balance) {
            const overstayMinutes = minutesElapsed - userData.minutes_balance;
            
            // Update session to mark as overstay
            await updateDoc(doc(db, 'sessions', docSnap.id), {
              status: 'overstay',
              overstay_minutes: overstayMinutes,
              minutes_elapsed: minutesElapsed,
              last_update: serverTimestamp()
            });
            
            sessionData.status = 'overstay';
            sessionData.overstay_minutes = overstayMinutes;
            // Convert the new timestamp to string
            sessionData.last_update = new Date().toISOString();
          } else {
            // Update elapsed time
            await updateDoc(doc(db, 'sessions', docSnap.id), {
              minutes_elapsed: minutesElapsed,
              last_update: serverTimestamp()
            });
            // Convert the new timestamp to string
            sessionData.last_update = new Date().toISOString();
          }
          
          sessionData.minutes_elapsed = minutesElapsed;
          sessionData.user_data = userData;
        }
        
        updatedSessions.push(sessionData);
      }
      */
      
      return updatedSessions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para obtener estadísticas de sesiones para admin
export const getSessionStatistics = createAsyncThunk(
  'session/getSessionStatistics',
  async ({ timeRange = 'today' }, { rejectWithValue }) => {
    try {
      // DEMO MODE - Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // DEMO MODE - Filter sessions from mock data
      const filteredSessions = mockSessions.filter(session => 
        new Date(session.entry_time) >= startDate
      );
      
      /* ORIGINAL FIREBASE CODE - commented out for demo
      const q = query(
        collection(db, 'sessions'),
        where('entry_time', '>=', startDate.toISOString()),
        orderBy('entry_time', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      */
      
      // Calculate statistics
      const stats = {
        total_sessions: filteredSessions.length,
        active_sessions: filteredSessions.filter(s => s.status === 'active').length,
        completed_sessions: filteredSessions.filter(s => s.status === 'completed').length,
        overstay_sessions: filteredSessions.filter(s => s.status === 'overstay').length,
        total_revenue: filteredSessions.reduce((sum, s) => sum + (s.total_cost || 0), 0),
        average_duration: filteredSessions.filter(s => s.minutes_used).reduce((sum, s) => sum + s.minutes_used, 0) / Math.max(1, filteredSessions.filter(s => s.minutes_used).length),
        peak_hours: {},
        timeRange: timeRange
      };
      
      // Calculate peak hours
      filteredSessions.forEach(session => {
        const hour = new Date(session.entry_time).getHours();
        stats.peak_hours[hour] = (stats.peak_hours[hour] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    currentSession: null,
    activeSessions: [],
    userSessions: [],
    sessionStatistics: null,
    isLoading: false,
    isUpdatingTime: false,
    error: null,
    lastAction: null,
    lastUpdate: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Start Parking Session
      .addCase(startParkingSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startParkingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        state.lastAction = 'entry';
      })
      .addCase(startParkingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // End Parking Session
      .addCase(endParkingSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endParkingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = null;
        state.lastAction = 'exit';
      })
      .addCase(endParkingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Active Sessions
      .addCase(getActiveSessions.fulfilled, (state, action) => {
        state.activeSessions = action.payload;
      })
      // Get User Sessions
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.userSessions = action.payload;
      })
      // Update Active Session Time
      .addCase(updateActiveSessionTime.pending, (state) => {
        state.isUpdatingTime = true;
      })
      .addCase(updateActiveSessionTime.fulfilled, (state, action) => {
        state.isUpdatingTime = false;
        state.activeSessions = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(updateActiveSessionTime.rejected, (state, action) => {
        state.isUpdatingTime = false;
        state.error = action.payload;
      })
      // Get Session Statistics
      .addCase(getSessionStatistics.fulfilled, (state, action) => {
        state.sessionStatistics = action.payload;
      });
  }
});

export const { clearError, clearCurrentSession } = sessionSlice.actions;
export default sessionSlice.reducer;