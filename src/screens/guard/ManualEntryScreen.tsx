import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface ManualEntryScreenProps {
  navigation: any;
}

interface ManualEntryData {
  licensePlate: string;
  name: string;
  idNumber: string;
  phone: string;
  vehicleModel: string;
  notes: string;
}

export const ManualEntryScreen: React.FC<ManualEntryScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<ManualEntryData>({
    licensePlate: '',
    name: '',
    idNumber: '',
    phone: '',
    vehicleModel: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewManualEntries = () => {
    navigation.navigate('ManualEntriesList');
  };

  const updateField = (field: keyof ManualEntryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatLicensePlate = (plate: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Format as XXX-####
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
    }
  };

  const formatPhone = (phone: string) => {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as +504 ####-####
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 8) {
      return cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    } else {
      return '+504 ' + cleaned.slice(-8, -4) + '-' + cleaned.slice(-4);
    }
  };

  const validateForm = () => {
    if (!formData.licensePlate.trim()) {
      Alert.alert('Error', 'Las placas del vehículo son requeridas');
      return false;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del conductor es requerido');
      return false;
    }

    if (!formData.idNumber.trim()) {
      Alert.alert('Error', 'El número de identidad es requerido');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call to register manual entry
      await new Promise(resolve => setTimeout(resolve, 1500));

      const entryData = {
        ...formData,
        entryTime: new Date(),
        entryId: `manual-${Date.now()}`,
        guardId: 'guard-123', // This would come from auth context
      };

      // TODO: Save to backend/storage
      console.log('Manual entry registered:', entryData);

      Alert.alert(
        'Entrada Registrada',
        `Vehículo ${formData.licensePlate} registrado exitosamente.\n\nRecuerda cobrar al momento de la salida.`,
        [
          {
            text: 'Ver Entradas Manuales',
            onPress: () => {
              setFormData({
                licensePlate: '',
                name: '',
                idNumber: '',
                phone: '',
                vehicleModel: '',
                notes: '',
              });
              handleViewManualEntries();
            }
          },
          {
            text: 'Nueva Entrada',
            onPress: () => {
              setFormData({
                licensePlate: '',
                name: '',
                idNumber: '',
                phone: '',
                vehicleModel: '',
                notes: '',
              });
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la entrada. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#065f46', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Entrada Manual</Text>
            <TouchableOpacity style={styles.listButton} onPress={handleViewManualEntries}>
              <Ionicons name="list" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Registro de vehículos sin aplicación</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Placas del Vehículo *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.licensePlate}
              onChangeText={(value) => updateField('licensePlate', formatLicensePlate(value))}
              placeholder="Ej: ABC-1234"
              placeholderTextColor={theme.colors.text.muted}
              autoCapitalize="characters"
              maxLength={8}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Modelo del Vehículo</Text>
            <TextInput
              style={styles.textInput}
              value={formData.vehicleModel}
              onChangeText={(value) => updateField('vehicleModel', value)}
              placeholder="Ej: Toyota Corolla 2020"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        {/* Driver Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Conductor</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Ej: Juan Carlos Pérez"
              placeholderTextColor={theme.colors.text.muted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Identidad *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.idNumber}
              onChangeText={(value) => updateField('idNumber', value)}
              placeholder="Ej: 0801-1990-12345"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => updateField('phone', formatPhone(value))}
              placeholder="+504 9999-9999"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Adicionales</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Observaciones</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder="Ej: Vehículo con rayón en la puerta, cliente sin celular..."
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color={theme.colors.warning} />
            <Text style={styles.warningTitle}>Importante</Text>
          </View>
          <Text style={styles.warningText}>
            • Asegúrate de que toda la información sea correcta{'\n'}
            • Al salir, deberás cobrar según el tiempo transcurrido{'\n'}
            • Esta entrada quedará registrada como manual
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={isLoading ? 'Registrando...' : 'Registrar Entrada'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            style={styles.submitButton}
            disabled={isLoading}
          />

          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewManualEntries}>
            <Ionicons name="list-outline" size={20} color={theme.colors.success} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Ver Entradas Manuales</Text>
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
    marginBottom: theme.spacing.sm,
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
  listButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
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
    minHeight: 80,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  warningTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: '#92400e',
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: '#92400e',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.success,
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.success,
  },
});

export default ManualEntryScreen;