import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import { SMSVerificationScreen } from '../screens/auth/SMSVerificationScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import PasswordRecoveryScreen from '../screens/auth/PasswordRecoveryScreen';

export type AuthStackParamList = {
  Login: undefined;
  SMSVerification: {
    phone: string;
    phoneNumber?: string;
    type?: 'register' | 'recovery';
    verificationId?: string;
    confirmationResult?: any;
    isRegistration?: boolean;
    registerData?: any;
  };
  SMSVerificationScreen: {
    phone?: string;
    phoneNumber?: string;
    type?: 'register' | 'recovery';
    verificationId?: string;
    confirmationResult?: any;
    isRegistration?: boolean;
    registerData?: any;
  };
  Register: undefined;
  RegisterScreen: undefined;
  RoleSelection: undefined;
  PasswordRecovery: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SMSVerification" component={SMSVerificationScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="SMSVerificationScreen" component={SMSVerificationScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} />
    </Stack.Navigator>
  );
}