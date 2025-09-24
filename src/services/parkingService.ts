import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { updateUserBalance, getUserById } from './userService';

export interface ParkingSession {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  startTime: string;
  endTime?: string;
  duration?: number; // en minutos
  location: string;
  spot?: string;
  cost: number;
  status: 'active' | 'completed' | 'cancelled';
  paymentMethod?: 'balance' | 'cash' | 'transfer';
  guardId?: string; // ID del guardia que procesó
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ParkingSpot {
  id: string;
  number: string;
  location: string;
  isOccupied: boolean;
  currentSessionId?: string;
  type: 'regular' | 'disabled' | 'electric';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  lastUpdated: string;
}

export interface ParkingStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalRevenue: number;
  averageSessionDuration: number;
  mostPopularSpot: string;
  todayRevenue: number;
}

// Sessions Management
export const createParkingSession = async (sessionData: Omit<ParkingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParkingSession> => {
  try {
    const now = new Date().toISOString();
    const newSession = {
      ...sessionData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'parkingSessions'), newSession);
    const createdSession = { ...newSession, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdSession;
  } catch (error) {
    console.error('Error creating parking session:', error);
    throw error;
  }
};

export const getParkingSessionById = async (sessionId: string): Promise<ParkingSession | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, 'parkingSessions', sessionId));
    if (sessionDoc.exists()) {
      return sessionDoc.data() as ParkingSession;
    }
    return null;
  } catch (error) {
    console.error('Error getting parking session:', error);
    throw error;
  }
};

