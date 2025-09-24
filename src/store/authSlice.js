// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Thunk para login de usuario
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      // Formatear número de teléfono (ej: 521234567890 para México)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      if (formattedPhone.length < 12) {
        throw new Error('Número de teléfono debe incluir código de país y 10 dígitos');
      }

      // DEMO MODE - Firebase operations replaced with mock data
      // const userRef = doc(db, 'users', formattedPhone);
      // const userSnap = await getDoc(userRef);
      
      let userData;
      
      // Mock user data for demo
      userData = {
        id: formattedPhone,
        phone: formattedPhone,
        minutes_balance: 250,
        current_session: null,
        total_spent: 100,
        created_at: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Guardar en AsyncStorage para persistencia
      await AsyncStorage.setItem('userPhone', formattedPhone);
      
      return userData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para login de admin
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Por ahora, credenciales hardcodeadas para admin
      if (email === 'admin@parking.com' && password === 'admin123') {
        const adminData = {
          id: 'admin',
          email,
          role: 'admin',
          name: 'Administrador'
        };
        
        await AsyncStorage.setItem('adminAuth', JSON.stringify(adminData));
        return adminData;
      } else {
        throw new Error('Credenciales de administrador incorrectas');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para login de guardia
export const loginGuard = createAsyncThunk(
  'auth/loginGuard',
  async (code, { rejectWithValue }) => {
    try {
      // Por ahora, credenciales hardcodeadas para guardia
      if (code === '1234') {
        const guardData = {
          id: 'guard',
          code,
          role: 'guard',
          name: 'Guardia de Seguridad'
        };
        
        await AsyncStorage.setItem('guardAuth', JSON.stringify(guardData));
        return guardData;
      } else {
        throw new Error('Código de acceso incorrecto');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem('userPhone');
      await AsyncStorage.removeItem('adminAuth');
      await AsyncStorage.removeItem('guardAuth');
      return null;
    } catch (error) {
      console.error('Error during logout:', error);
      return rejectWithValue('Error al cerrar sesión');
    }
  }
);

// Thunk para verificar auth persistida
export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async () => {
    try {
      // Verificar admin
      const adminAuth = await AsyncStorage.getItem('adminAuth');
      if (adminAuth) {
        return { 
          user: JSON.parse(adminAuth), 
          userType: 'admin' 
        };
      }

      // Verificar guardia
      const guardAuth = await AsyncStorage.getItem('guardAuth');
      if (guardAuth) {
        return { 
          user: JSON.parse(guardAuth), 
          userType: 'guard' 
        };
      }

      // Verificar usuario regular
      const userPhone = await AsyncStorage.getItem('userPhone');
      if (userPhone) {
        // DEMO MODE - Mock user data instead of Firebase
        // const userRef = doc(db, 'users', userPhone);
        // const userSnap = await getDoc(userRef);
        
        // Mock user data for demo
        const mockUserData = {
          id: userPhone,
          phone: userPhone,
          minutes_balance: 250,
          current_session: null,
          total_spent: 100,
          created_at: new Date().toISOString()
        };
        
        return { 
          user: mockUserData, 
          userType: 'user' 
        };
      }

      return { user: null, userType: null };
    } catch (error) {
      return { user: null, userType: null };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userType: null, // 'user', 'admin', 'guard'
    isLoading: false,
    error: null,
    isAuthenticated: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.userType = 'user';
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login Guard
      .addCase(loginGuard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginGuard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.userType = 'guard';
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginGuard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login Admin
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.userType = 'admin';
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.userType = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        // Keep user logged in if logout fails
      })
      // Check Auth State
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.userType = action.payload.userType;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, setUserType } = authSlice.actions;
export default authSlice.reducer;