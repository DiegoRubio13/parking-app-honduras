import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getUserParkingHistory, ParkingSession } from '../../services/parkingService';
import { getUserTransactions, PaymentTransaction } from '../../services/paymentService';

// Navigation types
type ClientStackParamList = {
  History: undefined;
  Home: undefined;
  Profile: undefined;
  Purchase: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'History'>;

// ParkingSession interface is now imported from parkingService

interface HistoryScreenProps extends Props {
  onRefresh?: () => Promise<void>;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  navigation, 
  route,
  onRefresh 
}) => {
  const { userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      if (!userData?.uid) return;
      
      setLoading(true);
      try {
        const [userSessions, userTransactions] = await Promise.all([
          getUserParkingHistory(userData.uid),
          getUserTransactions(userData.uid)
        ]);
        
        setSessions(userSessions);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Error loading history data:', error);
        Alert.alert('Error', 'No se pudo cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userData?.uid]);

  // Filter sessions based on selected filter
  useEffect(() => {
    let filtered = [...sessions];
    
    switch (selectedFilter) {
      case 'completed':
        filtered = sessions.filter(s => s.status === 'completed');
        break;
      case 'active':
        filtered = sessions.filter(s => s.status === 'active');
        break;
      case 'cancelled':
        filtered = sessions.filter(s => s.status === 'cancelled');
        break;
      case 'week':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = sessions.filter(s => new Date(s.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filtered = sessions.filter(s => new Date(s.createdAt) >= monthAgo);
        break;
      default:
        // 'all' - no filtering
        break;
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredSessions(filtered);
  }, [sessions, selectedFilter]);

  // Transform Firebase sessions to display format
  const displaySessions = useMemo(() => {
    return sessions.map(session => ({
      ...session,
      date: new Date(session.createdAt),
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      cost: session.cost || 0,
      spot: session.spot || '',
      paymentMethod: session.paymentMethod || ''
    }));
  }, [sessions]);

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'Todas', value: 'all' },
    { id: 'completed', label: 'Completadas', value: 'completed' },
    { id: 'active', label: 'Activas', value: 'active' },
    { id: 'cancelled', label: 'Canceladas', value: 'cancelled' },
  ];


  const handleRefresh = async () => {
    if (!userData?.uid) return;
    
    setRefreshing(true);
    try {
      const [userSessions, userTransactions] = await Promise.all([
        getUserParkingHistory(userData.uid),
        getUserTransactions(userData.uid)
      ]);
      
      setSessions(userSessions);
      setTransactions(userTransactions);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error refreshing history data:', error);
      Alert.alert('Error', 'No se pudo actualizar el historial');
    } finally {
      setRefreshing(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSessionPress = (session: ParkingSession) => {
    Alert.alert(
      'Detalles de Sesión',
      `ID: ${session.id}\n` +
      `Ubicación: ${session.location}\n` +
      `${session.spot ? `Espacio: ${session.spot}\n` : ''}` +
      `Duración: ${formatDuration(session.duration)}\n` +
      `Costo: L${(session.cost || 0).toFixed(2)}\n` +
      `Estado: ${getStatusLabel(session.status)}\n` +
      `${session.paymentMethod ? `Pago: ${session.paymentMethod}` : ''}`,
      [{ text: 'Cerrar' }]
    );
  };

  const handleExportHistory = () => {
    Alert.alert(
      'Exportar Historial',
      'Esta función te permitirá descargar tu historial en formato PDF.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Exportar', onPress: () => Alert.alert('Función próximamente', 'Esta funcionalidad estará disponible pronto') }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'active':
        return theme.colors.blue[600];
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.text.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'active':
        return 'Activa';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const calculateTotalStats = () => {
    const completed = sessions.filter(s => s.status === 'completed');
    const totalSessions = completed.length;
    const totalCost = completed.reduce((sum, session) => sum + (session.cost || 0), 0);
    const totalTime = completed.reduce((sum, session) => sum + session.duration, 0);
    
    return { totalSessions, totalCost, totalTime };
  };

  const stats = calculateTotalStats();

  const renderSessionItem = ({ item }: { item: ParkingSession }) => (
    <TouchableOpacity 
      style={styles.sessionCard}
      onPress={() => handleSessionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionLocation}>{item.location}</Text>
          <Text style={styles.sessionDate}>{formatDate(new Date(item.createdAt))}</Text>
        </View>
        <View style={styles.sessionStatus}>
          <Ionicons 
            name={getStatusIcon(item.status) as any}
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.sessionStatusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.sessionDetails}>
        <View style={styles.sessionDetailItem}>
          <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.sessionDetailText}>
            {formatTime(new Date(item.startTime))}
            {item.endTime && ` - ${formatTime(new Date(item.endTime))}`}
          </Text>
        </View>
        
        {item.spot && (
          <View style={styles.sessionDetailItem}>
            <Ionicons name="car" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.sessionDetailText}>{item.spot}</Text>
          </View>
        )}
        
        <View style={styles.sessionDetailItem}>
          <Ionicons name="stopwatch" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.sessionDetailText}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
      
      <View style={styles.sessionFooter}>
        <View style={styles.sessionCost}>
          <Text style={styles.sessionCostText}>L{(item.cost || 0).toFixed(2)}</Text>
        </View>
        {item.paymentMethod && (
          <Text style={styles.sessionPaymentMethod}>{item.paymentMethod}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={theme.colors.text.muted} />
      <Text style={styles.emptyStateTitle}>Sin historial</Text>
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'all' 
          ? 'Aún no tienes sesiones de estacionamiento'
          : `No tienes sesiones ${filterOptions.find(f => f.id === selectedFilter)?.label.toLowerCase()}`
        }
      </Text>
    </View>
  );

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[800], theme.colors.blue[600]]}
        style={styles.header}
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial</Text>
          <TouchableOpacity onPress={handleExportHistory} style={styles.exportButton}>
            <Ionicons name="download" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatDuration(stats.totalTime)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>L{stats.totalCost.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Gastado</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={filterOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === item.id && styles.activeFilterButton
                ]}
                onPress={() => setSelectedFilter(item.id)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === item.id && styles.activeFilterButtonText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Sessions List */}
        <FlatList
          data={loading ? [] : filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.sessionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.blue[600]}
            />
          }
          ListEmptyComponent={loading ? null : renderEmptyState}
        />
      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filtersContainer: {
    paddingVertical: theme.spacing.md,
  },
  filtersList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.blue[600],
    borderColor: theme.colors.blue[600],
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
  },
  activeFilterButtonText: {
    color: 'white',
  },
  sessionsList: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  sessionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionLocation: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sessionStatusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sessionDetailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sessionCost: {
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  sessionCostText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.blue[600],
  },
  sessionPaymentMethod: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 250,
  },
});