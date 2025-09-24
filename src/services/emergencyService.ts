import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserById } from './userService';

export interface EmergencyRequest {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  serviceType: 'grua' | 'llanta' | 'llaves' | 'mecanico' | 'combustible' | 'bateria';
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  description: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedProviderId?: string;
  assignedTechnicianId?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  completedAt?: string;
  price?: number;
  rating?: number;
  feedback?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceTypes: ('grua' | 'llanta' | 'llaves' | 'mecanico' | 'combustible' | 'bateria')[];
  rating: number;
  totalServices: number;
  isActive: boolean;
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  workingHours: {
    start: string;
    end: string;
  };
  commission: number; // Percentage taken by the platform
  createdAt: string;
  updatedAt: string;
}

export interface EmergencySubscription {
  id: string;
  userId: string;
  planType: 'basic' | 'premium' | 'vip';
  price: number;
  benefits: string[];
  validUntil: string;
  servicesIncluded: number;
  servicesUsed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyStats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  averageResponseTime: number;
  averageRating: number;
  mostCommonService: string;
  totalRevenue: number;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyCallLog {
  id: string;
  userId: string;
  callType: '911' | 'contact' | 'service';
  contactId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  duration?: number;
  timestamp: string;
}

// Subscription Plans
const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 99,
    services: 2,
    benefits: ['2 servicios incluidos', 'Soporte 24/7', 'Respuesta en 30 min']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 179,
    services: 5,
    benefits: ['5 servicios incluidos', 'Soporte 24/7', 'Respuesta en 20 min', 'Descuento 10% en servicios extra']
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 299,
    services: 10,
    benefits: ['10 servicios incluidos', 'Soporte prioritario 24/7', 'Respuesta en 15 min', 'Descuento 20% en servicios extra', 'Técnico preferencial']
  }
];

