import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import * as Clipboard from 'expo-clipboard';

// Navigation prop types
interface QRConfigScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Mock user data - in real app this would come from user state
const USER_DATA = {
  id: 'USR-2023-001',
  name: 'Juan Carlos Pérez',
  phone: '+50412345678',
  qrCode: 'PKG-QR-USR2023001-HNDTGU',
  memberSince: '2023-01-15',
};

export const QRConfigScreen: React.FC<QRConfigScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCopyQRCode = async () => {
    try {
      await Clipboard.setStringAsync(USER_DATA.qrCode);
      setQrCopied(true);
      
      // Animation for visual feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => setQrCopied(false), 2000);
      Alert.alert('Copiado', 'Código QR copiado al portapapeles');
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar el código');
    }
  };

  const handleShareQRCode = async () => {
    try {
      const shareOptions = {
        message: `Mi código QR de ParKing: ${USER_DATA.qrCode}\n\nDescarga ParKing para estacionamientos inteligentes en Honduras.`,
        title: 'Mi Código QR - ParKing',
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código');
    }
  };

  const handleRegenerateQR = () => {
    Alert.alert(
      'Regenerar Código QR',
      '¿Estás seguro de que quieres generar un nuevo código QR? El código actual dejará de funcionar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Regenerar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // TODO: Implement QR regeneration logic
              console.log('Regenerating QR code...');
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              Alert.alert('Éxito', 'Tu nuevo código QR ha sido generado exitosamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo regenerar el código QR. Inténtalo de nuevo.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDownloadQR = () => {
    Alert.alert(
      'Descargar QR',
      'Esta función permite descargar tu código QR como imagen para imprimirlo o guardarlo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descargar',
          onPress: () => {
            // TODO: Implement QR image download
            Alert.alert('Función en desarrollo', 'La descarga de QR estará disponible pronto.');
          },
        },
      ]
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[50], theme.colors.background]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Código QR Personal</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* QR Code Display Section */}
          <Animated.View style={[styles.qrSection, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[theme.colors.card, theme.colors.blue[50]]}
              style={styles.qrCard}
            >
              {/* QR Code Placeholder */}
              <View style={styles.qrCodeContainer}>
                <LinearGradient
                  colors={[theme.colors.blue[600], theme.colors.blue[700]]}
                  style={styles.qrCodePlaceholder}
                >
                  <Ionicons name="qr-code" size={80} color="white" />
                </LinearGradient>
                <Text style={styles.qrCodeText}>{USER_DATA.qrCode}</Text>
                
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyQRCode}>
                  <Ionicons 
                    name={qrCopied ? "checkmark-circle" : "copy"} 
                    size={20} 
                    color={qrCopied ? theme.colors.success : theme.colors.primary} 
                  />
                  <Text style={[styles.copyButtonText, qrCopied && styles.copiedText]}>
                    {qrCopied ? 'Copiado' : 'Copiar Código'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{USER_DATA.name}</Text>
                <Text style={styles.userPhone}>{USER_DATA.phone}</Text>
                <Text style={styles.memberSince}>
                  Miembro desde {new Date(USER_DATA.memberSince).toLocaleDateString('es-HN')}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShareQRCode}>
                <View style={styles.actionIcon}>
                  <Ionicons name="share-social" size={24} color={theme.colors.blue[600]} />
                </View>
                <Text style={styles.actionText}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleDownloadQR}>
                <View style={styles.actionIcon}>
                  <Ionicons name="download" size={24} color={theme.colors.blue[600]} />
                </View>
                <Text style={styles.actionText}>Descargar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleRegenerateQR}>
                <View style={styles.actionIcon}>
                  <Ionicons name="refresh" size={24} color={theme.colors.warning} />
                </View>
                <Text style={styles.actionText}>Regenerar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información del QR</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Seguridad</Text>
                  <Text style={styles.infoDescription}>
                    Tu código QR es único e intransferible. No lo compartas con personas desconocidas.
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={theme.colors.blue[600]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Validez</Text>
                  <Text style={styles.infoDescription}>
                    Este código es válido hasta que decidas regenerar uno nuevo.
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="scan" size={20} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Uso</Text>
                  <Text style={styles.infoDescription}>
                    Los guardias pueden escanear este código para verificar tu identidad y registrar tu entrada/salida.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Action */}
          <View style={styles.emergencySection}>
            <Button
              title="REPORTAR CÓDIGO COMPROMETIDO"
              onPress={() => {
                Alert.alert(
                  'Reportar Compromiso',
                  'Si crees que tu código QR ha sido comprometido, genera uno nuevo inmediatamente.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Regenerar Ahora', 
                      onPress: handleRegenerateQR,
                      style: 'destructive',
                    },
                  ]
                );
              }}
              variant="outline"
              loading={isLoading}
              style={styles.emergencyButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  qrSection: {
    marginBottom: theme.spacing.xl,
  },
  qrCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  qrCodeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
  },
  copyButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  copiedText: {
    color: theme.colors.success,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  memberSince: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  infoSection: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  infoDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  emergencySection: {
    marginBottom: theme.spacing.xl,
  },
  emergencyButton: {
    borderColor: theme.colors.warning,
  },
});

export default QRConfigScreen;