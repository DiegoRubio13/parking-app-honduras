import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getAllActiveSessions } from './parkingService';
import { getAllUsers } from './userService';

export interface Incident {
  id: string;
  guardId: string;
  guardName: string;
  type: 'damage' | 'theft' | 'dispute' | 'emergency' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  vehiclePlate?: string;
  photoUrls?: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface ManualEntry {
  id: string;
  guardId: string;
  guardName: string;
  licensePlate: string;
  driverName: string;
  driverIdNumber: string;
  driverPhone?: string;
  vehicleModel?: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  cost?: number;
  paymentMethod?: 'cash' | 'transfer';
  photoUrl?: string;
  notes?: string;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface GuardShift {
  id: string;
  guardId: string;
  guardName: string;
  location: string;
  startTime: string;
  endTime?: string;
  totalEntries: number;
  totalExits: number;
  totalIncidents: number;
  totalManualEntries: number;
  revenue: number;
  status: 'active' | 'completed';
  createdAt: string;
}

// Incident Management
export const createIncident = async (
  incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Incident> => {
  try {
    const now = new Date().toISOString();
    const newIncident = {
      ...incidentData,
      status: 'open' as const,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'incidents'), newIncident);
    const createdIncident = { ...newIncident, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdIncident;
  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
};

export const getIncidentById = async (incidentId: string): Promise<Incident | null> => {
  try {
    const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
    if (incidentDoc.exists()) {
      return incidentDoc.data() as Incident;
    }
    return null;
  } catch (error) {
    console.error('Error getting incident:', error);
    throw error;
  }
};

export const getAllIncidents = async (limitCount: number = 50): Promise<Incident[]> => {
  try {
    const q = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Incident);
  } catch (error) {
    console.error('Error getting incidents:', error);
    throw error;
  }
};

export const getIncidentsByGuard = async (guardId: string): Promise<Incident[]> => {
  try {
    const q = query(
      collection(db, 'incidents'),
      where('guardId', '==', guardId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Incident);
  } catch (error) {
    console.error('Error getting incidents by guard:', error);
    throw error;
  }
};

export const updateIncidentStatus = async (
  incidentId: string,
  status: Incident['status'],
  resolvedBy?: string,
  resolutionNotes?: string
): Promise<void> => {
  try {
    const updates: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'resolved' || status === 'closed') {
      updates.resolvedAt = new Date().toISOString();
      updates.resolvedBy = resolvedBy;
      updates.resolutionNotes = resolutionNotes;
    }

    await updateDoc(doc(db, 'incidents', incidentId), updates);
  } catch (error) {
    console.error('Error updating incident status:', error);
    throw error;
  }
};

// Manual Entry Management
export const createManualEntry = async (
  entryData: Omit<ManualEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ManualEntry> => {
  try {
    const now = new Date().toISOString();
    const newEntry = {
      ...entryData,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'manualEntries'), newEntry);
    const createdEntry = { ...newEntry, id: docRef.id };

    // Update the document with the id
    await updateDoc(docRef, { id: docRef.id });

    return createdEntry;
  } catch (error) {
    console.error('Error creating manual entry:', error);
    throw error;
  }
};

export const getManualEntryById = async (entryId: string): Promise<ManualEntry | null> => {
  try {
    const entryDoc = await getDoc(doc(db, 'manualEntries', entryId));
    if (entryDoc.exists()) {
      return entryDoc.data() as ManualEntry;
    }
    return null;
  } catch (error) {
    console.error('Error getting manual entry:', error);
    throw error;
  }
};

export const getActiveManualEntries = async (guardId?: string): Promise<ManualEntry[]> => {
  try {
    let q = query(
      collection(db, 'manualEntries'),
      where('status', '==', 'active'),
      orderBy('entryTime', 'desc')
    );

    if (guardId) {
      q = query(
        collection(db, 'manualEntries'),
        where('guardId', '==', guardId),
        where('status', '==', 'active'),
        orderBy('entryTime', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ManualEntry);
  } catch (error) {
    console.error('Error getting active manual entries:', error);
    throw error;
  }
};

export const completeManualEntry = async (
  entryId: string,
  paymentMethod: 'cash' | 'transfer',
  notes?: string
): Promise<ManualEntry> => {
  try {
    const entry = await getManualEntryById(entryId);
    if (!entry) {
      throw new Error('Manual entry not found');
    }

    const exitTime = new Date();
    const entryTime = new Date(entry.entryTime);
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const duration = Math.ceil(durationMs / (1000 * 60)); // Convert to minutes

    // Calculate cost (L 1.50 per minute)
    const cost = duration * 1.5;

    const updates = {
      exitTime: exitTime.toISOString(),
      duration,
      cost,
      paymentMethod,
      status: 'completed' as const,
      notes: notes || entry.notes,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'manualEntries', entryId), updates);

    return { ...entry, ...updates };
  } catch (error) {
    console.error('Error completing manual entry:', error);
    throw error;
  }
};

// Guard Shift Management
export const startGuardShift = async (
  guardId: string,
  guardName: string,
  location: string
): Promise<GuardShift> => {
  try {
    const shiftData: Omit<GuardShift, 'id'> = {
      guardId,
      guardName,
      location,
      startTime: new Date().toISOString(),
      totalEntries: 0,
      totalExits: 0,
      totalIncidents: 0,
      totalManualEntries: 0,
      revenue: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'guardShifts'), shiftData);
    const createdShift = { ...shiftData, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdShift;
  } catch (error) {
    console.error('Error starting guard shift:', error);
    throw error;
  }
};

export const endGuardShift = async (shiftId: string): Promise<GuardShift> => {
  try {
    const shiftDoc = await getDoc(doc(db, 'guardShifts', shiftId));
    if (!shiftDoc.exists()) {
      throw new Error('Shift not found');
    }

    const shift = shiftDoc.data() as GuardShift;

    const updates = {
      endTime: new Date().toISOString(),
      status: 'completed' as const
    };

    await updateDoc(doc(db, 'guardShifts', shiftId), updates);

    return { ...shift, ...updates };
  } catch (error) {
    console.error('Error ending guard shift:', error);
    throw error;
  }
};

export const getActiveShiftByGuard = async (guardId: string): Promise<GuardShift | null> => {
  try {
    const q = query(
      collection(db, 'guardShifts'),
      where('guardId', '==', guardId),
      where('status', '==', 'active'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as GuardShift;
    }
    return null;
  } catch (error) {
    console.error('Error getting active shift:', error);
    throw error;
  }
};

// Helper function for dashboard - Get active parking sessions
export const getActiveSessions = async () => {
  try {
    return await getAllActiveSessions();
  } catch (error) {
    console.error('Error getting active sessions:', error);
    throw error;
  }
};

// Export types for use in other files
export type { Incident, ManualEntry, GuardShift };