import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { logoutUser } from '../../store/authSlice';
import { getSalesStats } from '../../store/purchaseSlice';
import { getSessionStatistics, getActiveSessions } from '../../store/sessionSlice';
import Colors from '../../constants/colors';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');

/**
 * AdminDashboardScreen - Panel principal del administrador
 * Dashboard profesional con métricas en tiempo real, KPIs y gráficos
 * Diseño seamless sin SafeAreaView divisiones
 */
const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { salesStats } = useSelector((state) => state.purchase);
  const { activeSessions, sessionStatistics } = useSelector((state) => state.session);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);

  // Compute dashboard data from Firebase data
  const dashboardData = useMemo(() => {
    if (!salesStats || !sessionStatistics) {
      return {
        kpis: {
          activeUsers: activeSessions?.length || 0,
          todayRevenue: 0,
          occupancyRate: 0,
          totalSessions: 0,
          averageSessionTime: 0,
          lowBalanceUsers: 0,
        },
        charts: {
          hourlyUsage: [],
          dailyRevenue: [],
          paymentMethods: [],
        },
        alerts: [],
        systemStatus: 'operational',
      };
    }

    // Calculate payment method percentages
    const totalTransactions = salesStats.total_transactions || 1;
    const paymentMethods = [
      { 
        method: 'Efectivo', 
        percentage: Math.round((salesStats.payment_methods?.cash || 0) / totalTransactions * 100),
        color: '#2563eb' 
      },
      { 
        method: 'Transferencia', 
        percentage: Math.round((salesStats.payment_methods?.transfer || 0) / totalTransactions * 100),
        color: '#3b82f6' 
      },
      { 
        method: 'Tarjeta', 
        percentage: Math.round((salesStats.payment_methods?.card || 0) / totalTransactions * 100),
        color: '#1d4ed8' 
      },
    ].filter(p => p.percentage > 0);

    // Generate hourly usage from peak hours data
    const hourlyUsage = [];
    if (sessionStatistics.peak_hours) {
      for (let hour = 6; hour <= 20; hour++) {
        const sessions = sessionStatistics.peak_hours[hour] || 0;
        hourlyUsage.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          sessions
        });
      }
    }

    // Generate daily revenue (mock data for now - would need weekly stats)
    const dailyRevenue = [
      { day: 'Lun', amount: salesStats.total_revenue * 0.8 },
      { day: 'Mar', amount: salesStats.total_revenue * 0.9 },
      { day: 'Mie', amount: salesStats.total_revenue * 1.1 },
      { day: 'Jue', amount: salesStats.total_revenue * 0.85 },
      { day: 'Vie', amount: salesStats.total_revenue * 1.2 },
      { day: 'Sab', amount: salesStats.total_revenue * 1.4 },
      { day: 'Dom', amount: salesStats.total_revenue },
    ];

    // Calculate occupancy based on active vs total capacity (assuming 100 spots)
    const maxCapacity = 100;
    const occupancyRate = Math.min(Math.round((activeSessions?.length || 0) / maxCapacity * 100), 100);

    // Generate alerts based on real data
    const alerts = [];
    if (occupancyRate > 80) {
      alerts.push({
        id: 'occupancy',
        type: 'warning',
        title: 'Alta ocupación',
        message: `Estacionamiento al ${occupancyRate}% de capacidad`,
        time: new Date().toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }),
        action: null,
      });
    }
    
    if (salesStats.total_revenue > 10000) {
      alerts.push({
        id: 'revenue',
        type: 'success',
        title: 'Meta de ingresos alcanzada',
        message: `Ingresos del día: L${salesStats.total_revenue.toFixed(2)}`,
        time: new Date().toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }),
        action: 'Ver reporte',
      });
    }

    return {
      kpis: {
        activeUsers: activeSessions?.length || 0,
        todayRevenue: salesStats.total_revenue || 0,
        occupancyRate,
        totalSessions: sessionStatistics.total_sessions || 0,
        averageSessionTime: Math.round(sessionStatistics.average_duration || 0),
        lowBalanceUsers: 0, // Would need separate query for this
      },
      charts: {
        hourlyUsage,
        dailyRevenue,
        paymentMethods,
      },
      alerts,
      systemStatus: 'operational',
    };
  }, [salesStats, sessionStatistics, activeSessions]);

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      // Cargar datos reales de Firebase
      await Promise.all([
        dispatch(getSalesStats({})), // Today's stats
        dispatch(getSessionStatistics({ timeRange: 'today' })),
        dispatch(getActiveSessions())
      ]);
      
      // Los datos se actualizan automáticamente via Redux selectors
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  // Función de recarga
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Animate header on load
  useEffect(() => {
    if (!loading) {
      headerOpacity.value = withTiming(1, { duration: 1000 });
      headerTranslateY.value = withTiming(0, { duration: 800 });
    }
  }, [loading]);

  // Función de logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              Alert.alert(
                'Error',
                'Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
    }).format(amount);
  };

  // Configuración de gráficos
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };

  // Animated header style
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  // Renderizar KPI Card con animaciones
  const renderKPICard = (title, value, subtitle, color = '#2563eb', onPress = null, index = 0) => (
    <Animated.View
      key={title}
      entering={FadeInDown.delay(200 + index * 100).duration(600)}
      style={{ width: '48%', margin: '1%' }}
    >
      <TouchableOpacity
        style={[styles.kpiCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <Text style={styles.kpiTitle}>{title}</Text>
        <Text style={[styles.kpiValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );

  // Renderizar alerta con animaciones
  const renderAlert = (alert, index) => {
    const alertColor = {
      warning: '#f59e0b',
      info: '#3b82f6',
      success: '#10b981',
      error: '#ef4444',
    }[alert.type] || '#6b7280';

    return (
      <Animated.View
        key={alert.id}
        entering={SlideInRight.delay(300 + index * 150).duration(500)}
      >
        <TouchableOpacity style={styles.alertCard} activeOpacity={0.8}>
          <View style={styles.alertHeader}>
            <View style={[styles.alertIndicator, { backgroundColor: alertColor }]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
            {alert.action && (
              <TouchableOpacity style={styles.alertAction}>
                <Text style={[styles.alertActionText, { color: alertColor }]}>
                  {alert.action}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.alertMessage}>{alert.message}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Preparar datos para gráficos
  const hourlyUsageData = dashboardData.charts.hourlyUsage.slice(0, 8);
  const hourlyData = {
    labels: hourlyUsageData.length > 0 
      ? hourlyUsageData.map(item => item.hour)
      : ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    datasets: [{
      data: hourlyUsageData.length > 0 
        ? hourlyUsageData.map(item => item.sessions)
        : [0, 0, 0, 0, 0, 0, 0, 0], // Fallback data
    }],
  };

  const revenueData = {
    labels: dashboardData.charts.dailyRevenue.map(item => item.day),
    datasets: [{
      data: dashboardData.charts.dailyRevenue.map(item => item.amount / 1000), // En miles
    }],
  };

  const paymentData = dashboardData.charts.paymentMethods.map((item, index) => ({
    name: item.method,
    population: item.percentage,
    color: item.color,
    legendFontColor: '#4b5563',
    legendFontSize: 12,
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <LinearGradient
          colors={['#2563eb', '#1d4ed8', '#1e40af']}
          style={StyleSheet.absoluteFillObject}
        />
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Seamless LinearGradient Header */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8', '#1e40af']}
        style={styles.gradientHeader}
      >
        <Animated.View style={[styles.headerContent, animatedHeaderStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.titleContainer}>
                <Ionicons name="car-outline" size={24} color="white" />
                <Text style={styles.title}>Panel de Administración</Text>
              </View>
              <Text style={styles.subtitle}>
                {new Date().toLocaleDateString('es-HN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Ionicons name="exit-outline" size={24} color="#ffffff" />
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Content Container with Overlap */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentContainerStyle}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#2563eb"
            colors={['#2563eb', '#1d4ed8']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Estado del Sistema */}
        <Animated.View entering={FadeInUp.delay(100).duration(800)}>
          <TouchableOpacity style={styles.statusCard} activeOpacity={0.8}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Estado del Sistema</Text>
              <View style={[
                styles.statusIndicator,
                { 
                  backgroundColor: dashboardData.systemStatus === 'operational' 
                    ? '#10b981' 
                    : '#ef4444' 
                }
              ]} />
            </View>
            <Text style={styles.statusText}>
              {dashboardData.systemStatus === 'operational' ? 'Operacional' : 'Con problemas'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* KPIs Principales */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.sectionTitle}
          >
            Métricas Principales
          </Animated.Text>
          <View style={styles.kpiGrid}>
            {renderKPICard(
              'Usuarios Activos',
              dashboardData.kpis.activeUsers.toString(),
              'En línea ahora',
              '#3b82f6',
              () => navigation.navigate('Users'),
              0
            )}
            {renderKPICard(
              'Ingresos Hoy',
              formatCurrency(dashboardData.kpis.todayRevenue),
              '+12% vs ayer',
              '#10b981',
              () => navigation.navigate('Sales'),
              1
            )}
            {renderKPICard(
              'Ocupación',
              `${dashboardData.kpis.occupancyRate}%`,
              'Capacidad actual',
              '#f59e0b',
              null,
              2
            )}
            {renderKPICard(
              'Sesiones Activas',
              dashboardData.kpis.totalSessions.toString(),
              `${dashboardData.kpis.averageSessionTime} min promedio`,
              '#2563eb',
              null,
              3
            )}
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.sectionTitle}
          >
            Acciones Rápidas
          </Animated.Text>
          <Animated.View 
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.quickActions}
          >
            <Button
              title="Agregar Saldo"
              variant="primary"
              size="medium"
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddBalance')}
            />
            <Button
              title="Ver Reportes"
              variant="outline"
              size="medium"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            />
            <Button
              title="Gestionar Usuarios"
              variant="secondary"
              size="medium"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Users')}
            />
          </Animated.View>
        </View>

        {/* Gráficos */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.sectionTitle}
          >
            Uso por Horas (Hoy)
          </Animated.Text>
          <Animated.View 
            entering={FadeInDown.delay(700).duration(600)}
            style={styles.chartCard}
          >
            <LineChart
              data={hourlyData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Animated.View>
        </View>

        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(800).duration(600)}
            style={styles.sectionTitle}
          >
            Ingresos Semanales
          </Animated.Text>
          <Animated.View 
            entering={FadeInDown.delay(900).duration(600)}
            style={styles.chartCard}
          >
            <BarChart
              data={revenueData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisSuffix="k"
              fromZero
            />
          </Animated.View>
        </View>

        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(1000).duration(600)}
            style={styles.sectionTitle}
          >
            Métodos de Pago
          </Animated.Text>
          <Animated.View 
            entering={FadeInDown.delay(1100).duration(600)}
            style={styles.chartCard}
          >
            <PieChart
              data={paymentData}
              width={screenWidth - 40}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Animated.View>
        </View>

        {/* Alertas y Notificaciones */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInUp.delay(1200).duration(600)}
            style={styles.sectionTitle}
          >
            Alertas Importantes
          </Animated.Text>
          {dashboardData.alerts.map((alert, index) => renderAlert(alert, index))}
        </View>

        {/* Resumen de Usuarios con Saldo Bajo */}
        {dashboardData.kpis.lowBalanceUsers > 0 && (
          <Animated.View 
            entering={FadeInDown.delay(1400).duration(600)}
            style={styles.section}
          >
            <TouchableOpacity style={styles.warningCard} activeOpacity={0.8}>
              <Text style={styles.warningTitle}>Atención Requerida</Text>
              <Text style={styles.warningText}>
                {dashboardData.kpis.lowBalanceUsers} usuarios tienen saldo bajo
              </Text>
              <Button
                title="Ver Usuarios"
                variant="outline"
                size="small"
                style={styles.warningButton}
                onPress={() => navigation.navigate('Users', { filter: 'low_balance' })}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Espacio inferior para scroll */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  gradientHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
    tintColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainerStyle: {
    marginTop: -20,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: 5,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  kpiCard: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  kpiTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionButton: {
    flex: 1,
    margin: 6,
    minWidth: 100,
  },
  chartCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  chart: {
    marginVertical: 12,
    borderRadius: 16,
  },
  alertCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  alertTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  alertAction: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: 20,
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  warningText: {
    fontSize: 16,
    color: '#b45309',
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  warningButton: {
    borderColor: '#f59e0b',
  },
  bottomSpace: {
    height: 40,
  },
});

export default AdminDashboardScreen;