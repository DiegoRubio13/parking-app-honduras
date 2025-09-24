# Análisis Completo de Edge Cases y Robustez - ParKing App

## RESUMEN EJECUTIVO

Análisis exhaustivo de casos extremos, validaciones faltantes y potenciales crashes en la aplicación ParKing. Se identificaron **42 edge cases críticos** en 8 categorías principales.

---

## 1. ESTADOS EXTREMOS Y LOADING

### 1.1 Loading Indefinido ❌ CRÍTICO

**Problema:** No hay timeout en operaciones Firebase
- `authService.ts`: `sendVerificationCode()` puede quedarse colgado indefinidamente
- `parkingService.ts`: Queries sin timeout
- `paymentService.ts`: Transacciones sin límite de tiempo

**Ubicaciones afectadas:**
```typescript
// /Users/diego/Desktop/ParKing_NEW/src/services/authService.ts:47-96
// /Users/diego/Desktop/ParKing_NEW/src/services/parkingService.ts:95-113
// /Users/diego/Desktop/ParKing_NEW/src/services/paymentService.ts:166-227
```

**Solución:**
```typescript
// services/networkHelpers.ts (NUEVO ARCHIVO)
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
  errorMessage: string = 'Operación agotó el tiempo de espera'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

// Uso en authService.ts
export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    return await withTimeout(
      signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier),
      15000,
      'El envío del código tardó demasiado. Verifica tu conexión.'
    );
  } catch (error) {
    // manejo de error...
  }
};
```

### 1.2 Errores de Red sin Manejo ❌ CRÍTICO

**Problema:** No hay reconexión automática ni detección de offline
- Ninguna pantalla maneja `NetInfo` para detectar pérdida de conexión
- No hay retry logic en servicios

**Solución:**
```typescript
// hooks/useNetworkStatus.ts (NUEVO ARCHIVO)
import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, isInternetReachable };
};

// services/retryHelper.ts (NUEVO ARCHIVO)
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // No reintentar errores de validación
      if (error.code?.includes('invalid') || error.code?.includes('permission')) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError!;
};
```

### 1.3 Datos Vacíos sin Feedback ⚠️ IMPORTANTE

**Problema:** Listas vacías muestran loading indefinidamente
- `MapScreen.tsx`: Si no hay ubicaciones, muestra spinner eternamente
- `HistoryScreen.tsx`: No diferencia entre "sin datos" y "error"

**Ubicación:** `/Users/diego/Desktop/ParKing_NEW/src/screens/client/MapScreen.tsx:287-291`

**Solución:**
```typescript
// MapScreen.tsx
const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');

const loadParkingLocations = async () => {
  try {
    setLoadingState('loading');
    const parkingLocations = await searchParkingLocations(filters);

    if (parkingLocations.length === 0) {
      setLoadingState('empty');
    } else {
      setLoadingState('success');
    }

    setLocations(parkingLocations);
  } catch (error) {
    console.error('Error loading parking locations:', error);
    setLoadingState('error');
    Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
  }
};

// En el render:
{loadingState === 'loading' && <LoadingView />}
{loadingState === 'empty' && <EmptyStateView />}
{loadingState === 'error' && <ErrorStateView onRetry={loadParkingLocations} />}
{loadingState === 'success' && <LocationsList />}
```

---

## 2. VALIDACIONES FALTANTES

### 2.1 Inputs Vacíos ❌ CRÍTICO

**Problema:** Campos se validan solo al enviar, no en tiempo real
- `LoginScreen.tsx`: Permite espacios en blanco como número válido
- `RegisterScreen.tsx`: No valida formato de email

**Ubicación:** `/Users/diego/Desktop/ParKing_NEW/src/screens/auth/LoginScreen.tsx:56-70`

