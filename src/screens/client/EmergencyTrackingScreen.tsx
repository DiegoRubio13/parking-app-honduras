import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface EmergencyTrackingScreenProps {
  navigation: any;
  route: {
    params: {
      requestId: string;
      serviceType: {
        id: string;
        title: string;
        icon: string;
        color: string;
      };
    };
  };
}

interface TrackingStatus {
  status: 'pending' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  message: string;
  estimatedArrival?: string;
  technician?: {
    name: string;
    phone: string;
    vehicle: string;
    plates: string;
  };
}

const statusMessages = {
  pending: 'Buscando técnico disponible...',
  assigned: 'Técnico asignado, preparándose para salir',
  en_route: 'Técnico en camino a tu ubicación',
  arrived: 'Técnico ha llegado a tu ubicación',
  in_progress: 'Servicio en progreso',
  completed: 'Servicio completado exitosamente',
};

export const EmergencyTrackingScreen: React.FC<EmergencyTrackingScreenProps> = ({ navigation, route }) => {
  const { requestId, serviceType } = route.params;

  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
    status: 'pending',
    message: statusMessages.pending,
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate status progression
    const statusTimer = setTimeout(() => {
      setTrackingStatus({
        status: 'assigned',
        message: statusMessages.assigned,
        estimatedArrival: '15 minutos',
        technician: {
          name: 'Carlos Mendoza',
          phone: '+504 9876-5432',
          vehicle: 'Toyota Hilux Blanca',
          plates: 'SRV-1234',
        },
      });

      setTimeout(() => {
        setTrackingStatus(prev => ({
          ...prev,
          status: 'en_route',
          message: statusMessages.en_route,
          estimatedArrival: '8 minutos',
        }));
      }, 3000);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(statusTimer);
    };
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCallTechnician = () => {
    if (trackingStatus.technician) {
      Alert.alert(
        'Llamar Técnico',
        `¿Deseas llamar a ${trackingStatus.technician.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Llamar', onPress: () => console.log('Calling technician') },
        ]
      );
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de que deseas cancelar esta solicitud de emergencia?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Solicitud Cancelada', 'Tu solicitud de emergencia ha sido cancelada.');
            navigation.goBack();
          }
        },
      ]
    );
  };

  const getStatusIcon = () => {
    switch (trackingStatus.status) {
      case 'pending':
        return 'hourglass-outline';
      case 'assigned':
        return 'person-outline';
      case 'en_route':
        return 'car-outline';
      case 'arrived':
        return 'location-outline';
      case 'in_progress':
        return 'construct-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      default:
        return 'hourglass-outline';
    }
  };

  const getStatusColor = () => {
    switch (trackingStatus.status) {
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
      default:
        return theme.colors.warning;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
            <Text style={styles.headerTitle}>Seguimiento SOS</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.headerSubtitle}>Solicitud ID: {requestId.slice(-8)}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor()}15` }]}>
              <Ionicons name={getStatusIcon()} size={32} color={getStatusColor()} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>{serviceType.title}</Text>
              <Text style={styles.statusMessage}>{trackingStatus.message}</Text>
              {trackingStatus.estimatedArrival && (
                <Text style={styles.estimatedTime}>
                  Llegada estimada: {trackingStatus.estimatedArrival}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeLabel}>Hora actual</Text>
          </View>
        </View>

        {/* Technician Info */}
        {trackingStatus.technician && (
          <View style={styles.technicianCard}>
            <Text style={styles.sectionTitle}>Técnico Asignado</Text>

            <View style={styles.technicianInfo}>
              <View style={styles.technicianAvatar}>
                <Ionicons name="person" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.technicianDetails}>
                <Text style={styles.technicianName}>{trackingStatus.technician.name}</Text>
                <Text style={styles.technicianVehicle}>
                  {trackingStatus.technician.vehicle} - {trackingStatus.technician.plates}
                </Text>
                <Text style={styles.technicianPhone}>{trackingStatus.technician.phone}</Text>
              </View>
            </View>

            <Button
              title="Llamar Técnico"
              onPress={handleCallTechnician}
              variant="outline"
              size="md"
              style={styles.callButton}
            />
          </View>
        )}

        {/* Progress Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Progreso</Text>

          <View style={styles.timeline}>
            {[
              { key: 'pending', label: 'Solicitud recibida', time: '14:30' },
              { key: 'assigned', label: 'Técnico asignado', time: trackingStatus.status !== 'pending' ? '14:32' : null },
              { key: 'en_route', label: 'En camino', time: trackingStatus.status === 'en_route' ? '14:35' : null },
              { key: 'arrived', label: 'Llegada', time: null },
              { key: 'completed', label: 'Completado', time: null },
            ].map((step, index) => (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={[
                    styles.timelineDot,
                    {
                      backgroundColor: step.time || trackingStatus.status === step.key
                        ? getStatusColor()
                        : theme.colors.muted
                    }
                  ]} />
                  {index < 4 && (
                    <View style={[
                      styles.timelineLine,
                      {
                        backgroundColor: step.time
                          ? getStatusColor()
                          : theme.colors.muted
                      }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    {
                      color: step.time || trackingStatus.status === step.key
                        ? theme.colors.text.primary
                        : theme.colors.text.muted
                    }
                  ]}>
                    {step.label}
                  </Text>
                  {step.time && (
                    <Text style={styles.timelineTime}>{step.time}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapCard}>
          <Text style={styles.sectionTitle}>Ubicación en Tiempo Real</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={theme.colors.text.muted} />
            <Text style={styles.mapPlaceholderText}>
              Mapa con ubicación del técnico
            </Text>
            <Text style={styles.mapNote}>
              (Función disponible próximamente)
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {trackingStatus.status !== 'completed' && (
            <Button
              title="Cancelar Solicitud"
              onPress={handleCancelRequest}
              variant="outline"
              size="md"
              style={styles.cancelButton}
              textStyle={{ color: theme.colors.error }}
            />
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
  statusCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statusMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  estimatedTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
  },
  timeInfo: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.blue[200],
  },
  currentTime: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  timeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  technicianCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  technicianAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  technicianDetails: {
    flex: 1,
  },
  technicianName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  technicianVehicle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  technicianPhone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
  },
  callButton: {
    borderColor: theme.colors.primary,
  },
  timelineCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  timeline: {
    paddingLeft: theme.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    height: 30,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: -2,
  },
  timelineLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium as any,
  },
  timelineTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  mapCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.sm,
  },
  mapNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  actionsSection: {
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: theme.colors.error,
    width: '100%',
  },
});

export default EmergencyTrackingScreen;