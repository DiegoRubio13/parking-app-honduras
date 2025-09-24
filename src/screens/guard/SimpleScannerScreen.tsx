import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Vibration,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { getUserByPhone } from '../../services/userService';

const { width, height } = Dimensions.get('window');

interface ScannerScreenProps {
  navigation: any;
}

const SimpleScannerScreen: React.FC<ScannerScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [scanCount, setScanCount] = useState(0);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Animated values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startScanAnimation();
  }, []);


  const startScanAnimation = () => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseAnimation = Animated.loop(
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
      ])
    );

    scanAnimation.start();
    pulseAnimation.start();
  };

  const generateChecksum = (phone: string) => {
    // Simple checksum for validation
    let sum = 0;
    for (let i = 0; i < phone.length; i++) {
      sum += phone.charCodeAt(i) * (i + 1);
    }
    return sum % 10000;
  };

  const playFeedback = async (success = true) => {
    // Vibration feedback
    if (success) {
      Vibration.vibrate([100, 50, 100]);
    } else {
      Vibration.vibrate([500]);
    }
  };

  const handleBarcodeScanned = async ({ type, data }: any) => {
    if (isProcessing || !isScanning) return;

    setIsProcessing(true);
    setIsScanning(false);

    try {
      let phoneNumber = '';

      // Try to parse structured QR data first
      try {
        const qrData = JSON.parse(data);

        // Validate QR structure
        if (qrData.app !== 'PaRKING' || qrData.type !== 'user' || !qrData.phone) {
          throw new Error('Código QR no válido para PaRKING');
        }

        // Validate checksum
        const expectedChecksum = generateChecksum(qrData.phone);
        if (qrData.checksum !== expectedChecksum) {
          throw new Error('Código QR alterado o corrupto');
        }

        phoneNumber = qrData.phone;

      } catch (parseError) {
        // Fallback to old format - just phone number
        phoneNumber = data.replace(/\D/g, '');

        if (!phoneNumber || phoneNumber.length < 8) {
          throw new Error('Código QR inválido');
        }
      }

      // Get user information
      const userData = await getUserByPhone(`+504${phoneNumber}`);

      if (!userData) {
        throw new Error('Usuario no encontrado en el sistema');
      }

      setUserInfo(userData);

      // For demo purposes, just show success
      setScanResult({
        type: 'entry',
        success: true,
        message: 'Código QR escaneado exitosamente',
        user: userData
      });
      await playFeedback(true);

      setScanCount(prev => prev + 1);

    } catch (error: any) {
      console.error('Scan processing error:', error);
      setScanResult({
        type: 'error',
        success: false,
        message: error.message || 'Error al procesar el código QR',
        user: null
      });
      await playFeedback(false);
    } finally {
      setIsProcessing(false);

      // Show result for 3 seconds, then reset
      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(resultFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setScanResult(null);
          setUserInfo(null);
          setIsScanning(true);
        });
      }, 3000);
    }
  };

  const handleEmergencyExit = () => {
    setShowEmergencyModal(true);
    setEmergencyPhone('');
  };

  const processEmergencyAction = async () => {
    if (!emergencyPhone.trim()) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono');
      return;
    }

    const phoneNumber = emergencyPhone.replace(/\D/g, '');

    if (phoneNumber.length < 8) {
      Alert.alert('Error', 'Número de teléfono inválido');
      return;
    }

    setShowEmergencyModal(false);

    try {
      setIsProcessing(true);

      const userData = await getUserByPhone(`+504${phoneNumber}`);

      if (!userData) {
        throw new Error('Usuario no encontrado en el sistema');
      }

      setScanResult({
        type: 'entry',
        success: true,
        message: 'Entrada MANUAL registrada exitosamente',
        user: userData
      });
      await playFeedback(true);

      setScanCount(prev => prev + 1);

      // Show result
      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(resultFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setScanResult(null);
          setUserInfo(null);
        });
      }, 3000);

    } catch (error: any) {
      setScanResult({
        type: 'error',
        success: false,
        message: error.message || 'Error en procesamiento manual',
        user: null
      });
      await playFeedback(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos acceso a la cámara para escanear códigos QR</Text>
        <Button
          title="Otorgar Permisos"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  const renderScanResult = () => {
    if (!scanResult) return null;

    const backgroundColor = scanResult.success
      ? scanResult.type === 'entry' ? theme.colors.green[500] : theme.colors.blue[500]
      : theme.colors.red[500];

    const icon = scanResult.success
      ? scanResult.type === 'entry' ? '🚗→' : '←🚗'
      : '❌';

    return (
      <Animated.View
        style={[
          styles.resultContainer,
          { backgroundColor, opacity: resultFadeAnim }
        ]}
      >
        <Text style={styles.resultIcon}>{icon}</Text>
        <Text style={styles.resultTitle}>
          {scanResult.type === 'entry' ? 'ENTRADA' :
           scanResult.type === 'exit' ? 'SALIDA' : 'ERROR'}
        </Text>
        <Text style={styles.resultMessage}>{scanResult.message}</Text>

        {userInfo && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>📱 {userInfo.phone}</Text>
            <Text style={styles.userInfoText}>👤 {userInfo.name}</Text>
            <Text style={styles.userInfoText}>⏰ Saldo: {userInfo.balance} min</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="qr-code" size={28} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Escáner QR</Text>
              <Text style={styles.headerSubtitle}>Escaneos hoy: {scanCount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
          onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
          flash={flashMode}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop} />

            {/* Middle section with scan area */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />

              {/* Scan area */}
              <Animated.View
                style={[
                  styles.scanArea,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                {/* Corner indicators */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />

                {/* Scan line animation */}
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-100, 100],
                        }),
                      }],
                    },
                  ]}
                />

                {/* Status text */}
                <View style={styles.scanStatusContainer}>
                  <Text style={styles.scanStatus}>
                    {isProcessing ? 'Procesando...' : 'Apunte al QR del usuario'}
                  </Text>
                </View>
              </Animated.View>

              <View style={styles.overlaySide} />
            </View>

            {/* Bottom overlay */}
            <View style={styles.overlayBottom} />
          </View>
        </CameraView>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.flashButton]}
          onPress={toggleFlash}
        >
          <Ionicons
            name={flashMode === 'on' ? 'flashlight' : 'flashlight-outline'}
            size={24}
            color={theme.colors.orange[600]}
          />
          <Text style={styles.controlButtonLabel}>Flash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.emergencyButton]}
          onPress={handleEmergencyExit}
        >
          <Ionicons
            name="warning"
            size={24}
            color={theme.colors.red[600]}
          />
          <Text style={styles.controlButtonLabel}>Emergencia</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          • Mantenga el QR centrado en el área de escaneo
        </Text>
        <Text style={styles.instructionText}>
          • El escaneo es automático
        </Text>
        <Text style={styles.instructionText}>
          • Use el flash en condiciones de poca luz
        </Text>
      </View>

      {/* Scan Result Overlay */}
      {renderScanResult()}

      {/* Emergency Manual Entry Modal */}
      <Modal
        visible={showEmergencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Entrada/Salida Manual</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa el número de teléfono del usuario para procesar manualmente:
            </Text>

            <TextInput
              style={styles.modalInput}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              placeholder="Ejemplo: 12345678"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="phone-pad"
              maxLength={8}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={processEmergencyAction}
                disabled={isProcessing}
              >
                <Text style={styles.modalConfirmText}>
                  {isProcessing ? 'Procesando...' : 'Procesar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  message: {
    fontSize: 18,
    color: theme.colors.text.primary,
    textAlign: 'center',
    margin: 20,
    fontWeight: '500',
  },
  permissionButton: {
    marginHorizontal: 20,
    height: 56,
  },

  // Header
  header: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // Camera
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  camera: {
    flex: 1,
  },

  // Overlay
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  // Scan Area
  scanArea: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Corners
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: theme.colors.primary,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },

  // Scan Line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },

  // Status
  scanStatusContainer: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 24,
    backgroundColor: theme.colors.card,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flashButton: {
    borderColor: theme.colors.orange[300],
    backgroundColor: theme.colors.orange[50],
  },
  emergencyButton: {
    borderColor: theme.colors.red[300],
    backgroundColor: theme.colors.red[50],
  },
  controlButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginTop: 4,
  },

  // Instructions
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.colors.card,
  },
  instructionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 6,
    fontWeight: '500',
  },

  // Result
  resultContainer: {
    position: 'absolute',
    top: '40%',
    left: 24,
    right: 24,
    paddingVertical: 28,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalCancelButton: {
    backgroundColor: theme.colors.gray[500],
  },
  modalConfirmButton: {
    backgroundColor: theme.colors.orange[500],
  },
  modalCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalConfirmText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});

export default SimpleScannerScreen;