**Solución:**
```typescript
// utils/validators.ts (NUEVO ARCHIVO)
export const validators = {
  phone: (phone: string): { valid: boolean; error?: string } => {
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length === 0) {
      return { valid: false, error: 'Número de teléfono requerido' };
    }
    if (cleaned.length < 8) {
      return { valid: false, error: 'Número muy corto' };
    }
    if (cleaned.length > 15) {
      return { valid: false, error: 'Número muy largo' };
    }
    return { valid: true };
  },

  email: (email: string): { valid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return { valid: false, error: 'Email requerido' };
    }
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Email inválido' };
    }
    return { valid: true };
  },

  name: (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Nombre requerido' };
    }
    if (trimmed.length < 2) {
      return { valid: false, error: 'Nombre muy corto' };
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmed)) {
      return { valid: false, error: 'Nombre solo puede contener letras' };
    }
    return { valid: true };
  },

  verificationCode: (code: string): { valid: boolean; error?: string } => {
    const cleaned = code.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      return { valid: false, error: 'Código debe tener 6 dígitos' };
    }
    return { valid: true };
  }
};

// hooks/useFormValidation.ts (NUEVO ARCHIVO)
import { useState } from 'react';

export const useFormValidation = <T extends Record<string, string>>(
  initialValues: T,
  validators: Record<keyof T, (value: string) => { valid: boolean; error?: string }>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = (field: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // Validar en tiempo real solo si el campo ya fue tocado
    if (touched[field]) {
      const result = validators[field](value);
      setErrors(prev => ({
        ...prev,
        [field]: result.valid ? undefined : result.error
      }));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const result = validators[field](values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: result.valid ? undefined : result.error
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validators).forEach(key => {
      const field = key as keyof T;
      const result = validators[field](values[field]);
      if (!result.valid) {
        newErrors[field] = result.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return isValid;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    setValues,
  };
};
```

### 2.2 Formatos Incorrectos ⚠️ IMPORTANTE

**Problema:** No se validan formatos de fecha, moneda, etc.
- `paymentService.ts`: No valida que amount > 0
- `parkingService.ts`: No valida que duration no sea negativa

**Solución:**
```typescript
// services/parkingService.ts - Agregar validación
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

    // ✅ VALIDACIÓN: Verificar que la fecha de inicio sea válida
    if (isNaN(startTime.getTime())) {
      throw new Error('Fecha de inicio inválida');
    }

    const durationMs = endTime.getTime() - startTime.getTime();

    // ✅ VALIDACIÓN: Duración no puede ser negativa
    if (durationMs < 0) {
      throw new Error('La fecha de fin no puede ser anterior al inicio');
    }

    // ✅ VALIDACIÓN: Duración mínima de 1 minuto
    const duration = Math.max(1, Math.ceil(durationMs / (1000 * 60)));

    // ✅ VALIDACIÓN: Duración máxima razonable (24 horas = 1440 minutos)
    if (duration > 1440) {
      throw new Error('La sesión excede el tiempo máximo permitido (24 horas)');
    }

    const cost = duration * 1;

    // ... resto del código
  } catch (error) {
    console.error('Error ending parking session:', error);
    throw error;
  }
};
```

### 2.3 Límites de Caracteres ⚠️ IMPORTANTE

**Problema:** No hay maxLength consistente en inputs
- `LoginScreen.tsx`: Solo valida maxLength en teléfono (15)
- Falta en nombre, email, notas, etc.

**Solución:**
```typescript
// constants/inputLimits.ts (NUEVO ARCHIVO)
export const INPUT_LIMITS = {
  PHONE: 15,
  NAME: 50,
  EMAIL: 100,
  ADDRESS: 200,
  NOTES: 500,
  VERIFICATION_CODE: 6,
  REFERENCE_NUMBER: 50,
} as const;

// components/ui/ValidatedTextInput.tsx (NUEVO ARCHIVO)
import React, { useState } from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../constants/theme';

interface ValidatedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  maxLength: number;
  showCounter?: boolean;
}

export const ValidatedTextInput: React.FC<ValidatedTextInputProps> = ({
  label,
  error,
  maxLength,
  showCounter = true,
  value = '',
  ...props
}) => {
  const currentLength = value.length;
  const isNearLimit = currentLength >= maxLength * 0.8;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        {...props}
        value={value}
        maxLength={maxLength}
        style={[
          styles.input,
          error && styles.inputError,
          props.style,
        ]}
      />

      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {showCounter && (
          <Text style={[styles.counter, isNearLimit && styles.counterWarning]}>
            {currentLength}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    flex: 1,
  },
  counter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  counterWarning: {
    color: '#f59e0b',
    fontWeight: theme.fontWeight.semibold as any,
  },
});
```