export const getActiveSessionByUser = async (userId: string): Promise<ParkingSession | null> => {
  try {
    const q = query(
      collection(db, 'parkingSessions'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as ParkingSession;
    }
    return null;
  } catch (error) {
    console.error('Error getting active session:', error);
    throw error;
  }
};

export const getUserParkingHistory = async (userId: string, limitCount: number = 20): Promise<ParkingSession[]> => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'parkingSessions'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    // Map and sort client-side to avoid requiring Firebase index
    let sessions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ParkingSession));

    // Sort by creation date descending
    sessions = sessions.sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return dateB - dateA;
    });

    // Apply limit client-side
    return sessions.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting user parking history:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const getAllActiveSessions = async (): Promise<ParkingSession[]> => {
  try {
    const q = query(
      collection(db, 'parkingSessions'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    // Sort client-side to avoid index requirement
    let sessions = querySnapshot.docs.map(doc => doc.data() as ParkingSession);
    sessions = sessions.sort((a, b) => {
      const dateA = new Date(a.startTime || '').getTime();
      const dateB = new Date(b.startTime || '').getTime();
      return dateB - dateA;
    });

    return sessions;
  } catch (error) {
    console.error('Error getting active sessions:', error);
    throw error;
  }
};

export const startParkingSession = async (
  userId: string,
  userPhone: string,
  userName: string,
  location: string,
  spot?: string
): Promise<ParkingSession> => {
  try {
    // Check if user already has an active session
    const activeSession = await getActiveSessionByUser(userId);
    if (activeSession) {
      throw new Error('El usuario ya tiene una sesión activa');
    }

    // Generate QR code value
    const qrCode = `PARKING_${userId}_${Date.now()}`;

    const sessionData: Omit<ParkingSession, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      userPhone,
      userName,
      startTime: new Date().toISOString(),
      location,
      spot,
      cost: 0, // Will be calculated when session ends
      status: 'active',
      qrCode
    };

    const session = await createParkingSession(sessionData);

    // If spot is specified, mark it as occupied
    if (spot) {
      await updateParkingSpot(spot, { isOccupied: true, currentSessionId: session.id });
    }

    return session;
  } catch (error) {
    console.error('Error starting parking session:', error);
    throw error;
  }
};

export const endParkingSession = async (
  sessionId: string,
  guardId?: string,
  paymentMethod: 'balance' | 'cash' | 'transfer' = 'balance'
): Promise<ParkingSession> => {
  try {
    const session = await getParkingSessionById(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    if (session.status !== 'active') {
      throw new Error('La sesión no está activa');
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const duration = Math.ceil(durationMs / (1000 * 60)); // Convert to minutes

    // Calculate cost (e.g., $1 per minute)
    const cost = duration * 1;

    const updates = {
      endTime: endTime.toISOString(),
      duration,
      cost,
      status: 'completed' as const,
      paymentMethod,
      guardId,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'parkingSessions', sessionId), updates);

    // If payment is from balance, deduct from user
    if (paymentMethod === 'balance') {
      const user = await getUserById(session.userId);
      if (user) {
        const newBalance = Math.max(0, user.balance - cost);
        await updateUserBalance(session.userId, newBalance);
      }
    }

    // Free up the parking spot if it was specified
    if (session.spot) {
      await updateParkingSpot(session.spot, { isOccupied: false, currentSessionId: undefined });
    }

    return { ...session, ...updates };
  } catch (error) {
    console.error('Error ending parking session:', error);
    throw error;
  }
};

// Parking Spots Management
export const createParkingSpot = async (spotData: Omit<ParkingSpot, 'id' | 'lastUpdated'>): Promise<ParkingSpot> => {
  try {
    const newSpot = {
      ...spotData,
      lastUpdated: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'parkingSpots'), newSpot);
    const createdSpot = { ...newSpot, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdSpot;
  } catch (error) {
    console.error('Error creating parking spot:', error);
    throw error;
  }
};

export const getParkingSpotById = async (spotId: string): Promise<ParkingSpot | null> => {
  try {
    const spotDoc = await getDoc(doc(db, 'parkingSpots', spotId));
    if (spotDoc.exists()) {
      return spotDoc.data() as ParkingSpot;
    }
    return null;
  } catch (error) {
    console.error('Error getting parking spot:', error);
    throw error;
  }
};

export const getAllParkingSpots = async (location?: string): Promise<ParkingSpot[]> => {
  try {
    let q = query(collection(db, 'parkingSpots'));

    if (location) {
      q = query(collection(db, 'parkingSpots'), where('location', '==', location));
    }

    const querySnapshot = await getDocs(q);
    let spots = querySnapshot.docs.map(doc => doc.data() as ParkingSpot);

    // Sort client-side to avoid index requirement
    spots = spots.sort((a, b) => a.number.localeCompare(b.number));

    return spots;
  } catch (error) {
    console.error('Error getting parking spots:', error);
    throw error;
  }
};

export const getAvailableParkingSpots = async (location?: string): Promise<ParkingSpot[]> => {
  try {
    let q = query(
      collection(db, 'parkingSpots'),
      where('status', '==', 'available'),
      where('isOccupied', '==', false)
    );

    if (location) {
      q = query(
        collection(db, 'parkingSpots'),
        where('location', '==', location),
        where('status', '==', 'available'),
        where('isOccupied', '==', false)
      );
    }

    const querySnapshot = await getDocs(q);
    let spots = querySnapshot.docs.map(doc => doc.data() as ParkingSpot);

    // Sort client-side to avoid index requirement
    spots = spots.sort((a, b) => a.number.localeCompare(b.number));

    return spots;
  } catch (error) {
    console.error('Error getting available parking spots:', error);
    throw error;
  }
};

export const updateParkingSpot = async (spotId: string, updates: Partial<ParkingSpot>): Promise<void> => {
  try {
    const spotRef = doc(db, 'parkingSpots', spotId);
    await updateDoc(spotRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating parking spot:', error);
    throw error;
  }
};

// Statistics
export const getParkingStats = async (): Promise<ParkingStats> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all sessions
    const allSessionsSnapshot = await getDocs(collection(db, 'parkingSessions'));
    const allSessions = allSessionsSnapshot.docs.map(doc => doc.data() as ParkingSession);

    // Calculate stats
    const totalSessions = allSessions.length;
    const activeSessions = allSessions.filter(session => session.status === 'active').length;
    const completedSessions = allSessions.filter(session => session.status === 'completed').length;

    const totalRevenue = allSessions
      .filter(session => session.status === 'completed')
      .reduce((sum, session) => sum + session.cost, 0);

    const completedSessionsWithDuration = allSessions.filter(
      session => session.status === 'completed' && session.duration
    );
    const averageSessionDuration = completedSessionsWithDuration.length > 0
      ? completedSessionsWithDuration.reduce((sum, session) => sum + (session.duration || 0), 0) / completedSessionsWithDuration.length
      : 0;

    // Find most popular spot
    const spotCounts: { [key: string]: number } = {};
    allSessions.forEach(session => {
      if (session.spot) {
        spotCounts[session.spot] = (spotCounts[session.spot] || 0) + 1;
      }
    });
    const mostPopularSpot = Object.keys(spotCounts).reduce((a, b) =>
      spotCounts[a] > spotCounts[b] ? a : b, 'N/A'
    );

    // Today's revenue
    const todayRevenue = allSessions
      .filter(session =>
        session.status === 'completed' &&
        new Date(session.endTime || session.createdAt) >= todayStart
      )
      .reduce((sum, session) => sum + session.cost, 0);

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalRevenue,
      averageSessionDuration,
      mostPopularSpot,
      todayRevenue
    };
  } catch (error) {
    console.error('Error getting parking stats:', error);
    throw error;
  }
};

// Helper function for guard dashboard - Get active sessions
export const getActiveSessions = async (): Promise<ParkingSession[]> => {
  try {
    return await getAllActiveSessions();
  } catch (error) {
    console.error('Error getting active sessions:', error);
    throw error;
  }
};