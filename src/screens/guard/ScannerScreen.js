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
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc } from 'firebase/firestore';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';
import { startParkingSession, endParkingSession } from '../../store/sessionSlice';
import Colors from '../../constants/colors';
import { Button } from '../../components/shared';

const { width, height } = Dimensions.get('window');

const ScannerScreen = () => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const [scanCount, setScanCount] = useState(0);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.session);
  const { activeSessions } = useSelector(state => state.session);
  
  // Animated values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Sound
  const [sound, setSound] = useState(null);
  
  useEffect(() => {
    loadScanSound();
    startScanAnimation();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);
  
  const loadScanSound = async () => {
    try {
      // Load a simple beep sound for scanning feedback
      const { sound: scanSound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmNbEQVCn+HyvGJcEQVDnuDx' }
      );
      setSound(scanSound);
    } catch (error) {
      console.log('Could not load sound:', error);
    }
  };
  
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
  
  const generateChecksum = (phone) => {
    // Simple checksum for validation - must match HomeScreen
    let sum = 0;
    for (let i = 0; i < phone.length; i++) {
      sum += phone.charCodeAt(i) * (i + 1);
    }
    return sum % 10000;
  };

  const playFeedback = async (success = true) => {
    // Play sound
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.log('Sound play error:', error);
    }
    
    // Vibration feedback
    if (success) {
      Vibration.vibrate([100, 50, 100]);
    } else {
      Vibration.vibrate([500]);
    }
  };
  
  const handleBarcodeScanned = async ({ type, data }) => {
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
      
      // Get user information from Firestore
      const userRef = doc(db, 'users', phoneNumber);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado en el sistema');
      }
      
      const userData = userSnap.data();
      setUserInfo({ id: phoneNumber, ...userData });
      
      // Determine action based on current session
      const hasActiveSession = !!userData.current_session;
      
      if (hasActiveSession) {
        // User is inside, process EXIT
        await dispatch(endParkingSession({ userPhone: phoneNumber })).unwrap();
        setScanResult({
          type: 'exit',
          success: true,
          message: 'Salida registrada exitosamente',
          user: userData
        });
        await playFeedback(true);
      } else {
        // User wants to enter, process ENTRY
        if (userData.minutes_balance <= 0) {
          throw new Error('Usuario sin saldo suficiente');
        }
        
        await dispatch(startParkingSession({ userPhone: phoneNumber })).unwrap();
        setScanResult({
          type: 'entry',
          success: true,
          message: 'Entrada registrada exitosamente',
          user: userData
        });
        await playFeedback(true);
      }
      
      setScanCount(prev => prev + 1);
      
    } catch (error) {
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
    
    // Use the same logic as QR scanning
    try {
      setIsProcessing(true);
      
      const userRef = doc(db, 'users', phoneNumber);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('Usuario no encontrado en el sistema');
      }
      
      const userData = userSnap.data();
      const hasActiveSession = !!userData.current_session;
      
      if (hasActiveSession) {
        await dispatch(endParkingSession({ userPhone: phoneNumber })).unwrap();
        setScanResult({
          type: 'exit',
          success: true,
          message: 'Salida MANUAL registrada exitosamente',
          user: userData
        });
        await playFeedback(true);
      } else {
        Alert.alert(
          'Entrada Manual',
          'El usuario no tiene una sesión activa. ¿Deseas procesar una entrada manual?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sí, procesar entrada',
              onPress: async () => {
                try {
                  if (userData.minutes_balance <= 0) {
                    throw new Error('Usuario sin saldo suficiente');
                  }
                  
                  await dispatch(startParkingSession({ userPhone: phoneNumber })).unwrap();
                  setScanResult({
                    type: 'entry',
                    success: true,
                    message: 'Entrada MANUAL registrada exitosamente',
                    user: userData
                  });
                  await playFeedback(true);
                } catch (error) {
                  setScanResult({
                    type: 'error',
                    success: false,
                    message: error.message || 'Error al procesar entrada manual',
                    user: null
                  });
                  await playFeedback(false);
                }
              }
            }
          ]
        );
        return;
      }
      
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
      
    } catch (error) {
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
          variant="primary"
          style={styles.permissionButton}
        />
      </View>
    );
  }
  
  const renderScanResult = () => {
    if (!scanResult) return null;
    
    const backgroundColor = scanResult.success 
      ? scanResult.type === 'entry' ? Colors.success[500] : Colors.info[500]
      : Colors.error[500];
      
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
            <Text style={styles.userInfoText}>⏰ Saldo: {userInfo.minutes_balance} min</Text>
          </View>
        )}
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Top Safe Area */}
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: '#ffffff' }]} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="qr-code" size={28} color={Colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Escáner QR</Text>
              <Text style={styles.headerSubtitle}>Usuarios activos: {activeSessions.length}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.scanCountBadge}>
              <Text style={styles.scanCountText}>Hoy: {scanCount}</Text>
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
            color={Colors.warning[600]} 
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
            color={Colors.error[600]} 
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
              placeholder="Ejemplo: 50412345678"
              placeholderTextColor={Colors.dark.text.disabled}
              keyboardType="phone-pad"
              maxLength={15}
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
    backgroundColor: Colors.neutral[50],
  },
  topSafeArea: {
    backgroundColor: Colors.neutral[0],
  },
  message: {
    fontSize: 18,
    color: Colors.light.text.primary,
    textAlign: 'center',
    margin: 20,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  permissionButton: {
    marginHorizontal: 20,
    height: 56,
    borderRadius: 16,
  },
  
  // Header
  header: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: Colors.neutral[900],
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
    justifyContent: 'space-between',
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
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  scanCountBadge: {
    backgroundColor: Colors.success[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success[200],
  },
  scanCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success[600],
    letterSpacing: 0.5,
  },
  
  // Camera
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.primary[300],
    shadowColor: Colors.primary[600],
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
    borderColor: Colors.primary[400],
    borderWidth: 4,
    shadowColor: Colors.primary[400],
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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
    backgroundColor: Colors.primary[400],
    shadowColor: Colors.primary[400],
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
    color: Colors.neutral[0],
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    letterSpacing: -0.2,
    borderWidth: 1,
    borderColor: Colors.neutral[600],
  },
  
  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 24,
    backgroundColor: Colors.neutral[0],
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.neutral[50],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  flashButton: {
    borderColor: Colors.info[300],
    backgroundColor: Colors.info[50],
  },
  emergencyButton: {
    borderColor: Colors.error[300],
    backgroundColor: Colors.error[50],
  },
  controlButtonText: {
    fontSize: 28,
    marginBottom: 8,
  },
  controlButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text.secondary,
    letterSpacing: -0.1,
  },
  
  // Instructions
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.neutral[0],
  },
  instructionText: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: -0.1,
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
    shadowColor: Colors.neutral[900],
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
    color: Colors.neutral[0],
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  resultMessage: {
    fontSize: 16,
    color: Colors.neutral[0],
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
    color: Colors.neutral[100],
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
    backgroundColor: Colors.neutral[800],
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: Colors.neutral[600],
    shadowColor: Colors.neutral[900],
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
    color: Colors.neutral[0],
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.neutral[300],
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: Colors.neutral[600],
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: Colors.neutral[0],
    backgroundColor: Colors.neutral[900],
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.2,
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
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalCancelButton: {
    backgroundColor: Colors.neutral[700],
    borderWidth: 2,
    borderColor: Colors.neutral[600],
  },
  modalConfirmButton: {
    backgroundColor: Colors.warning[500],
  },
  modalCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[300],
    letterSpacing: -0.1,
  },
  modalConfirmText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[0],
    letterSpacing: -0.2,
  },
});

export default ScannerScreen;