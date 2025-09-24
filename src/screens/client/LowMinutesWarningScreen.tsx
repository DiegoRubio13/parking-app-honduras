import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { User } from '../../types/auth';

// Navigation types
type ClientStackParamList = {
  LowMinutesWarning: { remainingMinutes: number };
  Purchase: undefined;
  Home: undefined;
  QRDisplay: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'LowMinutesWarning'>;

interface LowMinutesWarningScreenProps extends Props {
  user?: User;
  onPurchase?: () => void;
  onContinue?: () => void;
  onDismiss?: () => void;
}

export const LowMinutesWarningScreen: React.FC<LowMinutesWarningScreenProps> = ({ 
  navigation, 
  route,
  user,
  onPurchase,
  onContinue,
  onDismiss 
}) => {
  const { remainingMinutes = 10, isUrgent = false } = route.params || {};
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [countdown, setCountdown] = useState(remainingMinutes);

  // Mock user data if not provided
  const userData: User = user || {
    id: '1',
    phone: '+504 9999-9999',
    name: 'Usuario Demo',
    email: 'demo@parking.com',
    role: 'user',
    balance: remainingMinutes,
    qrCode: 'demo-qr',
    createdAt: new Date(),
    isActive: true
  };

  useEffect(() => {
    // Prevent going back on urgent warnings
    if (isUrgent) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [isUrgent]);

  useEffect(() => {
    // Countdown timer (simulated)
    if (isUrgent && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 60000); // Every minute

      return () => clearInterval(timer);
    }
  }, [isUrgent, countdown]);

  useEffect(() => {
    // Warning animations
    if (isUrgent) {
      // Urgent pulse animation
      const urgentPulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => urgentPulse());
      };
      urgentPulse();

      // Shake animation for critical warning
      const shake = () => {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      };

      const shakeInterval = setInterval(shake, 3000);
      return () => clearInterval(shakeInterval);
    } else {
      // Gentle pulse for regular warning
      const gentlePulse = () => {
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
        ]).start(() => gentlePulse());
      };
      gentlePulse();
    }
  }, [isUrgent, pulseAnim, shakeAnim]);

  const handlePurchaseNow = () => {
    if (onPurchase) {
      onPurchase();
    } else {
      navigation.navigate('Purchase');
    }
  };

  const handleContinueAnyway = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleShowQR = () => {
    navigation.navigate('QRDisplay');
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      navigation.goBack();
    }
  };

  const getWarningLevel = () => {
    if (countdown <= 5) {
      return {
        level: 'critical',
        title: 'CRÍTICO: Sin Minutos',
        message: 'Tu saldo ha llegado a cero. Debes recargar inmediatamente.',
        colors: [theme.colors.error, '#dc2626'],
        icon: 'alert-circle',
        canContinue: false
      };
    } else if (countdown <= 10 || isUrgent) {
      return {
        level: 'urgent',
        title: 'URGENTE: Saldo Muy Bajo',
        message: `Solo te quedan ${countdown} minutos. Tu sesión podría terminar pronto.`,
        colors: ['#f59e0b', '#d97706'],
        icon: 'warning',
        canContinue: true
      };
    } else {
      return {
        level: 'warning',
        title: 'Aviso: Saldo Bajo',
        message: `Te quedan ${countdown} minutos. Te recomendamos recargar pronto.`,
        colors: [theme.colors.warning, '#f59e0b'],
        icon: 'information-circle',
        canContinue: true
      };
    }
  };

  const warningInfo = getWarningLevel();

  return (
    <PhoneContainer>
      <LinearGradient
        colors={warningInfo.colors}
        style={styles.container}
      >
        <Animated.View style={[
          styles.content,
          { 
            transform: [
              { scale: pulseAnim },
              { translateX: shakeAnim }
            ] 
          }
        ]}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name={warningInfo.icon as any} 
              size={80} 
              color="white" 
            />
          </View>

          {/* Warning Title */}
          <Text style={styles.warningTitle}>{warningInfo.title}</Text>

          {/* Remaining Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Tiempo restante</Text>
            <Text style={styles.timeDisplay}>{countdown}</Text>
            <Text style={styles.timeUnit}>minutos</Text>
          </View>

          {/* Warning Message */}
          <Text style={styles.warningMessage}>{warningInfo.message}</Text>

          {/* User Info */}
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoLabel}>Usuario actual</Text>
            <Text style={styles.userInfoName}>{userData.name}</Text>
            <Text style={styles.userInfoPhone}>{userData.phone}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Primary Action - Purchase */}
            <Button
              title="Comprar Minutos Ahora"
              onPress={handlePurchaseNow}
              size="lg"
              style={styles.purchaseButton}
            />

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              {warningInfo.canContinue && (
                <Button
                  title="Continuar Sin Recargar"
                  onPress={handleContinueAnyway}
                  variant="outline"
                  size="md"
                  style={styles.continueButton}
                  textStyle={styles.continueButtonText}
                />
              )}

              <Button
                title="Ver Mi QR"
                onPress={handleShowQR}
                variant="outline"
                size="md"
                style={styles.qrButton}
                textStyle={styles.qrButtonText}
              />
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recomendaciones</Text>
            
            <View style={styles.recommendation}>
              <Ionicons name="checkmark-circle" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.recommendationText}>
                Compra el paquete de 120 min para mejor valor
              </Text>
            </View>
            
            <View style={styles.recommendation}>
              <Ionicons name="checkmark-circle" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.recommendationText}>
                Activa la recarga automática en tu perfil
              </Text>
            </View>
            
            <View style={styles.recommendation}>
              <Ionicons name="checkmark-circle" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.recommendationText}>
                Configura alertas para evitar quedarte sin saldo
              </Text>
            </View>
          </View>

          {/* Dismiss Button (only for non-urgent warnings) */}
          {!isUrgent && warningInfo.level !== 'critical' && (
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <Text style={styles.dismissButtonText}>Recordar más tarde</Text>
            </TouchableOpacity>
          )}

          {/* Emergency Notice */}
          {warningInfo.level === 'critical' && (
            <View style={styles.emergencyNotice}>
              <Ionicons name="alert-circle" size={20} color="white" />
              <Text style={styles.emergencyText}>
                Si no recargas ahora, no podrás salir del estacionamiento
              </Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  warningTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    marginBottom: theme.spacing.xl,
  },
  timeLabel: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: theme.fontWeight.extrabold,
    color: 'white',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timeUnit: {
    fontSize: theme.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.fontWeight.semibold,
  },
  warningMessage: {
    fontSize: theme.fontSize.lg,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    minWidth: '80%',
  },
  userInfoLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  userInfoName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  userInfoPhone: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  purchaseButton: {
    backgroundColor: 'white',
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  secondaryActions: {
    gap: theme.spacing.sm,
  },
  continueButton: {
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  continueButtonText: {
    color: 'white',
  },
  qrButton: {
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'transparent',
  },
  qrButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  recommendationsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  recommendationsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing.md,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  dismissButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  dismissButtonText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  emergencyText: {
    fontSize: theme.fontSize.sm,
    color: 'white',
    marginLeft: theme.spacing.sm,
    flex: 1,
    fontWeight: theme.fontWeight.semibold,
  },
});