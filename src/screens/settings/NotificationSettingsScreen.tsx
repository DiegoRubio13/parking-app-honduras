import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface NotificationSettingsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'parking_alerts',
      title: 'Alertas de Estacionamiento',
      description: 'Recibe notificaciones cuando tu tiempo de estacionamiento esté por vencer',
      enabled: true,
      icon: 'notifications',
    },
    {
      id: 'payment_alerts',
      title: 'Alertas de Pago',
      description: 'Notificaciones sobre pagos exitosos y fallos en transacciones',
      enabled: true,
      icon: 'card',
    },
    {
      id: 'parking_reminders',
      title: 'Recordatorios de Vehículo',
      description: 'Te recordamos dónde estacionaste tu vehículo',
      enabled: false,
      icon: 'car',
    },
    {
      id: 'promotional_alerts',
      title: 'Ofertas y Promociones',
      description: 'Recibe notificaciones sobre descuentos y ofertas especiales',
      enabled: false,
      icon: 'gift',
    },
    {
      id: 'system_updates',
      title: 'Actualizaciones del Sistema',
      description: 'Información sobre nuevas funciones y mejoras de la app',
      enabled: true,
      icon: 'sync',
    },
    {
      id: 'security_alerts',
      title: 'Alertas de Seguridad',
      description: 'Notificaciones sobre actividad sospechosa en tu cuenta',
      enabled: true,
      icon: 'shield-checkmark',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSetting = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save notification settings logic
      console.log('Saving notification settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Configuración Guardada',
        'Tus preferencias de notificación han sido actualizadas exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las configuraciones. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Restaurar Configuración',
      '¿Estás seguro de que quieres restaurar todas las configuraciones a sus valores predeterminados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            setSettings(prevSettings =>
              prevSettings.map(setting => ({
                ...setting,
                enabled: setting.id === 'parking_alerts' || 
                        setting.id === 'payment_alerts' || 
                        setting.id === 'system_updates' || 
                        setting.id === 'security_alerts'
              }))
            );
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
          <Text style={styles.headerTitle}>Configuración de Notificaciones</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <LinearGradient
              colors={[theme.colors.blue[500], theme.colors.blue[600]]}
              style={styles.infoGradient}
            >
              <Ionicons name="information-circle" size={24} color="white" />
              <Text style={styles.infoText}>
                Personaliza qué tipo de notificaciones deseas recibir para mantenerte informado.
              </Text>
            </LinearGradient>
          </View>

          {/* Notification Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Configuraciones</Text>
            
            {settings.map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons 
                    name={setting.icon} 
                    size={20} 
                    color={setting.enabled ? theme.colors.blue[600] : theme.colors.text.muted} 
                  />
                </View>
                
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                
                <Switch
                  trackColor={{ 
                    false: theme.colors.border, 
                    true: theme.colors.blue[200] 
                  }}
                  thumbColor={setting.enabled ? theme.colors.blue[600] : theme.colors.text.muted}
                  value={setting.enabled}
                  onValueChange={() => handleToggleSetting(setting.id)}
                />
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetToDefaults}>
              <Ionicons name="refresh" size={20} color={theme.colors.text.secondary} />
              <Text style={styles.resetButtonText}>Restaurar a Valores Predeterminados</Text>
            </TouchableOpacity>
            
            <Button
              title="GUARDAR CONFIGURACIÓN"
              onPress={handleSaveSettings}
              loading={isLoading}
              style={styles.saveButton}
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
  infoCard: {
    marginBottom: theme.spacing.xl,
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  infoText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    marginLeft: theme.spacing.md,
    flex: 1,
    lineHeight: 20,
  },
  settingsSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[50],
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  resetButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.fontWeight.medium as any,
  },
  saveButton: {
    width: '100%',
  },
});

export default NotificationSettingsScreen;