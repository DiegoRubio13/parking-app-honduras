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
import { GuardScreenProps, User, ParsedQRData } from '../../types/guard';
// import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserByPhone } from '../../services/userService';
import { startParkingSession, getActiveSessionByUser } from '../../services/parkingService';

interface ScanResultEntradaScreenProps extends GuardScreenProps {
  route: {
    params: {
      qrData: ParsedQRData;
      scanTime: Date;
    };
  };
}

export const ScanResultEntradaScreen: React.FC<ScanResultEntradaScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { qrData, scanTime } = route.params;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserByPhone(qrData.phoneNumber);
        if (userData) {
          // Check if user already has an active session
          const activeSession = await getActiveSessionByUser(userData.uid);
          if (activeSession) {
            Alert.alert(
              'Usuario ya está adentro',
              `${userData.name} ya tiene una sesión activa de estacionamiento.`,
              [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]
            );
            return;
          }
          setUser(userData);
        } else {
          Alert.alert(
            'Usuario no encontrado',
            'El código QR no corresponde a un usuario registrado.',
            [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]
          );
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del usuario.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      }
    };

    loadUserData();
  }, [qrData.phoneNumber, navigation]);

  const handleConfirmEntry = async () => {
    if (!user) return;

    // Check if user has sufficient balance
    if (user.balance <= 0) {
      Alert.alert(
        'Saldo Insuficiente',
        `${user.name} no tiene minutos suficientes para ingresar al parqueadero.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Create parking session in Firebase
      const result = await startParkingSession(
        user.id,
        user.phone,
        user.name,
        'Estacionamiento Central' // Default location for guard entries
      );
      
      if (result.success && result.session) {
        Alert.alert(
          'Entrada Confirmada',
          `${user.name} ha ingresado correctamente al parqueadero.\n\nSesi\u00f3n ID: ${result.session.id}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('QRScanner')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo crear la sesi\u00f3n de estacionamiento.');
      }
    } catch (error: any) {
      console.error('Error creating parking session:', error);
      Alert.alert('Error', 'No se pudo registrar la entrada. Intenta de nuevo.');
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

  if (!user) {
    return (
      <PhoneContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información del usuario...</Text>
        </View>
      </PhoneContainer>
    );
  }

  return (
    <PhoneContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.resultHeader}>
          <Ionicons name="checkmark-circle-outline" size={28} color={theme.colors.success} />
          <Text style={styles.resultHeaderText}>ENTRADA</Text>
        </View>

        <View style={styles.entryAnimation}>
          <LinearGradient
            colors={['#d1fae5', '#a7f3d0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.carIcon}
          >
            <Image
              source={require('../../../assets/parking-logo.png')}
              style={[styles.carLogoImage, { tintColor: theme.colors.success }]}
              resizeMode="contain"
            />
          </LinearGradient>
          <Text style={styles.arrowDown}>↓</Text>
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
          
          <View style={styles.infoRow}>
            <LinearGradient
              colors={[theme.colors.blue[100], theme.colors.blue[200]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoIcon}
            >
              <Ionicons name="card-outline" size={16} color={theme.colors.primary} />
            </LinearGradient>
            <Text style={styles.infoText}>
              Saldo: <Text style={styles.infoValue}>{user.balance} minutos</Text>
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['#d1fae5', '#a7f3d0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.timeInfo}
        >
          <Text style={styles.timeTitle}>Entrada registrada:</Text>
          <Text style={styles.timeValue}>
            {format(scanTime, "eee dd/MM/yyyy HH:mm:ss", { locale: es })}
          </Text>
        </LinearGradient>

        <View style={styles.rateInfo}>
          <Text style={styles.rateTitle}>Tarifa actual:</Text>
          <Text style={styles.rateValue}>L 1.50 por minuto</Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="CONFIRMAR ENTRADA"
            onPress={handleConfirmEntry}
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
    color: theme.colors.success,
  },
  entryAnimation: {
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
  arrowDown: {
    fontSize: 48,
    color: theme.colors.success,
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
  infoValue: {
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
  },
  timeInfo: {
    borderWidth: 2,
    borderColor: theme.colors.success,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  timeTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.success,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.success,
  },
  rateInfo: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  rateTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
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