# PaRKING App - Layouts con Sistema QR (19 Screens)
## Sistema: QR para entrada/salida + compra de minutos

### AUTHENTICATION SCREENS (5)

#### 1. LOGIN SCREEN
```
┌─────────────────────────────────────┐
│           ╔═══════════╗             │
│           ║ ParKing   ║             │
│           ║    🅿️      ║             │
│           ╚═══════════╝             │
│                                     │
│        Bienvenido de vuelta         │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Número de teléfono         │   │
│    │ +504 ________________      │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        CONTINUAR           │   │
│    └─────────────────────────────┘   │
│                                     │
│           ¿No tienes cuenta?        │
│            [Registrarse]            │
└─────────────────────────────────────┘
```

#### 2. SMS VERIFICATION (Para Admin/Guard)
```
┌─────────────────────────────────────┐
│              ←  Verificar           │
│                                     │
│              📱                     │
│                                     │
│        Código de verificación       │
│                                     │
│     Ingresa el código enviado a     │
│           +504 9999-9999            │
│                                     │
│    ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐    │
│    │ │  │ │  │ │  │ │  │ │  │ │    │
│    └─┘  └─┘  └─┘  └─┘  └─┘  └─┘    │
│                                     │
│         Reenviar código (30s)       │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        VERIFICAR           │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 3. REGISTER SCREEN
```
┌─────────────────────────────────────┐
│              ←  Registro            │
│                                     │
│           Crear cuenta nueva        │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Nombre completo            │   │
│    │ ______________________     │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Número de teléfono         │   │
│    │ +504 ________________      │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Correo electrónico         │   │
│    │ ______________________     │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        REGISTRARSE         │   │
│    └─────────────────────────────┘   │
│                                     │
│         ¿Ya tienes cuenta?          │
│           [Iniciar sesión]          │
└─────────────────────────────────────┘
```

#### 4. ROLE SELECTION (Admin/Guard PIN)
```
┌─────────────────────────────────────┐
│              ←  Acceso especial     │
│                                     │
│                🔐                   │
│                                     │
│           Acceso especial           │
│                                     │
│       Ingresa tu PIN de acceso      │
│                                     │
│    ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐    │
│    │●│  │●│  │ │  │ │  │ │  │ │    │
│    └─┘  └─┘  └─┘  └─┘  └─┘  └─┘    │
│                                     │
│         [1] [2] [3] [4] [5]         │
│         [6] [7] [8] [9] [0]         │
│                                     │
│              [Borrar]               │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         ACCEDER            │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 5. PASSWORD RECOVERY
```
┌─────────────────────────────────────┐
│              ←  Recuperar acceso    │
│                                     │
│                🔄                   │
│                                     │
│         ¿Olvidaste tu PIN?          │
│                                     │
│     Ingresa tu número de teléfono   │
│     y te enviaremos un nuevo PIN    │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Número de teléfono         │   │
│    │ +504 ________________      │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      ENVIAR NUEVO PIN      │   │
│    └─────────────────────────────┘   │
│                                     │
│           Volver al inicio          │
└─────────────────────────────────────┘
```

### CLIENT SCREENS (8) - Con QR

#### 6. HOME SCREEN (Not Logged In)
```
┌─────────────────────────────────────┐
│  🅿️ ParKing              👤  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │                             │   │
│    │         ¡Bienvenido!        │   │
│    │                             │   │
│    │  Inicia sesión para acceder │   │
│    │    al estacionamiento       │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │          🚗 INICIAR         │   │
│    │         SESIÓN              │   │
│    └─────────────────────────────┘   │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  💳      │  │   📊     │         │
│  │ Comprar  │  │ Tarifas  │         │
│  │ Minutos  │  │          │         │
│  └──────────┘  └──────────┘         │
│                                     │
│          ¿Cómo funciona?            │
│            [Ver guía]               │
└─────────────────────────────────────┘
```

