# Guía de Conversión HTML/CSS a React Native - ParKing

## Tabla de Conversión de Elementos

### Elementos Básicos HTML → React Native

| HTML | CSS | React Native | Props/Style |
|------|-----|--------------|-------------|
| `<div>` | `display: flex` | `<View>` | `style={{flexDirection: 'column'}}` |
| `<span>` | `display: inline` | `<Text>` | Componente por defecto para texto |
| `<button>` | `cursor: pointer` | `<TouchableOpacity>` | `onPress={handlePress}` |
| `<input>` | `type="text"` | `<TextInput>` | `placeholder`, `value`, `onChangeText` |
| `<img>` | `src="..."` | `<Image>` | `source={{uri: '...'}}` |

### Conversión de Estilos CSS

| CSS Property | React Native Equivalent | Notas |
|-------------|------------------------|-------|
| `padding: 20px` | `paddingHorizontal: 20, paddingVertical: 20` | RN usa propiedades específicas |
| `margin: 10px 20px` | `marginVertical: 10, marginHorizontal: 20` | No shorthand en RN |
| `border-radius: 15px` | `borderRadius: 15` | Igual sintaxis |
| `box-shadow` | `shadowColor, shadowOffset, shadowOpacity, shadowRadius` | iOS only; usar elevation en Android |
| `background: linear-gradient()` | `LinearGradient` component | Requiere `expo-linear-gradient` |

---

## Conversión Específica por Pantalla

### 1. Pantalla Principal del Usuario

#### HTML/CSS Original:
```html
<div class="mobile-container">
    <div class="header">
        <div class="logo">ParKing</div>
        <div class="subtitle">Tu estacionamiento inteligente</div>
    </div>
    <!-- ... resto del contenido ... -->
</div>
```

#### Conversión a React Native:
```jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const UserMainScreen = () => {
  const [minutesBalance, setMinutesBalance] = useState(45);
  const [isInside, setIsInside] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#5ba0f2']}
        style={styles.header}
      >
        <Text style={styles.logo}>ParKing</Text>
        <Text style={styles.subtitle}>Tu estacionamiento inteligente</Text>
      </LinearGradient>

      {/* Estado del usuario */}
      <View style={styles.statusSection}>
        <View style={[
          styles.statusBadge,
          isInside ? styles.statusInside : styles.statusOutside
        ]}>
          <Text style={styles.statusText}>
            {isInside ? 'ESTÁS ADENTRO' : 'ESTÁS AFUERA'}
          </Text>
        </View>
      </View>

      {/* Saldo de minutos */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Tu saldo actual</Text>
        <Text style={styles.balanceAmount}>
          <Text style={styles.balanceNumber}>{minutesBalance}</Text>
          <Text style={styles.balanceUnit}> min</Text>
        </Text>
      </View>

      {/* Código QR */}
      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>Muestra este código al guardia</Text>
        <View style={styles.qrContainer}>
          <View style={styles.qrCode} />
        </View>
        <Text style={styles.qrInstruction}>
          El guardia escaneará este código para registrar tu entrada o salida
        </Text>
      </View>

      {/* Botón principal */}
      <TouchableOpacity style={styles.mainButton} onPress={() => {}}>
        <Text style={styles.mainButtonText}>Comprar Más Minutos</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statusSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  statusInside: {
    backgroundColor: '#50C878',
  },
  statusOutside: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  balanceSection: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  balanceUnit: {
    fontSize: 18,
    color: '#666666',
  },
  qrSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333333',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  qrCode: {
    width: 250,
    height: 250,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  qrInstruction: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 250,
  },
  mainButton: {
    backgroundColor: '#50C878',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UserMainScreen;
```

### 2. Pantalla de Compra de Minutos

