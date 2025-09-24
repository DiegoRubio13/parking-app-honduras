# Resumen Ejecutivo: Fixes de Edge Cases - ParKing App

## 📊 HALLAZGOS PRINCIPALES

Se identificaron **42 edge cases críticos** que pueden causar crashes o comportamiento inesperado:

- **10 casos CRÍTICOS** que pueden crashear la app
- **18 casos IMPORTANTES** que degradan UX
- **14 casos de MEJORA** para optimización

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. Loading Indefinido
**Archivos afectados:**
- `/src/services/authService.ts` - `sendVerificationCode()` sin timeout
- `/src/services/parkingService.ts` - Queries sin límite de tiempo
- `/src/services/paymentService.ts` - Transacciones sin timeout

**Impacto:** Usuario queda bloqueado si Firebase no responde

### 2. Usuario Sin Rol
**Archivo:** `/src/navigation/AppNavigator.tsx:82-94`

**Problema:** Si `userData.role` es `undefined`, la app crashea

### 3. Race Conditions en Pagos
**Archivo:** `/src/services/paymentService.ts:231-275`

**Problema:** Múltiples ejecuciones de `completeTransaction()` pueden duplicar minutos

### 4. Back Button Android
**Archivos afectados:**
- `/src/screens/auth/LoginScreen.tsx`
- `/src/screens/client/PurchaseScreen.tsx`

**Problema:** Pierde estado al presionar back durante procesos críticos

### 5. Sesión Expirada
**Archivo:** `/src/hooks/useAuth.tsx`

**Problema:** No detecta cuando el token de Firebase expira

---

## ✅ ARCHIVOS CREADOS (Soluciones)

### Servicios y Utilidades
1. ✅ `/src/services/networkHelpers.ts` - Timeout y retry logic
2. ✅ `/src/utils/validators.ts` - Validadores reutilizables
3. ✅ `/src/utils/sanitize.ts` - Sanitización de inputs

### Hooks
4. ✅ `/src/hooks/useBackHandler.ts` - Manejo de back button
5. ✅ `/src/hooks/useNetworkStatus.ts` - Estado de red
6. ✅ `/src/hooks/useAppState.ts` - Estado de la app

### Componentes
7. ✅ `/src/components/ErrorBoundary.tsx` - Ya existe, mejorado

---

## 🛠️ FIXES INMEDIATOS REQUERIDOS

### FIX 1: Agregar Timeout a Operaciones Firebase

**Archivo:** `/src/services/authService.ts`

```typescript
import { withTimeout } from './networkHelpers';

export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    // ❌ ANTES (puede colgar indefinidamente)
    // const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);

    // ✅ DESPUÉS (timeout de 15 segundos)
    const confirmationResult = await withTimeout(
      signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier),
      15000,
      'El envío del código tardó demasiado. Verifica tu conexión.'
    );

    return { success: true, confirmationResult };
  } catch (error: any) {
    // manejo de error...
  }
};
```

**También aplicar en:**
- `/src/services/parkingService.ts` - Todas las queries
- `/src/services/paymentService.ts` - Todas las transacciones

---

### FIX 2: Validar Rol en AppNavigator

**Archivo:** `/src/navigation/AppNavigator.tsx`

```typescript
export default function AppNavigator() {
  const { isLoading, isAuthenticated, userData } = useAuth();

  // ✅ VALIDACIÓN MEJORADA
  const hasValidRole = userData?.role && ['client', 'guard', 'admin'].includes(userData.role);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* ❌ ANTES */}
        {/* {!isAuthenticated ? ( */}

        {/* ✅ DESPUÉS */}
        {!isAuthenticated || !hasValidRole ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {userData.role === 'client' && <Stack.Screen name="Client" component={ClientNavigator} />}
            {userData.role === 'guard' && <Stack.Screen name="Guard" component={GuardNavigator} />}
            {userData.role === 'admin' && <Stack.Screen name="Admin" component={AdminNavigator} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

### FIX 3: Usar Transacciones Atómicas en Pagos

**Archivo:** `/src/services/paymentService.ts`

```typescript
import { runTransaction } from 'firebase/firestore';

