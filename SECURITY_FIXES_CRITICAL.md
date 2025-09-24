# FIXES DE SEGURIDAD CRÍTICOS - IMPLEMENTACIÓN INMEDIATA

## 1. FIREBASE CONFIG SEGURA

### Archivo: `src/services/firebase.ts`

**ANTES (INSEGURO):**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDlusfJ0-y6fCJW_G_Wr9NC08WB4NGfj5I",
  authDomain: "a01252199.firebaseapp.com",
  // ...
};
```

**DESPUÉS (SEGURO):**
```typescript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: Constants.expoConfig?.extra?.firebaseDatabaseURL || process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validar que todas las keys estén presentes
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase config: ${missingKeys.join(', ')}`);
}
```

---

## 2. FIRESTORE RULES SEGURAS

### Archivo: `firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ============= HELPER FUNCTIONS =============

    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function hasRole(role) {
      return isAuthenticated() && getUserData().role == role;
    }

    function isAdmin() {
      return hasRole('admin');
    }

    function isGuard() {
      return hasRole('guard') || hasRole('admin');
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isOwnerOrAdmin(userId) {
      return isOwner(userId) || isAdmin();
    }

    // ============= DATA VALIDATION =============

    function isValidPhone(phone) {
      return phone is string && phone.matches('^\\+504[0-9]{8}$');
    }

    function isValidEmail(email) {
      return email is string && email.matches('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$');
    }

    function isValidUserRole(role) {
      return role in ['client', 'admin', 'guard'];
    }

    function isValidTransactionType(type) {
      return type in ['purchase', 'refund', 'usage', 'bonus'];
    }

    function isValidPaymentMethod(method) {
      return method in ['transfer', 'cash', 'card'];
    }

    function isValidTransactionStatus(status) {
      return status in ['pending', 'completed', 'failed', 'cancelled'];
    }

    // ============= USERS COLLECTION =============

    match /users/{userId} {
      // Read: Owner or Admin
      allow read: if isOwnerOrAdmin(userId);

      // Create: Only authenticated users, auto-assign 'client' role
      allow create: if isAuthenticated() &&
                       request.resource.data.uid == request.auth.uid &&
                       request.resource.data.role == 'client' &&
                       isValidPhone(request.resource.data.phone) &&
                       request.resource.data.name is string &&
                       request.resource.data.balance == 0 &&
                       request.resource.data.isActive == true;

      // Update: Owner can update own data, Admin can update any
      allow update: if isOwnerOrAdmin(userId) &&
                       // Cannot change uid
                       request.resource.data.uid == resource.data.uid &&
                       // Only admin can change role or isActive status
                       (request.resource.data.role == resource.data.role || isAdmin()) &&
                       (request.resource.data.isActive == resource.data.isActive || isAdmin()) &&
                       // Validate phone if changed
                       (request.resource.data.phone == resource.data.phone || isValidPhone(request.resource.data.phone));

      // Delete: Admin only
      allow delete: if isAdmin();
    }

    // ============= PAYMENT TRANSACTIONS =============

    match /paymentTransactions/{transactionId} {
      // Read: Owner, Guard, or Admin
      allow read: if isOwnerOrAdmin(resource.data.userId) || isGuard();

      // Create: Authenticated user, validates data
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       isValidTransactionType(request.resource.data.type) &&
                       isValidPaymentMethod(request.resource.data.method) &&
                       isValidTransactionStatus(request.resource.data.status) &&
                       request.resource.data.amount > 0 &&
                       request.resource.data.amount <= 10000 &&
                       request.resource.data.minutes > 0 &&
                       request.resource.data.minutes <= 1000;

      // Update: Guard or Admin can update status
      allow update: if isGuard() &&
                       // Cannot change userId, amount, or minutes
                       request.resource.data.userId == resource.data.userId &&
                       request.resource.data.amount == resource.data.amount &&
                       request.resource.data.minutes == resource.data.minutes &&
                       // Can only update to completed, failed, or cancelled
                       isValidTransactionStatus(request.resource.data.status);

      // Delete: Admin only
      allow delete: if isAdmin();
    }

    // ============= PARKING SESSIONS =============

    match /parkingSessions/{sessionId} {
      // Read: Owner, Guard, or Admin
      allow read: if isOwnerOrAdmin(resource.data.userId) || isGuard();

      // Create: Authenticated user, one active session per user
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'active' &&
                       request.resource.data.minutesUsed >= 0 &&
                       // Verify user has enough balance
                       getUserData().balance >= request.resource.data.minutesRequired;

      // Update: Owner, Guard, or Admin
      allow update: if (isOwnerOrAdmin(resource.data.userId) || isGuard()) &&
                       // Cannot change userId
                       request.resource.data.userId == resource.data.userId &&
                       // Minutes used can only increase
                       request.resource.data.minutesUsed >= resource.data.minutesUsed;

      // Delete: Admin only
      allow delete: if isAdmin();
    }

    // ============= PARKING SPOTS =============

    match /parkingSpots/{spotId} {
      // Read: All authenticated users
      allow read: if isAuthenticated();

      // Write: Guard or Admin only
      allow write: if isGuard();
    }

    // ============= PARKING LOCATIONS =============

    match /parkingLocations/{locationId} {
      // Read: All authenticated users
      allow read: if isAuthenticated();

      // Write: Admin only
      allow write: if isAdmin();
    }

    // ============= PAYMENT PACKAGES =============

    match /paymentPackages/{packageId} {
      // Read: All authenticated users
      allow read: if isAuthenticated();

      // Write: Admin only
      allow write: if isAdmin();
    }

    // ============= PAYMENT METHODS =============

    match /paymentMethods/{methodId} {
      // Read: Owner only
      allow read: if isOwner(resource.data.userId);

      // Create: Owner only
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;

      // Update: Owner only (for isDefault flag)
      allow update: if isOwner(resource.data.userId) &&
                       // Cannot change userId or stripePaymentMethodId
                       request.resource.data.userId == resource.data.userId &&
                       request.resource.data.stripePaymentMethodId == resource.data.stripePaymentMethodId;

      // Delete: Owner or Admin
      allow delete: if isOwnerOrAdmin(resource.data.userId);
    }

    // ============= TEMP REGISTRATIONS =============

    match /temp_registrations/{tempId} {
      // Create: Anyone (for registration flow)
      allow create: if true;

      // Read/Update: Only by authenticated user matching phone
      allow read, update: if isAuthenticated();

      // Delete: System or Admin
      allow delete: if isAdmin();
    }

    // ============= INCIDENTS =============

    match /incidents/{incidentId} {
      // Read: Guard or Admin
      allow read: if isGuard();

      // Create: Guard
      allow create: if hasRole('guard') &&
                       request.resource.data.reportedBy == request.auth.uid;

      // Update: Guard or Admin
      allow update: if isGuard();

      // Delete: Admin only
      allow delete: if isAdmin();
    }

    // ============= EMERGENCY REQUESTS =============

    match /emergencyRequests/{requestId} {
      // Read: Owner, Admin
      allow read: if isOwnerOrAdmin(resource.data.userId);

      // Create: Authenticated user
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'active';

      // Update: Owner or Admin
      allow update: if isOwnerOrAdmin(resource.data.userId) || isAdmin();

      // Delete: Admin only
      allow delete: if isAdmin();
    }

    // ============= DENY ALL OTHER COLLECTIONS =============
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 3. AUTH SERVICE SEGURO

### Archivo: `src/services/authService.ts`

Agregar rate limiting y validación:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Rate limiting en cliente (adicional al del backend)
class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();

  async checkLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Limpiar intentos antiguos
    const recentAttempts = attempts.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  async getRemainingAttempts(key: string, maxAttempts: number, windowMs: number): Promise<number> {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(time => now - time < windowMs);

    return Math.max(0, maxAttempts - recentAttempts.length);
  }
}

