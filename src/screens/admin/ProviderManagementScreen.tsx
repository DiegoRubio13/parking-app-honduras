import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface ProviderManagementScreenProps {
  navigation: any;
}

interface ServiceProvider {
  id: string;
  name: string;
  type: 'tow' | 'tire' | 'locksmith' | 'mechanic' | 'battery' | 'general';
  phone: string;
  email: string;
  rating: number;
  commissionRate: number;
  isActive: boolean;
  completedJobs: number;
  responseTime: number;
  coverage: string[];
  schedule: string;
}

const serviceProviders: ServiceProvider[] = [
  {
    id: 'prov-001',
    name: 'Grúas del Centro',
    type: 'tow',
    phone: '+504 9999-1111',
    email: 'contacto@gruascentro.hn',
    rating: 4.8,
    commissionRate: 15,
    isActive: true,
    completedJobs: 145,
    responseTime: 12,
    coverage: ['Tegucigalpa', 'Comayagüela'],
    schedule: '24/7',
  },
  {
    id: 'prov-002',
    name: 'Vulcanizadora Express',
    type: 'tire',
    phone: '+504 8888-2222',
    email: 'info@vulcaexpress.hn',
    rating: 4.5,
    commissionRate: 20,
    isActive: true,
    completedJobs: 89,
    responseTime: 18,
    coverage: ['Tegucigalpa'],
    schedule: '6:00 AM - 10:00 PM',
  },
  {
    id: 'prov-003',
    name: 'Cerrajería Rápida',
    type: 'locksmith',
    phone: '+504 7777-3333',
    email: 'servicio@cerrajerirapida.hn',
    rating: 4.3,
    commissionRate: 25,
    isActive: true,
    completedJobs: 67,
    responseTime: 15,
    coverage: ['Tegucigalpa', 'San Pedro Sula'],
    schedule: '24/7',
  },
  {
    id: 'prov-004',
    name: 'Taller Mecánico JM',
    type: 'mechanic',
    phone: '+504 6666-4444',
    email: 'contacto@tallerjm.hn',
    rating: 4.6,
    commissionRate: 18,
    isActive: false,
    completedJobs: 23,
    responseTime: 25,
    coverage: ['Tegucigalpa'],
    schedule: '7:00 AM - 6:00 PM',
  },
  {
    id: 'prov-005',
    name: 'Auto Eléctrico Pro',
    type: 'battery',
    phone: '+504 5555-5555',
    email: 'ventas@autoelectrico.hn',
    rating: 4.7,
    commissionRate: 22,
    isActive: true,
    completedJobs: 134,
    responseTime: 14,
    coverage: ['Tegucigalpa', 'Comayagüela', 'Choloma'],
    schedule: '24/7',
  },
];

