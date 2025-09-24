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

interface UserEditScreenProps {
  navigation: any;
  route: {
    params: {
      user: {
        id: string;
        name: string;
        phone: string;
        balance: number;
        status: 'active' | 'low_balance' | 'suspended';
        sessions: number;
        createdAt: Date;
      };
    };
  };
}

export const UserEditScreen: React.FC<UserEditScreenProps> = ({ navigation, route }) => {
  const { user } = route.params;

  const [editedUser, setEditedUser] = useState({
    name: user.name,
    phone: user.phone,
    balance: user.balance.toString(),
    isActive: user.status !== 'suspended',
    email: 'usuario@example.com', // Mock email
    notes: '', // Mock notes field
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    // Validation
    if (!editedUser.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!editedUser.phone.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return;
    }

    const balanceNumber = parseFloat(editedUser.balance);
    if (isNaN(balanceNumber) || balanceNumber < 0) {
      Alert.alert('Error', 'El saldo debe ser un número válido mayor o igual a 0');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Éxito',
        'Usuario actualizado correctamente',
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
    setEditedUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddBalance = () => {
    Alert.alert(
      'Agregar Saldo',
      'Ingresa la cantidad de minutos a agregar:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Agregar 60 min',
          onPress: () => {
            const currentBalance = parseFloat(editedUser.balance) || 0;
            updateField('balance', (currentBalance + 60).toString());
            Alert.alert('Éxito', '60 minutos agregados al saldo');
          }
        },
        {
          text: 'Agregar 120 min',
          onPress: () => {
            const currentBalance = parseFloat(editedUser.balance) || 0;
            updateField('balance', (currentBalance + 120).toString());
            Alert.alert('Éxito', '120 minutos agregados al saldo');
          }
        },
      ]
    );
  };

  const initials = editedUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

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
            <Text style={styles.headerTitle}>Editar Usuario</Text>
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
          <Text style={styles.previewName}>{editedUser.name || 'Nombre del usuario'}</Text>
          <Text style={styles.previewPhone}>{editedUser.phone || 'Teléfono'}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.textInput}
              value={editedUser.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Ej: Juan Carlos Pérez"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.textInput}
              value={editedUser.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+504 9999-9999"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <TextInput
              style={styles.textInput}
              value={editedUser.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="usuario@example.com"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Balance Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Saldo</Text>

          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Saldo Actual</Text>
                <Text style={styles.balanceValue}>{editedUser.balance} min</Text>
              </View>
              <TouchableOpacity style={styles.addBalanceButton} onPress={handleAddBalance}>
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.addBalanceText}>Agregar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ajustar Saldo (minutos)</Text>
              <TextInput
                style={styles.textInput}
                value={editedUser.balance}
                onChangeText={(value) => updateField('balance', value)}
                placeholder="0"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de la Cuenta</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Usuario Activo</Text>
              <Text style={styles.switchDescription}>
                {editedUser.isActive
                  ? 'El usuario puede usar la aplicación normalmente'
                  : 'El usuario está suspendido temporalmente'
                }
              </Text>
            </View>
            <Switch
              value={editedUser.isActive}
              onValueChange={(value) => updateField('isActive', value)}
              trackColor={{ false: theme.colors.text.muted, true: theme.colors.primary }}
              thumbColor={editedUser.isActive ? theme.colors.card : theme.colors.background}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Administrativas</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notas Internas</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={editedUser.notes}
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
              name={isLoading ? "time-outline" : "save-outline"}
              size={20}
              color="white"
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  balanceInfo: {
    flex: 1,
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
  addBalanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addBalanceText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: 'white',
    marginLeft: theme.spacing.xs,
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

export default UserEditScreen;