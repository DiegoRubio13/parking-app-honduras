export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  role: 'user' | 'guard' | 'admin';
  balance: number;
  qrCode: string;
  createdAt: Date;
  isActive: boolean;
  pin?: string;
  guardShift?: 'morning' | 'afternoon' | 'night';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phone: string;
  pin?: string;
}

export interface RegisterData {
  phone: string;
  name: string;
  email: string;
}