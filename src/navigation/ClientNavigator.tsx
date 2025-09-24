import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { getActiveSessionByUser, ParkingSession } from '../services/parkingService';
import { useFocusEffect } from '@react-navigation/native';

// Import client screens
import { HomeNotLoggedScreen } from '../screens/client/HomeNotLoggedScreen';
import { HomeLoggedOutsideScreen } from '../screens/client/HomeLoggedOutsideScreen';
import { HomeParkedActiveScreen } from '../screens/client/HomeParkedActiveScreen';
import { PurchaseScreen } from '../screens/client/PurchaseScreen';
import { PaymentMethodScreen } from '../screens/client/PaymentMethodScreen';
import { ProfileScreen } from '../screens/client/ProfileScreen';
import { HistoryScreen } from '../screens/client/HistoryScreen';
import { QRDisplayScreen } from '../screens/client/QRDisplayScreen';
import { LowMinutesWarningScreen } from '../screens/client/LowMinutesWarningScreen';
import { MapScreen } from '../screens/client/MapScreen';
import { LocationDetailScreen } from '../screens/client/LocationDetailScreen';
import SOSServicesScreen from '../screens/client/SOSServicesScreen';
import SubscriptionPlansScreen from '../screens/client/SubscriptionPlansScreen';
import EmergencyRequestScreen from '../screens/client/EmergencyRequestScreen';
import EmergencyTrackingScreen from '../screens/client/EmergencyTrackingScreen';

// Import settings and general screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import QRConfigScreen from '../screens/settings/QRConfigScreen';
import HelpSupportScreen from '../screens/general/HelpSupportScreen';
import PricingInfoScreen from '../screens/general/PricingInfoScreen';
import UsageGuideScreen from '../screens/general/UsageGuideScreen';
import ExportHistoryScreen from '../screens/general/ExportHistoryScreen';

export type ClientStackParamList = {
  HomeNotLogged: undefined;
  HomeLoggedOutside: undefined;
  HomeParkedActive: { sessionId: string };
  PurchaseMain: undefined;
  PaymentMethod: { package: any };
  ProfileMain: undefined;
  HistoryMain: undefined;
  QRDisplay: undefined;
  LowMinutesWarning: { remainingMinutes: number };
  Settings: { userRole?: string };
  NotificationSettings: undefined;
  QRConfig: undefined;
  HelpSupport: undefined;
  PricingInfo: undefined;
  UsageGuide: undefined;
  ExportHistory: undefined;
  MapMain: undefined;
  LocationDetail: { location: any };
  SOSServices: undefined;
  SubscriptionPlans: undefined;
  EmergencyRequest: { serviceType: any };
  EmergencyTracking: { requestId: string; serviceType: any };
};

export type ClientTabParamList = {
  Home: undefined;
  Map: undefined;
  QR: undefined;
  Purchase: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<ClientStackParamList>();
const Tab = createBottomTabNavigator<ClientTabParamList>();

// Smart Home Stack Navigator that automatically switches based on parking session status
function HomeStackNavigator() {
  const { userData } = useAuth();
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [initialRoute, setInitialRoute] = useState<keyof ClientStackParamList>('HomeLoggedOutside');
  const [isLoading, setIsLoading] = useState(true);

  // Check for active session when screen comes into focus
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
    // Return a loading screen or the default while checking
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="HomeLoggedOutside"
      >
        <Stack.Screen name="HomeNotLogged" component={HomeNotLoggedScreen} />
        <Stack.Screen name="HomeLoggedOutside" component={HomeLoggedOutsideScreen} />
        <Stack.Screen name="HomeParkedActive" component={HomeParkedActiveScreen} />
        <Stack.Screen name="LowMinutesWarning" component={LowMinutesWarningScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SOSServices" component={SOSServicesScreen} />
        <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
        <Stack.Screen name="EmergencyRequest" component={EmergencyRequestScreen} />
        <Stack.Screen name="EmergencyTracking" component={EmergencyTrackingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="HomeNotLogged" component={HomeNotLoggedScreen} />
      <Stack.Screen
        name="HomeLoggedOutside"
        component={HomeLoggedOutsideScreen}
      />
      <Stack.Screen
        name="HomeParkedActive"
        component={HomeParkedActiveScreen}
        initialParams={{ sessionId: activeSession?.id || '' }}
      />
      <Stack.Screen name="LowMinutesWarning" component={LowMinutesWarningScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SOSServices" component={SOSServicesScreen} />
      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="EmergencyRequest" component={EmergencyRequestScreen} />
      <Stack.Screen name="EmergencyTracking" component={EmergencyTrackingScreen} />
    </Stack.Navigator>
  );
}

// Purchase Stack Navigator
function PurchaseStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PurchaseMain" component={PurchaseScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="QRConfig" component={QRConfigScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="PricingInfo" component={PricingInfoScreen} />
      <Stack.Screen name="UsageGuide" component={UsageGuideScreen} />
    </Stack.Navigator>
  );
}

// History Stack Navigator
function HistoryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
      <Stack.Screen name="ExportHistory" component={ExportHistoryScreen} />
    </Stack.Navigator>
  );
}

// Map Stack Navigator
function MapStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
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
          } else if (route.name === 'Map') {
            iconName = 'map-pin';
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
        name="Map"
        component={MapStackNavigator}
        options={{ tabBarLabel: 'Mapa' }}
      />
      <Tab.Screen
        name="QR"
        component={QRDisplayScreen}
        options={{ tabBarLabel: 'Mi QR' }}
      />
      <Tab.Screen 
        name="Purchase" 
        component={PurchaseStackNavigator}
        options={{ tabBarLabel: 'Comprar' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryStackNavigator}
        options={{ tabBarLabel: 'Historial' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function ClientNavigator() {
  return <ClientTabNavigator />;
}