#### Componentes adicionales necesarios:
```jsx
// PackageCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PackageCard = ({ 
  minutes, 
  price, 
  isPopular, 
  isSelected, 
  onSelect,
  savings 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.packageCard,
        isSelected && styles.selected,
        isPopular && styles.popular
      ]}
      onPress={onSelect}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MÁS POPULAR</Text>
        </View>
      )}
      
      <View style={styles.packageHeader}>
        <Text style={styles.packageMinutes}>
          {minutes}<Text style={styles.minutesUnit}>min</Text>
        </Text>
        <Text style={styles.packagePrice}>
          <Text style={styles.priceSymbol}>$</Text>{price}
        </Text>
      </View>
      
      <Text style={styles.packageDetails}>
        {minutes === 60 && 'Perfecto para visitas cortas'}
        {minutes === 120 && 'Ideal para el día completo'}
        {minutes === 240 && 'Máximo ahorro para uso frecuente'}
      </Text>
      
      <View style={styles.packageFeatures}>
        <Text style={styles.costPerMinute}>
          ${(price / minutes).toFixed(2)} por minuto
        </Text>
        {savings > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Ahorra ${savings}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
```

### 3. Scanner del Guardia

#### Implementación con Camera:
```jsx
import React, { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

const GuardScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // Procesar datos del QR
    setScanResult(processQRData(data));
  };

  if (hasPermission === null) {
    return <View />;
  }
  
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Overlay del scanner */}
      <View style={styles.scannerOverlay}>
        <View style={styles.scanningFrame} />
        <Text style={styles.scanInstructions}>
          Posiciona el código QR dentro del marco
        </Text>
      </View>
      
      {/* Resultado del escaneo */}
      {scanResult && (
        <ScanResultCard 
          result={scanResult}
          onConfirm={() => confirmEntry(scanResult)}
          onReject={() => rejectEntry(scanResult)}
        />
      )}
    </View>
  );
};
```

---

## Componentes Reutilizables

### 1. Botón Personalizado
```jsx
// CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  style 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#50C878',
  },
  secondary: {
    backgroundColor: '#4A90E2',
  },
  alert: {
    backgroundColor: '#FF6B6B',
  },
  disabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  alertText: {
    color: '#FFFFFF',
  },
});

export default CustomButton;
```

### 2. StatusBadge Component
```jsx
// StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusBadge = ({ status, animated = false }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'inside':
        return [styles.badge, styles.inside];
      case 'outside':
        return [styles.badge, styles.outside];
      case 'lowBalance':
        return [styles.badge, styles.warning];
      default:
        return [styles.badge];
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'inside':
        return 'ESTÁS ADENTRO';
      case 'outside':
        return 'ESTÁS AFUERA';
      case 'lowBalance':
        return 'SALDO BAJO';
      default:
        return 'ESTADO DESCONOCIDO';
    }
  };

  return (
    <View style={getStatusStyle()}>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  inside: {
    backgroundColor: '#50C878',
  },
  outside: {
    backgroundColor: '#FF6B6B',
  },
  warning: {
    backgroundColor: '#FFA500',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StatusBadge;
```

---

## Navegación y Estado Global

### Navigation Setup
```jsx
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

import UserMainScreen from './src/screens/UserMainScreen';
import PurchaseScreen from './src/screens/PurchaseScreen';
import GuardScannerScreen from './src/screens/GuardScannerScreen';
import AdminDashboard from './src/screens/AdminDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="UserMain">
          <Stack.Screen 
            name="UserMain" 
            component={UserMainScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Purchase" 
            component={PurchaseScreen}
            options={{ 
              title: 'Comprar Minutos',
              headerStyle: { backgroundColor: '#4A90E2' },
              headerTintColor: '#FFFFFF'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
```

### Redux Store
```jsx
// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    balance: 45,
    isInside: false,
    lastEntry: null,
    qrCode: null,
  },
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    toggleStatus: (state) => {
      state.isInside = !state.isInside;
      state.lastEntry = new Date().toISOString();
    },
    addMinutes: (state, action) => {
      state.balance += action.payload;
    },
    decrementBalance: (state) => {
      if (state.balance > 0 && state.isInside) {
        state.balance -= 1;
      }
    },
  },
});

export const { 
  updateBalance, 
  toggleStatus, 
  addMinutes, 
  decrementBalance 
} = userSlice.actions;

export default userSlice.reducer;
```