#### 7. HOME SCREEN (Logged In - Outside)
```
┌─────────────────────────────────────┐
│  🅿️ ParKing              👤  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 💰 150 minutos              │   │
│    │    Saldo disponible         │   │
│    │                    [+ Más] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        TU QR CODE           │   │
│    │                             │   │
│    │    ████ ██   ███ ████       │   │
│    │    █  █ ██ █ █ █ █  █       │   │
│    │    ████  █ ██  █ ████       │   │
│    │    █  █  █  ███  █  █       │   │
│    │    ████ ███ ███ ████        │   │
│    │                             │   │
│    │    PARKING_USER_50498765    │   │
│    └─────────────────────────────┘   │
│                                     │
│         Muestra este QR             │
│         al guardia para             │
│         ENTRAR al estacionamiento   │
│                                     │
│  [45]    [32 min]    [L180]         │
│ Sesiones Promedio   Gastado         │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  💳      │  │   🕐     │         │
│  │ Comprar  │  │Ver       │         │
│  │ Minutos  │  │Historial │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

#### 8. HOME SCREEN (Parked - Active Session)
```
┌─────────────────────────────────────┐
│  🅿️ ParKing              👤  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ ⏱️  SESIÓN ACTIVA           │   │
│    │                             │   │
│    │     00:32:15                │   │
│    │                             │   │
│    │ Tarifa: L 1.50/min          │   │
│    │ Costo actual: L 48.00       │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        TU QR CODE           │   │
│    │                             │   │
│    │    ████ ██   ███ ████       │   │
│    │    █  █ ██ █ █ █ █  █       │   │
│    │    ████  █ ██  █ ████       │   │
│    │    █  █  █  ███  █  █       │   │
│    │    ████ ███ ███ ████        │   │
│    │                             │   │
│    │    PARKING_USER_50498765    │   │
│    └─────────────────────────────┘   │
│                                     │
│         Muestra este QR             │
│         al guardia para             │
│         SALIR del estacionamiento   │
│                                     │
│  💰 102 min restantes               │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  ⏰      │  │   📞     │         │
│  │ Extender │  │ Reportar │         │
│  │ Tiempo   │  │Problema  │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

#### 9. PURCHASE SCREEN
```
┌─────────────────────────────────────┐
│              ← Comprar Minutos      │
│                                     │
│          💳 Planes Disponibles      │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      60 MINUTOS             │   │
│    │        L 20.00              │   │
│    │                        [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │     120 MINUTOS             │   │
│    │        L 35.00              │   │
│    │   💥 Ahorra L5          [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │     240 MINUTOS             │   │
│    │        L 60.00              │   │
│    │   💥 Ahorra L20         [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         COMPRAR             │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 10. PAYMENT METHOD SCREEN
```
┌─────────────────────────────────────┐
│              ← Método de Pago       │
│                                     │
│           Selecciona método         │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 💳 Tarjeta de Crédito      ●│   │
│    │    **** **** **** 1234      │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📱 Pago Móvil              ○│   │
│    │    Tigo Money / Claro       │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 💰 Efectivo                ○│   │
│    │    Pagar en el estacionam. │   │
│    └─────────────────────────────┘   │
│                                     │
│           [+ Agregar método]        │
│                                     │
│    Resumen de compra:               │
│    120 minutos - L 35.00            │
│    IVA (15%) - L 5.25               │
│    ────────────────────             │
│    Total: L 40.25                   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         PAGAR               │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 11. PROFILE SCREEN
```
┌─────────────────────────────────────┐
│              ← Mi Perfil            │
│                                     │
│            👤                       │
│       Juan Carlos Pérez             │
│       +504 9999-9999               │
│       juan@email.com               │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 💰 Saldo actual: 150 min   │   │
│    │                    [Recargar]│   │
│    └─────────────────────────────┘   │
│                                     │
│  📊 Mis Estadísticas                │
│  ┌──────────┐  ┌──────────┐         │
│  │   45     │  │ 32 min   │         │
│  │ Sesiones │  │Promedio  │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │ L 180    │  │ 89%      │         │
│  │ Gastado  │  │Cliente   │         │
│  │  Total   │  │ Activo   │         │
│  └──────────┘  └──────────┘         │
│                                     │
│  ⚙️  Configuración                  │
│  ├ Notificaciones                   │
│  ├ Métodos de pago                  │
│  ├ Mi QR personal                   │
│  ├ Ayuda y soporte                  │
│  └ Cerrar sesión                    │
│                                     │
│            Versión 1.2.0            │
└─────────────────────────────────────┘
```

