import * as Location from 'expo-location';
import { startParkingSession, endParkingSession, getActiveSessionByUser } from './parkingService';
import { getAllParkingSpots } from './parkingService';
import type { ParkingSpot } from './parkingService';

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  spotId: string;
  location: string;
}

export interface GeofenceEvent {
  type: 'enter' | 'exit';
  region: GeofenceRegion;
  timestamp: string;
  userId: string;
}

// Store active geofences in memory
let activeGeofences: GeofenceRegion[] = [];
let isMonitoring = false;
let monitoringInterval: NodeJS.Timeout | null = null;

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.warn('Background location permission not granted - geofencing will be limited');
      // Still return true as foreground is sufficient for basic functionality
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Create geofence regions from parking spots
 */
export const createGeofencesFromParkingSpots = async (
  spots: ParkingSpot[]
): Promise<GeofenceRegion[]> => {
  try {
    // This is a simplified version. In production, spots would have lat/long coordinates
    const geofences: GeofenceRegion[] = spots.map((spot, index) => ({
      id: `geofence_${spot.id}`,
      latitude: 19.432608 + (index * 0.001), // Example coordinates (would be real in production)
      longitude: -99.133209 + (index * 0.001),
      radius: 50, // 50 meters radius
      spotId: spot.id,
      location: spot.location,
    }));

    return geofences;
  } catch (error) {
    console.error('Error creating geofences:', error);
    return [];
  }
};

/**
 * Start geofencing monitoring
 */
export const startGeofencing = async (
  userId: string,
  onGeofenceEvent?: (event: GeofenceEvent) => void
): Promise<boolean> => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return false;
    }

    // Load parking spots and create geofences
    const spots = await getAllParkingSpots();
    activeGeofences = await createGeofencesFromParkingSpots(spots);

    if (activeGeofences.length === 0) {
      console.warn('No geofences to monitor');
      return false;
    }

    // Start monitoring location
    isMonitoring = true;
    let lastPosition: Location.LocationObject | null = null;
    const userInRegions = new Set<string>();

    monitoringInterval = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentLat = location.coords.latitude;
        const currentLon = location.coords.longitude;

        // Check each geofence
        for (const geofence of activeGeofences) {
          const distance = calculateDistance(
            currentLat,
            currentLon,
            geofence.latitude,
            geofence.longitude
          );

          const isInside = distance <= geofence.radius;
          const wasInside = userInRegions.has(geofence.id);

          // Detect entry
          if (isInside && !wasInside) {
            userInRegions.add(geofence.id);
            const event: GeofenceEvent = {
              type: 'enter',
              region: geofence,
              timestamp: new Date().toISOString(),
              userId,
            };

            // Trigger callback
            if (onGeofenceEvent) {
              onGeofenceEvent(event);
            }

            // Auto-start parking session
            await handleGeofenceEntry(userId, geofence);
          }

          // Detect exit
          if (!isInside && wasInside) {
            userInRegions.delete(geofence.id);
            const event: GeofenceEvent = {
              type: 'exit',
              region: geofence,
              timestamp: new Date().toISOString(),
              userId,
            };

            // Trigger callback
            if (onGeofenceEvent) {
              onGeofenceEvent(event);
            }

            // Auto-end parking session
            await handleGeofenceExit(userId, geofence);
          }
        }

        lastPosition = location;
      } catch (error) {
        console.error('Error monitoring location:', error);
      }
    }, 10000); // Check every 10 seconds

    console.log(`Geofencing started with ${activeGeofences.length} regions`);
    return true;
  } catch (error) {
    console.error('Error starting geofencing:', error);
    return false;
  }
};

/**
 * Stop geofencing monitoring
 */
export const stopGeofencing = (): void => {
  isMonitoring = false;
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  activeGeofences = [];
  console.log('Geofencing stopped');
};

/**
 * Handle geofence entry event
 */
const handleGeofenceEntry = async (
  userId: string,
  region: GeofenceRegion
): Promise<void> => {
  try {
    // Check if user already has an active session
    const activeSession = await getActiveSessionByUser(userId);
    if (activeSession) {
      console.log('User already has an active session, skipping auto-start');
      return;
    }

    // Auto-start parking session
    console.log(`Auto-starting parking session for user ${userId} at ${region.location}`);

    // Note: In production, we would get user details from auth
    await startParkingSession(
      userId,
      'Auto',
      'Auto User',
      region.location,
      region.spotId
    );

    console.log('Parking session auto-started via geofencing');
  } catch (error) {
    console.error('Error handling geofence entry:', error);
  }
};

/**
 * Handle geofence exit event
 */
const handleGeofenceExit = async (
  userId: string,
  region: GeofenceRegion
): Promise<void> => {
  try {
    // Get active session
    const activeSession = await getActiveSessionByUser(userId);
    if (!activeSession) {
      console.log('No active session to end');
      return;
    }

    // Verify the session is for this location
    if (activeSession.location !== region.location) {
      console.log('Active session is for a different location, skipping auto-end');
      return;
    }

    // Auto-end parking session
    console.log(`Auto-ending parking session for user ${userId} at ${region.location}`);

    await endParkingSession(activeSession.id, undefined, 'balance');

    console.log('Parking session auto-ended via geofencing');
  } catch (error) {
    console.error('Error handling geofence exit:', error);
  }
};

/**
 * Get current monitoring status
 */
export const getGeofencingStatus = (): {
  isMonitoring: boolean;
  activeGeofencesCount: number;
} => {
  return {
    isMonitoring,
    activeGeofencesCount: activeGeofences.length,
  };
};

/**
 * Check if user is currently in any geofenced area
 */
export const checkCurrentGeofence = async (
  userId: string
): Promise<GeofenceRegion | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const currentLat = location.coords.latitude;
    const currentLon = location.coords.longitude;

    for (const geofence of activeGeofences) {
      const distance = calculateDistance(
        currentLat,
        currentLon,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        return geofence;
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking current geofence:', error);
    return null;
  }
};

/**
 * Get distance to nearest parking spot
 */
export const getDistanceToNearestSpot = async (): Promise<{
  spot: GeofenceRegion;
  distance: number;
} | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const currentLat = location.coords.latitude;
    const currentLon = location.coords.longitude;

    let nearest: { spot: GeofenceRegion; distance: number } | null = null;

    for (const geofence of activeGeofences) {
      const distance = calculateDistance(
        currentLat,
        currentLon,
        geofence.latitude,
        geofence.longitude
      );

      if (!nearest || distance < nearest.distance) {
        nearest = { spot: geofence, distance };
      }
    }

    return nearest;
  } catch (error) {
    console.error('Error getting distance to nearest spot:', error);
    return null;
  }
};