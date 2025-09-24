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
import { GuardScreenProps } from '../../types/guard';
import { createIncident, Incident } from '../../services/guardService';
import { useAuth } from '../../hooks/useAuth';

interface IncidentReportScreenProps extends GuardScreenProps {}

type IncidentType = 'damage' | 'theft' | 'dispute' | 'emergency' | 'other';
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export const IncidentReportScreen: React.FC<IncidentReportScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<IncidentType>('other');
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const incidentTypes = [
    { value: 'damage' as IncidentType, label: 'Daño al Vehículo', icon: 'car-outline', color: '#f59e0b' },
    { value: 'theft' as IncidentType, label: 'Robo', icon: 'warning-outline', color: '#ef4444' },
    { value: 'dispute' as IncidentType, label: 'Disputa', icon: 'people-outline', color: '#6366f1' },
    { value: 'emergency' as IncidentType, label: 'Emergencia', icon: 'medical-outline', color: '#dc2626' },
    { value: 'other' as IncidentType, label: 'Otro', icon: 'ellipsis-horizontal-outline', color: '#8b5cf6' },
  ];

  const severityLevels = [
    { value: 'low' as IncidentSeverity, label: 'Bajo', color: '#10b981' },
    { value: 'medium' as IncidentSeverity, label: 'Medio', color: '#f59e0b' },
    { value: 'high' as IncidentSeverity, label: 'Alto', color: '#f97316' },
    { value: 'critical' as IncidentSeverity, label: 'Crítico', color: '#dc2626' },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título del incidente es requerido');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción del incidente es requerida');
      return false;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'La ubicación del incidente es requerida');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para reportar un incidente');
      return;
    }

    setIsLoading(true);

    try {
      const incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'> = {
        guardId: user.uid,
        guardName: user.name,
        type: selectedType,
        severity: selectedSeverity,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        vehiclePlate: vehiclePlate.trim() || undefined,
        userName: userName.trim() || undefined,
        status: 'open',
      };

      await createIncident(incidentData);

      Alert.alert(
        'Incidente Reportado',
        'El incidente ha sido reportado exitosamente. El equipo administrativo será notificado.',
        [
          {
            text: 'Reportar Otro',
            onPress: () => {
              setTitle('');
              setDescription('');
              setLocation('');
              setVehiclePlate('');
              setUserName('');
              setSelectedType('other');
              setSelectedSeverity('medium');
            }
          },
          {
            text: 'Volver al Menú',
            onPress: handleGoBack
          },
        ]
      );
    } catch (error) {
      console.error('Error reporting incident:', error);
      Alert.alert('Error', 'No se pudo reportar el incidente. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#dc2626', '#ef4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reportar Incidente</Text>
            <View style={styles.backButton} />
          </View>
          <Text style={styles.headerSubtitle}>Documenta incidentes en el estacionamiento</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Incident Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Incidente *</Text>
          <View style={styles.typeGrid}>
            {incidentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  selectedType === type.value && styles.typeCardSelected,
                  { borderColor: selectedType === type.value ? type.color : theme.colors.blue[200] }
                ]}
                onPress={() => setSelectedType(type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={selectedType === type.value ? type.color : theme.colors.text.secondary}
                />
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.value && { color: type.color }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de Severidad *</Text>
          <View style={styles.severityRow}>
            {severityLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.severityButton,
                  selectedSeverity === level.value && styles.severityButtonSelected,
                  {
                    borderColor: selectedSeverity === level.value ? level.color : theme.colors.blue[200],
                    backgroundColor: selectedSeverity === level.value ? `${level.color}20` : theme.colors.card
                  }
                ]}
                onPress={() => setSelectedSeverity(level.value)}
              >
                <Text style={[
                  styles.severityLabel,
                  selectedSeverity === level.value && { color: level.color }
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Incident Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Incidente</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Daño en el espejo lateral"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción *</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe detalladamente lo sucedido..."
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ubicación *</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Ej: Espacio A-15, Entrada principal"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Placas del Vehículo (si aplica)</Text>
            <TextInput
              style={styles.textInput}
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              placeholder="Ej: ABC-1234"
              placeholderTextColor={theme.colors.text.muted}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del Usuario (si aplica)</Text>
            <TextInput
              style={styles.textInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor={theme.colors.text.muted}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <View style={styles.warningHeader}>
            <Ionicons name="information-circle" size={20} color="#1e40af" />
            <Text style={styles.warningTitle}>Importante</Text>
          </View>
          <Text style={styles.warningText}>
            • Proporciona información precisa y detallada{'\n'}
            • El reporte será enviado al equipo administrativo{'\n'}
            • Si es una emergencia, llama al 911 primero{'\n'}
            • Toma fotos del incidente si es posible
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={isLoading ? 'Enviando...' : 'Reportar Incidente'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            style={[styles.submitButton, { backgroundColor: '#dc2626' }]}
            disabled={isLoading}
          />

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
            <Ionicons name="close-outline" size={20} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  typeCardSelected: {
    backgroundColor: '#fef3c7',
  },
  typeLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  severityRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  severityButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
  },
  severityButtonSelected: {
    borderWidth: 2,
  },
  severityLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.secondary,
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
  warningBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#3b82f6',
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
    color: '#1e40af',
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: '#1e40af',
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
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
});

export default IncidentReportScreen;