import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { theme } from '../../constants/theme';
import {
  getAllParkingLocations,
  ParkingLocation,
  forceReinitializeParkingData
} from '../../services/parkingLocationService';
import {
  updateParkingLocation,
  deleteParkingLocation,
  toggleLocationStatus,
  searchLocations,
} from '../../services/adminService';

interface LocationManagementScreenProps {
  navigation: any;
}

export const LocationManagementScreen: React.FC<LocationManagementScreenProps> = ({ navigation }) => {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<ParkingLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [searchQuery, locations]);

  const filterLocations = () => {
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const filtered = locations.filter(location =>
        location.name.toLowerCase().includes(searchLower) ||
        location.address.toLowerCase().includes(searchLower)
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  };

  const loadLocations = async () => {
    try {
      console.log('ADMIN: Loading parking locations for management...');
      const parkingLocations = await getAllParkingLocations();
      setLocations(parkingLocations);
      console.log('ADMIN: Loaded', parkingLocations.length, 'locations for management');
    } catch (error) {
      console.error('Error loading locations for admin:', error);
      Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const handleLocationEdit = (location: ParkingLocation) => {
    navigation.navigate('LocationEdit', { location });
  };

  const handleToggleLocationStatus = async (location: ParkingLocation) => {
    const action = location.isActive ? 'desactivar' : 'activar';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Ubicación`,
      `¿Estás seguro de ${action} ${location.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await toggleLocationStatus(location.id, !location.isActive);
              await loadLocations();
              Alert.alert('Éxito', `Ubicación ${action}da correctamente`);
            } catch (error) {
              console.error('Error toggling location status:', error);
              Alert.alert('Error', `No se pudo ${action} la ubicación`);
            }
          }
        },
      ]
    );
  };

  const handleDeleteLocation = async (location: ParkingLocation) => {
    Alert.alert(
      'Eliminar Ubicación',
      `¿Estás seguro de eliminar ${location.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParkingLocation(location.id);
              await loadLocations();
              Alert.alert('Éxito', 'Ubicación eliminada correctamente');
            } catch (error: any) {
              console.error('Error deleting location:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar la ubicación');
            }
          }
        },
      ]
    );
  };

  const handleAddLocation = () => {
    Alert.alert(
      'Agregar Ubicación',
      'Función en desarrollo',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reinicializar Datos',
      '¿Estás seguro de que quieres reinicializar todos los datos de ubicaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reinicializar',
          style: 'destructive',
          onPress: async () => {
            await forceReinitializeParkingData();
            await loadLocations();
            Alert.alert('Éxito', 'Datos reinicializados correctamente');
          }
        },
      ]
    );
  };

  const getStatusColor = (location: ParkingLocation) => {
    if (!location.isActive) return theme.colors.text.muted;
    const percentage = (location.availableSpots / location.totalSpots) * 100;
    if (percentage > 50) return theme.colors.success;
    if (percentage > 20) return '#f59e0b';
    return theme.colors.error;
  };

  const getStatusText = (location: ParkingLocation) => {
    if (!location.isActive) return 'Inactiva';
    const percentage = (location.availableSpots / location.totalSpots) * 100;
    if (percentage > 50) return 'Disponible';
    if (percentage > 20) return 'Ocupado';
    return 'Lleno';
  };

  const handleGoBack = () => {
    // Check if we can go back in the current stack
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If we can't go back, navigate to Settings tab
      navigation.navigate('Settings', { screen: 'AdminSettings' });
    }
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
            <Text style={styles.headerTitle}>Gestión de Ubicaciones</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddLocation}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{locations.length}</Text>
            <Text style={styles.statLabel}>Ubicaciones</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {locations.filter(loc => loc.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Activas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {locations.reduce((sum, loc) => sum + loc.totalSpots, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Espacios</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {locations.reduce((sum, loc) => sum + loc.availableSpots, 0)}
            </Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleResetData}>
            <Ionicons name="refresh-circle-outline" size={16} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Reinicializar</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={theme.colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ubicación..."
            placeholderTextColor={theme.colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Ubicaciones ({filteredLocations.length})</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
          </View>
        ) : filteredLocations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={theme.colors.text.muted} />
            <Text style={styles.emptyText}>No se encontraron ubicaciones</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Intenta con otro término de búsqueda' : 'Agrega tu primera ubicación'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.locationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationCard}
                onPress={() => handleLocationEdit(location)}
              >
                <View style={styles.locationHeader}>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationAddress}>{location.address}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(location) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(location) }
                    ]}>
                      {getStatusText(location)}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="car-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={styles.detailText}>
                        {location.availableSpots}/{location.totalSpots} espacios
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={styles.detailText}>L {location.hourlyRate}/hora</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={styles.detailText}>
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={styles.detailText}>ID: {location.id}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.locationActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleLocationEdit(location)}
                  >
                    <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={location.isActive ? styles.deactivateButton : styles.activateButton}
                    onPress={() => handleToggleLocationStatus(location)}
                  >
                    <Ionicons
                      name={location.isActive ? "pause-outline" : "play-outline"}
                      size={16}
                      color={location.isActive ? theme.colors.warning : theme.colors.success}
                    />
                    <Text style={styles.actionButtonText}>
                      {location.isActive ? 'Desactivar' : 'Activar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteLocation(location)}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  statsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium as any,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
  },
  locationDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
    flex: 1,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
    flex: 1,
    marginLeft: theme.spacing.xs,
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    ...theme.shadows.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#fbbf24',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    justifyContent: 'center',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#10b981',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    justifyContent: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
  },
});

export default LocationManagementScreen;