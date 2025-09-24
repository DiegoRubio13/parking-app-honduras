import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export type GuardTabParamList = {
  Main: undefined;
  Scanner: undefined;
  Sessions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<GuardTabParamList>();

function GuardMainScreen() {
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Panel de Guardia</Text>
        <Text style={styles.subtitle}>Control de Acceso</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Vehículos Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Entradas Hoy</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Registro Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Ver Alertas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function GuardScannerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escáner QR</Text>
      <Text style={styles.subtitle}>Escanear códigos de entrada/salida</Text>

      <View style={styles.scannerPlaceholder}>
        <Feather name="camera" size={64} color={theme.colors.text.muted} />
        <Text style={styles.scannerText}>Cámara QR no disponible en demo</Text>
      </View>

      <TouchableOpacity style={styles.manualButton}>
        <Text style={styles.manualText}>Entrada Manual</Text>
      </TouchableOpacity>
    </View>
  );
}

function GuardSessionsScreen() {
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sesiones Activas</Text>
        <Text style={styles.subtitle}>Vehículos en el estacionamiento</Text>

        <View style={styles.sessionCard}>
          <Text style={styles.sessionText}>ABC-123 • Espacio A-15</Text>
          <Text style={styles.sessionTime}>Desde: 14:30</Text>
        </View>

        <View style={styles.sessionCard}>
          <Text style={styles.sessionText}>XYZ-789 • Espacio B-08</Text>
          <Text style={styles.sessionTime}>Desde: 15:45</Text>
        </View>

        <View style={styles.sessionCard}>
          <Text style={styles.sessionText}>LMN-456 • Espacio C-22</Text>
          <Text style={styles.sessionTime}>Desde: 16:15</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function GuardSettingsScreen() {
  const { signOut, userData } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Hola {userData?.name || 'Guardia'}</Text>

        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Cambiar Turno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Reportar Incidente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Historial de Turnos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default function GuardNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'Main') {
            iconName = 'home';
          } else if (route.name === 'Scanner') {
            iconName = 'camera';
          } else if (route.name === 'Sessions') {
            iconName = 'list';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
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
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Main"
        component={GuardMainScreen}
        options={{ tabBarLabel: 'Principal' }}
      />
      <Tab.Screen
        name="Scanner"
        component={GuardScannerScreen}
        options={{ tabBarLabel: 'Escáner' }}
      />
      <Tab.Screen
        name="Sessions"
        component={GuardSessionsScreen}
        options={{ tabBarLabel: 'Activas' }}
      />
      <Tab.Screen
        name="Settings"
        component={GuardSettingsScreen}
        options={{ tabBarLabel: 'Config' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 5,
  },
  actionContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerPlaceholder: {
    backgroundColor: theme.colors.card,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  scannerText: {
    color: theme.colors.text.muted,
    marginTop: 10,
    textAlign: 'center',
  },
  manualButton: {
    backgroundColor: theme.colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  manualText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sessionTime: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 8,
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});