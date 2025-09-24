import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { GuardStackParamList } from '../../navigation/GuardNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';

type GuardMainMenuNavigationProp = CompositeNavigationProp<
  StackNavigationProp<GuardStackParamList, 'MainMenu'>,
  StackNavigationProp<RootStackParamList>
>;

interface GuardMainMenuScreenProps {
  navigation: GuardMainMenuNavigationProp;
}

interface MenuActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}

const MenuAction: React.FC<MenuActionProps> = ({ icon, title, description, color, onPress }) => (
  <TouchableOpacity
    style={styles.menuAction}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.menuActionIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={32} color={color} />
    </View>
    <View style={styles.menuActionContent}>
      <Text style={styles.menuActionTitle}>{title}</Text>
      <Text style={styles.menuActionDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
  </TouchableOpacity>
);

export const GuardMainMenuScreen: React.FC<GuardMainMenuScreenProps> = ({ navigation }) => {
  const { signOut } = useAuth();
  const handleScannerPress = () => {
    navigation.navigate('QRScanner');
  };

  const handleDashboardPress = () => {
    navigation.navigate('Dashboard');
  };

  const handleManualEntryPress = () => {
    navigation.navigate('ManualEntry');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  };

  return (
    <PhoneContainer>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#065f46', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.logo}>
                <Image
                  source={require('../../../assets/parking-logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>GUARDIA</Text>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Bienvenido, Guardia</Text>
            <Text style={styles.welcomeSubtitle}>Selecciona una opción para continuar</Text>
          </View>

          {/* Menu Actions */}
          <View style={styles.menuSection}>
            <MenuAction
              icon="qr-code-outline"
              title="Scanner QR"
              description="Escanear códigos QR de entrada y salida"
              color={theme.colors.primary}
              onPress={handleScannerPress}
            />

            <MenuAction
              icon="analytics-outline"
              title="Ver Dashboard"
              description="Estadísticas y vehículos en el estacionamiento"
              color={theme.colors.success}
              onPress={handleDashboardPress}
            />

            <MenuAction
              icon="person-add-outline"
              title="Entrada Manual"
              description="Registrar vehículos sin aplicación"
              color={theme.colors.warning}
              onPress={handleManualEntryPress}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Image
                source={require('../../../assets/parking-logo.png')}
                style={[styles.quickStatIcon, { tintColor: theme.colors.primary }]}
                resizeMode="contain"
              />
              <Text style={styles.quickStatValue}>5</Text>
              <Text style={styles.quickStatLabel}>Vehículos adentro</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Ionicons name="time-outline" size={20} color={theme.colors.warning} />
              <Text style={styles.quickStatValue}>23</Text>
              <Text style={styles.quickStatLabel}>Entradas hoy</Text>
            </View>
          </View>
        </View>
      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.xxl,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  menuSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  menuAction: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  menuActionIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuActionContent: {
    flex: 1,
  },
  menuActionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  menuActionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  quickStatItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  quickStatValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
  },
  quickStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  quickStatIcon: {
    width: 20,
    height: 20,
  },
});

export default GuardMainMenuScreen;