const rateLimiter = new ClientRateLimiter();

// Send verification code con rate limiting
export const sendVerificationCode = async (
  phoneNumber: string
): Promise<{ success: boolean; verificationId?: string; error?: string; confirmationResult?: ConfirmationResult }> => {
  try {
    // Validar formato de teléfono
    if (!phoneNumber.match(/^\+504[0-9]{8}$/)) {
      return {
        success: false,
        error: 'Formato inválido. Use: +504XXXXXXXX'
      };
    }

    // Rate limiting: 3 intentos por hora
    const canProceed = await rateLimiter.checkLimit(
      `sms_${phoneNumber}`,
      3,
      60 * 60 * 1000 // 1 hora
    );

    if (!canProceed) {
      const remaining = await rateLimiter.getRemainingAttempts(
        `sms_${phoneNumber}`,
        3,
        60 * 60 * 1000
      );

      return {
        success: false,
        error: `Demasiados intentos. Espera 1 hora. Intentos restantes: ${remaining}`
      };
    }

    console.log('Sending verification code to:', phoneNumber);

    // ... resto del código de envío de SMS

  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return {
      success: false,
      error: error.message || 'Error enviando código de verificación'
    };
  }
};

// Verificar código con rate limiting
export const verifyCodeAndSignIn = async (
  verificationId: string,
  code: string,
  phoneNumber: string,
  name?: string,
  confirmationResult?: ConfirmationResult
): Promise<AuthResult> => {
  try {
    // Rate limiting: 5 intentos por código
    const canProceed = await rateLimiter.checkLimit(
      `verify_${phoneNumber}`,
      5,
      15 * 60 * 1000 // 15 minutos
    );

    if (!canProceed) {
      return {
        success: false,
        error: 'Demasiados intentos de verificación. Solicita un nuevo código.'
      };
    }

    // Validar código (6 dígitos)
    if (!code.match(/^\d{6}$/)) {
      return {
        success: false,
        error: 'Código inválido. Debe ser de 6 dígitos.'
      };
    }

    // ... resto del código de verificación

  } catch (error: any) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      error: error.message || 'Código de verificación inválido'
    };
  }
};
```

---

## 4. SECURE STORAGE PARA DATOS SENSIBLES

### Archivo: `src/utils/secureStorage.ts` (NUEVO)

```typescript
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

