import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface PricingInfoScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  timeUnit: string;
  maxTime: string;
  features: string[];
  color: string;
  popular?: boolean;
}

interface LocationPricing {
  id: string;
  name: string;
  zone: 'premium' | 'standard' | 'economic';
  address: string;
  baseRate: number;
  hourlyRate: number;
  maxDaily: number;
  availability: string;
}

export const PricingInfoScreen: React.FC<PricingInfoScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'rates' | 'locations' | 'plans'>('rates');

  const pricingTiers: PricingTier[] = [
    {
      id: 'hourly',
      name: 'Pago por Hora',
      description: 'Ideal para estacionamientos cortos',
      basePrice: 25,
      currency: 'L',
      timeUnit: 'hora',
      maxTime: 'Sin límite',
      features: [
        'Pago solo por tiempo usado',
        'Sin compromisos',
        'Acceso a todos los estacionamientos',
        'Soporte 24/7',
      ],
      color: theme.colors.blue[500],
    },
    {
      id: 'daily',
      name: 'Tarifa Diaria',
      description: 'Perfecto para días completos',
      basePrice: 150,
      currency: 'L',
      timeUnit: 'día',
      maxTime: '24 horas',
      features: [
        'Tarifa fija por día completo',
        'Entrada y salida ilimitada',
        'Ahorro hasta 40% vs. tarifa horaria',
        'Reserva garantizada',
      ],
      color: theme.colors.blue[600],
      popular: true,
    },
    {
      id: 'monthly',
      name: 'Plan Mensual',
      description: 'La mejor opción para uso frecuente',
      basePrice: 2500,
      currency: 'L',
      timeUnit: 'mes',
      maxTime: '30 días',
      features: [
        'Acceso ilimitado por 30 días',
        'Espacio reservado garantizado',
        'Máximo ahorro - hasta 60%',
        'Soporte prioritario',
        'Facturación empresarial disponible',
      ],
      color: theme.colors.blue[700],
    },
  ];

  const locationPricings: LocationPricing[] = [
    {
      id: '1',
      name: 'Centro Comercial Multiplaza',
      zone: 'premium',
      address: 'Boulevard Morazán, Tegucigalpa',
      baseRate: 30,
      hourlyRate: 35,
      maxDaily: 200,
      availability: '24/7',
    },
    {
      id: '2',
      name: 'Hospital Viera',
      zone: 'standard',
      address: 'Colonia Palmira, Tegucigalpa',
      baseRate: 25,
      hourlyRate: 30,
      maxDaily: 150,
      availability: '6:00 AM - 10:00 PM',
    },
    {
      id: '3',
      name: 'Universidad Nacional',
      zone: 'economic',
      address: 'Ciudad Universitaria, Tegucigalpa',
      baseRate: 15,
      hourlyRate: 20,
      maxDaily: 80,
      availability: '6:00 AM - 9:00 PM',
    },
    {
      id: '4',
      name: 'Aeropuerto Toncontín',
      zone: 'premium',
      address: 'Aeropuerto Internacional, Tegucigalpa',
      baseRate: 40,
      hourlyRate: 45,
      maxDaily: 300,
      availability: '24/7',
    },
    {
      id: '5',
      name: 'Centro Histórico',
      zone: 'standard',
      address: 'Parque Central, Tegucigalpa',
      baseRate: 20,
      hourlyRate: 25,
      maxDaily: 120,
      availability: '7:00 AM - 8:00 PM',
    },
  ];

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'premium': return theme.colors.blue[700];
      case 'standard': return theme.colors.blue[500];
      case 'economic': return theme.colors.blue[300];
      default: return theme.colors.text.secondary;
    }
  };

  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case 'premium': return 'Premium';
      case 'standard': return 'Estándar';
      case 'economic': return 'Económico';
      default: return zone;
    }
  };

  const handleSelectPlan = (planId: string) => {
    Alert.alert(
      'Seleccionar Plan',
      `¿Deseas activar el plan ${pricingTiers.find(p => p.id === planId)?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Seleccionar',
          onPress: () => {
            // TODO: Navigate to payment or plan selection
            Alert.alert('Función en desarrollo', 'La activación de planes estará disponible pronto.');
          },
        },
      ]
    );
  };

  const renderRatesTab = () => (
    <View style={styles.ratesContainer}>
      <Text style={styles.sectionTitle}>Planes de Estacionamiento</Text>
      <Text style={styles.sectionDescription}>
        Elige el plan que mejor se adapte a tus necesidades de estacionamiento.
      </Text>

      {pricingTiers.map((tier) => (
        <View key={tier.id} style={styles.pricingCard}>
          {tier.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MÁS POPULAR</Text>
            </View>
          )}
          
          <LinearGradient
            colors={[`${tier.color}15`, `${tier.color}05`]}
            style={styles.cardContent}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.planName}>{tier.name}</Text>
              <Text style={styles.planDescription}>{tier.description}</Text>
            </View>

            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>{tier.currency}</Text>
                <Text style={styles.price}>{tier.basePrice}</Text>
                <Text style={styles.timeUnit}>/{tier.timeUnit}</Text>
              </View>
              <Text style={styles.maxTime}>Máximo: {tier.maxTime}</Text>
            </View>

            <View style={styles.featuresSection}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={tier.color} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <Button
              title={tier.popular ? "SELECCIONAR PLAN" : "VER DETALLES"}
              onPress={() => handleSelectPlan(tier.id)}
              variant={tier.popular ? "primary" : "outline"}
              size="md"
              style={styles.selectButton}
            />
          </LinearGradient>
        </View>
      ))}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={theme.colors.blue[600]} />
        <Text style={styles.infoText}>
          Los precios pueden variar según la ubicación y demanda. Consulta las tarifas específicas por ubicación.
        </Text>
      </View>
    </View>
  );

  const renderLocationsTab = () => (
    <View style={styles.locationsContainer}>
      <Text style={styles.sectionTitle}>Tarifas por Ubicación</Text>
      <Text style={styles.sectionDescription}>
        Consulta las tarifas específicas de cada ubicación disponible.
      </Text>

      {locationPricings.map((location) => (
        <View key={location.id} style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationAddress}>{location.address}</Text>
            </View>
            <View style={[styles.zoneBadge, { backgroundColor: getZoneColor(location.zone) }]}>
              <Text style={styles.zoneText}>{getZoneLabel(location.zone)}</Text>
            </View>
          </View>

          <View style={styles.pricingDetails}>
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Primera hora</Text>
                <Text style={styles.priceValue}>L {location.baseRate}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Hora adicional</Text>
                <Text style={styles.priceValue}>L {location.hourlyRate}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Máximo diario</Text>
                <Text style={styles.priceValue}>L {location.maxDaily}</Text>
              </View>
            </View>
          </View>

          <View style={styles.locationFooter}>
            <View style={styles.availabilityInfo}>
              <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.availabilityText}>{location.availability}</Text>
            </View>
            <TouchableOpacity style={styles.directionsButton}>
              <Ionicons name="navigate" size={16} color={theme.colors.blue[600]} />
              <Text style={styles.directionsText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPlansTab = () => (
    <View style={styles.plansContainer}>
      <Text style={styles.sectionTitle}>Comparación de Planes</Text>
      <Text style={styles.sectionDescription}>
        Compara las características de cada plan para tomar la mejor decisión.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.comparisonScroll}>
        <View style={styles.comparisonTable}>
          {/* Header */}
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonCell}>
              <Text style={styles.comparisonHeaderText}>Característica</Text>
            </View>
            {pricingTiers.map((tier) => (
              <View key={tier.id} style={styles.comparisonCell}>
                <Text style={styles.comparisonHeaderText}>{tier.name}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {[
            { label: 'Precio', values: pricingTiers.map(t => `L ${t.basePrice}/${t.timeUnit}`) },
            { label: 'Tiempo máximo', values: pricingTiers.map(t => t.maxTime) },
            { label: 'Entrada/Salida', values: ['Ilimitada', 'Ilimitada', 'Ilimitada'] },
            { label: 'Soporte', values: ['24/7', '24/7', 'Prioritario'] },
            { label: 'Reserva', values: ['No', 'Garantizada', 'Garantizada'] },
            { label: 'Facturación', values: ['Individual', 'Individual', 'Empresarial'] },
          ].map((row, index) => (
            <View key={index} style={styles.comparisonRow}>
              <View style={styles.comparisonCell}>
                <Text style={styles.comparisonLabel}>{row.label}</Text>
              </View>
              {row.values.map((value, cellIndex) => (
                <View key={cellIndex} style={styles.comparisonCell}>
                  <Text style={styles.comparisonValue}>{value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.recommendationCard}>
        <LinearGradient
          colors={[theme.colors.blue[500], theme.colors.blue[600]]}
          style={styles.recommendationGradient}
        >
          <Ionicons name="bulb" size={24} color="white" />
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Recomendación</Text>
            <Text style={styles.recommendationText}>
              Si usas el estacionamiento más de 6 horas al día, el plan diario te ahorrará dinero.
              Para uso frecuente (más de 15 días al mes), el plan mensual es la mejor opción.
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Información de Tarifas</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rates' && styles.activeTab]}
            onPress={() => setActiveTab('rates')}
          >
            <Text style={[styles.tabText, activeTab === 'rates' && styles.activeTabText]}>
              Planes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
            onPress={() => setActiveTab('locations')}
          >
            <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>
              Ubicaciones
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, activeTab === 'plans' && styles.activeTabText]}>
              Comparar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'rates' && renderRatesTab()}
          {activeTab === 'locations' && renderLocationsTab()}
          {activeTab === 'plans' && renderPlansTab()}
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
  tabNavigation: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    ...theme.shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.blue[600],
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: 'white',
    fontWeight: theme.fontWeight.bold as any,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  // Rates Tab Styles
  ratesContainer: {
    marginBottom: theme.spacing.xl,
  },
  pricingCard: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: theme.colors.blue[700],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  cardHeader: {
    marginBottom: theme.spacing.lg,
  },
  planName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  planDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  price: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.xs,
  },
  timeUnit: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  maxTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  featuresSection: {
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  selectButton: {
    width: '100%',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
    flex: 1,
    lineHeight: 18,
  },
  // Locations Tab Styles
  locationsContainer: {
    marginBottom: theme.spacing.xl,
  },
  locationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  zoneBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  zoneText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
  },
  pricingDetails: {
    marginBottom: theme.spacing.md,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  priceValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.blue[50],
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.blue[600],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium as any,
  },
  // Plans Tab Styles
  plansContainer: {
    marginBottom: theme.spacing.xl,
  },
  comparisonScroll: {
    marginBottom: theme.spacing.xl,
  },
  comparisonTable: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.blue[50],
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[50],
  },
  comparisonCell: {
    width: 120,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  comparisonHeaderText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  comparisonLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  comparisonValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  recommendationCard: {
    marginTop: theme.spacing.lg,
  },
  recommendationGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  recommendationContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  recommendationTitle: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});

export default PricingInfoScreen;