import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface EmergencyRequestScreenProps {
  navigation: any;
  route: {
    params: {
      serviceType: {
        id: string;
        title: string;
        icon: string;
        color: string;
      };
    };
  };
}

interface VehicleInfo {
  brand: string;
  model: string;
  color: string;
  plates: string;
}

interface ContactInfo {
  name: string;
  phone: string;
}

const vehicleBrands = ['Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Ford', 'Chevrolet', 'Otro'];
const vehicleColors = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Otro'];

const problemOptions = {
  tow: [
    'Motor no enciende',
    'Accidente menor',
    'Vehículo atascado',
    'Sin combustible',
    'Otro',
  ],
  tire: [
    'Llanta ponchada',
    'Llanta desinflada',
    'Problema con el rin',
    'Otro',
  ],
  keys: [
    'Llaves dentro del vehículo',
    'Llave rota en cerradura',
    'Control remoto no funciona',
    'Otro',
  ],
  battery: [
    'Batería completamente descargada',
    'Luces se quedaron prendidas',
    'Batería vieja',
    'Otro',
  ],
  mechanic: [
    'Ruido extraño en motor',
    'Sobrecalentamiento',
    'Problema eléctrico',
    'Otro',
  ],
  emergency: [
    'Problema no listado',
    'Emergencia múltiple',
    'Otro',
  ],
};