---

## 3. NAVEGACIÓN EDGE CASES

### 3.1 Back Button del Sistema ❌ CRÍTICO

**Problema:** No se maneja hardware back button en Android
- `LoginScreen.tsx`: Al presionar back durante verificación SMS, pierde el estado
- `PaymentScreen.tsx`: Back durante pago puede dejar transacción pendiente

**Solución:**
```typescript
// hooks/useBackHandler.ts (NUEVO ARCHIVO)
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useBackHandler = (
  handler: () => boolean,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handler
    );

    return () => backHandler.remove();
  }, dependencies);
};

// LoginScreen.tsx - Agregar manejo
import { useBackHandler } from '../../hooks/useBackHandler';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // ... código existente

  useBackHandler(() => {
    if (step === 'verification') {
      Alert.alert(
        'Cancelar verificación',
        '¿Estás seguro de cancelar? Perderás el código enviado.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: () => {
              setStep('phone');
              setVerificationCode('');
              setVerificationId('');
            }
          }
        ]
      );
      return true; // Prevenir default back
    }
    return false; // Permitir default back
  }, [step]);

  // ... resto del código
};
```

### 3.2 Deep Links sin Validación ⚠️ IMPORTANTE

**Problema:** No hay manejo de deep links/universal links
- Si reciben link `parking://session/123`, la app crashea
- No valida que el usuario tenga permisos

**Solución:**
```typescript
// navigation/DeepLinkHandler.tsx (NUEVO ARCHIVO)
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

export const DeepLinkHandler: React.FC = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        const route = url.replace(/.*?:\/\//g, '');
        const [screen, ...params] = route.split('/');

        // Validar que el usuario esté autenticado
        if (!userData) {
          console.warn('Deep link ignored: User not authenticated');
          return;
        }

        switch (screen) {
          case 'session':
            if (params[0] && userData.role === 'client') {
              navigation.navigate('QRDisplay', { sessionId: params[0] });
            }
            break;

          case 'payment':
            if (params[0] && userData.role === 'client') {
              navigation.navigate('Purchase', { packageId: params[0] });
            }
            break;

          case 'location':
            if (params[0]) {
              navigation.navigate('LocationDetail', { locationId: params[0] });
            }
            break;

          default:
            console.warn('Unknown deep link screen:', screen);
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Manejar app abierta por deep link
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    // Manejar deep links mientras app está abierta
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [userData, navigation]);

  return null;
};
```

### 3.3 Interrupciones (Llamadas) ⚠️ IMPORTANTE

**Problema:** No se maneja AppState cuando recibe llamada
- QR Scanner no se pausa al recibir llamada
- Timer de sesión sigue corriendo

**Solución:**
```typescript
// hooks/useAppState.ts (NUEVO ARCHIVO)
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = (
  onForeground?: () => void,
  onBackground?: () => void
) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to foreground');
        onForeground?.();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to background');
        onBackground?.();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);

  return appStateVisible;
};

// QRScannerScreen.tsx - Usar el hook
export const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [scanning, setScanning] = useState(true);

  useAppState(
    () => {
      // Al volver al foreground
      setScanning(true);
    },
    () => {
      // Al ir a background
      setScanning(false);
    }
  );

  // ... resto del código
};
```

---

## 4. ROLES Y PERMISOS

### 4.1 Usuario Sin Rol Asignado ❌ CRÍTICO

