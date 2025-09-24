import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import { I18nProvider } from './src/hooks/useI18n';
import { initializeParkingData } from './src/services/parkingLocationService';
// Import Firebase auth to ensure it's initialized early
import './src/services/firebase';

export default function App() {
  useEffect(() => {
    initializeParkingData();
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1 }}>
          {/* Add div for recaptcha in web builds only */}
          {Platform.OS === 'web' && (
            <div id="recaptcha-container" style={{ display: 'none' }} />
          )}
          <AppNavigator />
        </View>
      </AuthProvider>
    </I18nProvider>
  );
}