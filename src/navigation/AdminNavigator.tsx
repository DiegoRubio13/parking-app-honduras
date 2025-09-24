import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

// Import admin screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';
import PaymentTransactionsScreen from '../screens/admin/PaymentTransactionsScreen';
import AdminGuardsScreen from '../screens/admin/AdminGuardsScreen';
import AdminPricingScreen from '../screens/admin/AdminPricingScreen';
import { LocationManagementScreen } from '../screens/admin/LocationManagementScreen';
import { LocationEditScreen } from '../screens/admin/LocationEditScreen';
import { AdvancedChartsScreen } from '../screens/admin/AdvancedChartsScreen';
import { UserDetailScreen } from '../screens/admin/UserDetailScreen';
import { UserEditScreen } from '../screens/admin/UserEditScreen';
import { AddUserScreen } from '../screens/admin/AddUserScreen';
import EmergencyControlScreen from '../screens/admin/EmergencyControlScreen';
import ProviderManagementScreen from '../screens/admin/ProviderManagementScreen';

export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminGuards: undefined;
  AdminPricing: undefined;
  PaymentTransactions: undefined;
  AdminPanel: undefined;
  LocationManagement: undefined;
  LocationEdit: { location: any };
  AdvancedCharts: undefined;
  UserDetail: { user: any };
  UserEdit: { user: any };
  AddUser: undefined;
  EmergencyControl: undefined;
  ProviderManagement: undefined;
  // Simple names for navigation compatibility
  Pricing: undefined;
  Guards: undefined;
  Users: undefined;
  Transactions: undefined;
  Panel: undefined;
  Locations: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

// Stack Navigator for Dashboard
function DashboardStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="PaymentTransactions" component={PaymentTransactionsScreen} />
      <Stack.Screen name="Transactions" component={PaymentTransactionsScreen} />
      <Stack.Screen name="Pricing" component={AdminPricingScreen} />
      <Stack.Screen name="Guards" component={AdminGuardsScreen} />
      <Stack.Screen name="Users" component={AdminUsersScreen} />
      <Stack.Screen name="Panel" component={AdminPanelScreen} />
      <Stack.Screen name="LocationManagement" component={LocationManagementScreen} />
      <Stack.Screen name="Locations" component={LocationManagementScreen} />
      <Stack.Screen name="LocationEdit" component={LocationEditScreen} />
      <Stack.Screen name="AdvancedCharts" component={AdvancedChartsScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
      <Stack.Screen name="ProviderManagement" component={ProviderManagementScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Users
function UsersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminGuards" component={AdminGuardsScreen} />
      <Stack.Screen name="Guards" component={AdminGuardsScreen} />
      <Stack.Screen name="Pricing" component={AdminPricingScreen} />
      <Stack.Screen name="Transactions" component={PaymentTransactionsScreen} />
      <Stack.Screen name="Panel" component={AdminPanelScreen} />
      <Stack.Screen name="LocationEdit" component={LocationEditScreen} />
      <Stack.Screen name="AdvancedCharts" component={AdvancedChartsScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
      <Stack.Screen name="ProviderManagement" component={ProviderManagementScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Reports
function ReportsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="AdminPricing" component={AdminPricingScreen} />
      <Stack.Screen name="Pricing" component={AdminPricingScreen} />
      <Stack.Screen name="Guards" component={AdminGuardsScreen} />
      <Stack.Screen name="Users" component={AdminUsersScreen} />
      <Stack.Screen name="Transactions" component={PaymentTransactionsScreen} />
      <Stack.Screen name="Panel" component={AdminPanelScreen} />
      <Stack.Screen name="LocationEdit" component={LocationEditScreen} />
      <Stack.Screen name="AdvancedCharts" component={AdvancedChartsScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
      <Stack.Screen name="ProviderManagement" component={ProviderManagementScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Settings
function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="Pricing" component={AdminPricingScreen} />
      <Stack.Screen name="Guards" component={AdminGuardsScreen} />
      <Stack.Screen name="Users" component={AdminUsersScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="Transactions" component={PaymentTransactionsScreen} />
      <Stack.Screen name="Panel" component={AdminPanelScreen} />
      <Stack.Screen name="Locations" component={LocationManagementScreen} />
      <Stack.Screen name="LocationEdit" component={LocationEditScreen} />
      <Stack.Screen name="AdvancedCharts" component={AdvancedChartsScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="EmergencyControl" component={EmergencyControlScreen} />
      <Stack.Screen name="ProviderManagement" component={ProviderManagementScreen} />
    </Stack.Navigator>
  );
}

function AdminSettingsScreen({ navigation }: any) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleConfigPress = (configType: string) => {
    switch (configType) {
      case 'pricing':
        navigation.navigate('Pricing');
        break;
      case 'guards':
        navigation.navigate('Guards');
        break;
      case 'users':
        navigation.navigate('Users');
        break;
      case 'reports':
        navigation.navigate('AdminReports');
        break;
      case 'transactions':
        navigation.navigate('Transactions');
        break;
      case 'panel':
        navigation.navigate('Panel');
        break;
      case 'locations':
        navigation.navigate('Locations');
        break;
      case 'emergency':
        navigation.navigate('EmergencyControl');
        break;
      default:
        console.log(`Configuración ${configType} en desarrollo`);
    }
  };

  const configOptions = [
    { title: 'Control de Emergencias SOS', icon: 'alert-triangle', description: 'Gestionar solicitudes de emergencia', action: 'emergency' },
    { title: 'Gestión de Ubicaciones', icon: 'map-pin', description: 'Administrar ubicaciones de estacionamiento', action: 'locations' },
    { title: 'Configuración de Tarifas', icon: 'dollar-sign', description: 'Ajustar precios y tarifas del sistema', action: 'pricing' },
    { title: 'Gestión de Guardias', icon: 'shield', description: 'Administrar permisos y turnos de guardias', action: 'guards' },
    { title: 'Gestión de Usuarios', icon: 'users', description: 'Administrar usuarios del sistema', action: 'users' },
    { title: 'Transacciones', icon: 'credit-card', description: 'Ver historial de transacciones', action: 'transactions' },
    { title: 'Reportes del Sistema', icon: 'file-text', description: 'Generar reportes y estadísticas', action: 'reports' },
    { title: 'Panel Completo', icon: 'layout', description: 'Acceder al panel de administración completo', action: 'panel' }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7c2d12', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Configuración Admin</Text>
          <Text style={styles.headerSubtitle}>Configuraciones del sistema</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.configList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {configOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.configItem}
            onPress={() => handleConfigPress(option.action)}
          >
            <View style={styles.configIcon}>
              <Feather name={option.icon as any} size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.configContent}>
              <Text style={styles.configTitle}>{option.title}</Text>
              <Text style={styles.configDescription}>{option.description}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Feather name="log-out" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Users') {
            iconName = 'users';
          } else if (route.name === 'Reports') {
            iconName = 'bar-chart-2';
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
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Users"
        component={UsersStackNavigator}
        options={{ tabBarLabel: 'Usuarios' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackNavigator}
        options={{ tabBarLabel: 'Reportes' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Config' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  configList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  configContent: {
    flex: 1,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});