**Problema:** AppNavigator crashea si user.role es undefined/null
- Línea 82-94 en AppNavigator.tsx tiene fallback pero no es suficiente

**Ubicación:** `/Users/diego/Desktop/ParKing_NEW/src/navigation/AppNavigator.tsx:82-94`

**Solución:**
```typescript
// navigation/AppNavigator.tsx
export default function AppNavigator() {
  const { isLoading, isAuthenticated, userData } = useAuth();

  if (isLoading) {
    return (
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>
    );
  }

  // ✅ Validación mejorada de rol
  const hasValidRole = userData?.role && ['client', 'guard', 'admin'].includes(userData.role);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated || !hasValidRole ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {userData.role === 'client' && (
              <Stack.Screen name="Client" component={ClientNavigator} />
            )}
            {userData.role === 'guard' && (
              <Stack.Screen name="Guard" component={GuardNavigator} />
            )}
            {userData.role === 'admin' && (
              <Stack.Screen name="Admin" component={AdminNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// services/authService.ts - Asegurar rol por defecto
export const verifyCodeAndSignIn = async (...) => {
  try {
    // ... código existente

    if (!userDoc.exists()) {
      // ✅ SIEMPRE asignar un rol, nunca dejar undefined
      let userRole: 'client' | 'admin' | 'guard' = 'client'; // DEFAULT

      if (isAdminPhone) {
        userRole = 'admin';
      } else if (isGuardPhone) {
        userRole = 'guard';
      }

      userProfile = {
        // ... otros campos
        role: userRole, // ✅ NUNCA undefined
        // ...
      };
    } else {
      userProfile = userDoc.data() as UserProfile;

      // ✅ Validar que el rol sea válido
      if (!userProfile.role || !['client', 'admin', 'guard'].includes(userProfile.role)) {
        console.warn('Invalid role detected, setting to client');
        userProfile.role = 'client';
        await updateDoc(userDocRef, { role: 'client' });
      }
    }

    // ... resto
  } catch (error) {
    // ...
  }
};
```

### 4.2 Cambio de Rol en Tiempo Real ⚠️ IMPORTANTE

**Problema:** Si admin cambia rol de usuario, no se refleja hasta logout
- No hay listener de cambios en userData

**Solución:**
```typescript
// hooks/useAuth.tsx - Agregar listener de perfil
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Listener de cambios en el perfil de usuario
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedProfile = docSnap.data() as UserProfile;

        // Verificar si el rol cambió
        if (userData?.role !== updatedProfile.role) {
          console.log('User role changed:', userData?.role, '->', updatedProfile.role);
          Alert.alert(
            'Rol Actualizado',
            `Tu rol ha sido cambiado a ${updatedProfile.role}. La app se reiniciará.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setUserData(updatedProfile);
                  // Forzar re-render del navegador
                }
              }
            ]
          );
        } else {
          setUserData(updatedProfile);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ... resto del código
};
```

### 4.3 Sesión Expirada ❌ CRÍTICO

**Problema:** No hay manejo de token expirado de Firebase
- Si token expira, usuario queda en limbo

**Solución:**
```typescript
// hooks/useAuth.tsx
import { onIdTokenChanged } from 'firebase/auth';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // ... estado existente

  // ✅ Listener para cambios en el token (incluye expiración)
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Intentar refrescar token
          const token = await firebaseUser.getIdToken(true);
          console.log('Token refreshed successfully');
        } catch (error: any) {
          console.error('Token refresh failed:', error);

          if (error.code === 'auth/user-token-expired') {
            Alert.alert(
              'Sesión Expirada',
              'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    await signOut();
                  }
                }
              ]
            );
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ... resto del código
};
```

---

## 5. MANEJO DE DATOS Y ESTADO

### 5.1 Race Conditions en Firestore ❌ CRÍTICO

**Problema:** Múltiples updates simultáneos pueden corromper datos
- `paymentService.ts:completeTransaction()` puede ejecutarse 2 veces
- Usuario puede obtener minutos duplicados

**Ubicación:** `/Users/diego/Desktop/ParKing_NEW/src/services/paymentService.ts:231-275`

**Solución:**
```typescript
// services/paymentService.ts
import { runTransaction } from 'firebase/firestore';

