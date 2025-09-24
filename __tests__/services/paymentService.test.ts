import {
  getPaymentPackages,
  createPaymentTransaction,
  processPurchaseTransaction,
  completeTransaction,
  cancelTransaction,
  getUserTransactions,
  getPendingTransactions,
  getPaymentStats,
  saveStripePaymentMethod,
  getUserPaymentMethods,
  setDefaultPaymentMethod,
  createStripePaymentTransaction,
  completeStripePayment,
} from '../../src/services/paymentService';
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

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentPackages', () => {
    it('should return active payment packages sorted by price', async () => {
      const mockPackages = [
        { id: '1', name: 'Premium', price: 240, isActive: true },
        { id: '2', name: 'Basic', price: 60, isActive: true },
        { id: '3', name: 'Standard', price: 135, isActive: true },
        { id: '4', name: 'Inactive', price: 100, isActive: false },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: mockPackages.map(pkg => ({
          data: () => pkg,
          id: pkg.id,
        })),
      });

      const result = await getPaymentPackages();

      expect(result).toHaveLength(3);
      expect(result[0].price).toBe(60); // Basic
      expect(result[1].price).toBe(135); // Standard
      expect(result[2].price).toBe(240); // Premium
    });

    it('should initialize with default packages if none exist', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: [],
      });
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-package' });

      const result = await getPaymentPackages();

      expect(result).toHaveLength(3);
      expect(addDoc).toHaveBeenCalled();
    });

    it('should return default packages on error', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getPaymentPackages();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Básico');
    });
  });

  describe('createPaymentTransaction', () => {
    it('should create a payment transaction successfully', async () => {
      const mockDocRef = { id: 'transaction123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const transactionData = {
        userId: 'user123',
        userPhone: '+50412345678',
        userName: 'Test User',
        type: 'purchase' as const,
        method: 'cash' as const,
        amount: 60,
        minutes: 60,
        status: 'completed' as const,
        description: 'Test purchase',
      };

      const result = await createPaymentTransaction(transactionData);

      expect(result.id).toBe('transaction123');
      expect(result.userId).toBe('user123');
      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should clean undefined and null values', async () => {
      const mockDocRef = { id: 'transaction123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const transactionData = {
        userId: 'user123',
        userPhone: '+50412345678',
        userName: 'Test User',
        type: 'purchase' as const,
        method: 'cash' as const,
        amount: 60,
        minutes: 60,
        status: 'completed' as const,
        description: 'Test purchase',
        reference: undefined,
        processedBy: null,
        metadata: {
          package: 'basic' as const,
          bankName: undefined,
        },
      };

      await createPaymentTransaction(transactionData as any);

      const addDocCall = (addDoc as jest.Mock).mock.calls[0][1];
      expect(addDocCall.reference).toBeUndefined();
      expect(addDocCall.processedBy).toBeUndefined();
    });
  });

  describe('processPurchaseTransaction', () => {
    beforeEach(() => {
      const mockUser = {
        uid: 'user123',
        phone: '+50412345678',
        name: 'Test User',
        balance: 100,
      };

      (getUserById as jest.Mock).mockResolvedValue(mockUser);

      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{
          data: () => ({
            id: 'basic-60',
            name: 'Básico',
            price: 60,
            minutes: 60,
            isActive: true,
          }),
          id: 'basic-60',
        }],
      });

      const mockDocRef = { id: 'transaction123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
    });

    it('should process cash purchase and update balance immediately', async () => {
      const result = await processPurchaseTransaction(
        'user123',
        'basic-60',
        'cash',
        undefined,
        'guard123'
      );

      expect(result.status).toBe('completed');
      expect(result.method).toBe('cash');
      expect(updateUserBalance).toHaveBeenCalledWith('user123', 160); // 100 + 60
    });

    it('should process transfer purchase as pending', async () => {
      const result = await processPurchaseTransaction(
        'user123',
        'basic-60',
        'transfer',
        'REF123'
      );

      expect(result.status).toBe('pending');
      expect(result.reference).toBe('REF123');
      expect(updateUserBalance).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        processPurchaseTransaction('invalid-user', 'basic-60', 'cash')
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error for non-existent package', async () => {
      await expect(
        processPurchaseTransaction('user123', 'invalid-package', 'cash')
      ).rejects.toThrow('Paquete no encontrado');
    });
  });

  describe('completeTransaction', () => {
    it('should complete a pending transaction and update balance', async () => {
      const mockTransaction = {
        id: 'transaction123',
        userId: 'user123',
        type: 'purchase',
        status: 'pending',
        minutes: 60,
        amount: 60,
      };

      const mockUser = {
        uid: 'user123',
        balance: 100,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockTransaction,
      });

      (getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await completeTransaction('transaction123', 'admin123');

      expect(result.status).toBe('completed');
      expect(updateDoc).toHaveBeenCalled();
      expect(updateUserBalance).toHaveBeenCalledWith('user123', 160);
    });

    it('should return existing transaction if already completed', async () => {
      const mockTransaction = {
        id: 'transaction123',
        status: 'completed',
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockTransaction,
      });

      const result = await completeTransaction('transaction123');

      expect(result).toEqual(mockTransaction);
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent transaction', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await expect(completeTransaction('invalid')).rejects.toThrow('Transacción no encontrada');
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel a pending transaction', async () => {
      const mockTransaction = {
        id: 'transaction123',
        status: 'pending',
        metadata: {},
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockTransaction,
      });

      const result = await cancelTransaction('transaction123', 'User requested');

      expect(result.status).toBe('cancelled');
      expect(result.metadata?.cancellationReason).toBe('User requested');
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should not cancel a completed transaction', async () => {
      const mockTransaction = {
        id: 'transaction123',
        status: 'completed',
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockTransaction,
      });

      await expect(
        cancelTransaction('transaction123')
      ).rejects.toThrow('No se puede cancelar una transacción completada');
    });
  });

  describe('getUserTransactions', () => {
    it('should retrieve user transactions sorted by date', async () => {
      const mockTransactions = [
        {
          id: 'tx1',
          userId: 'user123',
          createdAt: '2024-01-15T10:00:00Z',
          amount: 60,
        },
        {
          id: 'tx2',
          userId: 'user123',
          createdAt: '2024-01-16T10:00:00Z',
          amount: 135,
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockTransactions.map(tx => ({
          id: tx.id,
          data: () => tx,
        })),
      });

      const result = await getUserTransactions('user123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('tx2'); // Most recent first
    });

    it('should return empty array on error', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getUserTransactions('user123');

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const mockTransactions = Array.from({ length: 30 }, (_, i) => ({
        id: `tx${i}`,
        userId: 'user123',
        createdAt: new Date(Date.now() - i * 1000000).toISOString(),
      }));

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockTransactions.map(tx => ({
          id: tx.id,
          data: () => tx,
        })),
      });

      const result = await getUserTransactions('user123', 10);

      expect(result).toHaveLength(10);
    });
  });

  describe('getPendingTransactions', () => {
    it('should retrieve only pending transactions', async () => {
      const mockTransactions = [
        { id: 'tx1', status: 'pending', createdAt: '2024-01-15T10:00:00Z' },
        { id: 'tx2', status: 'pending', createdAt: '2024-01-16T10:00:00Z' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockTransactions.map(tx => ({
          data: () => tx,
        })),
      });

      const result = await getPendingTransactions();

      expect(result).toHaveLength(2);
      expect(where).toHaveBeenCalledWith('status', '==', 'pending');
    });
  });

  describe('getPaymentStats', () => {
    it('should calculate payment statistics correctly', async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const mockTransactions = [
        {
          status: 'completed',
          amount: 60,
          createdAt: today.toISOString(),
          completedAt: today.toISOString(),
          metadata: { package: 'basic' },
        },
        {
          status: 'completed',
          amount: 135,
          createdAt: today.toISOString(),
          completedAt: today.toISOString(),
          metadata: { package: 'standard' },
        },
        {
          status: 'completed',
          amount: 240,
          createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { package: 'premium' },
        },
        {
          status: 'pending',
          amount: 60,
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockTransactions.map(tx => ({
          data: () => tx,
        })),
      });

      const stats = await getPaymentStats();

      expect(stats.totalTransactions).toBe(3);
      expect(stats.totalRevenue).toBe(435);
      expect(stats.todayRevenue).toBeLessThanOrEqual(195);
      expect(stats.averageTransactionAmount).toBeCloseTo(145);
      expect(stats.pendingTransactions).toBe(1);
    });
  });

  describe('Stripe Integration', () => {
    describe('saveStripePaymentMethod', () => {
      it('should save a new payment method', async () => {
        const mockDocRef = { id: 'pm123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
        (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

        const result = await saveStripePaymentMethod(
          'user123',
          'pm_stripe123',
          { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025 },
          true
        );

        expect(result.id).toBe('pm123');
        expect(result.stripePaymentMethodId).toBe('pm_stripe123');
        expect(result.isDefault).toBe(true);
      });

      it('should unset other default methods when setting new default', async () => {
        const mockExistingMethods = [
          { id: 'pm1', isDefault: true },
          { id: 'pm2', isDefault: false },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
          docs: mockExistingMethods.map(pm => ({
            ref: { id: pm.id },
            data: () => pm,
          })),
        });

        const mockDocRef = { id: 'pm123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

        await saveStripePaymentMethod(
          'user123',
          'pm_stripe123',
          { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025 },
          true
        );

        expect(updateDoc).toHaveBeenCalledTimes(2); // Unset 2 existing methods
      });
    });

    describe('getUserPaymentMethods', () => {
      it('should retrieve user payment methods', async () => {
        const mockMethods = [
          { id: 'pm1', userId: 'user123', brand: 'visa', last4: '4242' },
          { id: 'pm2', userId: 'user123', brand: 'mastercard', last4: '5555' },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
          docs: mockMethods.map(pm => ({
            id: pm.id,
            data: () => pm,
          })),
        });

        const result = await getUserPaymentMethods('user123');

        expect(result).toHaveLength(2);
        expect(result[0].brand).toBe('visa');
      });

      it('should return empty array on error', async () => {
        (getDocs as jest.Mock).mockRejectedValue(new Error('Database error'));

        const result = await getUserPaymentMethods('user123');

        expect(result).toEqual([]);
      });
    });

    describe('setDefaultPaymentMethod', () => {
      it('should set a payment method as default', async () => {
        const mockExistingMethods = [
          { id: 'pm1', isDefault: true },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
          docs: mockExistingMethods.map(pm => ({
            ref: { id: pm.id },
            data: () => pm,
          })),
        });

        await setDefaultPaymentMethod('user123', 'pm2');

        expect(updateDoc).toHaveBeenCalledTimes(2); // Unset old + set new
      });
    });

    describe('createStripePaymentTransaction', () => {
      it('should create a Stripe payment transaction', async () => {
        const mockUser = {
          uid: 'user123',
          phone: '+50412345678',
          name: 'Test User',
          balance: 100,
        };

        (getUserById as jest.Mock).mockResolvedValue(mockUser);

        (getDocs as jest.Mock).mockResolvedValue({
          empty: false,
          docs: [{
            data: () => ({
              id: 'basic-60',
              name: 'Básico',
              price: 60,
              minutes: 60,
              isActive: true,
            }),
            id: 'basic-60',
          }],
        });

        const mockDocRef = { id: 'transaction123' };
        (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
        (updateDoc as jest.Mock).mockResolvedValue(undefined);

        const result = await createStripePaymentTransaction(
          'user123',
          'basic-60',
          'pi_stripe123',
          'pm_stripe123'
        );

        expect(result.status).toBe('pending');
        expect(result.method).toBe('card');
        expect(result.metadata?.stripePaymentIntentId).toBe('pi_stripe123');
      });
    });

    describe('completeStripePayment', () => {
      it('should complete a Stripe payment and update balance', async () => {
        const mockTransaction = {
          id: 'transaction123',
          userId: 'user123',
          status: 'pending',
          minutes: 60,
          metadata: {
            stripePaymentIntentId: 'pi_stripe123',
          },
        };

        const mockUser = {
          uid: 'user123',
          balance: 100,
        };

        (getDocs as jest.Mock).mockResolvedValue({
          empty: false,
          docs: [{
            ref: { id: 'transaction123' },
            data: () => mockTransaction,
          }],
        });

        (getUserById as jest.Mock).mockResolvedValue(mockUser);

        const result = await completeStripePayment('pi_stripe123');

        expect(result?.status).toBe('completed');
        expect(updateUserBalance).toHaveBeenCalledWith('user123', 160);
      });

      it('should return null if transaction not found', async () => {
        (getDocs as jest.Mock).mockResolvedValue({
          empty: true,
          docs: [],
        });

        const result = await completeStripePayment('pi_invalid');

        expect(result).toBeNull();
      });
    });
  });
});