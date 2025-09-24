// src/navigation/UserNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

// User Screens
import HomeScreen from '../screens/user/HomeScreen';
import PurchaseScreen from '../screens/user/PurchaseScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import HistoryScreen from '../screens/user/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para Home (incluye Purchase)
const HomeStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="HomeMain"
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Purchase" component={PurchaseScreen} />
  </Stack.Navigator>
);

// Stack para Profile (incluye History)
const ProfileStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="ProfileMain"
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
  </Stack.Navigator>
);

const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[500],
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 16,
          backgroundColor: Colors.neutral[0],
          borderTopWidth: 0,
          shadowColor: Colors.neutral[900],
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          letterSpacing: -0.1,
        },
        tabBarIconStyle: {
          marginTop: 4,
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{
          tabBarLabel: 'Mi QR'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil'
        }}
      />
    </Tab.Navigator>
  );
};

export default UserNavigator;