export const completeTransaction = async (
  transactionId: string,
  processedBy?: string
): Promise<PaymentTransaction> => {
  // ❌ ANTES (race condition posible)
  // const transactionDoc = await getDoc(transactionRef);
  // await updateDoc(transactionRef, updates);
  // await updateUserBalance(userId, newBalance);

  // ✅ DESPUÉS (atómico, previene race conditions)
  return await runTransaction(db, async (transaction) => {
    const transactionRef = doc(db, 'paymentTransactions', transactionId);
    const transactionDoc = await transaction.get(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transacción no encontrada');
    }

    const txData = transactionDoc.data() as PaymentTransaction;

    // Validar estado DENTRO de la transacción
    if (txData.status === 'completed') {
      return txData; // Ya completada, evitar duplicado
    }

    // Actualizar transacción y balance en una sola transacción
    transaction.update(transactionRef, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      processedBy
    });

    if (txData.type === 'purchase') {
      const userRef = doc(db, 'users', txData.userId);
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists()) {
        const newBalance = (userDoc.data().balance || 0) + txData.minutes;
        transaction.update(userRef, { balance: newBalance });
      }
    }

    return { ...txData, status: 'completed' };
  });
};
```

---

### FIX 4: Manejar Back Button en Pantallas Críticas

**Archivo:** `/src/screens/auth/LoginScreen.tsx`

```typescript
import { useBackHandler } from '../../hooks/useBackHandler';
import { Alert } from 'react-native';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  // ... otros estados

  // ✅ AGREGAR esto
  useBackHandler(() => {
    if (step === 'verification') {
      Alert.alert(
        'Cancelar verificación',
        '¿Estás seguro? Perderás el código enviado.',
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

---

### FIX 5: Detectar Token Expirado

**Archivo:** `/src/hooks/useAuth.tsx`

```typescript
import { onIdTokenChanged } from 'firebase/auth';
import { Alert } from 'react-native';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // ... estados existentes

  // ✅ AGREGAR listener de token
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Intentar refrescar token
          await firebaseUser.getIdToken(true);
          console.log('Token refreshed successfully');
        } catch (error: any) {
          console.error('Token refresh failed:', error);

          if (error.code === 'auth/user-token-expired') {
            Alert.alert(
              'Sesión Expirada',
              'Tu sesión ha expirado. Inicia sesión nuevamente.',
              [{ text: 'OK', onPress: () => signOut() }]
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

### FIX 6: Validar Inputs en Tiempo Real

**Archivo:** `/src/screens/auth/LoginScreen.tsx`

```typescript
import { validators } from '../../utils/validators';
import { useState } from 'react';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string>();

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);

    // ✅ Validar en tiempo real
    if (formatted.length > 0) {
      const validation = validators.phone(formatted);
      setPhoneError(validation.valid ? undefined : validation.error);
    } else {
      setPhoneError(undefined);
    }
  };

  return (
    // ... JSX
    <View>
      <TextInput
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        // ...
      />
      {phoneError && (
        <Text style={styles.errorText}>{phoneError}</Text>
      )}
    </View>
  );
};
```

---

### FIX 7: Sanitizar Inputs antes de Guardar

**Archivo:** `/src/services/paymentService.ts`

```typescript
import { sanitizeInput, sanitizeReference } from '../utils/sanitize';

export const processPurchaseTransaction = async (
  userId: string,
  packageId: string,
  method: 'transfer' | 'cash' | 'card',
  reference?: string,
  processedBy?: string
): Promise<PaymentTransaction> => {
  // ❌ ANTES (sin sanitizar)
  // const transactionData = { ...otherData, reference };

  // ✅ DESPUÉS (sanitizado)
  const cleanReference = reference ? sanitizeReference(reference) : undefined;

  const transactionData = {
    ...otherData,
    reference: cleanReference
  };

  // ... resto
};
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Prioridad CRÍTICA (Esta semana)
- [ ] **FIX 1:** Agregar timeout a operaciones Firebase (2h)
- [ ] **FIX 2:** Validar rol en AppNavigator (30m)
- [ ] **FIX 3:** Transacciones atómicas en pagos (1h)
- [ ] **FIX 4:** Back handler en pantallas críticas (1h)
- [ ] **FIX 5:** Detectar token expirado (30m)

### Prioridad IMPORTANTE (Próxima semana)
- [ ] **FIX 6:** Validación en tiempo real (2h)
- [ ] **FIX 7:** Sanitizar inputs (1h)
- [ ] Agregar indicadores de red sin conexión (1h)
- [ ] Implementar retry logic en servicios (2h)
- [ ] Manejar AppState en QR Scanner (30m)

### Prioridad MEJORA (Siguiente sprint)
- [ ] Optimizar imágenes con cache (1h)
- [ ] Implementar paginación en listas (2h)
- [ ] Sistema de logging estructurado (1h)
- [ ] Datos en tiempo real para balance (1h)

---

## 🧪 TESTS RECOMENDADOS

### Tests Unitarios a Crear
```bash
# Validadores
__tests__/utils/validators.test.ts

# Network helpers
__tests__/services/networkHelpers.test.ts

# Sanitización
__tests__/utils/sanitize.test.ts
```

### Tests de Integración
```bash
# Flujo de autenticación
__tests__/integration/auth.test.ts

# Flujo de pagos
__tests__/integration/payment.test.ts

# Manejo de errores
__tests__/integration/errorHandling.test.ts
```

---

## 📊 MÉTRICAS DE ÉXITO

Después de implementar los fixes:

- ✅ **0 crashes** por estados edge
- ✅ **100% de inputs** validados y sanitizados
- ✅ **0 race conditions** en transacciones
- ✅ **Timeout máximo** de 15s en operaciones
- ✅ **Feedback claro** en todos los estados de error
- ✅ **Manejo robusto** de back button y app state

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar fixes críticos** (4-5 horas)
2. **Agregar tests unitarios** (2-3 horas)
3. **Testing manual** en dispositivos Android/iOS
4. **Code review** del equipo
5. **Deploy a staging** para QA
6. **Monitoreo** de crashes en producción (Sentry)

---

## 📁 ARCHIVOS DE REFERENCIA

### Análisis Completo
`/Users/diego/Desktop/ParKing_NEW/EDGE_CASES_ANALYSIS.md`

### Código Creado
- `/Users/diego/Desktop/ParKing_NEW/src/services/networkHelpers.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/utils/validators.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/utils/sanitize.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/hooks/useBackHandler.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/hooks/useNetworkStatus.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/hooks/useAppState.ts`

### Archivos a Modificar
- `/Users/diego/Desktop/ParKing_NEW/src/services/authService.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/services/paymentService.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/services/parkingService.ts`
- `/Users/diego/Desktop/ParKing_NEW/src/navigation/AppNavigator.tsx`
- `/Users/diego/Desktop/ParKing_NEW/src/hooks/useAuth.tsx`
- `/Users/diego/Desktop/ParKing_NEW/src/screens/auth/LoginScreen.tsx`

---

**Fecha de análisis:** 2025-09-23
**Tiempo estimado total:** 18-26 horas de desarrollo + testing