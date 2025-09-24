import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { View, Text } from 'react-native';

function SimpleHomeScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1d4ed8' }}>
        Home Client
      </Text>
    </View>
  );
}

function SimpleProfileScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1d4ed8' }}>
        Profile Client
      </Text>
    </View>
  );
}

export type ClientStackParamList = {
  Home: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ClientStackParamList>();

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={SimpleHomeScreen} />
      <Tab.Screen name="Profile" component={SimpleProfileScreen} />
    </Tab.Navigator>
  );
}