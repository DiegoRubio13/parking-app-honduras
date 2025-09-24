import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { GuardScreenProps, QRScanData, ParsedQRData, DailyStats } from '../../types/guard';
import { useAuth } from '../../hooks/useAuth';
// import Icon from 'react-native-vector-icons/Feather';
// import { getParkingStats, getActiveSessions } from '../../services/parkingService';

const { width, height } = Dimensions.get('window');

interface QRScannerScreenProps extends GuardScreenProps {}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ navigation }) => {
  const { signOut } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: new Date().toDateString(),
    totalEntries: 0,
    totalExits: 0,
    currentlyInside: 0,
    totalRevenue: 0,
    averageSessionTime: 0
  });

  useEffect(() => {
    // Load daily stats on component mount
    loadDailyStats();
  }, []);

  const loadDailyStats = async () => {
    // DEMO MODE - Use simple static data, no async calls
    const todayStats: DailyStats = {
      date: new Date().toDateString(),
      totalEntries: 23,
      totalExits: 18,
      currentlyInside: 5,
      totalRevenue: 145.50,
      averageSessionTime: 75
    };
    setDailyStats(todayStats);
  };

  const parseQRData = (data: string): ParsedQRData | null => {
    try {
      // Expected format: PARKING_USER_{phoneNumber}
      if (data.startsWith('PARKING_USER_')) {
        const phoneNumber = data.replace('PARKING_USER_', '');
        return { phoneNumber };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleBarCodeScanned = ({ type, data }: QRScanData) => {
    setScanned(true);
    
    const parsedData = parseQRData(data);
    if (parsedData) {
      // Navigate to entry scan result screen
      navigation.navigate('ScanResultEntrada', { 
        qrData: parsedData,
        scanTime: new Date()
      });
    } else {
      Alert.alert(
        'Código QR Inválido',
        'El código QR escaneado no es válido para el sistema ParKing.',
        [
          {
            text: 'Intentar de nuevo',
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (!permission) {
    return (
      <PhoneContainer>
        <View style={styles.centerContent}>
          <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
        </View>
      </PhoneContainer>
    );
  }

  if (!permission.granted) {
    return (
      <PhoneContainer>
        <View style={styles.centerContent}>
          <Text style={styles.permissionText}>
            Se necesita acceso a la cámara para escanear códigos QR
          </Text>
          <Button
            title="Otorgar Permisos"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
      </PhoneContainer>
    );
  }

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.success, '#10b981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Image
                source={require('../../../assets/parking-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>GUARDIA</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
                <Ionicons name="home-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scannerCard}>
          <View style={styles.scannerTitle}>
            <Ionicons name="camera-outline" size={24} color={theme.colors.success} />
            <Text style={styles.scannerTitleText}>SCANNER ACTIVO</Text>
          </View>

          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              flash={flashOn ? 'on' : 'off'}
            />
            <View style={styles.overlay}>
              <View style={styles.viewfinder}>
                <View style={styles.viewfinderCorners}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={styles.focusText}>ENFOCA{'\n'}EL QR</Text>
              </View>
            </View>
          </View>

          <View style={styles.scannerControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Ionicons name={flashOn ? "flash-outline" : "flash-off-outline"} size={16} color={theme.colors.text.primary} />
              <Text style={styles.controlButtonText}>Flash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={resetScanner}>
              <Ionicons name="refresh-outline" size={16} color={theme.colors.text.primary} />
              <Text style={styles.controlButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dailySummary}>
          <View style={styles.summaryTitle}>
            <Ionicons name="trending-up-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.summaryTitleText}>Resumen del Día</Text>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyStats.totalEntries}</Text>
              <Text style={styles.statLabel}>Entradas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyStats.totalExits}</Text>
              <Text style={styles.statLabel}>Salidas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyStats.currentlyInside}</Text>
              <Text style={styles.statLabel}>Adentro ahora</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>L {dailyStats.totalRevenue}</Text>
              <Text style={styles.statLabel}>Ingresos</Text>
            </View>
          </View>
        </View>

      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  permissionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium as any,
  },
  permissionButton: {
    marginTop: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.xxl,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  logoText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: 'white',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  scannerCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    ...theme.shadows.lg,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-evenly',
  },
  scannerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  scannerTitleText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.success,
    textAlign: 'center',
  },
  cameraContainer: {
    width: '85%',
    aspectRatio: 1,
    maxWidth: 280,
    maxHeight: 280,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewfinderCorners: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: theme.colors.success,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  focusText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.success,
    textAlign: 'center',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  scannerControls: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  controlButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  dailySummary: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  summaryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  summaryTitleText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium as any,
  },
  dashboardButton: {
    marginTop: theme.spacing.sm,
  },
  // DEMO MODE - Mock camera styles
  mockCamera: {
    flex: 1,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  mockCameraText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  mockScanButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  mockScanButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: 'white',
    textAlign: 'center',
  },
});

export default QRScannerScreen;