// Create emergency request
export const createEmergencyRequest = async (
  requestData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EmergencyRequest> => {
  try {
    const now = new Date().toISOString();
    const newRequest = {
      ...requestData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'emergencyRequests'), newRequest);
    const createdRequest = { ...newRequest, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdRequest;
  } catch (error) {
    console.error('Error creating emergency request:', error);
    throw error;
  }
};

// Get emergency request by ID
export const getEmergencyRequestById = async (requestId: string): Promise<EmergencyRequest | null> => {
  try {
    const requestDoc = await getDoc(doc(db, 'emergencyRequests', requestId));
    if (requestDoc.exists()) {
      return requestDoc.data() as EmergencyRequest;
    }
    return null;
  } catch (error) {
    console.error('Error getting emergency request:', error);
    throw error;
  }
};

// Get user's emergency requests
export const getUserEmergencyRequests = async (
  userId: string,
  limitCount: number = 20
): Promise<EmergencyRequest[]> => {
  try {
    const q = query(
      collection(db, 'emergencyRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EmergencyRequest);
  } catch (error) {
    console.error('Error getting user emergency requests:', error);
    throw error;
  }
};

// Get active emergency requests
export const getActiveEmergencyRequests = async (): Promise<EmergencyRequest[]> => {
  try {
    const q = query(
      collection(db, 'emergencyRequests'),
      where('status', 'in', ['pending', 'assigned', 'in_progress']),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EmergencyRequest);
  } catch (error) {
    console.error('Error getting active emergency requests:', error);
    throw error;
  }
};

// Update emergency request status
export const updateEmergencyRequestStatus = async (
  requestId: string,
  status: EmergencyRequest['status'],
  updates?: Partial<EmergencyRequest>
): Promise<void> => {
  try {
    const requestRef = doc(db, 'emergencyRequests', requestId);
    await updateDoc(requestRef, {
      status,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating emergency request status:', error);
    throw error;
  }
};

// Assign provider to emergency request
export const assignProviderToRequest = async (
  requestId: string,
  providerId: string,
  technicianId?: string,
  estimatedArrival?: string
): Promise<void> => {
  try {
    const updates = {
      status: 'assigned' as const,
      assignedProviderId: providerId,
      assignedTechnicianId: technicianId,
      estimatedArrival,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'emergencyRequests', requestId), updates);
  } catch (error) {
    console.error('Error assigning provider to request:', error);
    throw error;
  }
};

// Complete emergency request
export const completeEmergencyRequest = async (
  requestId: string,
  price: number,
  feedback?: string,
  photos?: string[]
): Promise<void> => {
  try {
    const updates = {
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      price,
      feedback,
      photos,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'emergencyRequests', requestId), updates);
  } catch (error) {
    console.error('Error completing emergency request:', error);
    throw error;
  }
};

// Rate emergency service
export const rateEmergencyService = async (
  requestId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  try {
    const updates = {
      rating,
      feedback,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'emergencyRequests', requestId), updates);

    // Update provider rating if service is completed
    const request = await getEmergencyRequestById(requestId);
    if (request?.assignedProviderId && request.status === 'completed') {
      await updateProviderRating(request.assignedProviderId, rating);
    }
  } catch (error) {
    console.error('Error rating emergency service:', error);
    throw error;
  }
};

// Service Providers Management
export const createServiceProvider = async (
  providerData: Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceProvider> => {
  try {
    const now = new Date().toISOString();
    const newProvider = {
      ...providerData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'serviceProviders'), newProvider);
    const createdProvider = { ...newProvider, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdProvider;
  } catch (error) {
    console.error('Error creating service provider:', error);
    throw error;
  }
};

export const getAllServiceProviders = async (): Promise<ServiceProvider[]> => {
  try {
    const q = query(collection(db, 'serviceProviders'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ServiceProvider);
  } catch (error) {
    console.error('Error getting service providers:', error);
    throw error;
  }
};

export const getAvailableProviders = async (
  serviceType: string,
  location?: { latitude: number; longitude: number }
): Promise<ServiceProvider[]> => {
  try {
    const q = query(
      collection(db, 'serviceProviders'),
      where('serviceTypes', 'array-contains', serviceType),
      where('isActive', '==', true),
      orderBy('rating', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let providers = querySnapshot.docs.map(doc => doc.data() as ServiceProvider);

    // TODO: Add distance-based filtering if location is provided
    // For now, return all providers sorted by rating

    return providers;
  } catch (error) {
    console.error('Error getting available providers:', error);
    throw error;
  }
};

export const updateProviderRating = async (providerId: string, newRating: number): Promise<void> => {
  try {
    const providerRef = doc(db, 'serviceProviders', providerId);
    const providerDoc = await getDoc(providerRef);

    if (providerDoc.exists()) {
      const provider = providerDoc.data() as ServiceProvider;

      // Calculate new average rating
      const totalRatings = provider.totalServices + 1;
      const currentTotal = provider.rating * provider.totalServices;
      const newAverage = (currentTotal + newRating) / totalRatings;

      await updateDoc(providerRef, {
        rating: newAverage,
        totalServices: totalRatings,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating provider rating:', error);
    throw error;
  }
};

// Emergency Subscriptions
export const createEmergencySubscription = async (
  userId: string,
  planType: 'basic' | 'premium' | 'vip'
): Promise<EmergencySubscription> => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const plan = subscriptionPlans.find(p => p.id === planType);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    // Calculate validity (1 month from now)
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    const subscriptionData: Omit<EmergencySubscription, 'id'> = {
      userId,
      planType,
      price: plan.price,
      benefits: plan.benefits,
      validUntil: validUntil.toISOString(),
      servicesIncluded: plan.services,
      servicesUsed: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'emergencySubscriptions'), subscriptionData);
    const createdSubscription = { ...subscriptionData, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdSubscription;
  } catch (error) {
    console.error('Error creating emergency subscription:', error);
    throw error;
  }
};

export const getUserActiveSubscription = async (userId: string): Promise<EmergencySubscription | null> => {
  try {
    const q = query(
      collection(db, 'emergencySubscriptions'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      where('validUntil', '>', new Date().toISOString()),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as EmergencySubscription;
    }
    return null;
  } catch (error) {
    console.error('Error getting user active subscription:', error);
    throw error;
  }
};

export const useSubscriptionService = async (subscriptionId: string): Promise<void> => {
  try {
    const subscriptionRef = doc(db, 'emergencySubscriptions', subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (subscriptionDoc.exists()) {
      const subscription = subscriptionDoc.data() as EmergencySubscription;

      if (subscription.servicesUsed < subscription.servicesIncluded) {
        await updateDoc(subscriptionRef, {
          servicesUsed: subscription.servicesUsed + 1,
          updatedAt: new Date().toISOString()
        });
      } else {
        throw new Error('No hay servicios disponibles en la suscripción');
      }
    } else {
      throw new Error('Suscripción no encontrada');
    }
  } catch (error) {
    console.error('Error using subscription service:', error);
    throw error;
  }
};

// Statistics
export const getEmergencyStats = async (): Promise<EmergencyStats> => {
  try {
    const requestsSnapshot = await getDocs(collection(db, 'emergencyRequests'));
    const requests = requestsSnapshot.docs.map(doc => doc.data() as EmergencyRequest);

    const totalRequests = requests.length;
    const activeRequests = requests.filter(r => ['pending', 'assigned', 'in_progress'].includes(r.status)).length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;

    // Calculate average response time (in minutes)
    const completedWithTimes = requests.filter(r => r.status === 'completed' && r.actualArrival);
    const responseTimes = completedWithTimes.map(r => {
      const created = new Date(r.createdAt);
      const arrived = new Date(r.actualArrival!);
      return (arrived.getTime() - created.getTime()) / (1000 * 60); // minutes
    });
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate average rating
    const ratedRequests = requests.filter(r => r.rating !== undefined);
    const averageRating = ratedRequests.length > 0
      ? ratedRequests.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRequests.length
      : 0;

    // Find most common service
    const serviceCounts: { [key: string]: number } = {};
    requests.forEach(r => {
      serviceCounts[r.serviceType] = (serviceCounts[r.serviceType] || 0) + 1;
    });
    const mostCommonService = Object.keys(serviceCounts).reduce((a, b) =>
      serviceCounts[a] > serviceCounts[b] ? a : b, 'grua'
    );

    // Calculate total revenue
    const totalRevenue = requests
      .filter(r => r.status === 'completed' && r.price)
      .reduce((sum, r) => sum + (r.price || 0), 0);

    return {
      totalRequests,
      activeRequests,
      completedRequests,
      averageResponseTime,
      averageRating,
      mostCommonService,
      totalRevenue
    };
  } catch (error) {
    console.error('Error getting emergency stats:', error);
    throw error;
  }
};

// Emergency Contacts Management
export const createEmergencyContact = async (
  contactData: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EmergencyContact> => {
  try {
    const now = new Date().toISOString();
    const newContact = {
      ...contactData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'emergencyContacts'), newContact);
    const createdContact = { ...newContact, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdContact;
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    throw error;
  }
};

export const getUserEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
  try {
    const q = query(
      collection(db, 'emergencyContacts'),
      where('userId', '==', userId),
      orderBy('isPrimary', 'desc'),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EmergencyContact);
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    throw error;
  }
};

export const updateEmergencyContact = async (
  contactId: string,
  updates: Partial<EmergencyContact>
): Promise<void> => {
  try {
    const contactRef = doc(db, 'emergencyContacts', contactId);
    await updateDoc(contactRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
};

export const deleteEmergencyContact = async (contactId: string): Promise<void> => {
  try {
    const contactRef = doc(db, 'emergencyContacts', contactId);
    await updateDoc(contactRef, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    throw error;
  }
};

// Emergency Call Logging
export const logEmergencyCall = async (
  callData: Omit<EmergencyCallLog, 'id'>
): Promise<EmergencyCallLog> => {
  try {
    const newLog = {
      ...callData,
      timestamp: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'emergencyCallLogs'), newLog);
    const createdLog = { ...newLog, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdLog;
  } catch (error) {
    console.error('Error logging emergency call:', error);
    throw error;
  }
};

export const getUserEmergencyCallLogs = async (
  userId: string,
  limitCount: number = 50
): Promise<EmergencyCallLog[]> => {
  try {
    const q = query(
      collection(db, 'emergencyCallLogs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EmergencyCallLog);
  } catch (error) {
    console.error('Error getting emergency call logs:', error);
    throw error;
  }
};

// Notify Emergency Contacts
export const notifyEmergencyContacts = async (
  userId: string,
  emergencyType: string,
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  }
): Promise<void> => {
  try {
    const contacts = await getUserEmergencyContacts(userId);
    const user = await getUserById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // TODO: Implement SMS/Push notification to emergency contacts
    // For now, just log the notification
    console.log('Notifying emergency contacts:', {
      contacts: contacts.length,
      emergencyType,
      location,
      userName: user.name
    });

    // In a real implementation, you would:
    // 1. Send SMS to each contact's phone number
    // 2. Send push notifications if they have the app
    // 3. Include user's name, emergency type, and location link
  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
    throw error;
  }
};

export { subscriptionPlans };