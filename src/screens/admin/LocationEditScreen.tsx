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
import { ParkingLocation } from '../../services/parkingLocationService';

interface LocationEditScreenProps {
  navigation: any;
  route: {
    params: {
      location: ParkingLocation;
    };
  };
}

export const LocationEditScreen: React.FC<LocationEditScreenProps> = ({ navigation, route }) => {
  const { location } = route.params;

  const [editedLocation, setEditedLocation] = useState<ParkingLocation>({
    ...location,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editedLocation.name.trim()) {
      Alert.alert('Error', 'El nombre de la ubicación es requerido');
      return;
    }

    if (!editedLocation.address.trim()) {
      Alert.alert('Error', 'La dirección es requerida');
      return;
    }

    if (editedLocation.totalSpots < 1) {
      Alert.alert('Error', 'Debe haber al menos 1 espacio total');
      return;
    }

    if (editedLocation.availableSpots < 0) {
      Alert.alert('Error', 'Los espacios disponibles no pueden ser negativos');
      return;
    }

    if (editedLocation.availableSpots > editedLocation.totalSpots) {
      Alert.alert('Error', 'Los espacios disponibles no pueden exceder el total');
      return;
    }

    if (editedLocation.hourlyRate < 0) {
      Alert.alert('Error', 'La tarifa por hora no puede ser negativa');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Éxito',
        'Ubicación actualizada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1000);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const updateField = (field: keyof ParkingLocation, value: any) => {
    setEditedLocation(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
            <Text style={styles.headerTitle}>Editar Ubicación</Text>
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
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la Ubicación</Text>
            <TextInput
              style={styles.textInput}
              value={editedLocation.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Ej: Multiplaza, Hospital Viera"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dirección</Text>
            <TextInput
              style={styles.textInput}
              value={editedLocation.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Dirección completa"
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={styles.textInput}
              value={editedLocation.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Descripción del estacionamiento"
              placeholderTextColor={theme.colors.text.muted}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Location Coordinates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordenadas</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
              <Text style={styles.inputLabel}>Latitud</Text>
              <TextInput
                style={styles.textInput}
                value={editedLocation.latitude.toString()}
                onChangeText={(value) => updateField('latitude', parseFloat(value) || 0)}
                placeholder="14.0723"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
              <Text style={styles.inputLabel}>Longitud</Text>
              <TextInput
                style={styles.textInput}
                value={editedLocation.longitude.toString()}
                onChangeText={(value) => updateField('longitude', parseFloat(value) || 0)}
                placeholder="-87.1921"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Parking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Estacionamiento</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
              <Text style={styles.inputLabel}>Espacios Totales</Text>
              <TextInput
                style={styles.textInput}
                value={editedLocation.totalSpots.toString()}
                onChangeText={(value) => updateField('totalSpots', parseInt(value) || 0)}
                placeholder="150"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: theme.spacing.sm }]}>
              <Text style={styles.inputLabel}>Espacios Disponibles</Text>
              <TextInput
                style={styles.textInput}
                value={editedLocation.availableSpots.toString()}
                onChangeText={(value) => updateField('availableSpots', parseInt(value) || 0)}
                placeholder="45"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tarifa por Hora (L)</Text>
            <TextInput
              style={styles.textInput}
              value={editedLocation.hourlyRate.toString()}
              onChangeText={(value) => updateField('hourlyRate', parseFloat(value) || 0)}
              placeholder="25"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Ubicación Activa</Text>
              <Text style={styles.switchDescription}>
                {editedLocation.isActive
                  ? 'La ubicación está disponible para reservas'
                  : 'La ubicación está desactivada temporalmente'
                }
              </Text>
            </View>
            <Switch
              value={editedLocation.isActive}
              onValueChange={(value) => updateField('isActive', value)}
              trackColor={{ false: theme.colors.text.muted, true: theme.colors.primary }}
              thumbColor={editedLocation.isActive ? theme.colors.card : theme.colors.background}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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

export default LocationEditScreen;