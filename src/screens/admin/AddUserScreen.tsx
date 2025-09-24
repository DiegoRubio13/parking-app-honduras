import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { theme } from '../../constants/theme';

interface AddUserScreenProps {
  navigation: any;
}

export const AddUserScreen: React.FC<AddUserScreenProps> = ({ navigation }) => {
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    balance: '60', // Default balance in minutes
    isActive: true,
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    // Validation
    if (!newUser.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!newUser.phone.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return;
    }

    if (!newUser.email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      Alert.alert('Error', 'El correo electrónico no es válido');
      return;
    }

    // Phone validation (basic format check)
    if (!newUser.phone.includes('+504')) {
      Alert.alert('Error', 'El teléfono debe incluir el código de país (+504)');
      return;
    }

    const balanceNumber = parseFloat(newUser.balance);
    if (isNaN(balanceNumber) || balanceNumber < 0) {
      Alert.alert('Error', 'El saldo inicial debe ser un número válido mayor o igual a 0');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Éxito',
        'Usuario creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1000);
  };

  const updateField = (field: string, value: any) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    // Auto-format phone number
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 8) {
      return `+504 ${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('504')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }

    return phone;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    updateField('phone', formatted);
  };

  const handleQuickBalance = (minutes: number) => {
    updateField('balance', minutes.toString());
  };

  const initials = newUser.name ? newUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'NU';

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#7c2d12', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Agregar Usuario</Text>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Ionicons name={isLoading ? "time-outline" : "checkmark"} size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Preview */}
        <View style={styles.profilePreview}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.previewName}>{newUser.name || 'Nuevo Usuario'}</Text>
          <Text style={styles.previewPhone}>{newUser.phone || '+504 0000-0000'}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo *</Text>
            <TextInput
              style={styles.textInput}
              value={newUser.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Ej: Juan Carlos Pérez"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono *</Text>
            <TextInput
              style={styles.textInput}
              value={newUser.phone}
              onChangeText={handlePhoneChange}
              placeholder="+504 0000-0000"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo Electrónico *</Text>
            <TextInput
              style={styles.textInput}
              value={newUser.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="usuario@example.com"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Initial Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saldo Inicial</Text>

          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Saldo a Asignar</Text>
                <Text style={styles.balanceValue}>{newUser.balance} min</Text>
              </View>
            </View>

            <View style={styles.quickBalanceButtons}>
              <TouchableOpacity
                style={[styles.quickBalanceBtn, newUser.balance === '0' && styles.quickBalanceBtnActive]}
                onPress={() => handleQuickBalance(0)}
              >
                <Text style={[styles.quickBalanceText, newUser.balance === '0' && styles.quickBalanceTextActive]}>
                  Sin saldo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBalanceBtn, newUser.balance === '60' && styles.quickBalanceBtnActive]}
                onPress={() => handleQuickBalance(60)}
              >
                <Text style={[styles.quickBalanceText, newUser.balance === '60' && styles.quickBalanceTextActive]}>
                  60 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBalanceBtn, newUser.balance === '120' && styles.quickBalanceBtnActive]}
                onPress={() => handleQuickBalance(120)}
              >
                <Text style={[styles.quickBalanceText, newUser.balance === '120' && styles.quickBalanceTextActive]}>
                  120 min
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>O ingresa cantidad personalizada (minutos)</Text>
              <TextInput
                style={styles.textInput}
                value={newUser.balance}
                onChangeText={(value) => updateField('balance', value)}
                placeholder="60"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de la Cuenta</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Activar Inmediatamente</Text>
              <Text style={styles.switchDescription}>
                {newUser.isActive
                  ? 'El usuario podrá usar la aplicación inmediatamente'
                  : 'El usuario será creado en estado suspendido'
                }
              </Text>
            </View>
            <Switch
              value={newUser.isActive}
              onValueChange={(value) => updateField('isActive', value)}
              trackColor={{ false: theme.colors.text.muted, true: theme.colors.primary }}
              thumbColor={newUser.isActive ? theme.colors.card : theme.colors.background}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Administrativas</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notas Internas (Opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={newUser.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder="Notas sobre el usuario (solo visible para administradores)"
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons
              name={isLoading ? "time-outline" : "person-add-outline"}
              size={20}
              color="white"
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Creando Usuario...' : 'Crear Usuario'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
            <Ionicons name="close-outline" size={20} color={theme.colors.text.secondary} style={{ marginRight: theme.spacing.sm }} />
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.lg,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  profilePreview: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  previewName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  previewPhone: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  textAreaInput: {
    minHeight: 100,
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  balanceHeader: {
    marginBottom: theme.spacing.md,
  },
  balanceInfo: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balanceValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  quickBalanceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  quickBalanceBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  quickBalanceBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickBalanceText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  quickBalanceTextActive: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  switchInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  switchLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  switchDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    marginTop: theme.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
  },
});

export default AddUserScreen;