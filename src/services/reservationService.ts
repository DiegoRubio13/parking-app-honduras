import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  spotId: string;
  spotNumber: string;
  location: string;
  vehicleId?: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export const createReservation = async (
  reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reservation> => {
  try {
    const now = new Date().toISOString();
    const newReservation = {
      ...reservationData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'reservations'), newReservation);
    const createdReservation = { ...newReservation, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdReservation;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

export const getReservationById = async (reservationId: string): Promise<Reservation | null> => {
  try {
    const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
    if (reservationDoc.exists()) {
      return reservationDoc.data() as Reservation;
    }
    return null;
  } catch (error) {
    console.error('Error getting reservation:', error);
    throw error;
  }
};

export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  try {
    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    let reservations = querySnapshot.docs.map(doc => doc.data() as Reservation);

    // Sort by start time descending
    reservations = reservations.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return dateB - dateA;
    });

    return reservations;
  } catch (error) {
    console.error('Error getting user reservations:', error);
    return [];
  }
};

export const cancelReservation = async (reservationId: string): Promise<void> => {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};

export const activateReservation = async (reservationId: string): Promise<void> => {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error activating reservation:', error);
    throw error;
  }
};

export const completeReservation = async (
  reservationId: string,
  actualCost: number
): Promise<void> => {
  try {
    const reservationRef = doc(db, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: 'completed',
      actualCost,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error completing reservation:', error);
    throw error;
  }
};