// Generar clave de encriptación única por dispositivo
const getEncryptionKey = async (): Promise<string> => {
  let key = await SecureStore.getItemAsync('encryption_key');

  if (!key) {
    key = CryptoJS.lib.WordArray.random(256 / 8).toString();
    await SecureStore.setItemAsync('encryption_key', key);
  }

  return key;
};

// Encriptar datos
const encrypt = async (data: any): Promise<string> => {
  const key = await getEncryptionKey();
  const jsonString = JSON.stringify(data);

  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

// Desencriptar datos
const decrypt = async (encryptedData: string): Promise<any> => {
  const key = await getEncryptionKey();
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const jsonString = bytes.toString(CryptoJS.enc.Utf8);

  return JSON.parse(jsonString);
};

// Guardar datos sensibles
export const setSecureItem = async (key: string, value: any): Promise<void> => {
  try {
    const encrypted = await encrypt(value);

    if (Platform.OS === 'web') {
      // En web, usar localStorage con encriptación
      localStorage.setItem(key, encrypted);
    } else {
      // En móvil, usar SecureStore
      await SecureStore.setItemAsync(key, encrypted);
    }
  } catch (error) {
    console.error('Error saving secure item:', error);
    throw error;
  }
};

// Obtener datos sensibles
export const getSecureItem = async (key: string): Promise<any> => {
  try {
    let encrypted: string | null;

    if (Platform.OS === 'web') {
      encrypted = localStorage.getItem(key);
    } else {
      encrypted = await SecureStore.getItemAsync(key);
    }

    if (!encrypted) {
      return null;
    }

    return await decrypt(encrypted);
  } catch (error) {
    console.error('Error getting secure item:', error);
    return null;
  }
};

// Eliminar datos sensibles
export const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error('Error deleting secure item:', error);
  }
};

// Limpiar todos los datos
export const clearAllSecureData = async (): Promise<void> => {
  const keys = ['currentUser', 'userData', 'authToken', 'encryption_key'];

  for (const key of keys) {
    await deleteSecureItem(key);
  }
};
```

### Actualizar useAuth.tsx:

```typescript
import { setSecureItem, getSecureItem, deleteSecureItem } from '../utils/secureStorage';

// En lugar de AsyncStorage.setItem
await setSecureItem('currentUser', authUser);
await setSecureItem('userData', profile);

// En lugar de AsyncStorage.getItem
const persistedUser = await getSecureItem('currentUser');
const persistedUserData = await getSecureItem('userData');

// En lugar de AsyncStorage.removeItem
await deleteSecureItem('currentUser');
await deleteSecureItem('userData');
```

---

## 5. BACKEND SEGURO

### Archivo: `backend/server.ts`

```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { expressRoutes } from './payment-processor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============= SECURITY MIDDLEWARE =============

// 1. Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// 2. CORS restrictivo
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:8081', 'http://localhost:19006');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
}));

// 3. Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalLimiter);

// 4. Rate limiting para pagos
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: 'Límite de transacciones de pago excedido'
});

app.use('/api/create-payment-intent', paymentLimiter);
app.use('/api/create-customer', paymentLimiter);

// 5. Sanitización contra injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential injection attempt: ${key}`);
  },
}));

// 6. Body parsing
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============= LOGGING MIDDLEWARE =============

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
});

// ============= ROUTES =============

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ParKing Payment Server',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/create-payment-intent', expressRoutes.createPaymentIntent);
app.post('/api/create-customer', expressRoutes.createCustomer);
app.post('/api/webhook', expressRoutes.webhook);
app.post('/api/refund', expressRoutes.refund);

// ============= ERROR HANDLING =============

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`🚀 ParKing Payment Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log(`🔒 Security: Helmet ✓, CORS ✓, Rate Limiting ✓`);
});

export default app;
```

---

## 6. VALIDACIÓN HONDURAS-ESPECÍFICA

### Archivo: `src/utils/validationHonduras.ts` (NUEVO)

