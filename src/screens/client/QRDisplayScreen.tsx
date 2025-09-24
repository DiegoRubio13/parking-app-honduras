import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Dimensions, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { User } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { getActiveSessionByUser } from '../../services/parkingService';

// Navigation types
type ClientStackParamList = {
  QRDisplay: undefined;
  Home: undefined;
  Purchase: undefined;
  Profile: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'QRDisplay'>;

interface QRDisplayScreenProps extends Props {
  // No additional props needed - will use useAuth hook for user data
}

const { width: screenWidth } = Dimensions.get('window');

export const QRDisplayScreen: React.FC<QRDisplayScreenProps> = ({
  navigation
}) => {
  const { userData, refreshUserData } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseAnim] = useState(new Animated.Value(1));
  const [originalBrightness, setOriginalBrightness] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [isUserParked, setIsUserParked] = useState(false);

  // Check for active parking session
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!userData?.uid) return;
      
      try {
        const session = await getActiveSessionByUser(userData.uid);
        setActiveSession(session);
        setIsUserParked(!!session);
      } catch (error) {
        console.error('Error checking active session:', error);
      }
    };

    checkActiveSession();
    // Check every 30 seconds for real-time updates
    const sessionInterval = setInterval(checkActiveSession, 30000);
    
    return () => clearInterval(sessionInterval);
  }, [userData?.uid]);

  // Refresh user data periodically to ensure balance is up to date
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshUserData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [refreshUserData]);

  // Generate QR code value as specified in the implementation plan
  const qrValue = userData ? `PARKING_USER_${userData.phone.replace(/\D/g, '')}` : 'PARKING_USER_DEMO';
  const userBalance = userData?.balance || 0;
  const userName = userData?.name || 'Usuario';
  const balance = userBalance; // Use balance from userData
  const isParked = isUserParked; // Use calculated parking status

  useEffect(() => {
    // Update time every second for live display
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Increase brightness for better QR scanning
    const increaseBrightness = async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          const current = await Brightness.getBrightnessAsync();
          setOriginalBrightness(current);
          await Brightness.setBrightnessAsync(1); // Max brightness
        }
      } catch (error) {
        console.log('Could not adjust brightness:', error);
      }
    };

    increaseBrightness();

    return () => {
      clearInterval(timer);
      // Restore original brightness when leaving screen
      if (originalBrightness > 0) {
        Brightness.setBrightnessAsync(originalBrightness);
      }
    };
  }, []);

  // Pulse animation for active status
  useEffect(() => {
    if (isUserParked) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [isParked, pulseAnim]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `Mi código QR de ParKing: ${qrValue}`,
        title: 'Código QR ParKing',
      });
    } catch (error) {
      console.log('Error sharing QR:', error);
    }
  };

  const handleRefreshQR = () => {
    Alert.alert(
      'Actualizar QR',
      '¿Deseas generar un nuevo código QR? Esto invalidará el código actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Actualizar', 
          onPress: () => {
            // Simulate QR refresh
            Alert.alert('QR Actualizado', 'Tu código QR ha sido actualizado correctamente');
          }
        }
      ]
    );
  };

  const handlePurchaseMinutes = () => {
    navigation.navigate('Purchase');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusInfo = () => {
    if (isParked) {
      return {
        title: 'SESIÓN ACTIVA',
        subtitle: 'Muestra este código para salir',
        color: theme.colors.success,
        icon: 'checkmark-circle'
      };
    } else if (balance > 0) {
      return {
        title: 'LISTO PARA INGRESAR',
        subtitle: 'Muestra este código al guardia',
        color: theme.colors.blue[600],
        icon: 'qr-code'
      };
    } else {
      return {
        title: 'SIN SALDO',
        subtitle: 'Compra minutos para continuar',
        color: theme.colors.warning,
        icon: 'warning'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const qrSize = screenWidth - 120; // Responsive QR size

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
          <Text style={styles.headerTitle}>Mi Código QR</Text>
          <TouchableOpacity onPress={handleRefreshQR} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userData?.name || 'Usuario'}</Text>
          <Text style={styles.userPhone}>{userData?.phone || 'Sin teléfono'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Status Banner */}
        <Animated.View style={[
          styles.statusBanner,
          { backgroundColor: statusInfo.color },
          isParked && { transform: [{ scale: pulseAnim }] }
        ]}>
          <Ionicons name={statusInfo.icon as any} size={24} color="white" />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>{statusInfo.title}</Text>
            <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
          </View>
        </Animated.View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            <QRCode
              value={qrValue}
              size={qrSize}
              color={theme.colors.text.primary}
              backgroundColor="white"
              logo={undefined}
              logoSize={60}
              logoBackgroundColor="white"
              logoMargin={2}
              logoBorderRadius={8}
            />
          </View>
          
          <View style={styles.qrInfo}>
            <Text style={styles.qrLabel}>Código único de usuario</Text>
            <Text style={styles.qrValue}>{qrValue}</Text>
          </View>
        </View>

        {/* Balance Info */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <Ionicons 
              name={balance > 0 ? "time" : "warning"} 
              size={28} 
              color={balance > 0 ? theme.colors.success : theme.colors.warning} 
            />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceAmount}>{balance} min</Text>
              <Text style={styles.balanceLabel}>
                {balance > 0 ? 'Saldo disponible' : 'Sin saldo'}
              </Text>
            </View>
          </View>
          
          {balance < 30 && (
            <Button
              title="Comprar Minutos"
              onPress={handlePurchaseMinutes}
              size="lg"
              style={styles.purchaseButton}
            />
          )}
        </View>

        {/* Live Time Display */}
        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>Hora actual</Text>
          <Text style={styles.timeDisplay}>{formatTime(currentTime)}</Text>
          <Text style={styles.dateDisplay}>{formatDate(currentTime)}</Text>
        </View>

        {/* QR Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Compartir QR"
            onPress={handleShareQR}
            variant="outline"
            size="lg"
            style={styles.actionButton}
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instrucciones de uso</Text>
          
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Mantén el código QR visible y bien iluminado
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Acércate al guardia y presenta tu teléfono
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Espera la confirmación del escaneo para proceder
            </Text>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Este código es único e intransferible. No lo compartas con terceros.
          </Text>
        </View>
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  statusText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  statusSubtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  qrValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  balanceSection: {
    marginBottom: theme.spacing.xl,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  balanceInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  balanceAmount: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.primary,
  },
  balanceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  purchaseButton: {
    backgroundColor: theme.colors.warning,
  },
  timeSection: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  timeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  timeDisplay: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.blue[600],
    fontFamily: 'monospace',
  },
  dateDisplay: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    borderColor: theme.colors.blue[600],
  },
  instructionsSection: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.blue[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  instructionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.blue[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  securityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});