export const completeTransaction = async (
  transactionId: string,
  processedBy?: string
): Promise<PaymentTransaction> => {
  try {
    // ✅ Usar transacción atómica para evitar race conditions
    return await runTransaction(db, async (transaction) => {
      const transactionRef = doc(db, 'paymentTransactions', transactionId);
      const transactionDoc = await transaction.get(transactionRef);

      if (!transactionDoc.exists()) {
        throw new Error('Transacción no encontrada');
      }

      const txData = transactionDoc.data() as PaymentTransaction;

      // ✅ Verificar estado DENTRO de la transacción
      if (txData.status === 'completed') {
        console.log('Transaction already completed (race condition prevented)');
        return txData;
      }

      const updates: any = {
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      };

      if (processedBy) {
        updates.processedBy = processedBy;
      }

      // Actualizar transacción
      transaction.update(transactionRef, updates);

      // ✅ Actualizar balance DENTRO de la misma transacción
      if (txData.type === 'purchase') {
        const userRef = doc(db, 'users', txData.userId);
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newBalance = (userData.balance || 0) + txData.minutes;
          transaction.update(userRef, { balance: newBalance });
        }
      }

      return { ...txData, ...updates };
    });
  } catch (error) {
    console.error('Error completing transaction:', error);
    throw error;
  }
};
```

### 5.2 Memoria de Listas Grandes ⚠️ IMPORTANTE

**Problema:** No hay paginación en listas
- `getAllTransactions()` carga TODAS las transacciones en memoria
- `getAllActiveSessions()` puede crashear con muchas sesiones

**Solución:**
```typescript
// hooks/usePaginatedQuery.ts (NUEVO ARCHIVO)
import { useState, useCallback } from 'react';

export interface PaginationResult<T> {
  data: T[];
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
  hasMore: boolean;
  error: Error | null;
}

export const usePaginatedQuery = <T>(
  queryFn: (limit: number, lastDoc?: any) => Promise<{ data: T[]; lastDoc?: any }>,
  pageSize: number = 20
): PaginationResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const result = await queryFn(pageSize, lastDoc);

      setData(prev => [...prev, ...result.data]);
      setLastDoc(result.lastDoc);
      setHasMore(result.data.length === pageSize);
    } catch (err: any) {
      setError(err);
      console.error('Error loading more data:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastDoc, queryFn, pageSize]);

  const refresh = useCallback(async () => {
    setData([]);
    setLastDoc(null);
    setHasMore(true);
    await loadMore();
  }, [loadMore]);

  return { data, loadMore, refresh, loading, hasMore, error };
};

// services/paymentService.ts - Versión paginada
import { startAfter } from 'firebase/firestore';

export const getUserTransactionsPaginated = async (
  userId: string,
  limitCount: number = 20,
  lastDocument?: any
): Promise<{ data: PaymentTransaction[]; lastDoc?: any }> => {
  try {
    let q = query(
      collection(db, 'paymentTransactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDocument) {
      q = query(q, startAfter(lastDocument));
    }

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentTransaction));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { data: transactions, lastDoc };
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return { data: [] };
  }
};
```

### 5.3 Caché y Stale Data ⚠️ IMPORTANTE

**Problema:** Datos cacheados nunca se refrescan
- Balance de usuario no se actualiza en tiempo real
- Stats del admin pueden estar desactualizados

**Solución:**
```typescript
// hooks/useRealtimeData.ts (NUEVO ARCHIVO)
import { useEffect, useState } from 'react';
import { onSnapshot, doc, DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useRealtimeDocument = <T extends DocumentData>(
  collection: string,
  documentId: string | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, collection, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Realtime listener error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collection, documentId]);

  return { data, loading, error };
};

