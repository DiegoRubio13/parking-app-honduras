import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface SOSServicesScreenProps {
  navigation: any;
}

interface EmergencyService {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  available: boolean;
}

const emergencyServices: EmergencyService[] = [
  {
    id: 'tow',
    title: 'GRÚA',
    description: 'Vehículo varado o accidentado',
    icon: 'car-outline',
    color: '#dc2626',
    available: true,
  },
  {
    id: 'tire',
    title: 'LLANTA PONCHADA',
    description: 'Cambio de neumático',
    icon: 'radio-button-off-outline',
    color: '#ea580c',
    available: true,
  },
  {
    id: 'keys',
    title: 'LLAVES ADENTRO',
    description: 'Apertura de vehículo',
    icon: 'key-outline',
    color: '#ca8a04',
    available: true,
  },
  {
    id: 'battery',
    title: 'BATERÍA DESCARGADA',
    description: 'Arranque con cables',
    icon: 'battery-dead-outline',
    color: '#16a34a',
    available: true,
  },
  {
    id: 'mechanic',
    title: 'MECÁNICO EXPRESS',
    description: 'Falla mecánica básica',
    icon: 'construct-outline',
    color: '#2563eb',
    available: true,
  },
  {
    id: 'emergency',
    title: 'EMERGENCIA GENERAL',
    description: 'Otros problemas vehiculares',
    icon: 'warning-outline',
    color: '#7c2d12',
    available: true,
  },
];

