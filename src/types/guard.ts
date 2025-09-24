export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  balance: number; // in minutes
  isActive: boolean;
  createdAt: Date;
}

export interface ParkingSession {
  id: string;
  userId: string;
  user?: User;
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // in minutes
  cost?: number;
  status: 'active' | 'completed' | 'cancelled';
  guardId: string;
}

export interface DailyStats {
  date: string;
  totalEntries: number;
  totalExits: number;
  currentlyInside: number;
  totalRevenue: number;
  averageSessionTime: number;
}

export interface GuardStats {
  daily: DailyStats;
  currentSessions: ParkingSession[];
  lowBalanceUsers: User[];
  totalScansToday: number;
}

export interface ScanResult {
  isValid: boolean;
  user?: User;
  session?: ParkingSession;
  error?: string;
  action: 'entry' | 'exit';
}

export interface GuardScreenProps {
  navigation: any;
  route?: any;
}

export interface QRScanData {
  type: string;
  data: string;
}

// QR Code format: PARKING_USER_{phoneNumber}
export interface ParsedQRData {
  phoneNumber: string;
}

export interface VehicleInside {
  sessionId: string;
  userName: string;
  phone: string;
  entryTime: Date;
  duration: number;
  currentCost: number;
}