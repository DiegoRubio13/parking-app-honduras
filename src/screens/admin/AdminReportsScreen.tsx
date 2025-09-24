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
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface AdminReportsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Report filter types
type ReportFilter = 'today' | 'week' | 'month' | 'custom';

// Financial report interface
interface FinancialReport {
  totalRevenue: number;
  totalTransactions: number;
  averagePerSession: number;
  growthRate: number;
}

// Usage report interface
interface UsageReport {
  totalSessions: number;
  averageDuration: number;
  peakHours: string;
  maxOccupancy: number;
}

// User activity report interface
interface UserActivityReport {
  uniqueUsers: number;
  newRegistrations: number;
  frequentUsers: number;
  retentionRate: number;
}

export const AdminReportsScreen: React.FC<AdminReportsScreenProps> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('today');
  const [refreshing, setRefreshing] = useState(false);

  const [financialReport, setFinancialReport] = useState<FinancialReport>({
    totalRevenue: 12450,
    totalTransactions: 247,
    averagePerSession: 50.40,
    growthRate: 15.6,
  });

  const [usageReport, setUsageReport] = useState<UsageReport>({
    totalSessions: 847,
    averageDuration: 32,
    peakHours: '14:00-16:00',
    maxOccupancy: 89,
  });

  const [userActivityReport, setUserActivityReport] = useState<UserActivityReport>({
    uniqueUsers: 234,
    newRegistrations: 12,
    frequentUsers: 89,
    retentionRate: 78,
  });

  const filterOptions: { key: ReportFilter; label: string }[] = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'custom', label: 'Personalizado' },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Update data based on active filter
      setFinancialReport(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 500),
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 10),
      }));
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleFilterChange = (filter: ReportFilter) => {
    setActiveFilter(filter);
    // Here you would typically fetch new data based on the filter
    if (filter === 'custom') {
      Alert.alert('Filtro Personalizado', 'Función para seleccionar rango de fechas');
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    Alert.alert(
      `Exportar ${format.toUpperCase()}`,
      `¿Exportar reportes en formato ${format.toUpperCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: () => {
            Alert.alert('Éxito', `Reporte exportado en formato ${format.toUpperCase()}`);
          }
        },
      ]
    );
  };

  const handleAdvancedCharts = () => {
    navigation.navigate('AdvancedCharts');
  };

  const FilterButton = ({ filter, label }: { filter: ReportFilter; label: string }) => (
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
    growth 
  }: {
    label: string;
    value: string | number;
    growth?: string;
  }) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {growth && <Text style={styles.statGrowth}>{growth}</Text>}
    </View>
  );

  const ReportCard = ({ 
    title, 
    icon, 
    children, 
    cardStyle 
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    children: React.ReactNode;
    cardStyle?: any;
  }) => (
    <View style={[styles.reportCard, cardStyle]}>
      <View style={[styles.reportCardHeader, cardStyle]} />
      <View style={styles.cardTitle}>
        <Ionicons name={icon} size={20} color={cardStyle?.titleColor || theme.colors.text.primary} />
        <Text style={[styles.cardTitleText, { color: cardStyle?.titleColor || theme.colors.text.primary }]}>
          {title}
        </Text>
      </View>
      <View style={styles.statsGrid}>
        {children}
      </View>
    </View>
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
                <Text style={styles.backBtnText}>Reportes</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="bar-chart-outline" size={24} color="white" />
                <Text style={styles.titleText}>Reportes Detallados</Text>
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
          {/* Filter Section */}
          <View style={styles.filterSection}>
            <View style={styles.filterLabel}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.primary} />
              <Text style={styles.filterLabelText}>Filtros:</Text>
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

          {/* Financial Report Card */}
          <ReportCard
            title="Resumen Financiero"
            icon="card-outline"
            cardStyle={{
              titleColor: theme.colors.success,
              backgroundColor: `linear-gradient(135deg, ${theme.colors.success} 0%, #10b981 100%)`,
            }}
          >
            <StatItem 
              label="Ingresos totales" 
              value={`L ${financialReport.totalRevenue.toLocaleString()}`} 
            />
            <StatItem 
              label="Transacciones" 
              value={financialReport.totalTransactions} 
            />
            <StatItem 
              label="Promedio/sesión" 
              value={`L ${financialReport.averagePerSession}`} 
            />
            <StatItem 
              label="Crecimiento" 
              value={`+${financialReport.growthRate}%`}
              growth="vs semana" 
            />
          </ReportCard>

          {/* Usage Report Card */}
          <ReportCard
            title="Estadísticas de Uso"
            icon="car-outline"
            cardStyle={{
              titleColor: theme.colors.primary,
            }}
          >
            <StatItem 
              label="Total sesiones" 
              value={usageReport.totalSessions} 
            />
            <StatItem 
              label="Duración promedio" 
              value={`${usageReport.averageDuration} min`} 
            />
            <StatItem 
              label="Pico de uso" 
              value={usageReport.peakHours} 
            />
            <StatItem 
              label="Ocupación máxima" 
              value={`${usageReport.maxOccupancy}%`} 
            />
          </ReportCard>

          {/* User Activity Report Card */}
          <ReportCard
            title="Usuarios Activos"
            icon="people-outline"
            cardStyle={{
              titleColor: theme.colors.warning,
            }}
          >
            <StatItem 
              label="Usuarios únicos" 
              value={userActivityReport.uniqueUsers} 
            />
            <StatItem 
              label="Nuevos registros" 
              value={userActivityReport.newRegistrations} 
            />
            <StatItem 
              label="Usuarios frecuentes" 
              value={userActivityReport.frequentUsers} 
            />
            <StatItem 
              label="Tasa retención" 
              value={`${userActivityReport.retentionRate}%`} 
            />
          </ReportCard>

          {/* Export Section */}
          <View style={styles.exportSection}>
            <View style={styles.exportButtons}>
              <TouchableOpacity 
                style={[styles.exportBtn, styles.btnExcel]}
                onPress={() => handleExport('excel')}
              >
                <Ionicons name="document-text-outline" size={16} color={theme.colors.success} />
                <Text style={styles.exportBtnText}>Exportar Excel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.exportBtn, styles.btnPdf]}
                onPress={() => handleExport('pdf')}
              >
                <Ionicons name="document-outline" size={16} color={theme.colors.error} />
                <Text style={styles.exportBtnText}>Exportar PDF</Text>
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
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  statGrowth: {
    fontSize: 12,
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
  },
  btnExcel: {
    backgroundColor: '#d1fae5',
  },
  btnPdf: {
    backgroundColor: '#fee2e2',
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  advancedChartsBtn: {
    marginBottom: 30,
  },
});

export default AdminReportsScreen;