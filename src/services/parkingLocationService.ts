import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  availableSpots: number;
  totalSpots: number;
  hourlyRate: number;
  isActive: boolean;
}

export interface LocationPackage {
  id: string;
  locationId: string;
  name: string;
  minutes: number;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  isPopular: boolean;
}

export interface UserLocationPackage {
  id: string;
  userId: string;
  locationId: string;
  packageId: string;
  remainingMinutes: number;
  purchaseDate: Date;
  expirationDate: Date;
  isActive: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  LOCATIONS: 'parking_locations',
  PACKAGES: 'location_packages',
  USER_PACKAGES: 'user_location_packages',
};

// Mock data
const MOCK_LOCATIONS: ParkingLocation[] = [
  {
    id: 'loc-1',
    name: 'Multiplaza',
    address: 'Blvd Morazán, Tegucigalpa',
    latitude: 14.0723,
    longitude: -87.1921,
    description: 'Centro comercial con estacionamiento techado',
    availableSpots: 45,
    totalSpots: 150,
    hourlyRate: 25,
    isActive: true,
  },
  {
    id: 'loc-2',
    name: 'Hospital Viera',
    address: 'Col. Humuya, Tegucigalpa',
    latitude: 14.0840,
    longitude: -87.2069,
    description: 'Estacionamiento del hospital con seguridad 24/7',
    availableSpots: 12,
    totalSpots: 80,
    hourlyRate: 20,
    isActive: true,
  },
  {
    id: 'loc-3',
    name: 'UNAH',
    address: 'Ciudad Universitaria, Tegucigalpa',
    latitude: 14.0886,
    longitude: -87.1677,
    description: 'Estacionamiento universitario para estudiantes y visitantes',
    availableSpots: 23,
    totalSpots: 200,
    hourlyRate: 15,
    isActive: true,
  },
  {
    id: 'loc-4',
    name: 'Aeropuerto Toncontín',
    address: 'Aeropuerto Internacional, Tegucigalpa',
    latitude: 14.0608,
    longitude: -87.2172,
    description: 'Estacionamiento del aeropuerto internacional',
    availableSpots: 67,
    totalSpots: 300,
    hourlyRate: 35,
    isActive: true,
  },
  {
    id: 'loc-5',
    name: 'Banco Central',
    address: 'Centro, Tegucigalpa',
    latitude: 14.1020,
    longitude: -87.2070,
    description: 'Estacionamiento en el centro de la ciudad',
    availableSpots: 8,
    totalSpots: 50,
    hourlyRate: 30,
    isActive: true,
  },
];

const MOCK_PACKAGES: LocationPackage[] = [
  // Multiplaza packages
  { id: 'pkg-1-1', locationId: 'loc-1', name: '2 Horas', minutes: 120, price: 40, originalPrice: 50, discount: 20, description: 'Perfecto para compras rápidas', isPopular: false },
  { id: 'pkg-1-2', locationId: 'loc-1', name: '4 Horas', minutes: 240, price: 70, originalPrice: 100, discount: 30, description: 'Para una tarde de shopping', isPopular: true },
  { id: 'pkg-1-3', locationId: 'loc-1', name: 'Día Completo', minutes: 480, price: 120, originalPrice: 200, discount: 40, description: 'Todo el día en el centro comercial', isPopular: false },

  // Hospital packages
  { id: 'pkg-2-1', locationId: 'loc-2', name: '1 Hora', minutes: 60, price: 15, originalPrice: 20, discount: 25, description: 'Consulta médica rápida', isPopular: true },
  { id: 'pkg-2-2', locationId: 'loc-2', name: '3 Horas', minutes: 180, price: 45, originalPrice: 60, discount: 25, description: 'Para procedimientos o emergencias', isPopular: false },
  { id: 'pkg-2-3', locationId: 'loc-2', name: '6 Horas', minutes: 360, price: 80, originalPrice: 120, discount: 33, description: 'Hospitalización o cirugía ambulatoria', isPopular: false },

  // UNAH packages
  { id: 'pkg-3-1', locationId: 'loc-3', name: '3 Horas', minutes: 180, price: 35, originalPrice: 45, discount: 22, description: 'Para clases matutinas', isPopular: true },
  { id: 'pkg-3-2', locationId: 'loc-3', name: '6 Horas', minutes: 360, price: 60, originalPrice: 90, discount: 33, description: 'Jornada completa de estudio', isPopular: false },
  { id: 'pkg-3-3', locationId: 'loc-3', name: 'Día Completo', minutes: 480, price: 90, originalPrice: 120, discount: 25, description: 'Para estudiantes de tiempo completo', isPopular: false },

  // Aeropuerto packages
  { id: 'pkg-4-1', locationId: 'loc-4', name: '2 Horas', minutes: 120, price: 60, originalPrice: 70, discount: 14, description: 'Viajes cortos', isPopular: false },
  { id: 'pkg-4-2', locationId: 'loc-4', name: '1 Día', minutes: 1440, price: 200, originalPrice: 280, discount: 29, description: 'Viajes de un día', isPopular: true },
  { id: 'pkg-4-3', locationId: 'loc-4', name: '3 Días', minutes: 4320, price: 450, originalPrice: 840, discount: 46, description: 'Viajes de fin de semana', isPopular: false },

  // Banco Central packages
  { id: 'pkg-5-1', locationId: 'loc-5', name: '1 Hora', minutes: 60, price: 25, originalPrice: 30, discount: 17, description: 'Trámites bancarios rápidos', isPopular: true },
  { id: 'pkg-5-2', locationId: 'loc-5', name: '2 Horas', minutes: 120, price: 45, originalPrice: 60, discount: 25, description: 'Gestiones en el centro', isPopular: false },
  { id: 'pkg-5-3', locationId: 'loc-5', name: '4 Horas', minutes: 240, price: 80, originalPrice: 120, discount: 33, description: 'Trabajo en el centro de la ciudad', isPopular: false },
];

