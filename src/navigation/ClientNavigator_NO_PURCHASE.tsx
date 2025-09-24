import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { getActiveSessionByUser, ParkingSession } from '../services/parkingService';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text } from 'react-native';

// Import client screens (excluding PurchaseScreen)
import { HomeNotLoggedScreen } from '../screens/client/HomeNotLoggedScreen';
import { HomeLoggedOutsideScreen } from '../screens/client/HomeLoggedOutsideScreen';
import { HomeParkedActiveScreen } from '../screens/client/HomeParkedActiveScreen';
import { ProfileScreen } from '../screens/client/ProfileScreen';
import { HistoryScreen } from '../screens/client/HistoryScreen';
import { QRDisplayScreen } from '../screens/client/QRDisplayScreen';
import { LowMinutesWarningScreen } from '../screens/client/LowMinutesWarningScreen';

// Simple placeholder for Purchase
function SimplePurchaseScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1d4ed8' }}>
        Comprar Minutos
      </Text>
      <Text style={{ fontSize: 16, color: '#64748b', marginTop: 10 }}>
        Funcionalidad en desarrollo
      </Text>
    </View>
  );
}

export type ClientStackParamList = {
  HomeNotLogged: undefined;
  HomeLoggedOutside: undefined;
  HomeParkedActive: { sessionId: string };
  Purchase: undefined;
  Profile: undefined;
  History: undefined;
  QRDisplay: undefined;
  LowMinutesWarning: { remainingMinutes: number };
};

export type ClientTabParamList = {
  Home: undefined;
  QR: undefined;
  Purchase: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<ClientStackParamList>();
const Tab = createBottomTabNavigator<ClientTabParamList>();

// Smart Home Stack Navigator
function HomeStackNavigator() {
  const { userData } = useAuth();
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [initialRoute, setInitialRoute] = useState<keyof ClientStackParamList>('HomeLoggedOutside');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const checkActiveSession = async () => {
        if (!userData?.uid) {
          setInitialRoute('HomeLoggedOutside');
          setIsLoading(false);
          return;
        }

        try {
          const session = await getActiveSessionByUser(userData.uid);
          setActiveSession(session);

          if (session) {
            setInitialRoute('HomeParkedActive');
          } else {
            setInitialRoute('HomeLoggedOutside');
          }
        } catch (error) {
          console.error('Error checking active session:', error);
          setInitialRoute('HomeLoggedOutside');
        } finally {
          setIsLoading(false);
        }
      };

      checkActiveSession();
    }, [userData?.uid])
  );

  if (isLoading) {
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="HomeLoggedOutside"
      >
        <Stack.Screen name="HomeNotLogged" component={HomeNotLoggedScreen} />
        <Stack.Screen name="HomeLoggedOutside" component={HomeLoggedOutsideScreen} />
        <Stack.Screen name="HomeParkedActive" component={HomeParkedActiveScreen} />
        <Stack.Screen name="LowMinutesWarning" component={LowMinutesWarningScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="HomeNotLogged" component={HomeNotLoggedScreen} />
      <Stack.Screen name="HomeLoggedOutside" component={HomeLoggedOutsideScreen} />
      <Stack.Screen
        name="HomeParkedActive"
        component={HomeParkedActiveScreen}
        initialParams={{ sessionId: activeSession?.id || '' }}
      />
      <Stack.Screen name="LowMinutesWarning" component={LowMinutesWarningScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'QR') {
            iconName = 'maximize';
          } else if (route.name === 'Purchase') {
            iconName = 'shopping-cart';
          } else if (route.name === 'History') {
            iconName = 'clock';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium as any,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="QR"
        component={QRDisplayScreen}
        options={{ tabBarLabel: 'Mi QR' }}
      />
      <Tab.Screen
        name="Purchase"
        component={SimplePurchaseScreen}
        options={{ tabBarLabel: 'Comprar' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Historial' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function ClientNavigator() {
  return <ClientTabNavigator />;
}