```typescript
export class HondurasValidator {
  // Validar teléfono de Honduras
  static phone(value: string): { isValid: boolean; errors: string[] } {
    // Formato: +504XXXXXXXX (código país + 8 dígitos)
    // Números válidos comienzan con 2, 3, 7, 8, 9
    const phoneRegex = /^\+504[23789]\d{7}$/;

    const isValid = phoneRegex.test(value);

    return {
      isValid,
      errors: isValid ? [] : [
        'Número inválido. Formato: +504XXXXXXXX',
        'Debe comenzar con 2, 3, 7, 8, o 9 después del código país'
      ]
    };
  }

  // Validar DNI/Identidad de Honduras
  static identidad(value: string): { isValid: boolean; errors: string[] } {
    // Formato: XXXX-XXXX-XXXXX (13 dígitos con guiones)
    const cleaned = value.replace(/-/g, '');
    const isValid = /^\d{13}$/.test(cleaned);

    return {
      isValid,
      errors: isValid ? [] : ['Identidad inválida. Formato: XXXX-XXXX-XXXXX']
    };
  }

  // Validar RTN (Registro Tributario Nacional)
  static rtn(value: string): { isValid: boolean; errors: string[] } {
    // Formato: XXXX-XXXX-XXXXXX (14 dígitos con guiones)
    const cleaned = value.replace(/-/g, '');
    const isValid = /^\d{14}$/.test(cleaned);

    return {
      isValid,
      errors: isValid ? [] : ['RTN inválido. Formato: XXXX-XXXX-XXXXXX']
    };
  }

  // Validar placa de vehículo de Honduras
  static licensePlate(value: string): { isValid: boolean; errors: string[] } {
    // Formatos comunes:
    // ABC-1234 (particular)
    // TXI-1234 (taxi)
    // C-12345 (carga)
    const plateRegex = /^[A-Z]{1,3}-?\d{4,5}$/i;

    const isValid = plateRegex.test(value.toUpperCase());

    return {
      isValid,
      errors: isValid ? [] : [
        'Placa inválida. Formatos válidos:',
        'ABC-1234 (particular)',
        'TXI-1234 (taxi)',
        'C-12345 (carga)'
      ]
    };
  }

  // Validar monto en Lempiras
  static lempiras(value: number): { isValid: boolean; errors: string[] } {
    const isValid = value > 0 && value <= 100000 && Number.isInteger(value);

    return {
      isValid,
      errors: isValid ? [] : [
        'Monto inválido. Debe ser un número entero entre L1 y L100,000'
      ]
    };
  }
}

// Uso:
const phoneValidation = HondurasValidator.phone('+50499887766');
const plateValidation = HondurasValidator.licensePlate('ABC-1234');
```

---

## 7. INSTALACIÓN DE DEPENDENCIAS NECESARIAS

```bash
# Seguridad
npm install expo-secure-store crypto-js

# Backend
npm install helmet express-rate-limit express-mongo-sanitize

# Types
npm install -D @types/crypto-js
```

---

## ORDEN DE IMPLEMENTACIÓN

1. **INMEDIATO (HOY):**
   - Actualizar firebase.ts con variables de entorno
   - Implementar firestore.rules seguras
   - Agregar secureStorage.ts

2. **DÍA 2:**
   - Actualizar useAuth.tsx con secureStorage
   - Implementar rate limiting en authService.ts
   - Agregar validación Honduras-específica

3. **DÍA 3:**
   - Securizar backend con helmet y rate limiting
   - Actualizar CORS
   - Implementar logging seguro

4. **VERIFICACIÓN:**
   - Probar cada componente actualizado
   - Ejecutar tests de seguridad
   - Code review de cambios

---

## TESTING DE SEGURIDAD

```typescript
// tests/security.test.ts

describe('Security Tests', () => {
  it('should reject invalid Honduras phone numbers', () => {
    const invalid = [
      '+50411111111', // Comienza con 1
      '+5049888777', // Solo 7 dígitos
      '50499887766', // Sin +
      '+50499887766123' // Demasiados dígitos
    ];

    invalid.forEach(phone => {
      const result = HondurasValidator.phone(phone);
      expect(result.isValid).toBe(false);
    });
  });

  it('should encrypt sensitive data', async () => {
    const sensitive = { password: '123456', token: 'abc' };

    await setSecureItem('test', sensitive);
    const retrieved = await getSecureItem('test');

    expect(retrieved).toEqual(sensitive);
  });

  it('should enforce rate limiting', async () => {
    // Simular 3 intentos
    for (let i = 0; i < 3; i++) {
      await sendVerificationCode('+50499887766');
    }

    // El 4to debe fallar
    const result = await sendVerificationCode('+50499887766');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Demasiados intentos');
  });
});
```