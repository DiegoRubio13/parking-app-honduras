import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminPricingScreen from '../screens/admin/AdminPricingScreen';
import AdminGuardsScreen from '../screens/admin/AdminGuardsScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';
import PaymentTransactionsScreen from '../screens/admin/PaymentTransactionsScreen';

export type AdminStackParamList = {
  Dashboard: undefined;
  Users: undefined;
  Pricing: undefined;
  Guards: undefined;
  Reports: undefined;
  Panel: undefined;
  PaymentTransactions: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Dashboard"
    >
      <Stack.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="Users" component={AdminUsersScreen} />
      <Stack.Screen name="Pricing" component={AdminPricingScreen} />
      <Stack.Screen name="Guards" component={AdminGuardsScreen} />
      <Stack.Screen name="Reports" component={AdminReportsScreen} />
      <Stack.Screen name="Panel" component={AdminPanelScreen} />
      <Stack.Screen name="PaymentTransactions" component={PaymentTransactionsScreen} />
    </Stack.Navigator>
  );
}