#### 12. HISTORY SCREEN
```
┌─────────────────────────────────────┐
│              ← Historial            │
│                                     │
│     📅 Filtros: [Hoy] [Semana]     │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Hoy 14:30 - 15:15           │ │
│  │    Tiempo: 45 min               │ │
│  │    Tarifa: L 1.50/min           │ │
│  │    Costo: L 67.50               │ │
│  │    QR usado ✓                   │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Ayer 09:00 - 09:30          │ │
│  │    Tiempo: 30 min               │ │
│  │    Tarifa: L 1.50/min           │ │
│  │    Costo: L 45.00               │ │
│  │    QR usado ✓                   │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 💳 Recarga - 15 Ene             │ │
│  │    +120 minutos                 │ │
│  │    Monto: L 35.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│            [Exportar PDF]           │
│                                     │
│         📊 Estadísticas             │
│       Total gastado: L 1,120       │
│       Sesiones: 45                 │
│       Tiempo promedio: 32 min      │
│       Ahorros con paquetes: L 45   │
└─────────────────────────────────────┘
```

#### 13. QR DISPLAY SCREEN (Pantalla completa)
```
┌─────────────────────────────────────┐
│              ←  Mi QR Code          │
│                                     │
│      Muestra este código al         │
│      guardia para entrar/salir      │
│                                     │
│  ┌───────────────────────────────┐   │
│  │                               │   │
│  │   ████ ██   ███ ████          │   │
│  │   █  █ ██ █ █ █ █  █          │   │
│  │   ████  █ ██  █ ████          │   │
│  │   █  █  █  ███  █  █          │   │
│  │   ████ ███ ███ ████           │   │
│  │   █  █ █ █ █  █  █ █          │   │
│  │   ████ ███  █  █ ████         │   │
│  │   █  █ █ █ ███  █  █          │   │
│  │   ████ ███ ███ ████           │   │
│  │                               │   │
│  └───────────────────────────────┘   │
│                                     │
│         PARKING_USER_50498765       │
│                                     │
│    Estado: Fuera del estacionam.    │
│    Saldo: 150 minutos               │
│                                     │
│  ┌──────────────────────────────┐    │
│  │        🔆 Brillo MAX        │    │
│  └──────────────────────────────┘    │
│                                     │
│           [Regresar a inicio]       │
└─────────────────────────────────────┘
```

#### 14. LOW MINUTES WARNING
```
┌─────────────────────────────────────┐
│              ⚠️ Advertencia         │
│                                     │
│                🪫                   │
│                                     │
│         Saldo bajo de minutos       │
│                                     │
│    Te quedan solo 15 minutos para   │
│    estacionar. ¿Quieres comprar    │
│    más minutos ahora?               │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         💳 COMPRAR          │   │
│    │        MÁS MINUTOS          │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      Recordar más tarde     │   │
│    └─────────────────────────────┘   │
│                                     │
│           Paquetes sugeridos:       │
│         🔥 60 min - L 20.00         │
│         💎 120 min - L 35.00        │
└─────────────────────────────────────┘
```

### GUARD SCREENS (3) - Con Scanner QR

#### 15. QR SCANNER SCREEN (Principal del Guardia)
```
┌─────────────────────────────────────┐
│  🛡️ GUARDIA            📊  ⚙️       │
│                                     │
│    ┌─────────────────────────────┐   │
│    │                             │   │
│    │        📷 SCANNER           │   │
│    │         ACTIVO              │   │
│    │                             │   │
│    │   ┌─────────────────────┐   │   │
│    │   │     ╔═══════╗       │   │   │
│    │   │     ║ ENFOCA║       │   │   │
│    │   │     ║ EL QR ║       │   │   │
│    │   │     ╚═══════╝       │   │   │
│    │   └─────────────────────┘   │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│        🔦 [Flash] [🔄 Cambiar]      │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📈 Resumen del Día          │   │
│    │                             │   │
│    │ Entradas: 23                │   │
│    │ Salidas: 18                 │   │
│    │ Adentro ahora: 5            │   │
│    │ Ingresos: L 450             │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│         [Ver Dashboard Completo]    │
└─────────────────────────────────────┘
```

