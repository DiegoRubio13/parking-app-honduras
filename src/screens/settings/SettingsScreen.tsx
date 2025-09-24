import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { theme } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutUser } from '../../services/authService';
import { CommonActions } from '@react-navigation/native';

interface SettingsScreenProps {
  navigation: any;
  route: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, route }) => {
  const userRole = route.params?.userRole || 'client';
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoLock, setAutoLock] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear auth state
              await signOutUser();

              // Clear AsyncStorage
              await AsyncStorage.multiRemove([
                'authToken',
                'userData',
                'userRole',
                'mockAuthState',
                'currentUser'
              ]);

              // Navigate to Login screen and reset navigation stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Hubo un problema al cerrar sesión. Por favor intenta de nuevo.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderRoleHeader = () => {
    switch(userRole) {
      case 'admin':
        return { title: 'Configuración Admin', color: ['#8b5cf6', '#7c3aed'] };
      case 'guard':
        return { title: 'Configuración Guardia', color: ['#f59e0b', '#d97706'] };
      default:
        return { title: 'Configuración', color: ['#dc2626', '#991b1b'] };
    }
  };

  const headerInfo = renderRoleHeader();

  return (
    <PhoneContainer>
      <LinearGradient
        colors={headerInfo.color as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerInfo.title}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-circle" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Editar Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Cambiar PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Notificaciones</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor={notifications ? 'white' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Modo Oscuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor={darkMode ? 'white' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Auto-bloqueo</Text>
            </View>
            <Switch
              value={autoLock}
              onValueChange={setAutoLock}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor={autoLock ? 'white' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Centro de Ayuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Términos y Condiciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Política de Privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={24} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Versión de la App</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="white" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  versionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  logoutSection: {
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  logoutText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: 'white',
  },
});

export default SettingsScreen;