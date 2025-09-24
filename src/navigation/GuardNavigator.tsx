import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import QRScannerScreen from '../screens/guard/QRScannerScreen';
import { ScanResultEntradaScreen } from '../screens/guard/ScanResultEntradaScreen';
import { ScanResultSalidaScreen } from '../screens/guard/ScanResultSalidaScreen';
import { GuardDashboardScreen } from '../screens/guard/GuardDashboardScreen';
import GuardMainMenuScreen from '../screens/guard/GuardMainMenuScreen';
import ManualEntryScreen from '../screens/guard/ManualEntryScreen';
import ManualEntriesListScreen from '../screens/guard/ManualEntriesListScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

export type GuardStackParamList = {
  MainMenu: undefined;
  Dashboard: undefined;
  QRScanner: undefined;
  ManualEntry: undefined;
  ManualEntriesList: undefined;
  Settings: undefined;
  ScanResultEntrada: {
    qrData: any;
    scanTime: Date;
  };
  ScanResultSalida: {
    qrData: any;
    scanTime: Date;
  };
};

const Stack = createStackNavigator<GuardStackParamList>();

export default function GuardNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="MainMenu"
    >
      <Stack.Screen name="MainMenu" component={GuardMainMenuScreen} />
      <Stack.Screen name="Dashboard" component={GuardDashboardScreen} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
      <Stack.Screen name="ManualEntriesList" component={ManualEntriesListScreen} />
      <Stack.Screen name="ScanResultEntrada" component={ScanResultEntradaScreen} />
      <Stack.Screen name="ScanResultSalida" component={ScanResultSalidaScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} initialParams={{ userRole: 'guard' }} />
    </Stack.Navigator>
  );
}