// Basic service functions
export const initializeParkingData = async (): Promise<void> => {
  try {
    console.log('DEMO: Initializing parking location data...');

    // Check if data already exists
    const existingLocations = await AsyncStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (existingLocations) {
      console.log('DEMO: Parking data already exists');
      const parsed = JSON.parse(existingLocations);
      console.log('DEMO: Existing locations count:', parsed.length);
      if (parsed.length === 0) {
        console.log('DEMO: Found empty data, reinitializing...');
        await forceReinitializeParkingData();
      }
      return;
    }

    console.log('DEMO: Creating initial parking data');

    // Initialize with mock data
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(MOCK_LOCATIONS));
    await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(MOCK_PACKAGES));
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PACKAGES, JSON.stringify([]));

  } catch (error) {
    console.error('Error initializing parking data:', error);
  }
};

export const forceReinitializeParkingData = async (): Promise<void> => {
  try {
    console.log('DEMO: Force reinitializing parking data with', MOCK_LOCATIONS.length, 'locations');
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(MOCK_LOCATIONS));
    await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(MOCK_PACKAGES));
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PACKAGES, JSON.stringify([]));
    console.log('DEMO: Force reinitialization complete');
  } catch (error) {
    console.error('Error force reinitializing parking data:', error);
  }
};

export const getAllParkingLocations = async (): Promise<ParkingLocation[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LOCATIONS);
    console.log('DEMO: Raw stored locations data:', stored);
    const parsed = stored ? JSON.parse(stored) : [];
    console.log('DEMO: Parsed locations count:', parsed.length);
    return parsed;
  } catch (error) {
    console.error('Error getting parking locations:', error);
    return [];
  }
};

export const getParkingLocationById = async (locationId: string): Promise<ParkingLocation | null> => {
  try {
    const locations = await getAllParkingLocations();
    return locations.find(location => location.id === locationId) || null;
  } catch (error) {
    console.error('Error getting parking location by id:', error);
    return null;
  }
};

export const getPackagesByLocation = async (locationId: string): Promise<LocationPackage[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PACKAGES);
    const allPackages: LocationPackage[] = stored ? JSON.parse(stored) : [];
    const locationPackages = allPackages.filter(pkg => pkg.locationId === locationId);
    console.log('DEMO: Found', locationPackages.length, 'packages for location', locationId);
    return locationPackages;
  } catch (error) {
    console.error('Error getting packages by location:', error);
    return [];
  }
};

