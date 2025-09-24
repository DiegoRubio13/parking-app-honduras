import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  Timestamp,
  writeBatch,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserStats } from './userService';
import { ParkingLocation } from './parkingLocationService';
import { Transaction, ParkingSession } from '../types/database';

// ==================== DASHBOARD & ANALYTICS ====================

export interface DashboardStats {
  totalRevenue: number;
  totalSessions: number;
  activeUsers: number;
  occupancyRate: number;
  revenueGrowth: number;
  sessionsGrowth: number;
  topLocations: {
    id: string;
    name: string;
    revenue: number;
    sessions: number;
  }[];
  recentActivity: {
    type: 'session' | 'transaction' | 'user';
    description: string;
    timestamp: Date;
    amount?: number;
  }[];
}

export interface RealtimeOccupancy {
  locationId: string;
  locationName: string;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  occupancyRate: number;
  revenue: number;
  lastUpdate: Date;
}

export interface ReportData {
  period: 'today' | 'week' | 'month' | 'custom';
  startDate: Date;
  endDate: Date;
  financial: {
    totalRevenue: number;
    totalTransactions: number;
    averagePerSession: number;
    growthRate: number;
    revenueByLocation: { locationId: string; name: string; revenue: number }[];
    revenueByPaymentMethod: { method: string; amount: number }[];
  };
  usage: {
    totalSessions: number;
    averageDuration: number;
    peakHours: { hour: number; count: number }[];
    maxOccupancy: number;
    sessionsByLocation: { locationId: string; name: string; count: number }[];
  };
  users: {
    uniqueUsers: number;
    newRegistrations: number;
    frequentUsers: number;
    retentionRate: number;
    usersByRole: { role: string; count: number }[];
  };
}

