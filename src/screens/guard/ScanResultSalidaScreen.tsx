import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { GuardScreenProps, User, ParkingSession, ParsedQRData } from '../../types/guard';
// import Icon from 'react-native-vector-icons/Feather';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserByPhone } from '../../services/userService';
import { getActiveSessionByUser, endParkingSession } from '../../services/parkingService';

interface ScanResultSalidaScreenProps extends GuardScreenProps {
  route: {
    params: {
      qrData: ParsedQRData;
      scanTime: Date;
    };
  };
}

export const ScanResultSalidaScreen: React.FC<ScanResultSalidaScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { qrData, scanTime } = route.params;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [duration, setDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Load user and session data from Firebase
  useEffect(() => {
    const loadUserAndSessionData = async () => {
      try {
        const userData = await getUserByPhone(qrData.phoneNumber);
        if (!userData) {
          Alert.alert(
            'Usuario no encontrado',
            'El código QR no corresponde a un usuario registrado.',
            [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]
          );
          return;
        }
        
        const activeSession = await getActiveSessionByUser(userData.uid);
        if (!activeSession) {
          Alert.alert(
            'No hay sesión activa',
            `${userData.name} no tiene una sesión de estacionamiento activa.`,
            [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]
          );
          return;
        }
        
        // Calculate session duration and cost
        const entryTime = new Date(activeSession.startTime);
        const sessionDuration = differenceInMinutes(scanTime, entryTime);
        const cost = sessionDuration * 1.5; // L 1.50 per minute
        
        setUser(userData);
        setSession(activeSession);
        setDuration(sessionDuration);
        setTotalCost(cost);
      } catch (error) {
        console.error('Error loading user and session data:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del usuario y la sesión.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      }
    };

    loadUserAndSessionData();
  }, [qrData.phoneNumber, scanTime, navigation]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const handleConfirmExit = async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      // End parking session in Firebase
      const result = await endParkingSession(session.id);
      
      if (result.success) {
        Alert.alert(
          'Salida Confirmada',
          `${user.name} ha salido correctamente del parqueadero.\n\n` +
          `Duraci\u00f3n: ${formatDuration(duration)}\n` +
          `Costo total: L ${totalCost.toFixed(2)}\n` +
          `Sesi\u00f3n ID: ${session.id}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('QRScanner')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo finalizar la sesi\u00f3n de estacionamiento.');
      }
    } catch (error: any) {
      console.error('Error ending parking session:', error);
      Alert.alert('Error', 'No se pudo registrar la salida. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleScanAnother = () => {
    navigation.navigate('QRScanner');
  };

  if (!user || !session) {
    return (
      <PhoneContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información de la sesión...</Text>
        </View>
      </PhoneContainer>
    );
  }

  const isLowBalance = user.balance < 30; // Less than 30 minutes

  return (
    <PhoneContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.resultHeader}>
          <Ionicons name="log-out-outline" size={28} color={theme.colors.primary} />
          <Text style={styles.resultHeaderText}>SALIDA</Text>
        </View>

        <View style={styles.exitAnimation}>
          <LinearGradient
            colors={[theme.colors.blue[100], theme.colors.blue[200]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.carIcon}
          >
            <Image
              source={require('../../../assets/parking-logo.png')}
              style={[styles.carLogoImage, { tintColor: theme.colors.primary }]}
              resizeMode="contain"
            />
          </LinearGradient>
          <Text style={styles.arrowUp}>↑</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.infoTitle}>Usuario escaneado:</Text>
          
          <View style={styles.infoRow}>
            <LinearGradient
              colors={[theme.colors.blue[100], theme.colors.blue[200]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoIcon}
            >
              <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
            </LinearGradient>
            <Text style={styles.infoText}>{user.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <LinearGradient
              colors={[theme.colors.blue[100], theme.colors.blue[200]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoIcon}
            >
              <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
            </LinearGradient>
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
        </View>

        <View style={styles.sessionInfo}>
          <View style={styles.sessionCard}>
            <View style={styles.sessionCardHeader}>
              <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.sessionTitle}>Tiempo estacionado:</Text>
            </View>
            <Text style={styles.sessionValue}>{formatDuration(duration)}</Text>
          </View>
          
          <View style={styles.sessionCard}>
            <View style={styles.sessionCardHeader}>
              <Ionicons name="cash-outline" size={16} color={theme.colors.success} />
              <Text style={styles.sessionTitle}>Costo total:</Text>
            </View>
            <Text style={[styles.sessionValue, styles.costValue]}>
              L {totalCost.toFixed(2)}
            </Text>
          </View>
        </View>

        {isLowBalance && (
          <LinearGradient
            colors={['#fed7aa', '#fdba74']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceWarning}
          >
            <View style={styles.balanceTitle}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
              <Text style={styles.balanceTitleText}>Saldo restante:</Text>
            </View>
            <Text style={styles.balanceValue}>
              {user.balance} minutos {isLowBalance && '(¡BAJO!)'}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="CONFIRMAR SALIDA"
            onPress={handleConfirmExit}
            loading={loading}
            style={styles.confirmButton}
          />
          
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close-outline" size={20} color="white" />
            <Text style={styles.cancelButtonText}>CANCELAR</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.scanAnotherButton} onPress={handleScanAnother}>
          <Text style={styles.scanAnotherText}>Escanear otro</Text>
        </TouchableOpacity>
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium as any,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.spacing.xl,
  },
  resultHeaderText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
  },
  exitAnimation: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  carIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  arrowUp: {
    fontSize: 48,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.extrabold as any,
  },
  userInfo: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    width: '100%',
    ...theme.shadows.md,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.spacing.sm + 4,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: theme.fontSize.md - 1,
    color: theme.colors.text.primary,
    flex: 1,
  },
  sessionInfo: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  sessionCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  sessionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  sessionValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
  },
  costValue: {
    color: theme.colors.success,
  },
  balanceWarning: {
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  balanceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  balanceTitleText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.warning,
  },
  balanceValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.warning,
  },
  actionButtons: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  confirmButton: {
    marginBottom: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...theme.shadows.md,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
  },
  scanAnotherButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  scanAnotherText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    textAlign: 'center',
  },
  carLogoImage: {
    width: 36,
    height: 36,
  },
});