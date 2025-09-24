import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import {
  generateReport,
  generateCSVExport,
  generatePDFExportData,
  getDashboardStats,
  getRealtimeOccupancy,
  ReportData,
  DashboardStats,
  RealtimeOccupancy,
} from '../../services/adminService';

interface ReportsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

type ReportPeriod = 'today' | 'week' | 'month' | 'custom';

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<ReportPeriod>('today');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [occupancyData, setOccupancyData] = useState<RealtimeOccupancy[]>([]);

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  useEffect(() => {
    // Set up real-time occupancy updates
    const interval = setInterval(loadOccupancyData, 30000); // Update every 30 seconds
    loadOccupancyData();

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, report] = await Promise.all([
        getDashboardStats(),
        generateReport(activeFilter)
      ]);
      setDashboardStats(stats);
      setReportData(report);
    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  const loadOccupancyData = async () => {
    try {
      const data = await getRealtimeOccupancy();
      setOccupancyData(data);
    } catch (error) {
      console.error('Error loading occupancy data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [activeFilter]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFilterChange = (filter: ReportPeriod) => {
    setActiveFilter(filter);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);

      if (format === 'csv') {
        const csvData = await generateCSVExport({
          format: 'csv',
          dataType: 'report',
          filters: {
            startDate: reportData?.startDate,
            endDate: reportData?.endDate,
          }
        });

        // In a real app, you would save this to a file
        // For now, we'll show a preview in a share dialog
        await Share.share({
          message: csvData,
          title: 'Reporte ParKing - CSV'
        });

        Alert.alert('Éxito', 'Reporte CSV generado correctamente');
      } else {
        const pdfData = await generatePDFExportData({
          format: 'pdf',
          dataType: 'report',
          filters: {
            startDate: reportData?.startDate,
            endDate: reportData?.endDate,
          }
        });

        // In a real app, you would generate a PDF file
        // For now, we'll show the data structure
        Alert.alert(
          'Reporte PDF',
          `Título: ${pdfData.title}\nPeríodo: ${pdfData.period}\nGenerado: ${new Date(pdfData.generatedAt).toLocaleString()}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'No se pudo exportar el reporte');
    } finally {
      setExporting(false);
    }
  };

  const handleAdvancedCharts = () => {
    navigation.navigate('AdvancedCharts');
  };

  const filterOptions: { key: ReportPeriod; label: string }[] = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
  ];

  const FilterButton = ({ filter, label }: { filter: ReportPeriod; label: string }) => (
    <TouchableOpacity
      style={[styles.filterBtn, activeFilter === filter && styles.filterBtnActive]}
      onPress={() => handleFilterChange(filter)}
    >
      <Text style={[
        styles.filterBtnText,
        activeFilter === filter && styles.filterBtnTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatItem = ({
    label,
    value,
    growth,
    icon,
    color
  }: {
    label: string;
    value: string | number;
    growth?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    color?: string;
  }) => (
    <View style={styles.statItem}>
      {icon && (
        <Ionicons name={icon} size={20} color={color || theme.colors.primary} />
      )}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      {growth && <Text style={styles.statGrowth}>{growth}</Text>}
    </View>
  );

  const ReportCard = ({
    title,
    icon,
    children,
    accentColor,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    children: React.ReactNode;
    accentColor?: string;
  }) => (
    <View style={styles.reportCard}>
      <View style={[
        styles.reportCardHeader,
        accentColor && { backgroundColor: accentColor }
      ]} />
      <View style={styles.cardTitle}>
        <Ionicons name={icon} size={20} color={accentColor || theme.colors.primary} />
        <Text style={styles.cardTitleText}>{title}</Text>
      </View>
      <View style={styles.statsGrid}>
        {children}
      </View>
    </View>
  );

  const OccupancyCard = ({ data }: { data: RealtimeOccupancy }) => {
    const occupancyColor = data.occupancyRate > 80 ? theme.colors.error :
                          data.occupancyRate > 50 ? theme.colors.warning :
                          theme.colors.success;

    return (
      <View style={styles.occupancyCard}>
        <View style={styles.occupancyHeader}>
          <Text style={styles.occupancyLocationName}>{data.locationName}</Text>
          <View style={[styles.occupancyBadge, { backgroundColor: `${occupancyColor}20` }]}>
            <Text style={[styles.occupancyRate, { color: occupancyColor }]}>
              {data.occupancyRate.toFixed(0)}%
            </Text>
          </View>
        </View>
        <View style={styles.occupancyDetails}>
          <View style={styles.occupancyDetailItem}>
            <Ionicons name="car-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.occupancyDetailText}>
              {data.occupiedSpots}/{data.totalSpots} ocupados
            </Text>
          </View>
          <View style={styles.occupancyDetailItem}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.success} />
            <Text style={styles.occupancyDetailText}>
              L {data.revenue.toFixed(2)} hoy
            </Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${data.occupancyRate}%`,
                backgroundColor: occupancyColor
              }
            ]}
          />
        </View>
      </View>
    );
  };

  if (loading && !dashboardStats) {
    return (
      <PhoneContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      </PhoneContainer>
    );
  }

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
                <Text style={styles.backBtnText}>Volver</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="bar-chart-outline" size={24} color="white" />
                <Text style={styles.titleText}>Reportes & Dashboard</Text>
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
          {/* Real-time Dashboard Stats */}
          {dashboardStats && (
            <View style={styles.dashboardSection}>
              <Text style={styles.sectionTitle}>Dashboard en Tiempo Real</Text>
              <View style={styles.dashboardGrid}>
                <View style={[styles.dashboardCard, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="cash-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.dashboardValue}>
                    L {dashboardStats.totalRevenue.toLocaleString()}
                  </Text>
                  <Text style={styles.dashboardLabel}>Ingresos Hoy</Text>
                  {dashboardStats.revenueGrowth !== 0 && (
                    <Text style={[
                      styles.dashboardGrowth,
                      { color: dashboardStats.revenueGrowth > 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {dashboardStats.revenueGrowth > 0 ? '+' : ''}{dashboardStats.revenueGrowth.toFixed(1)}%
                    </Text>
                  )}
                </View>

                <View style={[styles.dashboardCard, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="car-sport-outline" size={24} color={theme.colors.success} />
                  <Text style={styles.dashboardValue}>{dashboardStats.totalSessions}</Text>
                  <Text style={styles.dashboardLabel}>Sesiones</Text>
                  {dashboardStats.sessionsGrowth !== 0 && (
                    <Text style={[
                      styles.dashboardGrowth,
                      { color: dashboardStats.sessionsGrowth > 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {dashboardStats.sessionsGrowth > 0 ? '+' : ''}{dashboardStats.sessionsGrowth.toFixed(1)}%
                    </Text>
                  )}
                </View>

                <View style={[styles.dashboardCard, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="people-outline" size={24} color={theme.colors.warning} />
                  <Text style={styles.dashboardValue}>{dashboardStats.activeUsers}</Text>
                  <Text style={styles.dashboardLabel}>Usuarios Activos</Text>
                </View>

                <View style={[styles.dashboardCard, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="speedometer-outline" size={24} color={theme.colors.error} />
                  <Text style={styles.dashboardValue}>
                    {dashboardStats.occupancyRate.toFixed(1)}%
                  </Text>
                  <Text style={styles.dashboardLabel}>Ocupación</Text>
                </View>
              </View>
            </View>
          )}

          {/* Real-time Occupancy */}
          {occupancyData.length > 0 && (
            <View style={styles.occupancySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ocupación en Tiempo Real</Text>
                <TouchableOpacity onPress={loadOccupancyData}>
                  <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              {occupancyData.map(data => (
                <OccupancyCard key={data.locationId} data={data} />
              ))}
            </View>
          )}

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <View style={styles.filterLabel}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.primary} />
              <Text style={styles.filterLabelText}>Período del Reporte:</Text>
            </View>
            <View style={styles.filterButtons}>
              {filterOptions.map((option) => (
                <FilterButton
                  key={option.key}
                  filter={option.key}
                  label={option.label}
                />
              ))}
            </View>
          </View>

          {/* Report Data */}
          {reportData && (
            <>
              {/* Financial Report Card */}
              <ReportCard
                title="Resumen Financiero"
                icon="card-outline"
                accentColor={theme.colors.success}
              >
                <StatItem
                  label="Ingresos totales"
                  value={`L ${reportData.financial.totalRevenue.toLocaleString()}`}
                  icon="cash-outline"
                  color={theme.colors.success}
                />
                <StatItem
                  label="Transacciones"
                  value={reportData.financial.totalTransactions}
                  icon="swap-horizontal-outline"
                />
                <StatItem
                  label="Promedio/sesión"
                  value={`L ${reportData.financial.averagePerSession.toFixed(2)}`}
                  icon="calculator-outline"
                />
                <StatItem
                  label="Crecimiento"
                  value={`${reportData.financial.growthRate > 0 ? '+' : ''}${reportData.financial.growthRate.toFixed(1)}%`}
                  growth="vs período anterior"
                  icon="trending-up-outline"
                  color={reportData.financial.growthRate > 0 ? theme.colors.success : theme.colors.error}
                />
              </ReportCard>

              {/* Usage Report Card */}
              <ReportCard
                title="Estadísticas de Uso"
                icon="car-outline"
                accentColor={theme.colors.primary}
              >
                <StatItem
                  label="Total sesiones"
                  value={reportData.usage.totalSessions}
                  icon="list-outline"
                />
                <StatItem
                  label="Duración promedio"
                  value={`${reportData.usage.averageDuration.toFixed(0)} min`}
                  icon="time-outline"
                />
                <StatItem
                  label="Pico de uso"
                  value={reportData.usage.peakHours.length > 0
                    ? `${reportData.usage.peakHours[0].hour}:00`
                    : 'N/A'}
                  icon="pulse-outline"
                />
                <StatItem
                  label="Ocupación máxima"
                  value={`${reportData.usage.maxOccupancy.toFixed(0)}%`}
                  icon="speedometer-outline"
                  color={reportData.usage.maxOccupancy > 80 ? theme.colors.error : theme.colors.primary}
                />
              </ReportCard>

              {/* User Activity Report Card */}
              <ReportCard
                title="Usuarios Activos"
                icon="people-outline"
                accentColor={theme.colors.warning}
              >
                <StatItem
                  label="Usuarios únicos"
                  value={reportData.users.uniqueUsers}
                  icon="person-outline"
                />
                <StatItem
                  label="Nuevos registros"
                  value={reportData.users.newRegistrations}
                  icon="person-add-outline"
                  color={theme.colors.success}
                />
                <StatItem
                  label="Usuarios frecuentes"
                  value={reportData.users.frequentUsers}
                  icon="star-outline"
                />
                <StatItem
                  label="Tasa retención"
                  value={`${reportData.users.retentionRate.toFixed(1)}%`}
                  icon="trophy-outline"
                  color={theme.colors.warning}
                />
              </ReportCard>
            </>
          )}

          {/* Export Section */}
          <View style={styles.exportSection}>
            <Text style={styles.sectionTitle}>Exportar Datos</Text>
            <View style={styles.exportButtons}>
              <TouchableOpacity
                style={[styles.exportBtn, styles.btnExcel]}
                onPress={() => handleExport('csv')}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color={theme.colors.success} />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={16} color={theme.colors.success} />
                    <Text style={styles.exportBtnText}>Exportar CSV</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exportBtn, styles.btnPdf]}
                onPress={() => handleExport('pdf')}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color={theme.colors.error} />
                ) : (
                  <>
                    <Ionicons name="document-outline" size={16} color={theme.colors.error} />
                    <Text style={styles.exportBtnText}>Exportar PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Advanced Charts Button */}
          <Button
            title="Ver gráficos avanzados"
            onPress={handleAdvancedCharts}
            variant="primary"
            size="lg"
            style={styles.advancedChartsBtn}
          />

          <View style={{ height: 30 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  dashboardSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dashboardCard: {
    width: '48%',
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.md,
  },
  dashboardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginTop: 8,
  },
  dashboardLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  dashboardGrowth: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  occupancySection: {
    marginBottom: 24,
  },
  occupancyCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  occupancyLocationName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  occupancyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  occupancyRate: {
    fontSize: 14,
    fontWeight: '700',
  },
  occupancyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  occupancyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  occupancyDetailText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.blue[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: 12,
    backgroundColor: theme.colors.card,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  filterBtnTextActive: {
    color: 'white',
  },
  reportCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  reportCardHeader: {
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
    marginBottom: 16,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  statGrowth: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  exportSection: {
    marginBottom: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  btnExcel: {
    backgroundColor: '#d1fae5',
    borderColor: theme.colors.success,
  },
  btnPdf: {
    backgroundColor: '#fee2e2',
    borderColor: theme.colors.error,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  advancedChartsBtn: {
    marginBottom: 20,
  },
});

export default ReportsScreen;