---

## Consideraciones Técnicas Específicas

### 1. Manejo de Dimensiones
```jsx
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = PixelRatio.get();

// Función para ajustar tamaños
const normalize = (size) => {
  const newSize = size * scale;
  if (scale >= 3) {
    return Math.round(size * 1.5);
  } else if (scale >= 2) {
    return Math.round(size * 1.2);
  }
  return size;
};

// Uso en estilos
const styles = StyleSheet.create({
  qrCode: {
    width: width * 0.65, // 65% del ancho de pantalla
    height: width * 0.65,
    maxWidth: 250,
    maxHeight: 250,
  },
});
```

### 2. Animaciones
```jsx
import { Animated } from 'react-native';

const AnimatedStatusBadge = () => {
  const pulseAnimation = new Animated.Value(1);

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };

    pulse();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statusBadge,
        { transform: [{ scale: pulseAnimation }] }
      ]}
    >
      <Text style={styles.statusText}>ESTÁS ADENTRO</Text>
    </Animated.View>
  );
};
```

### 3. Manejo de Temas (Dark Mode)
```jsx
import { useColorScheme } from 'react-native';

const useTheme = () => {
  const colorScheme = useColorScheme();
  
  const colors = {
    primary: '#4A90E2',
    secondary: '#50C878',
    alert: '#FF6B6B',
    background: colorScheme === 'dark' ? '#1a1a1a' : '#F8F9FA',
    surface: colorScheme === 'dark' ? '#2a2a2a' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#333333',
    textSecondary: colorScheme === 'dark' ? '#CCCCCC' : '#666666',
  };

  return { colors, isDark: colorScheme === 'dark' };
};

// Uso en componentes
const UserMainScreen = () => {
  const { colors, isDark } = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* contenido */}
    </View>
  );
};
```

---

## Dependencias Necesarias

### package.json additions:
```json
{
  "dependencies": {
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/stack": "^6.0.0",
    "@reduxjs/toolkit": "^1.8.0",
    "react-redux": "^8.0.0",
    "expo-camera": "~13.0.0",
    "expo-barcode-scanner": "~12.0.0",
    "expo-linear-gradient": "~12.0.0",
    "react-native-qrcode-generator": "^1.4.0",
    "react-native-vector-icons": "^9.0.0",
    "react-native-gesture-handler": "~2.8.0",
    "react-native-screens": "~3.18.0",
    "react-native-safe-area-context": "4.4.1"
  }
}
```

### Comandos de instalación:
```bash
# Instalar dependencias principales
npm install @react-navigation/native @react-navigation/stack
npm install @reduxjs/toolkit react-redux

# Instalar dependencias de Expo
expo install expo-camera expo-barcode-scanner expo-linear-gradient

# Para proyectos React Native CLI
npm install react-native-gesture-handler react-native-screens
cd ios && pod install # Solo para iOS
```

---

## Checklist de Migración

### ✅ Fase 1: Estructura Básica
- [ ] Configurar navegación entre pantallas
- [ ] Implementar store de Redux
- [ ] Crear componentes básicos (View, Text, TouchableOpacity)
- [ ] Definir sistema de colores y estilos

### ✅ Fase 2: Funcionalidad Core
- [ ] Implementar generación/display de QR
- [ ] Configurar cámara para scanner
- [ ] Crear formularios de compra
- [ ] Implementar lógica de balance

### ✅ Fase 3: UI/UX
- [ ] Añadir animaciones y transiciones
- [ ] Implementar feedback táctil
- [ ] Optimizar para diferentes tamaños de pantalla
- [ ] Añadir modo oscuro

### ✅ Fase 4: Features Avanzadas
- [ ] Integración con métodos de pago
- [ ] Notificaciones push
- [ ] Persistencia de datos offline
- [ ] Analytics y métricas

Este diseño HTML/CSS está optimizado para una conversión directa a React Native manteniendo la funcionalidad y estética original mientras aprovecha las capacidades nativas de la plataforma móvil.