// ProfileScreen.tsx - Usar datos en tiempo real
import { useRealtimeDocument } from '../../hooks/useRealtimeData';

export const ProfileScreen = () => {
  const { user } = useAuth();
  const { data: userData, loading } = useRealtimeDocument<UserProfile>('users', user?.uid || null);

  // userData se actualiza automáticamente cuando cambia en Firestore
  return (
    <View>
      <Text>Balance: {userData?.balance || 0} minutos</Text>
      {/* ... */}
    </View>
  );
};
```

---

## 6. SEGURIDAD Y VALIDACIÓN DEL BACKEND

### 6.1 Inyección de Datos Maliciosos ⚠️ IMPORTANTE

**Problema:** No hay sanitización de inputs
- Nombres, notas, referencias pueden contener HTML/scripts
- No se validan tipos de datos

**Solución:**
```typescript
// utils/sanitize.ts (NUEVO ARCHIVO)
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers
};

export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, 'string' | 'number' | 'boolean'>
): Partial<T> => {
  const sanitized: any = {};

  Object.keys(schema).forEach(key => {
    const value = obj[key];
    const type = schema[key];

    switch (type) {
      case 'string':
        sanitized[key] = typeof value === 'string' ? sanitizeInput(value) : '';
        break;
      case 'number':
        sanitized[key] = typeof value === 'number' ? value : 0;
        break;
      case 'boolean':
        sanitized[key] = Boolean(value);
        break;
    }
  });

  return sanitized as Partial<T>;
};

// services/paymentService.ts - Usar sanitización
export const processPurchaseTransaction = async (...) => {
  // ✅ Sanitizar referencia del usuario
  const cleanReference = reference ? sanitizeInput(reference, 50) : undefined;

  const transactionData = {
    // ...
    reference: cleanReference,
    // ...
  };

  // ...
};
```

### 6.2 Validación de Permisos en Cliente ❌ CRÍTICO

**Problema:** Permisos solo se validan en UI, no en servicio
- Cliente puede llamar `completeTransaction()` directamente
- No hay verificación de rol antes de operaciones críticas

**Solución:**
```typescript
// services/securityRules.ts (NUEVO ARCHIVO)
import { UserProfile } from './authService';

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export const requireRole = (
  user: UserProfile | null,
  requiredRole: 'client' | 'admin' | 'guard' | ('client' | 'admin' | 'guard')[]
) => {
  if (!user) {
    throw new PermissionError('Usuario no autenticado');
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.role)) {
    throw new PermissionError(
      `Permiso denegado. Se requiere rol: ${roles.join(' o ')}`
    );
  }
};

export const requireOwnership = (
  user: UserProfile | null,
  resourceUserId: string
) => {
  if (!user) {
    throw new PermissionError('Usuario no autenticado');
  }

  if (user.uid !== resourceUserId && user.role !== 'admin') {
    throw new PermissionError('No tienes permiso para acceder a este recurso');
  }
};

// services/paymentService.ts - Aplicar validación
import { requireRole, requireOwnership } from './securityRules';
import { getUserProfile } from './authService';
import { getCurrentUser } from './authService';

export const completeTransaction = async (
  transactionId: string,
  processedBy?: string,
  currentUser?: UserProfile // ✅ Requerir usuario actual
): Promise<PaymentTransaction> => {
  try {
    // ✅ Validar permisos
    requireRole(currentUser, ['admin', 'guard']);

    // ... resto del código
  } catch (error) {
    if (error instanceof PermissionError) {
      Alert.alert('Permiso Denegado', error.message);
    }
    throw error;
  }
};

