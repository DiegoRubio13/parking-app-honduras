import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import AdminNavigator from './AdminNavigator';  // TESTING THIS ONE
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';

export type RootStackParamList = {
  Auth: undefined;
  Client: undefined;
  Guard: undefined;
  Admin: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background
    }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.text.primary
      }}>
        Cargando...
      </Text>
    </View>
  );
}

// Simple fallback screen for Guard role
function SimpleGuardScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' }}>
        Pantalla de Guardia
      </Text>
      <Text style={{ fontSize: 16, color: theme.colors.text.secondary, marginTop: 10, textAlign: 'center' }}>
        Funcionalidad en desarrollo para el demo
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isLoading, isAuthenticated, userData } = useAuth();

  if (isLoading) {
    return (
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {userData?.role === 'client' && (
              <Stack.Screen name="Client" component={ClientNavigator} />
            )}
            {userData?.role === 'guard' && (
              <Stack.Screen name="Guard" component={SimpleGuardScreen} />
            )}
            {userData?.role === 'admin' && (
              <Stack.Screen name="Admin" component={AdminNavigator} />
            )}
            {/* Fallback for users without a role or invalid role */}
            {(!userData?.role || !['client', 'guard', 'admin'].includes(userData.role)) && (
              <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}