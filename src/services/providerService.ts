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

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  numberOfSpots: number;
  commissionRate: number; // Percentage
  paymentMethod: 'bank_transfer' | 'cash' | 'check';
  isActive: boolean;
  totalRevenue: number;
  monthlyRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export const createProvider = async (
  providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Provider> => {
  try {
    const now = new Date().toISOString();
    const newProvider = {
      ...providerData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'parkingProviders'), newProvider);
    const createdProvider = { ...newProvider, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdProvider;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw error;
  }
};

export const getProviderById = async (providerId: string): Promise<Provider | null> => {
  try {
    const providerDoc = await getDoc(doc(db, 'parkingProviders', providerId));
    if (providerDoc.exists()) {
      return providerDoc.data() as Provider;
    }
    return null;
  } catch (error) {
    console.error('Error getting provider:', error);
    throw error;
  }
};

export const getAllProviders = async (): Promise<Provider[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'parkingProviders'));
    let providers = querySnapshot.docs.map(doc => doc.data() as Provider);

    // Sort: active first, then by name
    providers = providers.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });

    return providers;
  } catch (error) {
    console.error('Error getting providers:', error);
    return [];
  }
};

export const updateProvider = async (
  providerId: string,
  updates: Partial<Omit<Provider, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const providerRef = doc(db, 'parkingProviders', providerId);
    await updateDoc(providerRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    throw error;
  }
};

export const deleteProvider = async (providerId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'parkingProviders', providerId));
  } catch (error) {
    console.error('Error deleting provider:', error);
    throw error;
  }
};

export const toggleProviderStatus = async (
  providerId: string,
  isActive: boolean
): Promise<void> => {
  try {
    await updateProvider(providerId, { isActive });
  } catch (error) {
    console.error('Error toggling provider status:', error);
    throw error;
  }
};

export const updateProviderRevenue = async (
  providerId: string,
  amount: number
): Promise<void> => {
  try {
    const provider = await getProviderById(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    await updateProvider(providerId, {
      totalRevenue: provider.totalRevenue + amount,
      monthlyRevenue: provider.monthlyRevenue + amount,
    });
  } catch (error) {
    console.error('Error updating provider revenue:', error);
    throw error;
  }
};

export const resetMonthlyRevenue = async (providerId: string): Promise<void> => {
  try {
    await updateProvider(providerId, {
      monthlyRevenue: 0,
    });
  } catch (error) {
    console.error('Error resetting monthly revenue:', error);
    throw error;
  }
};