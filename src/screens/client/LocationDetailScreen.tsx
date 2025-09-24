import React, { useState, useEffect } from 'react';
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
import { theme } from '../../constants/theme';
import {
  ParkingLocation,
  LocationPackage,
  getPackagesByLocation
} from '../../services/parkingLocationService';

interface LocationDetailScreenProps {
  navigation: any;
  route: {
    params: {
      location: ParkingLocation;
    };
  };
}

export const LocationDetailScreen: React.FC<LocationDetailScreenProps> = ({ navigation, route }) => {
  const { location } = route.params;
  const [packages, setPackages] = useState<LocationPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocationPackages();
  }, []);

  const loadLocationPackages = async () => {
    try {
      console.log('CLIENT: Loading packages for location', location.id);
      const locationPackages = await getPackagesByLocation(location.id);
      setPackages(locationPackages);
      console.log('CLIENT: Loaded', locationPackages.length, 'packages');
    } catch (error) {
      console.error('Error loading location packages:', error);
      Alert.alert('Error', 'No se pudieron cargar los paquetes');
    } finally {
      setLoading(false);
    }
  };

  const handlePackagePurchase = (pkg: LocationPackage) => {
    console.log('CLIENT: Purchasing package', pkg.name, 'for location', location.name);
    navigation.navigate('PaymentMethod', {
      package: {
        ...pkg,
        locationName: location.name,
        locationAddress: location.address
      }
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return theme.colors.success;
    if (percentage > 20) return '#f59e0b';
    return theme.colors.error;
  };

  const getAvailabilityText = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'Buena disponibilidad';
    if (percentage > 20) return 'Disponibilidad limitada';
    return 'Casi lleno';
  };

  const formatMinutes = (minutes: number) => {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      return `${days} día${days > 1 ? 's' : ''}`;
    } else if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    } else {
      return `${minutes} min`;
    }
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.primary, '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{location.name}</Text>
              <Text style={styles.headerAddress}>{location.address}</Text>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="car-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoValue}>{location.availableSpots}/{location.totalSpots}</Text>
                <Text style={styles.infoLabel}>Espacios</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoValue}>L {location.hourlyRate}</Text>
                <Text style={styles.infoLabel}>Por hora</Text>
              </View>
            </View>
          </View>

          <View style={styles.availabilityContainer}>
            <View style={[
              styles.availabilityDot,
              { backgroundColor: getAvailabilityColor(location.availableSpots, location.totalSpots) }
            ]} />
            <Text style={[
              styles.availabilityText,
              { color: getAvailabilityColor(location.availableSpots, location.totalSpots) }
            ]}>
              {getAvailabilityText(location.availableSpots, location.totalSpots)}
            </Text>
          </View>

          <Text style={styles.description}>{location.description}</Text>
        </View>

        {/* Packages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paquetes de Tiempo</Text>
          <Text style={styles.sectionSubtitle}>
            Compra tiempo prepagado con descuentos especiales
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando paquetes...</Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={theme.colors.text.muted} />
              <Text style={styles.emptyText}>No hay paquetes disponibles</Text>
            </View>
          ) : (
            <View style={styles.packagesGrid}>
              {packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    pkg.isPopular && styles.popularPackageCard
                  ]}
                  onPress={() => handlePackagePurchase(pkg)}
                >
                  {pkg.isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageDuration}>{formatMinutes(pkg.minutes)}</Text>
                  </View>

                  <View style={styles.packagePricing}>
                    <Text style={styles.packagePrice}>L {pkg.price}</Text>
                    {pkg.discount > 0 && (
                      <View style={styles.priceDetails}>
                        <Text style={styles.originalPrice}>L {pkg.originalPrice}</Text>
                        <Text style={styles.discount}>-{pkg.discount}%</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.packageDescription}>{pkg.description}</Text>

                  <View style={styles.packageActions}>
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => handlePackagePurchase(pkg)}
                    >
                      <Ionicons name="card-outline" size={16} color="white" />
                      <Text style={styles.buyButtonText}>Comprar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Pay Per Use Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pago por Uso</Text>
          <View style={styles.payPerUseCard}>
            <View style={styles.payPerUseInfo}>
              <Text style={styles.payPerUseTitle}>Sin paquetes</Text>
              <Text style={styles.payPerUseDescription}>
                Paga directamente por el tiempo que uses
              </Text>
              <Text style={styles.payPerUseRate}>L {location.hourlyRate}/hora</Text>
            </View>
            <TouchableOpacity
              style={styles.payPerUseButton}
              onPress={() => Alert.alert('Funcionalidad', 'Próximamente disponible')}
            >
              <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.payPerUseButtonText}>Usar ahora</Text>
            </TouchableOpacity>
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
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  headerAddress: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    alignItems: 'flex-start',
  },
  infoValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  availabilityText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  packagesGrid: {
    gap: theme.spacing.md,
  },
  packageCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
    position: 'relative',
  },
  popularPackageCard: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  popularBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
  },
  packageHeader: {
    marginBottom: theme.spacing.md,
  },
  packageName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  packageDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  packagePricing: {
    marginBottom: theme.spacing.md,
  },
  packagePrice: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  priceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.sm,
  },
  discount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.success,
  },
  packageDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  packageActions: {
    alignItems: 'flex-end',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  buyButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: 'white',
    marginLeft: theme.spacing.xs,
  },
  payPerUseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payPerUseInfo: {
    flex: 1,
  },
  payPerUseTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  payPerUseDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  payPerUseRate: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  payPerUseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
  },
  payPerUseButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
});

export default LocationDetailScreen;