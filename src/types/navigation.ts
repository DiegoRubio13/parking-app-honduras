// Central navigation types for the entire app
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root stack parameter list
export type RootStackParamList = {
  Auth: undefined;
  Client: undefined;
  Guard: undefined;
  Admin: undefined;
  Dashboard: undefined;
  Users: undefined;
  Pricing: undefined;
  Guards: undefined;
  Reports: undefined;
  Panel: undefined;
};

// Client navigation types
export type ClientStackParamList = {
  HomeNotLogged: undefined;
  HomeLoggedOutside: undefined;
  HomeParkedActive: { sessionId: string };
  Purchase: undefined;
  PaymentMethod: { package: PaymentPackage };
  Profile: undefined;
  History: undefined;
  QRDisplay: undefined;
  LowMinutesWarning: { remainingMinutes: number };
  NotificationSettings: undefined;
  ExportHistory: undefined;
  EmergencyHistory: undefined;
  EmergencyContacts: undefined;
};

export type ClientTabParamList = {
  Home: undefined;
  QR: undefined;
  Purchase: undefined;
  History: undefined;
  Profile: undefined;
};

// Guard navigation types
export type GuardStackParamList = {
  GuardMainMenu: undefined;
  QRScanner: undefined;
  ScanResultEntrada: { sessionData: any };
  ScanResultSalida: { sessionData: any };
  GuardDashboard: undefined;
};

// Admin navigation types
export type AdminStackParamList = {
  Dashboard: undefined;
  Users: undefined;
  Pricing: undefined;
  Guards: undefined;
  Reports: undefined;
  Panel: undefined;
};

// Screen prop types
export type ClientStackScreenProps<T extends keyof ClientStackParamList> = 
  NativeStackScreenProps<ClientStackParamList, T>;

export type ClientTabScreenProps<T extends keyof ClientTabParamList> = 
  BottomTabScreenProps<ClientTabParamList, T>;

export type GuardStackScreenProps<T extends keyof GuardStackParamList> = 
  NativeStackScreenProps<GuardStackParamList, T>;

export type AdminStackScreenProps<T extends keyof AdminStackParamList> =
  NativeStackScreenProps<AdminStackParamList, T>;

// Payment package interface for navigation
export interface PaymentPackage {
  id: string;
  name: string;
  minutes: number;
  price: number;
  costPerMinute: number;
  savings?: number;
  popular?: boolean;
  description: string;
  isActive: boolean;
}