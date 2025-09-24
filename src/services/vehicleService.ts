import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  type: 'car' | 'motorcycle' | 'truck' | 'suv';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const addVehicle = async (
  vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vehicle> => {
  try {
    const now = new Date().toISOString();
    const newVehicle = {
      ...vehicleData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'vehicles'), newVehicle);
    const createdVehicle = { ...newVehicle, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdVehicle;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

export const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
  try {
    const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicleId));
    if (vehicleDoc.exists()) {
      return vehicleDoc.data() as Vehicle;
    }
    return null;
  } catch (error) {
    console.error('Error getting vehicle:', error);
    throw error;
  }
};

export const getUserVehicles = async (userId: string): Promise<Vehicle[]> => {
  try {
    const q = query(
      collection(db, 'vehicles'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    let vehicles = querySnapshot.docs.map(doc => doc.data() as Vehicle);

    // Sort: default vehicle first, then by creation date
    vehicles = vehicles.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return vehicles;
  } catch (error) {
    console.error('Error getting user vehicles:', error);
    return [];
  }
};

export const updateVehicle = async (
  vehicleId: string,
  updates: Partial<Omit<Vehicle, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  try {
    // First check if it's the default vehicle
    const vehicle = await getVehicleById(vehicleId);
    if (vehicle?.isDefault) {
      // Get user's other vehicles
      const userVehicles = await getUserVehicles(vehicle.userId);
      if (userVehicles.length > 1) {
        // Set another vehicle as default
        const nextVehicle = userVehicles.find(v => v.id !== vehicleId);
        if (nextVehicle) {
          await updateVehicle(nextVehicle.id, { isDefault: true });
        }
      }
    }

    await deleteDoc(doc(db, 'vehicles', vehicleId));
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

export const setDefaultVehicle = async (userId: string, vehicleId: string): Promise<void> => {
  try {
    // Get all user vehicles
    const vehicles = await getUserVehicles(userId);

    // Update all vehicles: set isDefault to false
    const updatePromises = vehicles.map(vehicle =>
      updateVehicle(vehicle.id, { isDefault: false })
    );
    await Promise.all(updatePromises);

    // Set the selected vehicle as default
    await updateVehicle(vehicleId, { isDefault: true });
  } catch (error) {
    console.error('Error setting default vehicle:', error);
    throw error;
  }
};

export const getDefaultVehicle = async (userId: string): Promise<Vehicle | null> => {
  try {
    const vehicles = await getUserVehicles(userId);
    return vehicles.find(v => v.isDefault) || vehicles[0] || null;
  } catch (error) {
    console.error('Error getting default vehicle:', error);
    return null;
  }
};