import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { getActiveSessionByUser, endParkingSession, ParkingSession } from '../../services/parkingService';

// Navigation types
type ClientStackParamList = {
  HomeParkedActive: { sessionId: string };
  Purchase: undefined;
  Profile: undefined;
  History: undefined;
  QRDisplay: undefined;
  LowMinutesWarning: { remainingMinutes: number };
};

type Props = NativeStackScreenProps<ClientStackParamList, 'HomeParkedActive'>;


interface HomeParkedActiveScreenProps extends Props {
  onRefresh?: () => Promise<void>;
}

export const HomeParkedActiveScreen: React.FC<HomeParkedActiveScreenProps> = ({ 
  navigation, 
  route,
  onRefresh 
}) => {
  const { userData, refreshUserData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [loading, setLoading] = useState(true);

  const balance = userData?.balance || 0;

  // Load active session
  useEffect(() => {
    const loadActiveSession = async () => {
      if (!userData?.uid) return;
      
      setLoading(true);
      try {
        const session = await getActiveSessionByUser(userData.uid);
        setActiveSession(session);
      } catch (error) {
        console.error('Error loading active session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveSession();
  }, [userData?.uid]);

  // Update time and calculate elapsed time
  useEffect(() => {
    if (!activeSession) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const startTime = new Date(activeSession.startTime);
      const elapsedMs = now.getTime() - startTime.getTime();
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      setElapsedMinutes(minutes);
      setElapsedSeconds(seconds);
    }, 1000);

    // Initial calculation
    const now = new Date();
    const startTime = new Date(activeSession.startTime);
    const elapsedMs = now.getTime() - startTime.getTime();
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    setElapsedMinutes(minutes);
    setElapsedSeconds(seconds);

    return () => clearInterval(timer);
  }, [activeSession]);

  // Pulse animation for status badge
  useEffect(() => {
    let animationRunning = true;

    const pulse = () => {
      if (!animationRunning) return;

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (animationRunning) {
          pulse();
        }
      });
    };
    pulse();

    return () => {
      animationRunning = false;
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim]);

  const handleRefresh = async () => {
    if (!userData?.uid) return;
    
    setRefreshing(true);
    try {
      // Refresh user data and active session
      await refreshUserData();
      const session = await getActiveSessionByUser(userData.uid);
      setActiveSession(session);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePurchaseMinutes = () => {
    navigation.navigate('Purchase');
  };

  const handleShowFullQR = () => {
    navigation.navigate('QRDisplay');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergencia',
      '¿Necesitas ayuda inmediata? Te conectaremos con seguridad.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar Seguridad', onPress: () => console.log('Emergency call') }
      ]
    );
  };

  const handleEndSession = async () => {
    if (!activeSession || !userData) return;

    Alert.alert(
      'Finalizar Sesión',
      '¿Estás seguro que deseas terminar tu sesión de estacionamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await endParkingSession(activeSession.id);
              
              if (result.success) {
                await refreshUserData();
                Alert.alert(
                  'Sesión Finalizada',
                  `Tu sesión ha terminado. Tiempo total: ${formatDuration(elapsedMinutes)}\nCosto: L${result.session?.cost || 0}`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert('Error', result.error || 'No se pudo finalizar la sesión');
              }
            } catch (error: any) {
              Alert.alert('Error', 'Error al finalizar la sesión');
            }
          }
        }
      ]
    );
  };

  const handleExtendSession = () => {
    Alert.alert(
      '⏰ Extender Sesión',
      '¿Deseas comprar más minutos para continuar tu sesión?',
      [
        { text: 'Más Tarde', style: 'cancel' },
        { text: 'Comprar Ahora', onPress: handlePurchaseMinutes }
      ]
    );
  };

  // Generate QR code value
  const qrValue = activeSession ? activeSession.qrCode : 'NO_ACTIVE_SESSION';

  // Show loading or no session state
  if (loading) {
    return (
      <PhoneContainer>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={styles.loadingText}>Cargando sesión...</Text>
        </View>
      </PhoneContainer>
    );
  }

  if (!activeSession) {
    return (
      <PhoneContainer>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="car-outline" size={64} color={theme.colors.text.muted} />
          <Text style={styles.noSessionTitle}>No hay sesión activa</Text>
          <Text style={styles.noSessionText}>Inicia una nueva sesión de estacionamiento</Text>
          <Button
            title="Iniciar Sesión"
            onPress={() => navigation.goBack()}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </PhoneContainer>
    );
  }

  // Check if balance is getting low
  const isLowBalance = balance < 30;
  const isCriticalBalance = balance < 15;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (minutes: number, seconds?: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m${seconds !== undefined ? ` ${seconds}s` : ''}`;
    }
    return `${mins}m${seconds !== undefined ? ` ${seconds}s` : ''}`;
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.success, '#45b86b']}
        style={styles.header}
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="car" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.welcomeText}>Sesión Activa</Text>
              <Text style={styles.statusText}>{activeSession.location}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Button
              title=""
              onPress={handleEmergency}
              variant="outline"
              size="sm"
              style={styles.emergencyButton}
              textStyle={{ color: 'transparent' }}
            >
              <Ionicons name="alert-circle" size={20} color="white" />
            </Button>
          </View>
        </View>

        {/* Status Badge with Animation */}
        <Animated.View style={[styles.statusBadge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.statusBadgeText}>ESTÁS ADENTRO</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.success}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Session Info Card */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Ionicons name="time" size={32} color={theme.colors.success} />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDuration}>{formatDuration(elapsedMinutes, elapsedSeconds)}</Text>
              <Text style={styles.sessionLabel}>Tiempo transcurrido</Text>
            </View>
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionSpot}>{activeSession.spot || 'N/A'}</Text>
              <Text style={styles.sessionSpotLabel}>Espacio</Text>
            </View>
          </View>
          
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionStartTime}>
              Iniciado a las {formatTime(new Date(activeSession.startTime))}
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={[
          styles.balanceCard, 
          isLowBalance && styles.lowBalanceCard,
          isCriticalBalance && styles.criticalBalanceCard
        ]}>
          <View style={styles.balanceHeader}>
            <Ionicons 
              name={isCriticalBalance ? "warning" : isLowBalance ? "time" : "checkmark-circle"} 
              size={32} 
              color={
                isCriticalBalance ? theme.colors.error : 
                isLowBalance ? theme.colors.warning : 
                theme.colors.success
              } 
            />
            <View style={styles.balanceInfo}>
              <Text style={[
                styles.balanceAmount,
                isCriticalBalance && styles.criticalBalanceAmount
              ]}>
                {balance} min
              </Text>
              <Text style={[
                styles.balanceLabel,
                isLowBalance && styles.lowBalanceLabel,
                isCriticalBalance && styles.criticalBalanceLabel
              ]}>
                {isCriticalBalance ? 'Saldo crítico' : 
                 isLowBalance ? 'Saldo bajo' : 
                 'Saldo disponible'}
              </Text>
            </View>
          </View>
          
          {(isLowBalance || isCriticalBalance) && (
            <View style={styles.warningMessage}>
              <Text style={styles.warningText}>
                {isCriticalBalance 
                  ? 'Tu saldo está muy bajo. ¡Recarga ahora!'
                  : 'Te recomendamos recargar pronto'
                }
              </Text>
              <Button
                title="Recargar Ahora"
                onPress={handleExtendSession}
                size="sm"
                style={styles.rechargeButton}
              />
            </View>
          )}
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Código para salir</Text>
          <Text style={styles.qrSubtitle}>
            Muestra este código al guardia para registrar tu salida
          </Text>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={200}
              color={theme.colors.text.primary}
              backgroundColor="white"
            />
          </View>
          
          <Button
            title="Ver código completo"
            onPress={handleShowFullQR}
            variant="outline"
            size="md"
            style={styles.qrButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Acciones disponibles</Text>
          
          <Button
            title="Comprar Más Minutos"
            onPress={handlePurchaseMinutes}
            size="lg"
            style={styles.primaryButton}
          />
          
          <Button
            title="Finalizar Sesión"
            onPress={handleEndSession}
            variant="outline"
            size="lg"
            style={[styles.primaryButton, styles.endSessionButton]}
            textStyle={{ color: theme.colors.error }}
          />
          
          <View style={styles.secondaryActions}>
            <Button
              title="Historial"
              onPress={handleViewHistory}
              variant="outline"
              style={styles.secondaryButton}
            />
            <Button
              title="Perfil"
              onPress={handleViewProfile}
              variant="outline"
              style={styles.secondaryButton}
            />
          </View>
        </View>

        {/* Session Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={24} color={theme.colors.blue[600]} />
            <Text style={styles.statLabel}>Ubicación</Text>
            <Text style={styles.statValue}>{activeSession.location}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="cash" size={24} color={theme.colors.success} />
            <Text style={styles.statLabel}>Costo estimado</Text>
            <Text style={styles.statValue}>L{((elapsedMinutes + elapsedSeconds / 60) * 0.33).toFixed(2)}</Text>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeContainer}>
          <Ionicons name="information-circle" size={20} color={theme.colors.blue[600]} />
          <Text style={styles.noticeText}>
            Recuerda escanear tu QR al salir para finalizar correctamente tu sesión
          </Text>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  welcomeText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  emergencyButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'transparent',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    alignSelf: 'center',
  },
  statusBadgeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  sessionCard: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    ...theme.shadows.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sessionInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  sessionDuration: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.primary,
  },
  sessionLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  sessionDetails: {
    alignItems: 'center',
  },
  sessionSpot: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  sessionSpotLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sessionMeta: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sessionStartTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  lowBalanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  criticalBalanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  balanceAmount: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.primary,
  },
  criticalBalanceAmount: {
    color: theme.colors.error,
  },
  balanceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  lowBalanceLabel: {
    color: theme.colors.warning,
  },
  criticalBalanceLabel: {
    color: theme.colors.error,
  },
  warningMessage: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  rechargeButton: {
    backgroundColor: theme.colors.warning,
    minHeight: 36,
  },
  qrSection: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  qrTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  qrSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  qrContainer: {
    padding: theme.spacing.lg,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  qrButton: {
    marginTop: theme.spacing.md,
  },
  actionsContainer: {
    margin: theme.spacing.lg,
  },
  actionsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    ...theme.shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  noticeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  noSessionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  noSessionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  endSessionButton: {
    borderColor: theme.colors.error,
  },
});