#### 16. SCAN RESULT - ENTRADA
```
┌─────────────────────────────────────┐
│              ✅ ENTRADA             │
│                                     │
│                🚗                   │
│                ⬇️                   │
│                                     │
│         Usuario escaneado:          │
│                                     │
│    👤 Juan Carlos Pérez             │
│    📱 +504 9876-5432               │
│    💰 Saldo: 150 minutos           │
│                                     │
│    ⏰ Entrada registrada:           │
│       Hoy 14:30:25                 │
│                                     │
│    💵 Tarifa actual:               │
│       L 1.50 por minuto            │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         ✅ CONFIRMAR        │   │
│    │          ENTRADA            │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      ❌ CANCELAR            │   │
│    └─────────────────────────────┘   │
│                                     │
│           [Escanear otro]           │
└─────────────────────────────────────┘
```

#### 17. SCAN RESULT - SALIDA
```
┌─────────────────────────────────────┐
│              🚪 SALIDA              │
│                                     │
│                🚗                   │
│                ⬆️                   │
│                                     │
│         Usuario escaneado:          │
│                                     │
│    👤 Juan Carlos Pérez             │
│    📱 +504 9876-5432               │
│                                     │
│    ⏰ Tiempo estacionado:           │
│       2 horas 15 minutos           │
│                                     │
│    💰 Costo total:                 │
│       L 202.50                     │
│                                     │
│    🪙 Saldo restante:               │
│       15 minutos (¡BAJO!)          │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         ✅ CONFIRMAR        │   │
│    │          SALIDA             │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      ❌ CANCELAR            │   │
│    └─────────────────────────────┘   │
│                                     │
│           [Escanear otro]           │
└─────────────────────────────────────┘
```

#### 18. GUARD DASHBOARD
```
┌─────────────────────────────────────┐
│              ← Dashboard            │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Estadísticas de Hoy      │   │
│    │                             │   │
│    │ 🚗 Entradas: 23             │   │
│    │ 🚪 Salidas: 18              │   │
│    │ 🅿️ Adentro: 5               │   │
│    │ 💰 Ingresos: L 1,250        │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│    🚗 Vehículos Adentro Ahora:     │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Juan Pérez (+504 9876-5432)    │ │
│  │ Entrada: 14:30 (1h 45m)        │ │
│  │ Costo actual: L 157.50          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ María López (+504 8765-4321)   │ │
│  │ Entrada: 15:45 (30m)           │ │
│  │ Costo actual: L 45.00           │ │
│  └─────────────────────────────────┘ │
│                                     │
│    ⚠️ Alertas:                      │
│    • 2 usuarios con saldo bajo      │
│                                     │
│         [Volver al Scanner]         │
└─────────────────────────────────────┘
```

### ADMIN SCREENS (3) - Gestión del Sistema

#### 19. ADMIN DASHBOARD
```
┌─────────────────────────────────────┐
│  ⚡ ADMIN                 🔧  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Estadísticas del Día     │   │
│    │                             │   │
│    │ 💰 Ingresos: L 4,250        │   │
│    │ 🚗 Total sesiones: 156      │   │
│    │ ⏱️ Promedio: 28 min/sesión   │   │
│    │ 👥 Usuarios activos: 89     │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│  🔧 Administración                  │
│  ┌──────────┐  ┌──────────┐         │
│  │  👥      │  │   💰     │         │
│  │Gestionar │  │ Tarifas  │         │
│  │Usuarios  │  │ y Precios│         │
│  └──────────┘  └──────────┘         │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  🛡️      │  │   📊     │         │
│  │Gestionar │  │ Reportes │         │
│  │ Guardias │  │ Detallados│        │
│  └──────────┘  └──────────┘         │
│                                     │
│  📈 Sistema QR funcionando:         │
│  • Códigos generados: 342          │
│  • Escaneos exitosos: 98.5%        │
│  • Sin errores de lectura          │
│                                     │
│    [Ver panel completo]            │
└─────────────────────────────────────┘
```

## FUNCIONALIDADES CLAVE:

### Para Usuarios:
- QR personal único: `PARKING_USER_{phone}`
- Mismo QR para entrada y salida
- Sistema automático de entrada/salida
- Compra de paquetes con descuentos
- Alertas de saldo bajo

### Para Guardia:
- Scanner QR principal
- Sistema automático entrada/salida
- Dashboard en tiempo real
- Confirmaciones antes de procesar

### Flujo Principal:
1. **Usuario llega:** Muestra QR → Guardia escanea → Sistema registra ENTRADA
2. **Usuario sale:** Muestra mismo QR → Guardia escanea → Sistema calcula tiempo y costo → Registra SALIDA
3. **Sistema cobra automáticamente** del saldo de minutos del usuario