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

interface EmergencyControlScreenProps {
  navigation: any;
}

interface EmergencyRequest {
  id: string;
  serviceType: string;
  status: 'pending' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  clientName: string;
  clientPhone: string;
  location: string;
  requestTime: Date;
  estimatedArrival?: string;
  technicianId?: string;
  technicianName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface SystemStats {
  activeRequests: number;
  completedToday: number;
  averageResponseTime: number;
  availableTechnicians: number;
}

export const EmergencyControlScreen: React.FC<EmergencyControlScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([
    {
      id: 'emer-001',
      serviceType: 'Grúa',
      status: 'assigned',
      clientName: 'Juan Pérez',
      clientPhone: '+504 9999-1234',
      location: 'Av. Morazán, Tegucigalpa',
      requestTime: new Date(Date.now() - 15 * 60 * 1000),
      estimatedArrival: '10 min',
      technicianId: 'tech-001',
      technicianName: 'Carlos Mendoza',
      priority: 'high',
    },
    {
      id: 'emer-002',
      serviceType: 'Llanta Ponchada',
      status: 'pending',
      clientName: 'María González',
      clientPhone: '+504 8888-5678',
      location: 'Mall City Mall',
      requestTime: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'medium',
    },
    {
      id: 'emer-003',
      serviceType: 'Batería Descargada',
      status: 'en_route',
      clientName: 'Roberto Silva',
      clientPhone: '+504 7777-9012',
      location: 'Centro Comercial Cascadas',
      requestTime: new Date(Date.now() - 25 * 60 * 1000),
      estimatedArrival: '5 min',
      technicianId: 'tech-002',
      technicianName: 'Luis Martínez',
      priority: 'medium',
    },
  ]);

  const [systemStats] = useState<SystemStats>({
    activeRequests: 3,
    completedToday: 12,
    averageResponseTime: 18,
    availableTechnicians: 5,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAssignTechnician = (requestId: string) => {
    Alert.alert(
      'Asignar Técnico',
      'Selecciona un técnico disponible:',
      [
        { text: 'Carlos Mendoza', onPress: () => assignTechnician(requestId, 'Carlos Mendoza') },
        { text: 'Luis Martínez', onPress: () => assignTechnician(requestId, 'Luis Martínez') },
        { text: 'Ana Rodríguez', onPress: () => assignTechnician(requestId, 'Ana Rodríguez') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const assignTechnician = (requestId: string, technicianName: string) => {
    setActiveRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'assigned',
              technicianName,
              estimatedArrival: '15-20 min',
            }
          : req
      )
    );
  };

  const handleUpdateStatus = (requestId: string, newStatus: EmergencyRequest['status']) => {
    setActiveRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const handleViewProviders = () => {
    navigation.navigate('ProviderManagement');
  };

  const getStatusColor = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'assigned':
      case 'en_route':
        return theme.colors.primary;
      case 'arrived':
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getPriorityColor = (priority: EmergencyRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const EmergencyCard = ({ request }: { request: EmergencyRequest }) => (
    <View style={styles.emergencyCard}>
      <View style={styles.emergencyHeader}>
        <View style={styles.emergencyType}>
          <Text style={styles.emergencyTitle}>{request.serviceType}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(request.priority)}15` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(request.priority) }]}>
              {request.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
            {request.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.emergencyDetails}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{request.clientName}</Text>
          <Text style={styles.clientPhone}>{request.clientPhone}</Text>
          <Text style={styles.location}>{request.location}</Text>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.requestTime}>Hace {formatTimeAgo(request.requestTime)}</Text>
          {request.estimatedArrival && (
            <Text style={styles.eta}>ETA: {request.estimatedArrival}</Text>
          )}
        </View>
      </View>

      {request.technicianName && (
        <View style={styles.technicianInfo}>
          <Ionicons name="person" size={16} color={theme.colors.primary} />
          <Text style={styles.technicianText}>{request.technicianName}</Text>
        </View>
      )}

      <View style={styles.emergencyActions}>
        {request.status === 'pending' && (
          <Button
            title="Asignar Técnico"
            onPress={() => handleAssignTechnician(request.id)}
            variant="primary"
            size="sm"
            style={styles.actionButton}
          />
        )}
        {request.status === 'assigned' && (
          <Button
            title="En Camino"
            onPress={() => handleUpdateStatus(request.id, 'en_route')}
            variant="outline"
            size="sm"
            style={styles.actionButton}
          />
        )}
        {request.status === 'en_route' && (
          <Button
            title="Llegó"
            onPress={() => handleUpdateStatus(request.id, 'arrived')}
            variant="outline"
            size="sm"
            style={styles.actionButton}
          />
        )}
        {request.status === 'arrived' && (
          <Button
            title="Completar"
            onPress={() => handleUpdateStatus(request.id, 'completed')}
            variant="primary"
            size="sm"
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Control de Emergencias</Text>
            <TouchableOpacity style={styles.providersButton} onPress={handleViewProviders}>
              <Ionicons name="business" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Gestión en tiempo real del sistema SOS</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* System Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estado del Sistema</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Solicitudes Activas" value={systemStats.activeRequests} icon="alert-circle" />
            <StatCard label="Completadas Hoy" value={systemStats.completedToday} icon="checkmark-circle" />
            <StatCard label="Tiempo Promedio" value={`${systemStats.averageResponseTime} min`} icon="time" />
            <StatCard label="Técnicos Disponibles" value={systemStats.availableTechnicians} icon="people" />
          </View>
        </View>

        {/* Active Emergencies */}
        <View style={styles.emergenciesSection}>
          <Text style={styles.sectionTitle}>Emergencias Activas</Text>
          {activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <EmergencyCard key={request.id} request={request} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
              <Text style={styles.emptyStateText}>No hay emergencias activas</Text>
              <Text style={styles.emptyStateSubtext}>Todas las solicitudes han sido atendidas</Text>
            </View>
          )}
        </View>

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
  providersButton: {
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
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  emergenciesSection: {
    marginBottom: theme.spacing.xl,
  },
  emergencyCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  emergencyType: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
  },
  emergencyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  clientPhone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  location: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  requestTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  eta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.blue[200],
  },
  technicianText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.semibold as any,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default EmergencyControlScreen;