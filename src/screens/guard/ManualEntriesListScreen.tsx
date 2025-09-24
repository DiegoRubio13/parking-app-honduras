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

interface ManualEntriesListScreenProps {
  navigation: any;
}

interface ManualEntry {
  entryId: string;
  licensePlate: string;
  name: string;
  idNumber: string;
  phone: string;
  vehicleModel: string;
  notes: string;
  entryTime: Date;
  guardId: string;
  isActive: boolean;
  exitTime?: Date;
  totalAmount?: number;
  totalMinutes?: number;
}

export const ManualEntriesListScreen: React.FC<ManualEntriesListScreenProps> = ({ navigation }) => {
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    {
      entryId: 'manual-1634567890',
      licensePlate: 'ABC-1234',
      name: 'Juan Carlos Pérez',
      idNumber: '0801-1990-12345',
      phone: '+504 9999-9999',
      vehicleModel: 'Toyota Corolla 2020',
      notes: 'Cliente sin celular',
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      guardId: 'guard-123',
      isActive: true,
    },
    {
      entryId: 'manual-1634567891',
      licensePlate: 'XYZ-5678',
      name: 'María López García',
      idNumber: '0801-1985-67890',
      phone: '+504 8888-8888',
      vehicleModel: 'Honda Civic 2019',
      notes: 'No sabe usar aplicaciones',
      entryTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      guardId: 'guard-123',
      isActive: true,
    },
    {
      entryId: 'manual-1634567892',
      licensePlate: 'DEF-9012',
      name: 'Carlos Ruiz Martín',
      idNumber: '0801-1992-34567',
      phone: '',
      vehicleModel: 'Nissan Sentra 2021',
      notes: 'Vehículo con rayón en puerta derecha',
      entryTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      guardId: 'guard-123',
      isActive: false,
      exitTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
      totalMinutes: 120,
      totalAmount: 60,
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddNew = () => {
    navigation.navigate('ManualEntry');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const calculateElapsedTime = (entryTime: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - entryTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const calculateAmount = (entryTime: Date): number => {
    const now = new Date();
    const diffMs = now.getTime() - entryTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Rate: L 0.50 per minute (L 30 per hour)
    return Math.ceil(diffMinutes * 0.5);
  };

  const handleCheckout = (entry: ManualEntry) => {
    const elapsedMinutes = Math.floor((new Date().getTime() - entry.entryTime.getTime()) / (1000 * 60));
    const amount = calculateAmount(entry.entryTime);

    Alert.alert(
      'Confirmar Salida',
      `Vehículo: ${entry.licensePlate}\nConductor: ${entry.name}\n\nTiempo transcurrido: ${calculateElapsedTime(entry.entryTime)}\nMonto a cobrar: L ${amount}\n\n¿Confirmar salida y cobro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Salida',
          style: 'default',
          onPress: () => {
            // Update entry as checked out
            setManualEntries(prev => prev.map(e =>
              e.entryId === entry.entryId
                ? {
                    ...e,
                    isActive: false,
                    exitTime: new Date(),
                    totalMinutes: elapsedMinutes,
                    totalAmount: amount
                  }
                : e
            ));

            Alert.alert(
              'Salida Registrada',
              `Cobro exitoso: L ${amount}\n\nEl vehículo ${entry.licensePlate} ha salido del estacionamiento.`,
              [{ text: 'OK' }]
            );
          }
        },
      ]
    );
  };

  const handleViewDetails = (entry: ManualEntry) => {
    const details = `
Información del Vehículo:
• Placas: ${entry.licensePlate}
• Modelo: ${entry.vehicleModel || 'No especificado'}

Información del Conductor:
• Nombre: ${entry.name}
• Identidad: ${entry.idNumber}
• Teléfono: ${entry.phone || 'No especificado'}

Detalles de Entrada:
• Hora de entrada: ${entry.entryTime.toLocaleString()}
• Guardia: ${entry.guardId}
• Notas: ${entry.notes || 'Sin observaciones'}

${entry.isActive ?
  `Estado: ACTIVO\n• Tiempo transcurrido: ${calculateElapsedTime(entry.entryTime)}\n• Monto actual: L ${calculateAmount(entry.entryTime)}` :
  `Estado: COMPLETADO\n• Hora de salida: ${entry.exitTime?.toLocaleString()}\n• Tiempo total: ${entry.totalMinutes} min\n• Monto cobrado: L ${entry.totalAmount}`
}`;

    Alert.alert('Detalles de Entrada Manual', details, [{ text: 'Cerrar' }]);
  };

  const activeEntries = manualEntries.filter(entry => entry.isActive);
  const completedEntries = manualEntries.filter(entry => !entry.isActive);

  const ManualEntryCard = ({ entry }: { entry: ManualEntry }) => {
    const elapsedTime = calculateElapsedTime(entry.entryTime);
    const currentAmount = entry.isActive ? calculateAmount(entry.entryTime) : entry.totalAmount;

    return (
      <View style={[styles.entryCard, !entry.isActive && styles.entryCardCompleted]}>
        <View style={[styles.entryCardHeader, { backgroundColor: entry.isActive ? theme.colors.success : theme.colors.text.muted }]} />

        <View style={styles.entryHeader}>
          <View style={styles.entryMain}>
            <Text style={styles.licensePlate}>{entry.licensePlate}</Text>
            <Text style={styles.driverName}>{entry.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: entry.isActive ? '#d1fae5' : '#f3f4f6' }]}>
            <Text style={[styles.statusText, { color: entry.isActive ? theme.colors.success : theme.colors.text.muted }]}>
              {entry.isActive ? 'ACTIVO' : 'COMPLETADO'}
            </Text>
          </View>
        </View>

        <View style={styles.entryDetails}>
          <View style={styles.timeInfo}>
            <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.timeText}>
              {entry.isActive ? `${elapsedTime} transcurrido` : `Completado - ${entry.totalMinutes} min`}
            </Text>
          </View>
          <View style={styles.amountInfo}>
            <Ionicons name="cash-outline" size={16} color={entry.isActive ? theme.colors.success : theme.colors.text.secondary} />
            <Text style={[styles.amountText, { color: entry.isActive ? theme.colors.success : theme.colors.text.secondary }]}>
              L {currentAmount}
            </Text>
          </View>
        </View>

        <View style={styles.entryActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => handleViewDetails(entry)}
          >
            <Text style={styles.actionBtnText}>Ver</Text>
          </TouchableOpacity>

          {entry.isActive && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.checkoutBtn]}
              onPress={() => handleCheckout(entry)}
            >
              <Text style={styles.checkoutBtnText}>Salida</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#065f46', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Entradas Manuales</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Vehículos registrados manualmente</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{activeEntries.length}</Text>
            <Text style={styles.summaryLabel}>Activos</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedEntries.length}</Text>
            <Text style={styles.summaryLabel}>Completados</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              L {activeEntries.reduce((total, entry) => total + calculateAmount(entry.entryTime), 0)}
            </Text>
            <Text style={styles.summaryLabel}>Por Cobrar</Text>
          </View>
        </View>

        {/* Active Entries */}
        {activeEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehículos Activos ({activeEntries.length})</Text>
            {activeEntries.map((entry) => (
              <ManualEntryCard key={entry.entryId} entry={entry} />
            ))}
          </View>
        )}

        {/* Completed Entries */}
        {completedEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial Completado ({completedEntries.length})</Text>
            {completedEntries.map((entry) => (
              <ManualEntryCard key={entry.entryId} entry={entry} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {manualEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color={theme.colors.text.muted} />
            <Text style={styles.emptyTitle}>No hay entradas manuales</Text>
            <Text style={styles.emptySubtitle}>
              Las entradas manuales aparecerán aquí cuando registres vehículos sin aplicación
            </Text>
            <Button
              title="Registrar Primera Entrada"
              onPress={handleAddNew}
              variant="primary"
              size="md"
              style={styles.emptyButton}
            />
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
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
    marginBottom: theme.spacing.sm,
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
  addButton: {
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
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  entryCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    position: 'relative',
  },
  entryCardCompleted: {
    opacity: 0.8,
  },
  entryCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  entryMain: {
    flex: 1,
  },
  licensePlate: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  driverName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  amountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
  },
  entryActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: theme.colors.blue[100],
  },
  checkoutBtn: {
    backgroundColor: theme.colors.success,
  },
  actionBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  checkoutBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
});

export default ManualEntriesListScreen;