import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { getUserEmergencyRequests, EmergencyRequest } from '../../services/emergencyService';

interface EmergencyHistoryScreenProps {
  navigation: any;
}

type FilterStatus = 'all' | 'pending' | 'completed' | 'cancelled';

const serviceTypeLabels: { [key: string]: string } = {
  grua: 'Grúa',
  llanta: 'Llanta Ponchada',
  llaves: 'Llaves Adentro',
  mecanico: 'Mecánico',
  combustible: 'Combustible',
  bateria: 'Batería',
};

const statusLabels: { [key: string]: { label: string; color: string } } = {
  pending: { label: 'Pendiente', color: '#f59e0b' },
  assigned: { label: 'Asignado', color: '#3b82f6' },
  in_progress: { label: 'En Progreso', color: '#8b5cf6' },
  completed: { label: 'Completado', color: '#10b981' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
};

export const EmergencyHistoryScreen: React.FC<EmergencyHistoryScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<EmergencyRequest[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmergencyHistory();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, requests]);

  const loadEmergencyHistory = async () => {
    try {
      setIsLoading(true);
      // TODO: Get actual user ID from auth context
      const userId = 'current-user-id';
      const history = await getUserEmergencyRequests(userId);
      setRequests(history);
    } catch (error) {
      console.error('Error loading emergency history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de emergencias');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => req.status === filter));
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleRequestDetail = (request: EmergencyRequest) => {
    navigation.navigate('EmergencyDetail', { requestId: request.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const EmergencyCard = ({ request }: { request: EmergencyRequest }) => {
    const statusInfo = statusLabels[request.status];

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => handleRequestDetail(request)}
        activeOpacity={0.8}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestTitleContainer}>
            <Ionicons
              name={
                request.serviceType === 'grua' ? 'car-outline' :
                request.serviceType === 'llanta' ? 'radio-button-off-outline' :
                request.serviceType === 'llaves' ? 'key-outline' :
                request.serviceType === 'bateria' ? 'battery-dead-outline' :
                request.serviceType === 'mecanico' ? 'construct-outline' :
                'warning-outline'
              }
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.requestTitle}>
              {serviceTypeLabels[request.serviceType] || request.serviceType}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.requestBody}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {request.location.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(request.createdAt)}</Text>
          </View>

          {request.vehicleInfo && (
            <View style={styles.infoRow}>
              <Ionicons name="car-sport-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.infoText}>
                {request.vehicleInfo.make} {request.vehicleInfo.model} - {request.vehicleInfo.licensePlate}
              </Text>
            </View>
          )}

          {request.price && (
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.infoText}>L {request.price.toFixed(2)}</Text>
            </View>
          )}

          {request.rating && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.infoText}>{request.rating.toFixed(1)} estrellas</Text>
            </View>
          )}
        </View>

        <View style={styles.requestFooter}>
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ status, label }: { status: FilterStatus; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === status && styles.filterButtonActive]}
      onPress={() => setFilter(status)}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterButtonText, filter === status && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#dc2626', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Historial de Emergencias</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.headerSubtitle}>
            {filteredRequests.length} {filteredRequests.length === 1 ? 'solicitud' : 'solicitudes'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          <FilterButton status="all" label="Todas" />
          <FilterButton status="pending" label="Pendientes" />
          <FilterButton status="completed" label="Completadas" />
          <FilterButton status="cancelled" label="Canceladas" />
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.text.muted} />
          <Text style={styles.emptyTitle}>No hay solicitudes</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'No tienes solicitudes de emergencia aún'
              : `No hay solicitudes ${filter === 'pending' ? 'pendientes' : filter === 'completed' ? 'completadas' : 'canceladas'}`
            }
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredRequests.map((request) => (
            <EmergencyCard key={request.id} request={request} />
          ))}
          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
      )}
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
  filterContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[200],
  },
  filterScrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  requestCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  requestTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  requestTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold as any,
  },
  requestBody: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.blue[200],
  },
  viewDetailsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default EmergencyHistoryScreen;