// Filter and search interfaces
export interface LocationFilters {
  searchText?: string;
  maxDistance?: number; // in kilometers
  minAvailableSpots?: number;
  maxPrice?: number; // hourly rate
  sortBy?: 'distance' | 'price' | 'availability' | 'name';
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationWithDistance extends ParkingLocation {
  distance?: number; // in kilometers
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Search and filter parking locations based on criteria
 */
export const searchParkingLocations = async (
  filters: LocationFilters = {}
): Promise<LocationWithDistance[]> => {
  try {
    let locations = await getAllParkingLocations();
    let results: LocationWithDistance[] = locations;

    // Add distance to each location if user location is provided
    if (filters.userLocation) {
      results = locations.map(location => ({
        ...location,
        distance: calculateDistance(
          filters.userLocation!.latitude,
          filters.userLocation!.longitude,
          location.latitude,
          location.longitude
        ),
      }));
    }

    // Filter by search text (name or address)
    if (filters.searchText && filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase().trim();
      results = results.filter(
        location =>
          location.name.toLowerCase().includes(searchLower) ||
          location.address.toLowerCase().includes(searchLower)
      );
    }

    // Filter by max distance
    if (filters.maxDistance !== undefined && filters.userLocation) {
      results = results.filter(
        location => location.distance !== undefined && location.distance <= filters.maxDistance!
      );
    }

    // Filter by minimum available spots
    if (filters.minAvailableSpots !== undefined) {
      results = results.filter(
        location => location.availableSpots >= filters.minAvailableSpots!
      );
    }

    // Filter by max hourly price
    if (filters.maxPrice !== undefined) {
      results = results.filter(location => location.hourlyRate <= filters.maxPrice!);
    }

    // Sort results
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'distance':
            return (a.distance || 0) - (b.distance || 0);
          case 'price':
            return a.hourlyRate - b.hourlyRate;
          case 'availability':
            return b.availableSpots - a.availableSpots;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }

    console.log('DEMO: Search returned', results.length, 'locations');
    return results;
  } catch (error) {
    console.error('Error searching parking locations:', error);
    return [];
  }
};

/**
 * Get nearby parking locations within a radius
 */
export const getNearbyParkingLocations = async (
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 5
): Promise<LocationWithDistance[]> => {
  try {
    const allLocations = await getAllParkingLocations();

    const locationsWithDistance: LocationWithDistance[] = allLocations.map(location => ({
      ...location,
      distance: calculateDistance(
        userLatitude,
        userLongitude,
        location.latitude,
        location.longitude
      ),
    }));

    // Filter by radius and sort by distance
    const nearbyLocations = locationsWithDistance
      .filter(location => location.distance! <= radiusKm)
      .sort((a, b) => a.distance! - b.distance!);

    console.log('DEMO: Found', nearbyLocations.length, 'locations within', radiusKm, 'km');
    return nearbyLocations;
  } catch (error) {
    console.error('Error getting nearby parking locations:', error);
    return [];
  }
};

/**
 * Get available parking spots count for all locations
 */
export const getAvailabilityStatus = async (): Promise<{
  total: number;
  available: number;
  occupied: number;
  locations: number;
}> => {
  try {
    const locations = await getAllParkingLocations();

    const stats = locations.reduce(
      (acc, location) => ({
        total: acc.total + location.totalSpots,
        available: acc.available + location.availableSpots,
        occupied: acc.occupied + (location.totalSpots - location.availableSpots),
        locations: acc.locations + 1,
      }),
      { total: 0, available: 0, occupied: 0, locations: 0 }
    );

    return stats;
  } catch (error) {
    console.error('Error getting availability status:', error);
    return { total: 0, available: 0, occupied: 0, locations: 0 };
  }
};

/**
 * Update available spots for a location (simulated real-time update)
 */
export const updateLocationAvailability = async (
  locationId: string,
  availableSpots: number
): Promise<boolean> => {
  try {
    const locations = await getAllParkingLocations();
    const locationIndex = locations.findIndex(loc => loc.id === locationId);

    if (locationIndex === -1) {
      console.error('Location not found:', locationId);
      return false;
    }

    locations[locationIndex].availableSpots = availableSpots;
    await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));

    console.log('DEMO: Updated availability for', locationId, 'to', availableSpots);
    return true;
  } catch (error) {
    console.error('Error updating location availability:', error);
    return false;
  }
};