export const ProviderManagementScreen: React.FC<ProviderManagementScreenProps> = ({ navigation }) => {
  const [providers, setProviders] = useState<ServiceProvider[]>(serviceProviders);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleToggleProvider = (providerId: string) => {
    setProviders(prev =>
      prev.map(provider =>
        provider.id === providerId
          ? { ...provider, isActive: !provider.isActive }
          : provider
      )
    );
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    Alert.alert(
      'Editar Proveedor',
      `Configurar ${provider.name}`,
      [
        {
          text: 'Editar Comisión',
          onPress: () => editCommission(provider.id, provider.commissionRate),
        },
        {
          text: 'Ver Detalles',
          onPress: () => viewProviderDetails(provider),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const editCommission = (providerId: string, currentRate: number) => {
    Alert.prompt(
      'Editar Comisión',
      `Comisión actual: ${currentRate}%\nIngresa la nueva comisión:`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: (newRate) => {
            const rate = parseFloat(newRate || '0');
            if (rate >= 0 && rate <= 50) {
              setProviders(prev =>
                prev.map(provider =>
                  provider.id === providerId
                    ? { ...provider, commissionRate: rate }
                    : provider
                )
              );
              Alert.alert('Éxito', 'Comisión actualizada correctamente');
            } else {
              Alert.alert('Error', 'La comisión debe estar entre 0% y 50%');
            }
          },
        },
      ],
      'plain-text',
      currentRate.toString()
    );
  };

  const viewProviderDetails = (provider: ServiceProvider) => {
    Alert.alert(
      `Detalles de ${provider.name}`,
      `
Tipo: ${getServiceTypeName(provider.type)}
Calificación: ${provider.rating}/5 ⭐
Trabajos completados: ${provider.completedJobs}
Tiempo de respuesta: ${provider.responseTime} min
Cobertura: ${provider.coverage.join(', ')}
Horario: ${provider.schedule}
Email: ${provider.email}
      `.trim()
    );
  };

  const handleAddProvider = () => {
    Alert.alert(
      'Agregar Proveedor',
      'Selecciona el tipo de servicio:',
      [
        { text: 'Grúa', onPress: () => addProviderForm('tow') },
        { text: 'Llanta', onPress: () => addProviderForm('tire') },
        { text: 'Cerrajería', onPress: () => addProviderForm('locksmith') },
        { text: 'Mecánico', onPress: () => addProviderForm('mechanic') },
        { text: 'Batería', onPress: () => addProviderForm('battery') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const addProviderForm = (type: ServiceProvider['type']) => {
    Alert.alert('Nuevo Proveedor', `Función para agregar proveedor de ${getServiceTypeName(type)} en desarrollo`);
  };

  const getServiceTypeName = (type: ServiceProvider['type']) => {
    const names = {
      tow: 'Grúa',
      tire: 'Llanta',
      locksmith: 'Cerrajería',
      mechanic: 'Mecánico',
      battery: 'Batería',
      general: 'General',
    };
    return names[type];
  };

  const getServiceTypeIcon = (type: ServiceProvider['type']) => {
    const icons = {
      tow: 'car-outline',
      tire: 'radio-button-off-outline',
      locksmith: 'key-outline',
      mechanic: 'construct-outline',
      battery: 'battery-dead-outline',
      general: 'build-outline',
    };
    return icons[type];
  };

  const getServiceTypeColor = (type: ServiceProvider['type']) => {
    const colors = {
      tow: '#dc2626',
      tire: '#ea580c',
      locksmith: '#ca8a04',
      mechanic: '#2563eb',
      battery: '#16a34a',
      general: '#7c2d12',
    };
    return colors[type];
  };

  const ProviderCard = ({ provider }: { provider: ServiceProvider }) => (
    <View style={[styles.providerCard, !provider.isActive && styles.inactiveCard]}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <View style={[styles.serviceIcon, { backgroundColor: `${getServiceTypeColor(provider.type)}15` }]}>
            <Ionicons
              name={getServiceTypeIcon(provider.type) as any}
              size={24}
              color={getServiceTypeColor(provider.type)}
            />
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerType}>{getServiceTypeName(provider.type)}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.rating}>{provider.rating}</Text>
              <Text style={styles.completedJobs}>({provider.completedJobs} trabajos)</Text>
            </View>
          </View>
        </View>
        <Switch
          value={provider.isActive}
          onValueChange={() => handleToggleProvider(provider.id)}
          trackColor={{ false: theme.colors.muted, true: `${theme.colors.success}50` }}
          thumbColor={provider.isActive ? theme.colors.success : theme.colors.text.muted}
        />
      </View>

      <View style={styles.providerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.commissionRate}%</Text>
          <Text style={styles.statLabel}>Comisión</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.responseTime} min</Text>
          <Text style={styles.statLabel}>Respuesta</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.coverage.length}</Text>
          <Text style={styles.statLabel}>Ciudades</Text>
        </View>
      </View>

      <View style={styles.providerContact}>
        <Text style={styles.contactPhone}>{provider.phone}</Text>
        <Text style={styles.contactSchedule}>{provider.schedule}</Text>
      </View>

      <View style={styles.providerActions}>
        <Button
          title="Editar"
          onPress={() => handleEditProvider(provider)}
          variant="outline"
          size="sm"
          style={styles.editButton}
        />
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={16} color="white" />
          <Text style={styles.callButtonText}>Llamar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeProviders = providers.filter(p => p.isActive);
  const inactiveProviders = providers.filter(p => !p.isActive);

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
            <Text style={styles.headerTitle}>Gestión de Proveedores</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddProvider}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Red de servicios de emergencia</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeProviders.length}</Text>
            <Text style={styles.summaryLabel}>Proveedores Activos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {(activeProviders.reduce((sum, p) => sum + p.rating, 0) / activeProviders.length || 0).toFixed(1)}
            </Text>
            <Text style={styles.summaryLabel}>Rating Promedio</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {Math.round(activeProviders.reduce((sum, p) => sum + p.responseTime, 0) / activeProviders.length || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Tiempo Promedio</Text>
          </View>
        </View>

        {/* Active Providers */}
        <View style={styles.providersSection}>
          <Text style={styles.sectionTitle}>Proveedores Activos ({activeProviders.length})</Text>
          {activeProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </View>

        {/* Inactive Providers */}
        {inactiveProviders.length > 0 && (
          <View style={styles.providersSection}>
            <Text style={styles.sectionTitle}>Proveedores Inactivos ({inactiveProviders.length})</Text>
            {inactiveProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </View>
        )}

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
  addButton: {
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
  summarySection: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  summaryValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  providersSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  providerCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  inactiveCard: {
    opacity: 0.7,
    borderColor: theme.colors.muted,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  providerType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  completedJobs: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.blue[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  providerContact: {
    marginBottom: theme.spacing.md,
  },
  contactPhone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
    marginBottom: theme.spacing.xs,
  },
  contactSchedule: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  providerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  callButtonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
  },
});

export default ProviderManagementScreen;