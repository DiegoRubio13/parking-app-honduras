import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
// Temporarily disabled for Expo Go compatibility
const MapView: any = null;
const Marker: any = null;
const PROVIDER_GOOGLE: any = null;
const Callout: any = null;
type Region = any;
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { MapFilters } from '../../components/MapFilters';
import { theme } from '../../constants/theme';
import {
  searchParkingLocations,
  LocationFilters,
  LocationWithDistance,
} from '../../services/parkingLocationService';
import {
  getCurrentLocation,
  requestLocationPermission,
  formatDistance,
  Coordinates,
} from '../../utils/locationHelpers';

interface MapScreenProps {
  navigation: any;
}

// Tegucigalpa default coordinates
const DEFAULT_REGION: Region = {
  latitude: 14.0723,
  longitude: -87.1921,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const mapRef = useRef<any>(null); // Temporarily disabled for Expo Go
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDistance | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [filters, setFilters] = useState<LocationFilters>({
    sortBy: 'name',
  });
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    loadParkingLocations();
  }, [filters, userLocation]);

  const initializeMap = async () => {
    try {
      console.log('Initializing map with GPS...');

      // Request location permission
      const permission = await requestLocationPermission();
      setLocationPermissionGranted(permission.granted);

      if (permission.granted) {
        // Get user's current location
        const currentLocation = await getCurrentLocation();
        if (currentLocation) {
          setUserLocation(currentLocation);
          setFilters((prev) => ({
            ...prev,
            userLocation: currentLocation,
            sortBy: 'distance',
          }));

          // Center map on user location
          setRegion({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          mapRef.current?.animateToRegion({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      } else {
        console.log('Location permission not granted, using default region');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      Alert.alert('Error', 'No se pudo inicializar el mapa');
    }
  };

  const loadParkingLocations = async () => {
    try {
      setLoading(true);
      console.log('Loading parking locations with filters:', filters);

      const parkingLocations = await searchParkingLocations(filters);
      setLocations(parkingLocations);

      console.log('Loaded', parkingLocations.length, 'parking locations');
    } catch (error) {
      console.error('Error loading parking locations:', error);
      Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPress = (location: LocationWithDistance) => {
    setSelectedLocation(location);

    // Animate to location
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  };

  const handleMyLocationPress = async () => {
    if (!locationPermissionGranted) {
      const permission = await requestLocationPermission();
      if (!permission.granted) return;
      setLocationPermissionGranted(true);
    }

    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setUserLocation(currentLocation);
      setFilters((prev) => ({
        ...prev,
        userLocation: currentLocation,
        sortBy: 'distance',
      }));

      mapRef.current?.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  const handleNavigateToLocation = async (location: LocationWithDistance) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    const url = Platform.select({
      ios: `${scheme}${location.name}@${location.latitude},${location.longitude}`,
      android: `${scheme}${location.latitude},${location.longitude}(${location.name})`,
    });

    try {
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
        }
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
      Alert.alert('Error', 'No se pudo abrir la navegación');
    }
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return theme.colors.success;
    if (percentage > 20) return '#f59e0b'; // amber
    return theme.colors.error;
  };

  const getMarkerColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return '#10b981'; // green
    if (percentage > 20) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const handleGoBack = () => {
    navigation.goBack();
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
            <Text style={styles.headerTitle}>Mapa de Estacionamientos</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Map View - Temporarily disabled for Expo Go */}
        <View style={styles.mapContainer}>
          <View style={[styles.map, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="map-outline" size={80} color="#9ca3af" />
            <Text style={{ marginTop: 16, fontSize: 18, color: '#6b7280' }}>Mapa no disponible en Expo Go</Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: '#9ca3af' }}>Use la lista para ver ubicaciones</Text>
          </View>

          {/* My Location Button */}
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={handleMyLocationPress}
          >
            <Ionicons
              name="locate"
              size={24}
              color={locationPermissionGranted ? theme.colors.primary : theme.colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Map Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Limitado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Lleno</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <MapFilters
          filters={filters}
          onFiltersChange={setFilters}
          hasUserLocation={userLocation !== null}
        />

        {/* Locations List */}
        <View style={styles.locationsContainer}>
          <View style={styles.locationsHeader}>
            <Text style={styles.sectionTitle}>
              {locations.length} Ubicacion{locations.length !== 1 ? 'es' : ''}
            </Text>
            {userLocation && (
              <Text style={styles.locationHint}>
                Ordenado por {filters.sortBy === 'distance' ? 'distancia' : filters.sortBy === 'price' ? 'precio' : filters.sortBy === 'availability' ? 'disponibilidad' : 'nombre'}
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
            </View>
          ) : locations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color={theme.colors.text.secondary} />
              <Text style={styles.emptyText}>No se encontraron ubicaciones</Text>
              <Text style={styles.emptySubtext}>Intenta ajustar los filtros</Text>
            </View>
          ) : (
            <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationCard,
                    selectedLocation?.id === location.id && styles.locationCardSelected,
                  ]}
                  onPress={() => handleLocationPress(location)}
                >
                  <View style={styles.locationHeader}>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationAddress}>{location.address}</Text>
                    </View>
                    <View style={styles.availabilityBadge}>
                      <View
                        style={[
                          styles.availabilityDot,
                          {
                            backgroundColor: getAvailabilityColor(
                              location.availableSpots,
                              location.totalSpots
                            ),
                          },
                        ]}
                      />
                      <Text style={styles.availabilityText}>
                        {location.availableSpots}/{location.totalSpots}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={styles.detailText}>L {location.hourlyRate}/h</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="car-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={styles.detailText}>{location.availableSpots} disponibles</Text>
                    </View>
                    {location.distance !== undefined && (
                      <View style={styles.detailItem}>
                        <Ionicons name="navigate-outline" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{formatDistance(location.distance)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.locationActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleNavigateToLocation(location)}
                    >
                      <Ionicons name="navigate" size={16} color={theme.colors.primary} />
                      <Text style={styles.actionButtonText}>Navegar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('LocationDetail', { location })}
                    >
                      <Ionicons name="card-outline" size={16} color={theme.colors.primary} />
                      <Text style={styles.actionButtonText}>Ver Paquetes</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
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
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    height: 300,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.md,
  },
  map: {
    flex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  legendContainer: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.primary,
  },
  calloutContainer: {
    width: 200,
    padding: theme.spacing.sm,
  },
  calloutTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  calloutAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  calloutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  calloutText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
  },
  calloutDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
    marginTop: theme.spacing.xs,
  },
  locationsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  locationsHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  locationHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  locationsList: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  locationCardSelected: {
    borderColor: theme.colors.primary,
    ...theme.shadows.md,
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
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
    color: theme.colors.text.primary,
  },
  locationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  locationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
  },
});

export default MapScreen;