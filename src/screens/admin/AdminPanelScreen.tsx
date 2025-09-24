import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { theme } from '../../constants/theme';

// Navigation prop types
interface AdminPanelScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Real-time status interface
interface RealTimeStatus {
  occupiedSpaces: number;
  totalSpaces: number;
  waitingQueue: number;
  averageTime: number;
}

// System alerts interface
interface SystemAlert {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
}

// Quick action interface
interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation }) => {
  const [todayRevenue, setTodayRevenue] = useState(4250);
  const [growthRate, setGrowthRate] = useState(12.5);
  const [refreshing, setRefreshing] = useState(false);

  const [overviewStats] = useState({
    sessions: 156,
    users: 89,
    revenue: 4250,
  });

  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus>({
    occupiedSpaces: 15,
    totalSpaces: 25,
    waitingQueue: 3,
    averageTime: 28,
  });

  const [systemAlerts] = useState<SystemAlert[]>([
    { id: '1', message: '5 usuarios con saldo bajo', type: 'warning' },
    { id: '2', message: 'Scanner #2 requiere mantto.', type: 'warning' },
    { id: '3', message: 'Conexión lenta detectada', type: 'warning' },
  ]);

  const quickActions: QuickAction[] = [
    { id: '1', title: 'Usuarios', icon: 'people-outline', screen: 'Users' },
    { id: '2', title: 'Pagos', icon: 'receipt-outline', screen: 'PaymentTransactions' },
    { id: '3', title: 'Tarifas', icon: 'card-outline', screen: 'Pricing' },
    { id: '4', title: 'Guardias', icon: 'shield-checkmark-outline', screen: 'Guards' },
    { id: '5', title: 'Reportes', icon: 'document-text-outline', screen: 'Reports' },
    { id: '6', title: 'Config', icon: 'settings-outline', screen: 'Settings' },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setTodayRevenue(prev => prev + Math.floor(Math.random() * 100));
      setGrowthRate(prev => +(prev + Math.random() * 2 - 1).toFixed(1));
      setRealTimeStatus(prev => ({
        ...prev,
        occupiedSpaces: Math.floor(Math.random() * prev.totalSpaces),
        waitingQueue: Math.floor(Math.random() * 5),
        averageTime: Math.floor(Math.random() * 10) + 25,
      }));
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleQuickAction = (screen: string) => {
    navigation.navigate(screen);
  };

  const OverviewItem = ({ 
    label, 
    value 
  }: {
    label: string;
    value: string | number;
  }) => (
    <View style={styles.overviewItem}>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  );

  const StatusItem = ({ 
    label, 
    value 
  }: {
    label: string;
    value: string | number;
  }) => (
    <View style={styles.statusItem}>
      <Text style={styles.statusItemLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );

  const AlertItem = ({ alert }: { alert: SystemAlert }) => (
    <View style={styles.alertItem}>
      <Text style={styles.alertBullet}>•</Text>
      <Text style={styles.alertText}>{alert.message}</Text>
    </View>
  );

  const QuickActionButton = ({ action }: { action: QuickAction }) => (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => handleQuickAction(action.screen)}
      activeOpacity={0.8}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={action.icon} size={16} color="white" />
      </View>
      <Text style={styles.actionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <PhoneContainer>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#7c2d12', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
                <Ionicons name="arrow-back-outline" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.backBtnText}>Panel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="bar-chart-outline" size={24} color="white" />
                <Text style={styles.titleText}>Panel Administrativo</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Revenue Banner */}
          <View style={styles.revenueBanner}>
            <Text style={styles.revenueAmount}>L {todayRevenue.toLocaleString()}</Text>
            <View style={styles.revenueGrowth}>
              <Ionicons 
                name="trending-up-outline" 
                size={16} 
                color={theme.colors.success} 
              />
              <Text style={styles.revenueGrowthText}>+{growthRate}% vs ayer</Text>
            </View>
          </View>

          {/* Overview Grid */}
          <View style={styles.overviewGrid}>
            <OverviewItem label="Sesiones" value={overviewStats.sessions} />
            <OverviewItem label="Usuarios" value={overviewStats.users} />
            <OverviewItem label="Ingresos" value={`L ${overviewStats.revenue.toLocaleString()}`} />
          </View>

          {/* Real-time Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusCardHeader} />
            <View style={styles.cardTitle}>
              <Ionicons name="car-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.cardTitleText}>Estado en Tiempo Real</Text>
            </View>
            <StatusItem 
              label="Espacios ocupados:" 
              value={`${realTimeStatus.occupiedSpaces}/${realTimeStatus.totalSpaces}`} 
            />
            <StatusItem 
              label="Cola de espera:" 
              value={realTimeStatus.waitingQueue} 
            />
            <StatusItem 
              label="Tiempo promedio:" 
              value={`${realTimeStatus.averageTime} min`} 
            />
          </View>

          {/* System Alerts */}
          <View style={styles.alertsCard}>
            <View style={styles.cardTitle}>
              <Ionicons name="alert-circle-outline" size={20} color="#92400e" />
              <Text style={[styles.cardTitleText, { color: '#92400e' }]}>
                Alertas del Sistema
              </Text>
            </View>
            {systemAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <View style={styles.cardTitle}>
              <Ionicons name="flash-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.cardTitleText}>Accesos Rápidos</Text>
            </View>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <QuickActionButton key={action.id} action={action} />
              ))}
            </View>
          </View>

          {/* Chart Visualization */}
          <View style={styles.chartCard}>
            <View style={styles.chartCardHeader} />
            <View style={styles.cardTitle}>
              <Ionicons name="pulse-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.cardTitleText}>Gráfico de uso (últimas 24h)</Text>
            </View>
            <View style={styles.chartVisual}>
              <Text style={styles.chartBars}>▁▃▅▇█▇▅▃▁</Text>
              <Text style={styles.chartLabel}>Pico: 16:00</Text>
            </View>
          </View>

          {/* Update Footer */}
          <View style={styles.updateFooter}>
            <View style={styles.updateText}>
              <Ionicons name="refresh-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.updateTextLabel}>Actualizado hace 30s</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.3,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    alignItems: 'center',
  },
  titleMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  revenueBanner: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: theme.colors.success,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.success,
    marginBottom: 4,
  },
  revenueGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  revenueGrowthText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  overviewItem: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  overviewLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  statusCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  statusCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusItemLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  alertsCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 20,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  alertBullet: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '700',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 18,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtn: {
    width: '30%',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 14,
  },
  chartCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  chartCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  chartVisual: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  chartBars: {
    fontFamily: 'monospace',
    fontSize: 24,
    color: theme.colors.primary,
    marginBottom: 8,
    letterSpacing: 2,
  },
  chartLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  updateFooter: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  updateText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateTextLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

export default AdminPanelScreen;