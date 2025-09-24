import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { View, Text, ActivityIndicator } from 'react-native';

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
      backgroundColor: '#f8fafc'
    }}>
      <ActivityIndicator size="large" color="#1d4ed8" />
      <Text style={{
        marginTop: 16,
        fontSize: 16,
        color: '#64748b'
      }}>
        Cargando ParKing...
      </Text>
    </View>
  );
}

function SimpleAuthScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1d4ed8'
    }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        ParKing Login
      </Text>
      <Text style={{ color: 'white', fontSize: 16, marginTop: 10 }}>
        Authentication Screen
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isLoading, isAuthenticated, userData } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={SimpleAuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}