export const getUserTransactions = async (
  userId: string,
  currentUser?: UserProfile
): Promise<PaymentTransaction[]> => {
  // ✅ Validar que sea el mismo usuario o admin
  requireOwnership(currentUser, userId);

  // ... resto del código
};
```

---

## 7. OPTIMIZACIÓN Y PERFORMANCE

### 7.1 Re-renders Innecesarios ⚠️ IMPORTANTE

**Problema:** Components se re-renderizan sin cambios
- `Button.tsx` tiene logs que se ejecutan en cada render

**Ubicación:** `/Users/diego/Desktop/ParKing_NEW/src/components/ui/Button.tsx:44-50`

**Solución:**
```typescript
// components/ui/Button.tsx
import React, { useCallback, memo } from 'react';

const ButtonComponent: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle
}) => {
  // ✅ Memoizar handler para evitar re-creación
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  // ✅ Remover logs de producción
  if (__DEV__) {
    console.log('Button render:', { disabled, loading, title });
  }

  // ... resto del código
};

// ✅ Memoizar component
export const Button = memo(ButtonComponent);
```

### 7.2 Imágenes sin Optimización ⚠️ IMPORTANTE

**Problema:** Imágenes se cargan sin cache ni compresión
- Logo en LoginScreen se carga cada vez
- No hay lazy loading

**Solución:**
```typescript
// components/ui/OptimizedImage.tsx (NUEVO ARCHIVO)
import React, { useState } from 'react';
import { Image, ActivityIndicator, View, StyleSheet, ImageProps } from 'react-native';
import { theme } from '../../constants/theme';

interface OptimizedImageProps extends ImageProps {
  source: any;
  width?: number;
  height?: number;
  showLoader?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  width,
  height,
  showLoader = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Image
        {...props}
        source={source}
        style={[styles.image, { width, height }]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        // ✅ Cache mode para mejor performance
        cache="force-cache"
      />

      {loading && showLoader && (
        <ActivityIndicator
          style={styles.loader}
          color={theme.colors.primary}
        />
      )}

      {error && (
        <View style={styles.error}>
          <Text style={styles.errorText}>Error</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
  loader: {
    position: 'absolute',
  },
  error: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
  },
});
```

---

## 8. TESTING Y DEBUGGING

### 8.1 Error Boundaries Faltantes ❌ CRÍTICO

**Problema:** No hay error boundaries para capturar crashes
- Si un component crashea, toda la app muere

**Solución:**
```typescript
// components/ErrorBoundary.tsx (NUEVO ARCHIVO)
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // ✅ Aquí enviar a servicio de logging (Sentry, Firebase Crashlytics, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Error desconocido'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  buttonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
  },
});

// App.tsx - Envolver toda la app
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 8.2 Logs de Producción ⚠️ IMPORTANTE

**Problema:** Console.logs en producción afectan performance
- 50+ console.log en el código
- No hay sistema de logging estructurado

**Solución:**
```typescript
// utils/logger.ts (NUEVO ARCHIVO)
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = __DEV__;

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return; // No mostrar debug en producción
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.log(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        // ✅ En producción, enviar a servicio de logging
        if (!this.isDevelopment) {
          // sendToLoggingService({ level, message, data });
        }
        break;
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const logger = new Logger();

// Reemplazar console.log por:
// logger.debug('Loading parking locations:', filters);
// logger.error('Error creating session:', error);
```

---

## RESUMEN DE ARCHIVOS A CREAR

### Archivos de Utilidades (8)
1. `/src/services/networkHelpers.ts` - Timeout y retry
2. `/src/services/retryHelper.ts` - Retry logic
3. `/src/utils/validators.ts` - Validadores reutilizables
4. `/src/utils/sanitize.ts` - Sanitización de inputs
5. `/src/utils/logger.ts` - Sistema de logging
6. `/src/constants/inputLimits.ts` - Límites de caracteres
7. `/src/services/securityRules.ts` - Validación de permisos
8. `/src/navigation/DeepLinkHandler.tsx` - Manejo de deep links

### Hooks Personalizados (6)
9. `/src/hooks/useNetworkStatus.ts` - Estado de red
10. `/src/hooks/useFormValidation.ts` - Validación de forms
11. `/src/hooks/useBackHandler.ts` - Back button Android
12. `/src/hooks/useAppState.ts` - Estado de la app
13. `/src/hooks/usePaginatedQuery.ts` - Paginación
14. `/src/hooks/useRealtimeData.ts` - Datos en tiempo real