export const SOSServicesScreen: React.FC<SOSServicesScreenProps> = ({ navigation }) => {
  const [hasSubscription] = useState(false);
  const [panicCountdown, setPanicCountdown] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (panicCountdown !== null) {
      if (panicCountdown === 0) {
        handleEmergencyCall();
        setPanicCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }
    }
  }, [panicCountdown]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se necesita acceso a la ubicación para servicios de emergencia');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewPlans = () => {
    navigation.navigate('SubscriptionPlans');
  };

  const handleServiceRequest = (service: EmergencyService) => {
    if (!hasSubscription) {
      Alert.alert(
        'Suscripción Requerida',
        `Para solicitar ${service.title.toLowerCase()}, necesitas una suscripción SOS activa.\n\nCosto sin suscripción: L 350`,
        [
          { text: 'Ver Planes', onPress: handleViewPlans },
          { text: 'Pagar L 350', onPress: () => handleEmergencyRequest(service) },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } else {
      handleEmergencyRequest(service);
    }
  };

  const handleEmergencyRequest = (service: EmergencyService) => {
    navigation.navigate('EmergencyRequest', { serviceType: service });
  };

  const handleViewHistory = () => {
    navigation.navigate('EmergencyHistory');
  };

  const handleContact = () => {
    navigation.navigate('EmergencyContacts');
  };

  const handlePanicButton = () => {
    Alert.alert(
      'Botón de Pánico',
      '¿Estás seguro que deseas activar el botón de pánico? Esto llamará a emergencias (911) en 5 segundos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Activar',
          onPress: startPanicCountdown,
          style: 'destructive',
        },
      ]
    );
  };

  const startPanicCountdown = () => {
    setPanicCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setPanicCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
  };

  const cancelPanicCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setPanicCountdown(null);
    Alert.alert('Cancelado', 'La llamada de emergencia ha sido cancelada');
  };

  const handleEmergencyCall = async () => {
    const emergencyNumber = Platform.select({
      ios: 'tel:911',
      android: 'tel:911',
      default: 'tel:911',
    });

    try {
      const canOpen = await Linking.canOpenURL(emergencyNumber);
      if (canOpen) {
        await Linking.openURL(emergencyNumber);
        // Log emergency call with location
        if (currentLocation) {
          console.log('Emergency call made from location:', {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      } else {
        Alert.alert('Error', 'No se puede realizar la llamada de emergencia');
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar llamar a emergencias');
    }
  };

  const call911Direct = () => {
    Alert.alert(
      'Llamar a 911',
      '¿Deseas llamar directamente a emergencias (911)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar Ahora',
          onPress: handleEmergencyCall,
          style: 'destructive',
        },
      ]
    );
  };

  const ServiceCard = ({ service }: { service: EmergencyService }) => (
    <TouchableOpacity
      style={[styles.serviceCard, !service.available && styles.serviceCardDisabled]}
      onPress={() => service.available && handleServiceRequest(service)}
      activeOpacity={0.8}
      disabled={!service.available}
    >
      <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
        <Ionicons name={service.icon} size={32} color={service.color} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        {!service.available && (
          <Text style={styles.unavailableText}>No disponible</Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={service.available ? theme.colors.text.secondary : theme.colors.text.muted}
      />
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
            <Text style={styles.headerTitle}>Servicios de Emergencia</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.headerSubtitle}>Asistencia vehicular 24/7</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Panic Button */}
        {panicCountdown !== null ? (
          <View style={styles.panicCountdownCard}>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{panicCountdown}</Text>
            </View>
            <Text style={styles.panicText}>Llamando a 911 en {panicCountdown} segundos...</Text>
            <Button
              title="CANCELAR LLAMADA"
              onPress={cancelPanicCountdown}
              variant="secondary"
              size="lg"
              style={styles.cancelButton}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.panicButton}
            onPress={handlePanicButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#dc2626', '#991b1b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.panicGradient}
            >
              <Ionicons name="warning" size={32} color="white" />
              <Text style={styles.panicButtonText}>BOTÓN DE PÁNICO</Text>
              <Text style={styles.panicButtonSubtext}>Presiona para llamar a 911</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Emergency Call Direct Button */}
        <TouchableOpacity
          style={styles.directCallButton}
          onPress={call911Direct}
          activeOpacity={0.8}
        >
          <View style={styles.directCallContent}>
            <Ionicons name="call" size={24} color="white" />
            <View style={styles.directCallTextContainer}>
              <Text style={styles.directCallText}>Llamar a 911</Text>
              <Text style={styles.directCallSubtext}>Emergencia inmediata</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
        {/* Subscription Status */}
        <View style={[styles.subscriptionCard, !hasSubscription && styles.noSubscriptionCard]}>
          <View style={styles.subscriptionHeader}>
            <Ionicons
              name={hasSubscription ? "shield-checkmark" : "shield-outline"}
              size={24}
              color={hasSubscription ? theme.colors.success : theme.colors.warning}
            />
            <Text style={styles.subscriptionTitle}>
              {hasSubscription ? 'SUSCRIPCIÓN ACTIVA: PREMIUM' : 'SIN SUSCRIPCIÓN ACTIVA'}
            </Text>
          </View>
          {hasSubscription ? (
            <View>
              <Text style={styles.subscriptionInfo}>Renovación: 15 Dic 2024</Text>
              <Text style={styles.subscriptionInfo}>1 emergencia restante este mes</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.subscriptionInfo}>
                Sin suscripción: L 350 por servicio
              </Text>
              <Button
                title="Ver Planes desde L 99/mes"
                onPress={handleViewPlans}
                variant="primary"
                size="sm"
                style={styles.subscriptionButton}
              />
            </View>
          )}
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>SERVICIOS DISPONIBLES</Text>

          {emergencyServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </View>

        {/* Pricing Info */}
        {!hasSubscription && (
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
              <Text style={styles.pricingTitle}>Precios sin suscripción</Text>
            </View>
            <Text style={styles.pricingText}>
              • Todos los servicios: L 350 por llamada{'\n'}
              • Tiempo de respuesta: 30-60 minutos{'\n'}
              • Disponibilidad: 24 horas, 7 días
            </Text>
          </View>
        )}

        {/* Quick Access Footer */}
        <View style={styles.quickAccessFooter}>
          <TouchableOpacity style={styles.quickAccessButton} onPress={handleViewPlans}>
            <Ionicons name="card-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.quickAccessText}>Ver planes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={handleViewHistory}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.quickAccessText}>Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={handleContact}>
            <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.quickAccessText}>Contacto</Text>
          </TouchableOpacity>
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
  subscriptionCard: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: theme.colors.success,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  noSubscriptionCard: {
    backgroundColor: '#fef3c7',
    borderColor: theme.colors.warning,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  subscriptionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: '#065f46',
  },
  subscriptionInfo: {
    fontSize: theme.fontSize.sm,
    color: '#065f46',
    marginBottom: theme.spacing.xs,
  },
  subscriptionButton: {
    marginTop: theme.spacing.sm,
  },
  servicesSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  serviceCardDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.muted,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  serviceDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  unavailableText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.semibold as any,
    marginTop: theme.spacing.xs,
  },
  pricingCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  pricingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: '#92400e',
  },
  pricingText: {
    fontSize: theme.fontSize.sm,
    color: '#92400e',
    lineHeight: 20,
  },
  quickAccessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  quickAccessButton: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  quickAccessText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
  },
  panicButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  panicGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  panicButtonText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    marginTop: theme.spacing.sm,
  },
  panicButtonSubtext: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: theme.spacing.xs,
  },
  panicCountdownCard: {
    backgroundColor: '#dc2626',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold as any,
    color: '#dc2626',
  },
  panicText: {
    fontSize: theme.fontSize.lg,
    color: 'white',
    fontWeight: theme.fontWeight.bold as any,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    width: '100%',
  },
  directCallButton: {
    backgroundColor: '#059669',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  directCallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  directCallTextContainer: {
    flexDirection: 'column',
  },
  directCallText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
  },
  directCallSubtext: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default SOSServicesScreen;