import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

/**
 * Request location permissions for both iOS and Android
 * Handles permission workflow and user messaging
 */
export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    console.log('Requesting location permission...');

    // Request foreground permissions
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    console.log('Location permission status:', status);

    if (status === 'granted') {
      return {
        granted: true,
        canAskAgain,
        status,
      };
    }

    // Permission denied
    if (!canAskAgain) {
      Alert.alert(
        'Permiso de Ubicación Requerido',
        'ParKing necesita acceso a tu ubicación para mostrarte estacionamientos cercanos. Por favor, habilita el permiso de ubicación en la configuración de tu dispositivo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configuración', onPress: () => Location.openSettings?.() },
        ]
      );
    } else {
      Alert.alert(
        'Permiso de Ubicación Denegado',
        'Sin acceso a tu ubicación, no podremos mostrarte los estacionamientos más cercanos.',
        [{ text: 'OK' }]
      );
    }

    return {
      granted: false,
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    Alert.alert('Error', 'No se pudo solicitar el permiso de ubicación');
    return {
      granted: false,
      canAskAgain: false,
      status: 'error',
    };
  }
};

/**
 * Check current location permission status without requesting
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'error',
    };
  }
};

/**
 * Get current user location
 * Returns null if permission is denied or location unavailable
 */
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    // Check permission first
    const permission = await checkLocationPermission();

    if (!permission.granted) {
      console.log('Location permission not granted, requesting...');
      const newPermission = await requestLocationPermission();

      if (!newPermission.granted) {
        return null;
      }
    }

    console.log('Getting current location...');

    // Get current position with high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    });

    console.log('Current location:', location.coords);

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * Shows in meters if less than 1km, otherwise in kilometers
 */
export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

/**
 * Get address from coordinates (reverse geocoding)
 */
export const getAddressFromCoordinates = async (
  coordinates: Coordinates
): Promise<string | null> => {
  try {
    const results = await Location.reverseGeocodeAsync(coordinates);

    if (results && results.length > 0) {
      const address = results[0];
      const parts = [
        address.street,
        address.streetNumber,
        address.district,
        address.city,
      ].filter(Boolean);

      return parts.join(', ');
    }

    return null;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return null;
  }
};

/**
 * Watch user location for real-time updates
 * Returns a subscription that should be removed when done
 */
export const watchUserLocation = async (
  callback: (location: Coordinates) => void
): Promise<Location.LocationSubscription | null> => {
  try {
    const permission = await checkLocationPermission();

    if (!permission.granted) {
      const newPermission = await requestLocationPermission();
      if (!newPermission.granted) {
        return null;
      }
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 50, // Update if moved 50 meters
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error watching user location:', error);
    return null;
  }
};

/**
 * Open device navigation app with directions to coordinates
 */
export const openNavigation = async (
  destination: Coordinates,
  destinationName?: string
): Promise<void> => {
  try {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    const label = destinationName || 'Destino';
    const url = Platform.select({
      ios: `${scheme}${label}@${destination.latitude},${destination.longitude}`,
      android: `${scheme}${destination.latitude},${destination.longitude}(${label})`,
    });

    if (url) {
      await Location.openSettings(); // This will open maps app
      console.log('Opening navigation to:', url);
    }
  } catch (error) {
    console.error('Error opening navigation:', error);
    Alert.alert('Error', 'No se pudo abrir la navegación');
  }
};

/**
 * Check if location services are enabled on device
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();

    if (!enabled) {
      Alert.alert(
        'Servicios de Ubicación Desactivados',
        'Por favor, activa los servicios de ubicación en la configuración de tu dispositivo para usar esta función.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configuración', onPress: () => Location.openSettings?.() },
        ]
      );
    }

    return enabled;
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

/**
 * Get coordinates from address (geocoding)
 */
export const getCoordinatesFromAddress = async (
  address: string
): Promise<Coordinates | null> => {
  try {
    const results = await Location.geocodeAsync(address);

    if (results && results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};