// Get dashboard statistics with real-time data
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Get today's sessions
    const todaySessionsQuery = query(
      collection(db, 'sessions'),
      where('entryTime', '>=', Timestamp.fromDate(todayStart)),
      orderBy('entryTime', 'desc')
    );
    const todaySessionsSnapshot = await getDocs(todaySessionsQuery);
    const todaySessions = todaySessionsSnapshot.docs.map(doc => doc.data() as ParkingSession);

    // Get yesterday's sessions for growth calculation
    const yesterdaySessionsQuery = query(
      collection(db, 'sessions'),
      where('entryTime', '>=', Timestamp.fromDate(yesterdayStart)),
      where('entryTime', '<', Timestamp.fromDate(todayStart))
    );
    const yesterdaySessionsSnapshot = await getDocs(yesterdaySessionsQuery);
    const yesterdaySessions = yesterdaySessionsSnapshot.docs.map(doc => doc.data() as ParkingSession);

    // Get today's transactions
    const todayTransactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', Timestamp.fromDate(todayStart)),
      orderBy('createdAt', 'desc')
    );
    const todayTransactionsSnapshot = await getDocs(todayTransactionsQuery);
    const todayTransactions = todayTransactionsSnapshot.docs.map(doc => doc.data() as Transaction);

    // Calculate revenue
    const totalRevenue = todayTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const yesterdayRevenue = await getYesterdayRevenue(yesterdayStart, todayStart);
    const revenueGrowth = yesterdayRevenue > 0
      ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Get active users
    const activeUsersQuery = query(
      collection(db, 'users'),
      where('isActive', '==', true)
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);

    // Calculate occupancy rate
    const locationsSnapshot = await getDocs(collection(db, 'parkingLocations'));
    const locations = locationsSnapshot.docs.map(doc => doc.data() as ParkingLocation);
    const totalSpots = locations.reduce((sum, loc) => sum + loc.totalSpots, 0);
    const availableSpots = locations.reduce((sum, loc) => sum + loc.availableSpots, 0);
    const occupancyRate = totalSpots > 0 ? ((totalSpots - availableSpots) / totalSpots) * 100 : 0;

    // Calculate sessions growth
    const sessionsGrowth = yesterdaySessions.length > 0
      ? ((todaySessions.length - yesterdaySessions.length) / yesterdaySessions.length) * 100
      : 0;

    // Get top locations by revenue
    const locationRevenue = new Map<string, { name: string; revenue: number; sessions: number }>();

    for (const session of todaySessions) {
      const location = locations.find(loc => loc.id === session.location);
      if (location) {
        const current = locationRevenue.get(session.location) || {
          name: location.name,
          revenue: 0,
          sessions: 0
        };
        locationRevenue.set(session.location, {
          name: current.name,
          revenue: current.revenue + (session.cost || 0),
          sessions: current.sessions + 1
        });
      }
    }

    const topLocations = Array.from(locationRevenue.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get recent activity
    const recentActivity = [
      ...todaySessions.slice(0, 3).map(s => ({
        type: 'session' as const,
        description: `Nueva sesión en ${locations.find(l => l.id === s.location)?.name || 'Ubicación'}`,
        timestamp: s.entryTime instanceof Date ? s.entryTime : new Date(),
        amount: s.cost
      })),
      ...todayTransactions.slice(0, 3).map(t => ({
        type: 'transaction' as const,
        description: `Transacción ${t.type}: L${t.amount}`,
        timestamp: t.createdAt instanceof Date ? t.createdAt : new Date(),
        amount: t.amount
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

    return {
      totalRevenue,
      totalSessions: todaySessions.length,
      activeUsers: activeUsersSnapshot.size,
      occupancyRate,
      revenueGrowth,
      sessionsGrowth,
      topLocations,
      recentActivity
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

// Helper function to get yesterday's revenue
const getYesterdayRevenue = async (yesterdayStart: Date, todayStart: Date): Promise<number> => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', Timestamp.fromDate(yesterdayStart)),
      where('createdAt', '<', Timestamp.fromDate(todayStart)),
      where('status', '==', 'completed')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
  } catch (error) {
    console.error('Error getting yesterday revenue:', error);
    return 0;
  }
};

// Get real-time occupancy data
export const getRealtimeOccupancy = async (): Promise<RealtimeOccupancy[]> => {
  try {
    const locationsSnapshot = await getDocs(collection(db, 'parkingLocations'));
    const locations = locationsSnapshot.docs.map(doc => doc.data() as ParkingLocation);

    const occupancyData = await Promise.all(
      locations.map(async (location) => {
        const occupiedSpots = location.totalSpots - location.availableSpots;
        const occupancyRate = location.totalSpots > 0
          ? (occupiedSpots / location.totalSpots) * 100
          : 0;

        // Get today's revenue for this location
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('location', '==', location.id),
          where('entryTime', '>=', Timestamp.fromDate(todayStart)),
          where('status', '==', 'completed')
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const revenue = sessionsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().cost || 0), 0);

        return {
          locationId: location.id,
          locationName: location.name,
          totalSpots: location.totalSpots,
          occupiedSpots,
          availableSpots: location.availableSpots,
          occupancyRate,
          revenue,
          lastUpdate: new Date()
        };
      })
    );

    return occupancyData.sort((a, b) => b.occupancyRate - a.occupancyRate);
  } catch (error) {
    console.error('Error getting realtime occupancy:', error);
    throw error;
  }
};

// Generate comprehensive report
export const generateReport = async (
  period: 'today' | 'week' | 'month' | 'custom',
  customStart?: Date,
  customEnd?: Date
): Promise<ReportData> => {
  try {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'custom':
        startDate = customStart || new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = customEnd || now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('entryTime', '>=', Timestamp.fromDate(startDate)),
      where('entryTime', '<=', Timestamp.fromDate(endDate)),
      orderBy('entryTime', 'desc')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    const sessions = sessionsSnapshot.docs.map(doc => doc.data() as ParkingSession);

    // Get transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);

    // Get users
    const usersQuery = query(
      collection(db, 'users'),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString())
    );
    const usersSnapshot = await getDocs(usersQuery);
    const newUsers = usersSnapshot.docs.map(doc => doc.data() as User);

    // Get locations
    const locationsSnapshot = await getDocs(collection(db, 'parkingLocations'));
    const locations = locationsSnapshot.docs.map(doc => doc.data() as ParkingLocation);

    // Calculate financial metrics
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averagePerSession = sessions.length > 0 ? totalRevenue / sessions.length : 0;

    // Previous period for growth calculation
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousEnd = startDate;

    const previousTransactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', Timestamp.fromDate(previousStart)),
      where('createdAt', '<', Timestamp.fromDate(previousEnd)),
      where('status', '==', 'completed')
    );
    const previousTransactionsSnapshot = await getDocs(previousTransactionsQuery);
    const previousRevenue = previousTransactionsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0), 0
    );
    const growthRate = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Revenue by location
    const revenueByLocation = locations.map(location => {
      const locationSessions = sessions.filter(s => s.location === location.id && s.status === 'completed');
      const revenue = locationSessions.reduce((sum, s) => sum + (s.cost || 0), 0);
      return {
        locationId: location.id,
        name: location.name,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Revenue by payment method
    const revenueByPaymentMethod = completedTransactions.reduce((acc, t) => {
      const existing = acc.find(item => item.method === t.paymentMethod);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ method: t.paymentMethod, amount: t.amount });
      }
      return acc;
    }, [] as { method: string; amount: number }[]);

    // Calculate usage metrics
    const totalDuration = sessions
      .filter(s => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

    // Peak hours analysis
    const hourCounts = new Map<number, number>();
    sessions.forEach(session => {
      const hour = session.entryTime instanceof Date
        ? session.entryTime.getHours()
        : new Date(session.entryTime).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);

    // Sessions by location
    const sessionsByLocation = locations.map(location => ({
      locationId: location.id,
      name: location.name,
      count: sessions.filter(s => s.location === location.id).length
    })).sort((a, b) => b.count - a.count);

    // User metrics
    const uniqueUserIds = new Set(sessions.map(s => s.userId));
    const allUsersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = allUsersSnapshot.docs.map(doc => doc.data() as User);

    const usersByRole = [
      { role: 'client', count: allUsers.filter(u => u.role === 'client' && u.isActive).length },
      { role: 'guard', count: allUsers.filter(u => u.role === 'guard' && u.isActive).length },
      { role: 'admin', count: allUsers.filter(u => u.role === 'admin' && u.isActive).length }
    ];

    // Calculate retention rate (users with > 1 session)
    const userSessionCounts = new Map<string, number>();
    sessions.forEach(session => {
      userSessionCounts.set(session.userId, (userSessionCounts.get(session.userId) || 0) + 1);
    });
    const frequentUsersCount = Array.from(userSessionCounts.values()).filter(count => count > 1).length;
    const retentionRate = uniqueUserIds.size > 0
      ? (frequentUsersCount / uniqueUserIds.size) * 100
      : 0;

    return {
      period,
      startDate,
      endDate,
      financial: {
        totalRevenue,
        totalTransactions: completedTransactions.length,
        averagePerSession,
        growthRate,
        revenueByLocation,
        revenueByPaymentMethod
      },
      usage: {
        totalSessions: sessions.length,
        averageDuration,
        peakHours,
        maxOccupancy: Math.max(...locations.map(l =>
          l.totalSpots > 0 ? ((l.totalSpots - l.availableSpots) / l.totalSpots) * 100 : 0
        )),
        sessionsByLocation
      },
      users: {
        uniqueUsers: uniqueUserIds.size,
        newRegistrations: newUsers.length,
        frequentUsers: frequentUsersCount,
        retentionRate,
        usersByRole
      }
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users with filters and pagination
export const getUsers = async (
  role?: 'client' | 'guard' | 'admin',
  isActive?: boolean,
  limitCount: number = 50,
  lastDoc?: any
): Promise<{ users: User[]; lastDoc: any }> => {
  try {
    let q = query(collection(db, 'users'));

    if (role) {
      q = query(q, where('role', '==', role));
    }
    if (isActive !== undefined) {
      q = query(q, where('isActive', '==', isActive));
    }

    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => doc.data() as User);
    const lastDocument = snapshot.docs[snapshot.docs.length - 1];

    return { users, lastDoc: lastDocument };
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Create user (admin function)
export const createUserAdmin = async (userData: Omit<User, 'uid' | 'createdAt'>): Promise<User> => {
  try {
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users'), newUser);
    const createdUser = { ...newUser, uid: docRef.id };

    await updateDoc(docRef, { uid: docRef.id });

    return createdUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user (admin function)
export const updateUserAdmin = async (uid: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      lastLoginAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Suspend/Activate user
export const toggleUserStatus = async (uid: string, isActive: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive,
      lastLoginAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

// Delete user (permanent)
export const deleteUserPermanent = async (uid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Error deleting user permanently:', error);
    throw error;
  }
};

// ==================== LOCATION MANAGEMENT ====================

// Create parking location
export const createParkingLocation = async (
  locationData: Omit<ParkingLocation, 'id' | 'createdAt'>
): Promise<ParkingLocation> => {
  try {
    const newLocation = {
      ...locationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'parkingLocations'), newLocation);
    const createdLocation = { ...newLocation, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdLocation;
  } catch (error) {
    console.error('Error creating parking location:', error);
    throw error;
  }
};

// Update parking location
export const updateParkingLocation = async (
  id: string,
  updates: Partial<ParkingLocation>
): Promise<void> => {
  try {
    const locationRef = doc(db, 'parkingLocations', id);
    await updateDoc(locationRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating parking location:', error);
    throw error;
  }
};

// Delete parking location
export const deleteParkingLocation = async (id: string): Promise<void> => {
  try {
    // Check if there are active sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('location', '==', id),
      where('status', '==', 'active')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);

    if (!sessionsSnapshot.empty) {
      throw new Error('Cannot delete location with active parking sessions');
    }

    await deleteDoc(doc(db, 'parkingLocations', id));
  } catch (error) {
    console.error('Error deleting parking location:', error);
    throw error;
  }
};

// Toggle location active status
export const toggleLocationStatus = async (id: string, isActive: boolean): Promise<void> => {
  try {
    const locationRef = doc(db, 'parkingLocations', id);
    await updateDoc(locationRef, {
      isActive,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling location status:', error);
    throw error;
  }
};

// ==================== DATA EXPORT ====================

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dataType: 'users' | 'locations' | 'sessions' | 'transactions' | 'report';
  filters?: {
    startDate?: Date;
    endDate?: Date;
    role?: string;
    status?: string;
  };
}

// Generate CSV export
export const generateCSVExport = async (options: ExportOptions): Promise<string> => {
  try {
    let data: any[] = [];
    let headers: string[] = [];

    switch (options.dataType) {
      case 'users':
        const usersSnapshot = await getDocs(collection(db, 'users'));
        data = usersSnapshot.docs.map(doc => doc.data());
        headers = ['uid', 'name', 'phone', 'role', 'balance', 'isActive', 'createdAt'];
        break;

      case 'locations':
        const locationsSnapshot = await getDocs(collection(db, 'parkingLocations'));
        data = locationsSnapshot.docs.map(doc => doc.data());
        headers = ['id', 'name', 'address', 'totalSpots', 'availableSpots', 'hourlyRate', 'isActive'];
        break;

      case 'sessions':
        let sessionsQuery = query(collection(db, 'sessions'));
        if (options.filters?.startDate) {
          sessionsQuery = query(
            sessionsQuery,
            where('entryTime', '>=', Timestamp.fromDate(options.filters.startDate))
          );
        }
        if (options.filters?.endDate) {
          sessionsQuery = query(
            sessionsQuery,
            where('entryTime', '<=', Timestamp.fromDate(options.filters.endDate))
          );
        }
        const sessionsSnapshot = await getDocs(sessionsQuery);
        data = sessionsSnapshot.docs.map(doc => doc.data());
        headers = ['id', 'userId', 'location', 'entryTime', 'exitTime', 'duration', 'cost', 'status'];
        break;

      case 'transactions':
        let transactionsQuery = query(collection(db, 'transactions'));
        if (options.filters?.startDate) {
          transactionsQuery = query(
            transactionsQuery,
            where('createdAt', '>=', Timestamp.fromDate(options.filters.startDate))
          );
        }
        if (options.filters?.endDate) {
          transactionsQuery = query(
            transactionsQuery,
            where('createdAt', '<=', Timestamp.fromDate(options.filters.endDate))
          );
        }
        const transactionsSnapshot = await getDocs(transactionsQuery);
        data = transactionsSnapshot.docs.map(doc => doc.data());
        headers = ['id', 'userId', 'type', 'amount', 'paymentMethod', 'status', 'createdAt'];
        break;
    }

    // Generate CSV string
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  } catch (error) {
    console.error('Error generating CSV export:', error);
    throw error;
  }
};

// Generate PDF export metadata (actual PDF generation would be done client-side)
export const generatePDFExportData = async (options: ExportOptions): Promise<any> => {
  try {
    const report = await generateReport(
      options.filters?.startDate && options.filters?.endDate ? 'custom' : 'month',
      options.filters?.startDate,
      options.filters?.endDate
    );

    return {
      title: 'Reporte ParKing',
      generatedAt: new Date().toISOString(),
      period: `${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}`,
      data: report
    };
  } catch (error) {
    console.error('Error generating PDF export data:', error);
    throw error;
  }
};

// ==================== BULK OPERATIONS ====================

// Bulk update users
export const bulkUpdateUsers = async (
  userIds: string[],
  updates: Partial<User>
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    userIds.forEach(uid => {
      const userRef = doc(db, 'users', uid);
      batch.update(userRef, {
        ...updates,
        lastLoginAt: new Date().toISOString()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error bulk updating users:', error);
    throw error;
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (userIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);

    userIds.forEach(uid => {
      const userRef = doc(db, 'users', uid);
      batch.delete(userRef);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    throw error;
  }
};

// ==================== SEARCH & FILTERS ====================

// Advanced user search
export const searchUsers = async (
  searchTerm: string,
  filters?: {
    role?: 'client' | 'guard' | 'admin';
    isActive?: boolean;
  }
): Promise<User[]> => {
  try {
    let q = query(collection(db, 'users'));

    if (filters?.role) {
      q = query(q, where('role', '==', filters.role));
    }
    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    const snapshot = await getDocs(q);
    const allUsers = snapshot.docs.map(doc => doc.data() as User);

    // Client-side filtering for search term
    const searchLower = searchTerm.toLowerCase();
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Advanced location search
export const searchLocations = async (searchTerm: string): Promise<ParkingLocation[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'parkingLocations'));
    const allLocations = snapshot.docs.map(doc => doc.data() as ParkingLocation);

    const searchLower = searchTerm.toLowerCase();
    return allLocations.filter(location =>
      location.name.toLowerCase().includes(searchLower) ||
      location.address.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};