export const EmergencyRequestScreen: React.FC<EmergencyRequestScreenProps> = ({ navigation, route }) => {
  const { serviceType } = route.params;

  const [location, setLocation] = useState('Obteniendo ubicación...');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    brand: '',
    model: '',
    color: '',
    plates: '',
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: 'Juan Pérez',
    phone: '+504 9999-9999',
  });
  const [selectedProblem, setSelectedProblem] = useState('');
  const [customProblem, setCustomProblem] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se necesita acceso a la ubicación para servicios de emergencia');
        setLocation('Ubicación no disponible');
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoordinates({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = `${
          address.street || ''
        } ${address.name || ''}, ${address.city || ''}, ${address.region || ''}`;
        setLocation(formattedAddress.trim() || 'Ubicación detectada');
      } else {
        setLocation(`Lat: ${currentLocation.coords.latitude.toFixed(6)}, Lng: ${currentLocation.coords.longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
      setLocation('Error al obtener ubicación');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleUpdateLocation = () => {
    getCurrentLocation();
  };

  const validateForm = () => {
    if (!vehicleInfo.brand) {
      Alert.alert('Error', 'Selecciona la marca del vehículo');
      return false;
    }
    if (!vehicleInfo.color) {
      Alert.alert('Error', 'Selecciona el color del vehículo');
      return false;
    }
    if (!vehicleInfo.plates.trim()) {
      Alert.alert('Error', 'Ingresa las placas del vehículo');
      return false;
    }
    if (!selectedProblem) {
      Alert.alert('Error', 'Describe el problema');
      return false;
    }
    if (selectedProblem === 'Otro' && !customProblem.trim()) {
      Alert.alert('Error', 'Describe el problema específico');
      return false;
    }
    return true;
  };

  const handleSubmitRequest = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const requestData = {
        serviceType: serviceType.id,
        location,
        coordinates,
        vehicleInfo,
        contactInfo,
        problem: selectedProblem === 'Otro' ? customProblem : selectedProblem,
        timestamp: new Date(),
        requestId: `emergency-${Date.now()}`,
      };

      console.log('Emergency request:', requestData);

      Alert.alert(
        'Solicitud Enviada',
        `Tu solicitud de ${serviceType.title.toLowerCase()} ha sido enviada.\n\nTiempo estimado de llegada: 15-30 minutos.\n\nTe contactaremos pronto.`,
        [
          {
            text: 'Ver Estado',
            onPress: () => {
              navigation.navigate('EmergencyTracking', { requestId: requestData.requestId, serviceType });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPlates = (plates: string) => {
    const cleaned = plates.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
    }
  };

  const Dropdown = ({
    value,
    options,
    placeholder,
    onSelect
  }: {
    value: string;
    options: string[];
    placeholder: string;
    onSelect: (value: string) => void;
  }) => (
    <TouchableOpacity
      style={styles.dropdown}
      onPress={() => {
        Alert.alert(
          'Seleccionar',
          '',
          options.map(option => ({
            text: option,
            onPress: () => onSelect(option),
          }))
        );
      }}
    >
      <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  const currentProblems = problemOptions[serviceType.id as keyof typeof problemOptions] || [];

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#dc2626', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Solicitar {serviceType.title}</Text>
            <TouchableOpacity style={styles.locationButton} onPress={handleUpdateLocation}>
              <Ionicons name="location" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Completa la información para asistencia</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Ubicación</Text>
          <View style={styles.locationCard}>
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="location" size={24} color={theme.colors.primary} />
            )}
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>{location}</Text>
              {coordinates && (
                <Text style={styles.coordinatesText}>
                  GPS: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </Text>
              )}
              <TouchableOpacity onPress={handleUpdateLocation} disabled={isLoadingLocation}>
                <Text style={[styles.updateLocationText, isLoadingLocation && styles.disabledText]}>
                  {isLoadingLocation ? 'Actualizando...' : 'Actualizar ubicación'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Marca *</Text>
            <Dropdown
              value={vehicleInfo.brand}
              options={vehicleBrands}
              placeholder="Seleccionar marca"
              onSelect={(value) => setVehicleInfo(prev => ({ ...prev, brand: value }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Modelo</Text>
            <TextInput
              style={styles.textInput}
              value={vehicleInfo.model}
              onChangeText={(value) => setVehicleInfo(prev => ({ ...prev, model: value }))}
              placeholder="Ej: Corolla"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Color *</Text>
            <Dropdown
              value={vehicleInfo.color}
              options={vehicleColors}
              placeholder="Seleccionar color"
              onSelect={(value) => setVehicleInfo(prev => ({ ...prev, color: value }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Placas *</Text>
            <TextInput
              style={styles.textInput}
              value={vehicleInfo.plates}
              onChangeText={(value) => setVehicleInfo(prev => ({ ...prev, plates: formatPlates(value) }))}
              placeholder="ABC-1234"
              placeholderTextColor={theme.colors.text.muted}
              autoCapitalize="characters"
              maxLength={8}
            />
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del Problema</Text>

          {currentProblems.map((problem, index) => (
            <TouchableOpacity
              key={index}
              style={styles.problemOption}
              onPress={() => setSelectedProblem(problem)}
            >
              <View style={styles.radioButton}>
                {selectedProblem === problem && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.problemText}>{problem}</Text>
            </TouchableOpacity>
          ))}

          {selectedProblem === 'Otro' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Describe el problema específico *</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={customProblem}
                onChangeText={setCustomProblem}
                placeholder="Describe detalladamente el problema..."
                placeholderTextColor={theme.colors.text.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono *</Text>
            <TextInput
              style={styles.textInput}
              value={contactInfo.phone}
              onChangeText={(value) => setContactInfo(prev => ({ ...prev, phone: value }))}
              placeholder="+504 9999-9999"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre *</Text>
            <TextInput
              style={styles.textInput}
              value={contactInfo.name}
              onChangeText={(value) => setContactInfo(prev => ({ ...prev, name: value }))}
              placeholder="Tu nombre completo"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={isLoading ? 'Enviando solicitud...' : `Solicitar ${serviceType.title} Ahora`}
            onPress={handleSubmitRequest}
            variant="primary"
            size="lg"
            style={[styles.submitButton, { backgroundColor: serviceType.color }]}
            disabled={isLoading}
          />

          <View style={styles.estimateCard}>
            <Ionicons name="time" size={16} color={theme.colors.warning} />
            <Text style={styles.estimateText}>Tiempo estimado de llegada: 15-30 minutos</Text>
          </View>
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
  locationButton: {
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
  locationCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  locationInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  locationText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  updateLocationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  coordinatesText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  disabledText: {
    opacity: 0.5,
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
  dropdown: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  dropdownText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  dropdownPlaceholder: {
    color: theme.colors.text.muted,
  },
  problemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  problemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  },
  submitSection: {
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  estimateText: {
    fontSize: theme.fontSize.sm,
    color: '#92400e',
    fontWeight: theme.fontWeight.medium as any,
  },
});

export default EmergencyRequestScreen;