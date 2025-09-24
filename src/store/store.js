// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import sessionReducer from './sessionSlice';
import purchaseReducer from './purchaseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    purchase: purchaseReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/loginUser/fulfilled',
          'auth/checkAuthState/fulfilled',
          'session/startParkingSession/fulfilled',
          'session/endParkingSession/fulfilled',
          'purchase/addMinutesToUser/fulfilled'
        ],
        ignoredPaths: [
          'auth.user.created_at',
          'session.currentSession.entry_time',
          'session.activeSessions',
          'purchase.lastPurchase.timestamp'
        ]
      }
    })
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;