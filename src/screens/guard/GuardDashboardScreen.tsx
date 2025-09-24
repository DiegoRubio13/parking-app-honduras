import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { 
  GuardScreenProps, 
  DailyStats, 
  VehicleInside, 
  User 
} from '../../types/guard';
// import Icon from 'react-native-vector-icons/Feather';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { getActiveSessions, getParkingStats } from '../../services/parkingService';
import { getAllUsers } from '../../services/userService';

interface GuardDashboardScreenProps extends GuardScreenProps {}

export const GuardDashboardScreen: React.FC<GuardDashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: new Date().toDateString(),
    totalEntries: 0,
    totalExits: 0,
    currentlyInside: 0,
    totalRevenue: 0,
    averageSessionTime: 0
  });

  const [vehiclesInside, setVehiclesInside] = useState<VehicleInside[]>([]);
  const [lowBalanceUsers, setLowBalanceUsers] = useState<User[]>([]);

  // Load data from Firebase
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, activeSessions, allUsers] = await Promise.all([
        getParkingStats(),
        getActiveSessions(),
        getAllUsers()
      ]);
      
      // Transform stats to DailyStats format
      const today = new Date();
      const todayStats: DailyStats = {
        date: today.toDateString(),
        totalEntries: stats.totalSessions,
        totalExits: stats.totalSessions - activeSessions.length,
        currentlyInside: activeSessions.length,
        totalRevenue: stats.totalRevenue,
        averageSessionTime: stats.averageSessionDuration
      };
      setDailyStats(todayStats);
      
      // Transform active sessions to VehicleInside format
      const vehicles: VehicleInside[] = activeSessions.map(session => {
        const duration = differenceInMinutes(new Date(), new Date(session.startTime));
        const currentCost = duration * 1.5; // L 1.50 per minute
        
        return {
          sessionId: session.id,
          userName: session.userName,
          phone: session.userPhone,
          entryTime: new Date(session.startTime),
          duration,
          currentCost
        };
      });
      setVehiclesInside(vehicles);
      
      // Filter users with low balance (less than 30 minutes)
      const usersWithLowBalance = allUsers.filter(user => 
        user.role === 'client' && user.balance < 30
      );
      setLowBalanceUsers(usersWithLowBalance);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm', { locale: es });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToScanner = () => {
    navigation.navigate('QRScanner');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <PhoneContainer>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando estadísticas...</Text>
          </View>
        ) : (
        <>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsTitle}>
            <Ionicons name="bar-chart-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.statsTitleText}>Estadísticas de Hoy</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#d1fae5', '#a7f3d0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statIcon, styles.entriesIcon]}
              >
                <Ionicons name="arrow-down-circle-outline" size={20} color={theme.colors.success} />
              </LinearGradient>
              <Text style={styles.statValue}>{dailyStats.totalEntries}</Text>
              <Text style={styles.statLabel}>Entradas</Text>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient
                colors={[theme.colors.blue[100], theme.colors.blue[200]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statIcon, styles.exitsIcon]}
              >
                <Ionicons name="arrow-up-circle-outline" size={20} color={theme.colors.primary} />
              </LinearGradient>
              <Text style={styles.statValue}>{dailyStats.totalExits}</Text>
              <Text style={styles.statLabel}>Salidas</Text>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statIcon, styles.insideIcon]}
              >
                <Image
                  source={require('../../../assets/parking-logo.png')}
                  style={[styles.statLogoImage, { tintColor: theme.colors.warning }]}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={styles.statValue}>{dailyStats.currentlyInside}</Text>
              <Text style={styles.statLabel}>Adentro</Text>
            </View>
            
            <View style={styles.statItem}>
              <LinearGradient
                colors={['#f3e8ff', '#e9d5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statIcon, styles.revenueIcon]}
              >
                <Ionicons name="cash-outline" size={20} color="#7c3aed" />
              </LinearGradient>
              <Text style={styles.statValue}>L {dailyStats.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Ingresos</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Ionicons name="people-outline" size={20} color={theme.colors.text.primary} />
          <Text style={styles.sectionTitleText}>Vehículos Adentro Ahora:</Text>
        </View>

        {vehiclesInside.map((vehicle, index) => (
          <TouchableOpacity key={vehicle.sessionId} style={styles.vehicleItem}>
            <View style={styles.vehicleHeader}>
              <LinearGradient
                colors={[theme.colors.blue[100], theme.colors.blue[200]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.vehicleAvatar}
              >
                <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
              </LinearGradient>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicle.userName} ({vehicle.phone})
                </Text>
                <Text style={styles.vehicleDetails}>
                  Entrada: {formatTime(vehicle.entryTime)} ({formatDuration(vehicle.duration)})
                </Text>
              </View>
              <Text style={styles.vehicleCost}>L {vehicle.currentCost.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {lowBalanceUsers.length > 0 && (
          <LinearGradient
            colors={['#fef3c7', '#fde68a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.alertsSection}
          >
            <View style={styles.alertsTitle}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
              <Text style={styles.alertsTitleText}>Alertas:</Text>
            </View>
            <Text style={styles.alertText}>
              • {lowBalanceUsers.length} usuarios con saldo bajo
            </Text>
            {lowBalanceUsers.map((user, index) => (
              <Text key={user.id} style={styles.alertUser}>
                - {user.name}: {user.balance} minutos restantes
              </Text>
            ))}
          </LinearGradient>
        )}

        <Button
          title="Volver al Menú Principal"
          onPress={handleGoBack}
          style={styles.backToScannerButton}
        />
        </>
        )}
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: 12,
    padding: 12,
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  statsCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  statsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  statsTitleText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  entriesIcon: {
    // Already defined in gradient
  },
  exitsIcon: {
    // Already defined in gradient
  },
  insideIcon: {
    // Already defined in gradient
  },
  revenueIcon: {
    // Already defined in gradient
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium as any,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  sectionTitleText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  vehicleItem: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm + 4,
    ...theme.shadows.sm,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: theme.fontSize.md - 1,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: theme.fontSize.xs + 1,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  vehicleCost: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.success,
  },
  alertsSection: {
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  alertsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  alertsTitleText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.warning,
  },
  alertText: {
    fontSize: theme.fontSize.sm,
    color: '#92400e',
    marginBottom: theme.spacing.xs,
  },
  alertUser: {
    fontSize: theme.fontSize.sm - 1,
    color: '#92400e',
    marginLeft: theme.spacing.sm,
    marginBottom: 2,
  },
  backToScannerButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  statLogoImage: {
    width: 20,
    height: 20,
  },
});