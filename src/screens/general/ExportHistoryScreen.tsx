import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Navigation prop types
interface ExportHistoryScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  format: string;
  color: string;
}

interface DateRange {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface ExportStats {
  totalSessions: number;
  totalCost: number;
  totalHours: number;
  averageSessionTime: number;
  mostUsedLocation: string;
  totalLocations: number;
}

export const ExportHistoryScreen: React.FC<ExportHistoryScreenProps> = ({ navigation }) => {
  const [selectedRange, setSelectedRange] = useState<string>('last-month');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeLocations, setIncludeLocations] = useState(true);
  const [includeCosts, setIncludeCosts] = useState(true);

  const dateRanges: DateRange[] = [
    {
      id: 'last-week',
      label: 'Última Semana',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    {
      id: 'last-month',
      label: 'Último Mes',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    {
      id: 'last-3-months',
      label: 'Últimos 3 Meses',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    {
      id: 'last-year',
      label: 'Último Año',
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    {
      id: 'all-time',
      label: 'Todo el Tiempo',
      startDate: new Date('2023-01-01'),
      endDate: new Date(),
    },
  ];

  const exportOptions: ExportOption[] = [
    {
      id: 'pdf',
      title: 'PDF',
      description: 'Documento portátil con formato profesional',
      icon: 'document-text',
      format: 'PDF',
      color: theme.colors.blue[600],
    },
    {
      id: 'csv',
      title: 'CSV',
      description: 'Para análisis en Excel o Google Sheets',
      icon: 'grid',
      format: 'CSV',
      color: theme.colors.blue[500],
    },
    {
      id: 'json',
      title: 'JSON',
      description: 'Datos estructurados para desarrolladores',
      icon: 'code-slash',
      format: 'JSON',
      color: theme.colors.blue[400],
    },
  ];

  // Mock statistics - in real app this would come from API
  const exportStats: ExportStats = {
    totalSessions: 47,
    totalCost: 1850.75,
    totalHours: 94.5,
    averageSessionTime: 2.01,
    mostUsedLocation: 'Centro Comercial Multiplaza',
    totalLocations: 8,
  };

  const getCurrentRange = () => {
    return dateRanges.find(range => range.id === selectedRange);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generateExportData = () => {
    // Mock data generation - in real app this would call API
    const currentRange = getCurrentRange();
    
    if (selectedFormat === 'pdf') {
      return {
        filename: `ParKing_Historial_${selectedRange}_${Date.now()}.pdf`,
        content: 'PDF content would be generated here',
        mimeType: 'application/pdf',
      };
    } else if (selectedFormat === 'csv') {
      const csvContent = `Fecha,Ubicación,Hora Entrada,Hora Salida,Duración,Costo
2023-10-15,Centro Comercial Multiplaza,09:30,11:45,2h 15min,L 67.50
2023-10-14,Hospital Viera,14:20,16:00,1h 40min,L 50.00
2023-10-13,Universidad Nacional,08:00,12:30,4h 30min,L 90.00`;
      
      return {
        filename: `ParKing_Historial_${selectedRange}_${Date.now()}.csv`,
        content: csvContent,
        mimeType: 'text/csv',
      };
    } else {
      const jsonContent = JSON.stringify({
        dateRange: {
          start: currentRange?.startDate.toISOString(),
          end: currentRange?.endDate.toISOString(),
        },
        statistics: includeStats ? exportStats : undefined,
        sessions: [
          {
            id: '1',
            date: '2023-10-15',
            location: 'Centro Comercial Multiplaza',
            entryTime: '09:30',
            exitTime: '11:45',
            duration: '2h 15min',
            cost: 67.50,
          },
          // More mock sessions...
        ],
      }, null, 2);
      
      return {
        filename: `ParKing_Historial_${selectedRange}_${Date.now()}.json`,
        content: jsonContent,
        mimeType: 'application/json',
      };
    }
  };

  const handleExport = async () => {
    if (!selectedRange || !selectedFormat) {
      Alert.alert('Error', 'Por favor selecciona un período y formato');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = generateExportData();
      
      // Create temporary file
      const fileUri = FileSystem.documentDirectory + exportData.filename;
      await FileSystem.writeAsStringAsync(fileUri, exportData.content);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: exportData.mimeType,
          dialogTitle: 'Exportar Historial de Estacionamiento',
        });
      } else {
        // Fallback to Share API
        await Share.share({
          message: `Historial de ParKing (${selectedRange})\n\n${exportData.content}`,
          title: 'Historial de Estacionamiento',
        });
      }

      Alert.alert(
        'Exportación Exitosa',
        `Tu historial ha sido exportado como ${selectedFormat.toUpperCase()}. ¡Ya puedes compartirlo o guardarlo!`
      );
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'No se pudo exportar el historial. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    const currentRange = getCurrentRange();
    const stats = exportStats;
    
    Alert.alert(
      'Vista Previa del Reporte',
      `Período: ${currentRange?.label}\n` +
      `Sesiones: ${stats.totalSessions}\n` +
      `Costo Total: L ${stats.totalCost.toFixed(2)}\n` +
      `Tiempo Total: ${stats.totalHours} horas\n` +
      `Ubicación más usada: ${stats.mostUsedLocation}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Exportar', onPress: handleExport },
      ]
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[50], theme.colors.background]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exportar Historial</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Statistics Summary */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[theme.colors.blue[500], theme.colors.blue[600]]}
              style={styles.summaryGradient}
            >
              <Text style={styles.summaryTitle}>Resumen de Actividad</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{exportStats.totalSessions}</Text>
                  <Text style={styles.statLabel}>Sesiones</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>L {exportStats.totalCost.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Gastado</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{exportStats.totalHours}h</Text>
                  <Text style={styles.statLabel}>Tiempo</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{exportStats.totalLocations}</Text>
                  <Text style={styles.statLabel}>Ubicaciones</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Date Range Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Período de Exportación</Text>
            <View style={styles.rangeOptions}>
              {dateRanges.map((range) => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.rangeOption,
                    selectedRange === range.id && styles.selectedRangeOption
                  ]}
                  onPress={() => setSelectedRange(range.id)}
                >
                  <Text style={[
                    styles.rangeOptionText,
                    selectedRange === range.id && styles.selectedRangeOptionText
                  ]}>
                    {range.label}
                  </Text>
                  <Text style={[
                    styles.rangeOptionDate,
                    selectedRange === range.id && styles.selectedRangeOptionDate
                  ]}>
                    {formatDate(range.startDate)} - {formatDate(range.endDate)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Format Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Formato de Exportación</Text>
            <View style={styles.formatOptions}>
              {exportOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.formatOption,
                    selectedFormat === option.id && styles.selectedFormatOption
                  ]}
                  onPress={() => setSelectedFormat(option.id)}
                >
                  <View style={[styles.formatIcon, { backgroundColor: `${option.color}20` }]}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>
                  <View style={styles.formatContent}>
                    <Text style={styles.formatTitle}>{option.title}</Text>
                    <Text style={styles.formatDescription}>{option.description}</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedFormat === option.id && styles.selectedRadioButton
                  ]}>
                    {selectedFormat === option.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Export Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opciones de Exportación</Text>
            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={styles.optionToggle}
                onPress={() => setIncludeStats(!includeStats)}
              >
                <View style={styles.optionContent}>
                  <Ionicons name="analytics" size={20} color={theme.colors.blue[600]} />
                  <Text style={styles.optionText}>Incluir Estadísticas</Text>
                </View>
                <View style={[styles.toggle, includeStats && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, includeStats && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionToggle}
                onPress={() => setIncludeLocations(!includeLocations)}
              >
                <View style={styles.optionContent}>
                  <Ionicons name="location" size={20} color={theme.colors.blue[600]} />
                  <Text style={styles.optionText}>Incluir Ubicaciones Detalladas</Text>
                </View>
                <View style={[styles.toggle, includeLocations && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, includeLocations && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionToggle}
                onPress={() => setIncludeCosts(!includeCosts)}
              >
                <View style={styles.optionContent}>
                  <Ionicons name="cash" size={20} color={theme.colors.blue[600]} />
                  <Text style={styles.optionText}>Incluir Detalles de Costos</Text>
                </View>
                <View style={[styles.toggle, includeCosts && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, includeCosts && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="VISTA PREVIA"
              onPress={handlePreview}
              variant="outline"
              style={styles.previewButton}
            />
            
            <Button
              title="EXPORTAR HISTORIAL"
              onPress={handleExport}
              loading={isExporting}
              style={styles.exportButton}
            />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={theme.colors.blue[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Información importante</Text>
              <Text style={styles.infoText}>
                Los archivos exportados incluyen todos los datos de estacionamiento del período seleccionado. 
                Puedes usar estos reportes para control personal, declaraciones de gastos o análisis de patrones de uso.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.xl,
  },
  summaryGradient: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  summaryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  rangeOptions: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  rangeOption: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[50],
  },
  selectedRangeOption: {
    backgroundColor: theme.colors.blue[50],
  },
  rangeOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  selectedRangeOptionText: {
    color: theme.colors.blue[700],
  },
  rangeOptionDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  selectedRangeOptionDate: {
    color: theme.colors.blue[600],
  },
  formatOptions: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[50],
  },
  selectedFormatOption: {
    backgroundColor: theme.colors.blue[50],
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  formatContent: {
    flex: 1,
  },
  formatTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  formatDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: theme.colors.blue[600],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.blue[600],
  },
  exportOptions: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  optionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[50],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.blue[600],
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  previewButton: {
    flex: 1,
  },
  exportButton: {
    flex: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.blue[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default ExportHistoryScreen;