export interface ParkingSession {
  id: string;
  userId: string;
  qrCode: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number;
  cost?: number;
  guardEntryId: string;
  guardExitId?: string;
  status: 'active' | 'completed' | 'cancelled';
  location: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'parking' | 'refund';
  amount: number;
  minutes?: number;
  sessionId?: string;
  paymentMethod: 'transfer' | 'cash';
  createdAt: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface Pricing {
  id: 'current';
  ratePerMinute: number;
  packages: {
    minutes: number;
    price: number;
    discount: number;
  }[];
  taxRate: number;
  updatedAt: Date;
  updatedBy: string;
}

export interface GuardActivity {
  id: string;
  guardId: string;
  date: string;
  entriesProcessed: number;
  exitsProcessed: number;
  totalRevenue: number;
  shift: 'morning' | 'afternoon' | 'night';
  lastActivity: Date;
}