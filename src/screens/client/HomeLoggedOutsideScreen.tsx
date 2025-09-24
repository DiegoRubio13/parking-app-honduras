import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { startParkingSession, getActiveSessionByUser } from '../../services/parkingService';

// Navigation types
type ClientStackParamList = {
  HomeLoggedOutside: undefined;
  HomeParkedActive: { sessionId: string };
  Purchase: undefined;
  Profile: undefined;
  History: undefined;
  QRDisplay: undefined;
  LowMinutesWarning: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'HomeLoggedOutside'>;

interface HomeLoggedOutsideScreenProps extends Props {
  onRefresh?: () => Promise<void>;
}

export const HomeLoggedOutsideScreen: React.FC<HomeLoggedOutsideScreenProps> = ({ 
  navigation, 
  onRefresh 
}) => {
  const { userData, refreshUserData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const balance = userData?.balance || 0;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
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
    navigation.navigate('SOSServices');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleStartParking = async () => {
    if (!userData) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    if (balance < 10) {
      Alert.alert(
        'Saldo Insuficiente',
        'Necesitas al menos 10 minutos para iniciar una sesión de estacionamiento. ¿Deseas comprar más minutos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Comprar Minutos', onPress: handlePurchaseMinutes }
        ]
      );
      return;
    }

    // Check if user already has an active session
    try {
      const activeSession = await getActiveSessionByUser(userData.uid);
      if (activeSession) {
        Alert.alert(
          'Sesión Activa',
          'Ya tienes una sesión de estacionamiento activa.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Start new parking session
      const session = await startParkingSession(
        userData.uid,
        userData.phone,
        userData.name,
        'Centro Comercial', // Default location
        undefined // No specific spot
      );

      Alert.alert(
        '¡Sesión Iniciada!',
        `Tu sesión de estacionamiento ha comenzado. ID: ${session.id.slice(-6)}`,
        [
          { text: 'OK', onPress: () => {
            // Refresh data and navigate to active session screen
            refreshUserData();
            // Navigate to HomeParkedActive screen with session ID
            navigation.navigate('HomeParkedActive', { sessionId: session.id });
          }}
        ]
      );

    } catch (error) {
      console.error('Error starting parking session:', error);
      Alert.alert(
        'Error',
        'No se pudo iniciar la sesión de estacionamiento. Inténtalo de nuevo.'
      );
    }
  };


  // Generate QR code value
  const qrValue = `PARKING_USER_${userData?.phone || 'UNKNOWN'}`;

  // Check if balance is low
  const isLowBalance = balance < 30;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[800], theme.colors.blue[600]]}
        style={styles.header}
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="white" />
            </View>
            <View>
              <Text style={styles.welcomeText}>¡Hola {userData?.name}!</Text>
              <Text style={styles.statusText}>Listo para ingresar</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>ESTÁS AFUERA</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.blue[600]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, isLowBalance && styles.lowBalanceCard]}>
          <View style={styles.balanceHeader}>
            <Ionicons 
              name={isLowBalance ? "warning" : "time"} 
              size={32} 
              color={isLowBalance ? theme.colors.warning : theme.colors.blue[600]} 
            />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceAmount}>{balance} min</Text>
              <Text style={[styles.balanceLabel, isLowBalance && styles.lowBalanceLabel]}>
                {isLowBalance ? 'Saldo bajo' : 'Saldo disponible'}
              </Text>
            </View>
          </View>
          {isLowBalance && (
            <View style={styles.warningMessage}>
              <Text style={styles.warningText}>
                Te recomendamos recargar antes de ingresar
              </Text>
            </View>
          )}
        </View>


        {/* QR Code Preview */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Tu código QR de acceso</Text>
          <Text style={styles.qrSubtitle}>
            Muestra este código al guardia para entrar y salir del estacionamiento
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
            title="Ver QR en pantalla completa"
            onPress={handleShowFullQR}
            variant="outline"
            size="md"
            style={styles.qrButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Acciones rápidas</Text>

          {/* Start Parking Button */}
          <TouchableOpacity
            style={[styles.primaryActionButton, styles.startParkingButton]}
            onPress={handleStartParking}
            disabled={balance < 10}
          >
            <Ionicons
              name="car"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryActionButtonText}>
              {balance < 10 ? 'Saldo Insuficiente' : 'Iniciar Estacionamiento'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryPrimaryButton} onPress={handlePurchaseMinutes}>
            <Text style={styles.secondaryPrimaryButtonText}>Comprar Minutos</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryActionButton} onPress={handleViewHistory}>
              <Text style={styles.secondaryActionButtonText}>Historial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionButton} onPress={handleViewProfile}>
              <Text style={styles.secondaryActionButtonText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={theme.colors.blue[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Horarios de servicio</Text>
              <Text style={styles.infoText}>Lunes a Domingo: 6:00 AM - 10:00 PM</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color={theme.colors.blue[600]} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Hora actual</Text>
              <Text style={styles.infoText}>{formatTime(currentTime)}</Text>
            </View>
          </View>
        </View>

        {/* Emergency Services Section */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.emergencyTitle}>Servicios de Emergencia</Text>
          </View>
          <Text style={styles.emergencySubtitle}>
            ¿Necesitas ayuda con tu vehículo? Grúa, llantas, llaves o mecánico
          </Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
            <Text style={styles.emergencyButtonText}>Ver Servicios SOS</Text>
            <Ionicons name="chevron-forward" size={16} color="#dc2626" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Ionicons name="settings" size={20} color="#6b7280" />
            <Text style={styles.settingsButtonText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Tu información está protegida con encriptación de extremo a extremo
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
  statusBadge: {
    backgroundColor: theme.colors.warning,
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
  balanceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  lowBalanceLabel: {
    color: theme.colors.warning,
  },
  warningMessage: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    textAlign: 'center',
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
  primaryActionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  primaryActionButtonText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  startParkingButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  buttonIcon: {
    marginRight: theme.spacing.xs,
  },
  secondaryPrimaryButton: {
    backgroundColor: theme.colors.blue[600],
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  secondaryPrimaryButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  secondaryActionButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  infoContainer: {
    margin: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  securityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  emergencySection: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: '#fecaca',
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  emergencyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: '#dc2626',
    marginLeft: theme.spacing.xs,
  },
  emergencySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  emergencyButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: '#dc2626',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: theme.spacing.xs,
  },
  settingsButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: '#6b7280',
  },
});