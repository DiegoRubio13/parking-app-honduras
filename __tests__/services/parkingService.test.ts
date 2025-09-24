import {
  createParkingSession,
  getParkingSessionById,
  getActiveSessionByUser,
  getUserParkingHistory,
  startParkingSession,
  endParkingSession,
  createParkingSpot,
  getParkingSpotById,
  getAllParkingSpots,
  getAvailableParkingSpots,
  updateParkingSpot,
  getParkingStats,
} from '../../src/services/parkingService';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { updateUserBalance, getUserById } from '../../src/services/userService';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date().toISOString()),
}));

jest.mock('../../src/services/userService', () => ({
  updateUserBalance: jest.fn(),
  getUserById: jest.fn(),
}));

describe('ParkingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createParkingSession', () => {
    it('should create a parking session successfully', async () => {
      const mockDocRef = { id: 'session123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const sessionData = {
        userId: 'user123',
        userPhone: '+50412345678',
        userName: 'Test User',
        startTime: new Date().toISOString(),
        location: 'Mall',
        cost: 0,
        status: 'active' as const,
        qrCode: 'PARKING_user123_1234567890',
      };

      const result = await createParkingSession(sessionData);

      expect(result.id).toBe('session123');
      expect(result.userId).toBe('user123');
      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      (addDoc as jest.Mock).mockRejectedValue(new Error('Database error'));

      const sessionData = {
        userId: 'user123',
        userPhone: '+50412345678',
        userName: 'Test User',
        startTime: new Date().toISOString(),
        location: 'Mall',
        cost: 0,
        status: 'active' as const,
        qrCode: 'PARKING_user123_1234567890',
      };

      await expect(createParkingSession(sessionData)).rejects.toThrow('Database error');
    });
  });

  describe('getParkingSessionById', () => {
    it('should retrieve session by id', async () => {
      const mockSession = {
        id: 'session123',
        userId: 'user123',
        status: 'active',
        cost: 0,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });

      const result = await getParkingSessionById('session123');

      expect(result).toEqual(mockSession);
    });

    it('should return null for non-existent session', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await getParkingSessionById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getActiveSessionByUser', () => {
    it('should return active session for user', async () => {
      const mockSession = {
        id: 'session123',
        userId: 'user123',
        status: 'active',
      };

      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{
          data: () => mockSession,
        }],
      });

      const result = await getActiveSessionByUser('user123');

      expect(result).toEqual(mockSession);
    });

    it('should return null when no active session exists', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await getActiveSessionByUser('user123');

      expect(result).toBeNull();
    });
  });

  describe('getUserParkingHistory', () => {
    it('should retrieve user parking history sorted by date', async () => {
      const mockSessions = [
        {
          id: 'session1',
          userId: 'user123',
          createdAt: '2024-01-15T10:00:00Z',
          status: 'completed',
        },
        {
          id: 'session2',
          userId: 'user123',
          createdAt: '2024-01-16T10:00:00Z',
          status: 'completed',
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockSessions.map(session => ({
          id: session.id,
          data: () => session,
        })),
      });

      const result = await getUserParkingHistory('user123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('session2'); // Most recent first
      expect(result[1].id).toBe('session1');
    });

    it('should return empty array on error', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getUserParkingHistory('user123');

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const mockSessions = Array.from({ length: 30 }, (_, i) => ({
        id: `session${i}`,
        userId: 'user123',
        createdAt: new Date(Date.now() - i * 1000000).toISOString(),
        status: 'completed',
      }));

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockSessions.map(session => ({
          id: session.id,
          data: () => session,
        })),
      });

      const result = await getUserParkingHistory('user123', 10);

      expect(result).toHaveLength(10);
    });
  });

  describe('startParkingSession', () => {
    beforeEach(() => {
      const mockDocRef = { id: 'session123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should start a new parking session', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await startParkingSession(
        'user123',
        '+50412345678',
        'Test User',
        'Mall',
        'A1'
      );

      expect(result.userId).toBe('user123');
      expect(result.status).toBe('active');
      expect(result.location).toBe('Mall');
      expect(result.spot).toBe('A1');
      expect(result.qrCode).toContain('PARKING_user123');
    });

    it('should prevent starting session if user already has active session', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{
          data: () => ({ id: 'existingSession', status: 'active' }),
        }],
      });

      await expect(
        startParkingSession('user123', '+50412345678', 'Test User', 'Mall')
      ).rejects.toThrow('El usuario ya tiene una sesión activa');
    });

    it('should update parking spot when spot is specified', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: [],
      });

      await startParkingSession(
        'user123',
        '+50412345678',
        'Test User',
        'Mall',
        'A1'
      );

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('endParkingSession', () => {
    it('should end parking session and calculate cost', async () => {
      const startTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const mockSession = {
        id: 'session123',
        userId: 'user123',
        status: 'active',
        startTime: startTime.toISOString(),
        spot: 'A1',
      };

      const mockUser = {
        uid: 'user123',
        balance: 100,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });

      (getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await endParkingSession('session123', 'guard123', 'balance');

      expect(result.status).toBe('completed');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.cost).toBeGreaterThan(0);
      expect(updateDoc).toHaveBeenCalled();
      expect(updateUserBalance).toHaveBeenCalled();
    });

    it('should throw error if session not found', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await expect(endParkingSession('non-existent')).rejects.toThrow('Sesión no encontrada');
    });

    it('should throw error if session is not active', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'completed' }),
      });

      await expect(endParkingSession('session123')).rejects.toThrow('La sesión no está activa');
    });

    it('should not deduct balance for cash payment', async () => {
      const mockSession = {
        id: 'session123',
        userId: 'user123',
        status: 'active',
        startTime: new Date().toISOString(),
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });

      await endParkingSession('session123', 'guard123', 'cash');

      expect(updateUserBalance).not.toHaveBeenCalled();
    });

    it('should free up parking spot when session ends', async () => {
      const mockSession = {
        id: 'session123',
        userId: 'user123',
        status: 'active',
        startTime: new Date().toISOString(),
        spot: 'A1',
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockSession,
      });

      await endParkingSession('session123');

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('Parking Spots', () => {
    describe('createParkingSpot', () => {
      it('should create a parking spot successfully', async () => {
        const mockDocRef = { id: 'spot123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
        (updateDoc as jest.Mock).mockResolvedValue(undefined);

        const spotData = {
          number: 'A1',
          location: 'Mall',
          isOccupied: false,
          type: 'regular' as const,
          status: 'available' as const,
        };

        const result = await createParkingSpot(spotData);

        expect(result.id).toBe('spot123');
        expect(result.number).toBe('A1');
        expect(addDoc).toHaveBeenCalled();
      });
    });

    describe('getAllParkingSpots', () => {
      it('should retrieve all parking spots sorted by number', async () => {
        const mockSpots = [
          { number: 'B1', location: 'Mall' },
          { number: 'A1', location: 'Mall' },
          { number: 'C1', location: 'Mall' },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
          docs: mockSpots.map(spot => ({
            data: () => spot,
          })),
        });

        const result = await getAllParkingSpots();

        expect(result).toHaveLength(3);
        expect(result[0].number).toBe('A1');
        expect(result[1].number).toBe('B1');
        expect(result[2].number).toBe('C1');
      });

      it('should filter by location when specified', async () => {
        const mockSpots = [
          { number: 'A1', location: 'Mall' },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
          docs: mockSpots.map(spot => ({
            data: () => spot,
          })),
        });

        await getAllParkingSpots('Mall');

        expect(query).toHaveBeenCalled();
        expect(where).toHaveBeenCalledWith('location', '==', 'Mall');
      });
    });

    describe('getAvailableParkingSpots', () => {
      it('should retrieve only available spots', async () => {
        const mockSpots = [
          { number: 'A1', status: 'available', isOccupied: false },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
          docs: mockSpots.map(spot => ({
            data: () => spot,
          })),
        });

        const result = await getAvailableParkingSpots();

        expect(result).toHaveLength(1);
        expect(where).toHaveBeenCalledWith('status', '==', 'available');
        expect(where).toHaveBeenCalledWith('isOccupied', '==', false);
      });
    });

    describe('updateParkingSpot', () => {
      it('should update parking spot with lastUpdated timestamp', async () => {
        await updateParkingSpot('spot123', { isOccupied: true });

        expect(updateDoc).toHaveBeenCalled();
        const callArgs = (updateDoc as jest.Mock).mock.calls[0][1];
        expect(callArgs.isOccupied).toBe(true);
        expect(callArgs.lastUpdated).toBeDefined();
      });
    });
  });

  describe('getParkingStats', () => {
    it('should calculate parking statistics correctly', async () => {
      const mockSessions = [
        {
          status: 'active',
          cost: 0,
        },
        {
          status: 'completed',
          cost: 30,
          duration: 30,
          spot: 'A1',
          endTime: new Date().toISOString(),
        },
        {
          status: 'completed',
          cost: 60,
          duration: 60,
          spot: 'A1',
          endTime: new Date().toISOString(),
        },
        {
          status: 'completed',
          cost: 45,
          duration: 45,
          spot: 'B1',
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockSessions.map(session => ({
          data: () => session,
        })),
      });

      const stats = await getParkingStats();

      expect(stats.totalSessions).toBe(4);
      expect(stats.activeSessions).toBe(1);
      expect(stats.completedSessions).toBe(3);
      expect(stats.totalRevenue).toBe(135);
      expect(stats.averageSessionDuration).toBe(45);
      expect(stats.mostPopularSpot).toBe('A1');
      expect(stats.todayRevenue).toBeLessThanOrEqual(90);
    });

    it('should handle empty sessions', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [],
      });

      const stats = await getParkingStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.activeSessions).toBe(0);
      expect(stats.completedSessions).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.averageSessionDuration).toBe(0);
    });
  });
});