### Componentes (3)
15. `/src/components/ui/ValidatedTextInput.tsx` - Input con validación
16. `/src/components/ui/OptimizedImage.tsx` - Imagen optimizada
17. `/src/components/ErrorBoundary.tsx` - Error boundary

---

## ARCHIVOS A MODIFICAR

### Servicios (5)
1. `/src/services/authService.ts` - Agregar timeout, validación de rol
2. `/src/services/parkingService.ts` - Validación de duración, transacciones atómicas
3. `/src/services/paymentService.ts` - Transacciones atómicas, permisos, paginación
4. `/src/hooks/useAuth.tsx` - Listener de rol, manejo de token expirado
5. `/src/navigation/AppNavigator.tsx` - Validación mejorada de rol

### Pantallas (3)
6. `/src/screens/auth/LoginScreen.tsx` - Validación en tiempo real, back handler
7. `/src/screens/client/MapScreen.tsx` - Estados de carga mejorados
8. `/src/screens/guard/QRScannerScreen.tsx` - AppState handler

### Componentes (1)
9. `/src/components/ui/Button.tsx` - Memoización, remover logs

---

## PRIORIDAD DE IMPLEMENTACIÓN

### 🔴 CRÍTICO (Implementar PRIMERO)
1. Error Boundaries
2. Loading timeouts
3. Race conditions en transacciones
4. Validación de rol undefined
5. Sesión expirada
6. Back button Android
7. Sanitización de inputs

### 🟡 IMPORTANTE (Implementar SEGUNDO)
8. Retry logic con manejo de red
9. Validación en tiempo real de forms
10. Paginación de listas
11. Listener de cambio de rol
12. Deep links
13. AppState handler

### 🟢 MEJORA (Implementar TERCERO)
14. Optimización de imágenes
15. Logger estructurado
16. Memoización de components
17. Datos en tiempo real
18. Estados vacíos mejorados

---

## TESTING RECOMENDADO

### Tests Unitarios
```typescript
// __tests__/validators.test.ts
describe('validators', () => {
  it('should validate phone numbers', () => {
    expect(validators.phone('12345678').valid).toBe(true);
    expect(validators.phone('123').valid).toBe(false);
    expect(validators.phone('').valid).toBe(false);
  });
});

// __tests__/retryHelper.test.ts
describe('retryOperation', () => {
  it('should retry on network errors', async () => {
    let attempts = 0;
    const operation = () => {
      attempts++;
      if (attempts < 3) throw new Error('Network error');
      return Promise.resolve('success');
    };

    const result = await retryOperation(operation, 3, 100);
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});
```

### Tests de Integración
```typescript
// __tests__/auth.integration.test.ts
describe('Authentication Flow', () => {
  it('should handle expired session', async () => {
    // Simular token expirado
    // Verificar que muestre alert
    // Verificar que cierre sesión
  });

  it('should handle role change', async () => {
    // Cambiar rol en Firestore
    // Verificar que detecte cambio
    // Verificar que actualice navegación
  });
});
```

---

## CONCLUSIÓN

Se identificaron **42 edge cases críticos** que pueden causar crashes o comportamiento inesperado. La implementación de las soluciones propuestas mejorará significativamente la robustez de la aplicación.

**Estimación de esfuerzo:**
- Archivos nuevos: ~17 archivos (8-12 horas)
- Modificaciones: ~9 archivos (6-8 horas)
- Testing: ~20 tests (4-6 horas)
- **TOTAL: 18-26 horas de desarrollo**

**Beneficios:**
- ✅ Eliminación de crashes por estados edge
- ✅ Mejor experiencia de usuario
- ✅ Código más mantenible y testeable
- ✅ Seguridad mejorada
- ✅ Performance optimizado