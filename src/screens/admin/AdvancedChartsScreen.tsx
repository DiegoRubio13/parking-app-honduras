import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { theme } from '../../constants/theme';

interface AdvancedChartsScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const AdvancedChartsScreen: React.FC<AdvancedChartsScreenProps> = ({ navigation }) => {
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'usage' | 'locations' | 'trends'>('revenue');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const chartTypes = [
    { key: 'revenue', label: 'Ingresos', icon: 'cash-outline' },
    { key: 'usage', label: 'Uso', icon: 'car-outline' },
    { key: 'locations', label: 'Ubicaciones', icon: 'location-outline' },
    { key: 'trends', label: 'Tendencias', icon: 'trending-up-outline' },
  ];

  // Mock chart data - en una app real estos vendrían de una API
  const chartData = {
    revenue: {
      title: 'Ingresos por Mes',
      data: [
        { month: 'Ene', amount: 12000 },
        { month: 'Feb', amount: 15000 },
        { month: 'Mar', amount: 18000 },
        { month: 'Abr', amount: 16000 },
        { month: 'May', amount: 22000 },
        { month: 'Jun', amount: 25000 },
      ]
    },
    usage: {
      title: 'Sesiones por Día',
      data: [
        { day: 'Lun', sessions: 45 },
        { day: 'Mar', sessions: 52 },
        { day: 'Mié', sessions: 38 },
        { day: 'Jue', sessions: 47 },
        { day: 'Vie', sessions: 65 },
        { day: 'Sáb', sessions: 72 },
        { day: 'Dom', sessions: 58 },
      ]
    },
    locations: {
      title: 'Ocupación por Ubicación',
      data: [
        { name: 'Multiplaza', occupancy: 85, total: 150 },
        { name: 'Mall Cascadas', occupancy: 72, total: 120 },
        { name: 'City Mall', occupancy: 90, total: 180 },
        { name: 'Plaza Miraflores', occupancy: 65, total: 100 },
        { name: 'Metromall', occupancy: 78, total: 140 },
      ]
    },
    trends: {
      title: 'Tendencias Semanales',
      data: [
        { week: 'S1', growth: 5.2 },
        { week: 'S2', growth: 8.7 },
        { week: 'S3', growth: -2.1 },
        { week: 'S4', growth: 12.4 },
        { week: 'S5', growth: 15.8 },
        { week: 'S6', growth: 9.3 },
      ]
    }
  };

  const MockBarChart = ({ data, type }: { data: any[], type: string }) => {
    const maxValue = Math.max(...data.map(item =>
      type === 'revenue' ? item.amount :
      type === 'usage' ? item.sessions :
      type === 'locations' ? item.occupancy :
      Math.abs(item.growth)
    ));

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.map((item, index) => {
            const value = type === 'revenue' ? item.amount :
                         type === 'usage' ? item.sessions :
                         type === 'locations' ? item.occupancy :
                         Math.abs(item.growth);
            const height = (value / maxValue) * 120;
            const isNegative = type === 'trends' && item.growth < 0;

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: height,
                        backgroundColor: isNegative ? theme.colors.error :
                                       type === 'revenue' ? theme.colors.success :
                                       type === 'usage' ? theme.colors.primary :
                                       type === 'locations' ? '#f59e0b' :
                                       theme.colors.primary
                      }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>
                  {type === 'revenue' ? item.month :
                   type === 'usage' ? item.day :
                   type === 'locations' ? item.name.split(' ')[0] :
                   item.week}
                </Text>
                <Text style={styles.barValue}>
                  {type === 'revenue' ? `L${(value/1000).toFixed(0)}k` :
                   type === 'usage' ? value :
                   type === 'locations' ? `${value}%` :
                   `${item.growth > 0 ? '+' : ''}${item.growth}%`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const MockDonutChart = () => {
    return (
      <View style={styles.donutContainer}>
        <View style={styles.donutChart}>
          <View style={styles.donutCenter}>
            <Text style={styles.donutCenterText}>78%</Text>
            <Text style={styles.donutCenterLabel}>Promedio</Text>
          </View>
        </View>
        <View style={styles.donutLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.legendText}>Alta ocupación</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Media ocupación</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text style={styles.legendText}>Baja ocupación</Text>
          </View>
        </View>
      </View>
    );
  };

  const MockLineChart = () => {
    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.lineChart}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.gridLine, { top: i * 30 }]} />
          ))}

          {/* Mock line path */}
          <View style={styles.linePath} />

          {/* Data points */}
          {[20, 40, 15, 80, 95, 60].map((point, index) => (
            <View
              key={index}
              style={[
                styles.dataPoint,
                {
                  left: (index * 45) + 15,
                  top: 140 - point
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.lineChartLabels}>
          {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((month, index) => (
            <Text key={index} style={styles.lineChartLabel}>{month}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#7c2d12', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gráficos Avanzados</Text>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => Alert.alert('Exportar', 'Función para exportar gráficos')}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Chart Type Selector */}
        <View style={styles.chartSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {chartTypes.map((chart) => (
              <TouchableOpacity
                key={chart.key}
                style={[
                  styles.chartTypeButton,
                  selectedChart === chart.key && styles.chartTypeButtonActive
                ]}
                onPress={() => setSelectedChart(chart.key as any)}
              >
                <Ionicons
                  name={chart.icon as any}
                  size={20}
                  color={selectedChart === chart.key ? 'white' : theme.colors.primary}
                />
                <Text style={[
                  styles.chartTypeText,
                  selectedChart === chart.key && styles.chartTypeTextActive
                ]}>
                  {chart.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.chartsContainer} showsVerticalScrollIndicator={false}>
          {/* Main Chart */}
          <View style={styles.mainChartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {chartData[selectedChart].title}
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Filtros', 'Opciones de filtrado')}>
                <Ionicons name="filter-outline" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <MockBarChart data={chartData[selectedChart].data} type={selectedChart} />
          </View>

          {/* Secondary Charts */}
          {selectedChart === 'locations' && (
            <View style={styles.secondaryChartCard}>
              <Text style={styles.chartTitle}>Distribución de Ocupación</Text>
              <MockDonutChart />
            </View>
          )}

          {selectedChart === 'revenue' && (
            <View style={styles.secondaryChartCard}>
              <Text style={styles.chartTitle}>Tendencia de Ingresos</Text>
              <MockLineChart />
            </View>
          )}

          {/* Stats Summary */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Resumen Estadístico</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>847</Text>
                <Text style={styles.statLabel}>Total Sesiones</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>L 25,450</Text>
                <Text style={styles.statLabel}>Ingresos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>78%</Text>
                <Text style={styles.statLabel}>Ocupación Avg</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+15.2%</Text>
                <Text style={styles.statLabel}>Crecimiento</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Exportar Data', 'Exportar datos en CSV/Excel')}
            >
              <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Exportar Datos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Compartir', 'Compartir gráficos')}
            >
              <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Compartir</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
      </View>
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
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chartSelector: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    backgroundColor: theme.colors.card,
  },
  chartTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chartTypeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  chartTypeTextActive: {
    color: 'white',
  },
  chartsContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  mainChartCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  secondaryChartCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  chartContainer: {
    height: 180,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  barValue: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold as any,
    marginTop: 2,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: theme.colors.success,
    borderTopColor: '#f59e0b',
    borderRightColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    alignItems: 'center',
  },
  donutCenterText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  donutCenterLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  donutLegend: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  legendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  lineChartContainer: {
    height: 180,
  },
  lineChart: {
    height: 150,
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  linePath: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  lineChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  lineChartLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  statsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  statsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
});

export default AdvancedChartsScreen;