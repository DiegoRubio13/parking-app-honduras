# PaRKING App - Complete Layouts (25 Screens)
## Simplified Version - No Biometrics, No Support Calling

### AUTHENTICATION SCREENS (5)

#### 1. LOGIN SCREEN
```
┌─────────────────────────────────────┐
│           ╔═══════════╗             │
│           ║ PaRKING   ║             │
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

#### 2. SMS VERIFICATION
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

### CLIENT SCREENS (8)

#### 6. HOME SCREEN (Not Logged In)
```
┌─────────────────────────────────────┐
│  🅿️ PaRKING              👤  ☰     │
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
│  🅿️ PaRKING              👤  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 💰 150 minutos              │   │
│    │    Saldo disponible         │   │
│    │                    [+ Más] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📍 Estado Actual            │   │
│    │ ● Disponible para estacionar│   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │          🚗 INICIAR         │   │
│    │      ESTACIONAMIENTO        │   │
│    └─────────────────────────────┘   │
│                                     │
│  [45]    [32 min]    [L250]         │
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
│  🅿️ PaRKING              👤  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ ⏱️  SESIÓN ACTIVA           │   │
│    │                             │   │
│    │     00:32:15                │   │
│    │                             │   │
│    │ Espacio: A-15               │   │
│    │ Costo actual: L25.50        │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         🛑 FINALIZAR        │   │
│    │       ESTACIONAMIENTO       │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         ⏰ EXTENDER         │   │
│    │           TIEMPO            │   │
│    └─────────────────────────────┘   │
│                                     │
│  💰 124 min restantes               │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  📍      │  │   📞     │         │
│  │ Ubicar   │  │ Reportar │         │
│  │   Auto   │  │Problema  │         │
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
│    │      30 MINUTOS             │   │
│    │        L 50.00              │   │
│    │                        [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      60 MINUTOS             │   │
│    │        L 95.00              │   │
│    │   💥 Ahorra L5          [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │     120 MINUTOS             │   │
│    │       L 180.00              │   │
│    │   💥 Ahorra L20         [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │     PAQUETE MENSUAL         │   │
│    │       L 500.00              │   │
│    │   💥 Acceso ilimitado   [+] │   │
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
│    │ 🏦 Transferencia           ○│   │
│    │    Banco Atlántida          │   │
│    └─────────────────────────────┘   │
│                                     │
│           [+ Agregar método]        │
│                                     │
│    Resumen de compra:               │
│    60 minutos - L 95.00             │
│    IVA (15%) - L 14.25              │
│    ────────────────────             │
│    Total: L 109.25                  │
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
│                                     │
│  ⚙️  Configuración                  │
│  ├ Notificaciones                   │
│  ├ Métodos de pago                  │
│  ├ Historial completo               │
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
│  │    Espacio: A-12                │ │
│  │    Tiempo: 45 min               │ │
│  │    Costo: L 35.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Ayer 09:00 - 09:30          │ │
│  │    Espacio: B-05                │ │
│  │    Tiempo: 30 min               │ │
│  │    Costo: L 25.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 💳 Recarga - 15 Ene             │ │
│  │    +60 minutos                  │ │
│  │    Monto: L 95.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│            [Exportar PDF]           │
│                                     │
│         📊 Estadísticas             │
│       Total gastado: L 1,250       │
│       Sesiones: 45                 │
│       Tiempo promedio: 32 min      │
└─────────────────────────────────────┘
```

#### 13. QR SCANNER SCREEN
```
┌─────────────────────────────────────┐
│              ← Escanear QR          │
│                                     │
│    Apunta la cámara al código QR    │
│         del espacio asignado        │
│                                     │
│    ┌─────────────────────────────┐   │
│    │                             │   │
│    │   ┌─────────────────────┐   │   │
│    │   │                     │   │   │
│    │   │  📷 ESCANEAR AQUÍ   │   │   │
│    │   │                     │   │   │
│    │   └─────────────────────┘   │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│           🔦 [Flash On/Off]         │
│                                     │
│    Si no puedes escanear, ingresa   │
│       el código manualmente:       │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Código del espacio         │   │
│    │ A-___                      │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        CONFIRMAR            │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### GUARD SCREENS (6)

#### 14. GUARD DASHBOARD
```
┌─────────────────────────────────────┐
│  🛡️ GUARDIA              🔓  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Resumen del Día          │   │
│    │                             │   │
│    │ Espacios ocupados: 45/60    │   │
│    │ Ingresos generados: L2,150  │   │
│    │ Sesiones iniciadas: 67      │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│  ⚡ Acciones Rápidas                │
│  ┌──────────┐  ┌──────────┐         │
│  │  👁️      │  │   🚗     │         │
│  │ Monitoreo│  │ Verificar│         │
│  │ en Vivo  │  │ Vehículo │         │
│  └──────────┘  └──────────┘         │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  ⚠️      │  │   📋     │         │
│  │ Reportar │  │ Lista de │         │
│  │Incidente │  │ Turnos   │         │
│  └──────────┘  └──────────┘         │
│                                     │
│  🚨 Alertas Recientes:              │
│  • Espacio A-12 sin pago (10:30)   │
│  • Vehículo bloqueando salida       │
│                                     │
│    [Ver todas las alertas]         │
└─────────────────────────────────────┘
```

#### 15. LIVE MONITORING
```
┌─────────────────────────────────────┐
│              ← Monitoreo en Vivo    │
│                                     │
│  🔄 Actualizando cada 30 segundos   │
│                                     │
│  📍 ZONA A (20/25 ocupados)         │
│  ┌─────────────────────────────────┐ │
│  │ [🚗] [🚗] [⬜] [🚗] [🚗]      │ │
│  │  A1   A2   A3   A4   A5         │ │
│  │                                 │ │
│  │ [🚗] [⬜] [🚗] [⚠️] [🚗]      │ │
│  │  A6   A7   A8   A9  A10         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  📍 ZONA B (15/20 ocupados)         │
│  ┌─────────────────────────────────┐ │
│  │ [🚗] [🚗] [⬜] [🚗] [⬜]      │ │
│  │  B1   B2   B3   B4   B5         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ⚠️ Espacios con problemas:         │
│  • A9 - Sin pago (45 min)          │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │ 📋 Ver   │  │ ⚠️ Crear │         │
│  │ Detalles │  │ Alerta   │         │
│  └──────────┘  └──────────┘         │
│                                     │
│         🔄 Actualizar ahora         │
└─────────────────────────────────────┘
```

#### 16. VEHICLE VERIFICATION
```
┌─────────────────────────────────────┐
│              ← Verificar Vehículo   │
│                                     │
│    📱 Escanea la placa o QR code    │
│                                     │
│    ┌─────────────────────────────┐   │
│    │                             │   │
│    │   ┌─────────────────────┐   │   │
│    │   │                     │   │   │
│    │   │  📷 ESCANEAR        │   │   │
│    │   │                     │   │   │
│    │   └─────────────────────┘   │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│       O ingresa manualmente:       │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Placa del vehículo         │   │
│    │ HNP-____                   │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Espacio asignado           │   │
│    │ A-____                     │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        VERIFICAR            │   │
│    └─────────────────────────────┘   │
│                                     │
│           [Reportar problema]       │
└─────────────────────────────────────┘
```

#### 17. INCIDENT REPORT
```
┌─────────────────────────────────────┐
│              ← Reportar Incidente   │
│                                     │
│      ⚠️ Crear Nuevo Reporte         │
│                                     │
│    Tipo de incidente:               │
│    ┌─────────────────────────────┐   │
│    │ Vehículo sin pago          ▼│   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Espacio afectado           │   │
│    │ A-____                     │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Placa del vehículo         │   │
│    │ HNP-____                   │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Descripción del problema   │   │
│    │                            │   │
│    │ ________________________   │   │
│    │ ________________________   │   │
│    │                            │   │
│    └─────────────────────────────┘   │
│                                     │
│    📷 [Adjuntar fotos]              │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      ENVIAR REPORTE         │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 18. SHIFT SCHEDULE
```
┌─────────────────────────────────────┐
│              ← Lista de Turnos      │
│                                     │
│          📅 Semana Actual           │
│                                     │
│  LUN 15 Ene ┌─────────────────────┐  │
│  06:00-14:00│ Carlos Mendoza      │  │
│  14:00-22:00│ María López         │  │
│             └─────────────────────┘  │
│                                     │
│  MAR 16 Ene ┌─────────────────────┐  │
│  06:00-14:00│ 👤 Mi turno         │  │
│  14:00-22:00│ Pedro González      │  │
│             └─────────────────────┘  │
│                                     │
│  MIÉ 17 Ene ┌─────────────────────┐  │
│  06:00-14:00│ Ana Rodríguez       │  │
│  14:00-22:00│ 👤 Mi turno         │  │
│             └─────────────────────┘  │
│                                     │
│  🕐 Próximo turno:                  │
│     Mañana 06:00 - 14:00            │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │ 📋 Marcar│  │ 🔄 Cambio│         │
│  │ Asistencia│  │  Turno   │         │
│  └──────────┘  └──────────┘         │
│                                     │
│         📧 Solicitar cambio         │
└─────────────────────────────────────┘
```

#### 19. PARKING MAP
```
┌─────────────────────────────────────┐
│              ← Mapa del Parking     │
│                                     │
│    🗺️ Vista General del Parking    │
│                                     │
│    ┌─────────────────────────────┐   │
│    │        ENTRADA              │   │
│    │           ↓                 │   │
│    │  ┌────────────────────────┐  │   │
│    │  │  ZONA A (20/25)        │  │   │
│    │  │ [🚗][🚗][⬜][🚗][🚗] │  │   │
│    │  │ [🚗][⬜][🚗][⚠️][🚗] │  │   │
│    │  │ [🚗][🚗][⬜][🚗][🚗] │  │   │
│    │  │ [🚗][⬜][🚗][🚗][🚗] │  │   │
│    │  │ [🚗][🚗][🚗][⬜][🚗] │  │   │
│    │  └────────────────────────┘  │   │
│    │                             │   │
│    │  ┌────────────────────────┐  │   │
│    │  │  ZONA B (15/20)        │  │   │
│    │  │ [🚗][🚗][⬜][🚗][⬜] │  │   │
│    │  │ [🚗][⬜][🚗][🚗][🚗] │  │   │
│    │  │ [⬜][🚗][🚗][⬜][🚗] │  │   │
│    │  │ [🚗][🚗][⬜][🚗][🚗] │  │   │
│    │  └────────────────────────┘  │   │
│    │           ↑                 │   │
│    │        SALIDA               │   │
│    └─────────────────────────────┘   │
│                                     │
│    🚗 Ocupado  ⬜ Libre  ⚠️ Problema │
│                                     │
│           [Refrescar vista]         │
└─────────────────────────────────────┘
```

### ADMIN SCREENS (6)

#### 20. ADMIN DASHBOARD
```
┌─────────────────────────────────────┐
│  ⚡ ADMIN                 🔧  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Estadísticas del Día     │   │
│    │                             │   │
│    │ Ingresos: L 5,250           │   │
│    │ Sesiones: 125               │   │
│    │ Ocupación: 75%              │   │
│    │ Usuarios activos: 89        │   │
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
│  │ Guardias │  │y Analytics│         │
│  └──────────┘  └──────────┘         │
│                                     │
│  🚨 Alertas del Sistema:            │
│  • 3 incidentes sin resolver       │
│  • Sistema de pago: OK             │
│  • Cámaras: 2 sin conexión         │
│                                     │
│    [Ver panel completo]            │
└─────────────────────────────────────┘
```

#### 21. USER MANAGEMENT
```
┌─────────────────────────────────────┐
│              ← Gestionar Usuarios   │
│                                     │
│     🔍 [Buscar usuario...]          │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👤 Juan Pérez                  │ │
│  │    +504 9999-1234              │ │
│  │    💰 150 min | ✅ Activo      │ │
│  │    Últ. sesión: Hace 2 horas   │ │
│  │              [Editar] [Bloquear]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👤 María González               │ │
│  │    +504 9999-5678              │ │
│  │    💰 45 min | ⚠️ Deuda        │ │
│  │    Últ. sesión: Hace 1 día     │ │
│  │              [Editar] [Cobrar] │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👤 Carlos López                │ │
│  │    +504 9999-9999              │ │
│  │    💰 200 min | 🚫 Bloqueado   │ │
│  │    Razón: Abuso del sistema    │ │
│  │            [Editar] [Desbloquear]│ │
│  └─────────────────────────────────┘ │
│                                     │
│         [+ Agregar usuario]         │
│                                     │
│    📊 Total: 342 usuarios activos  │
└─────────────────────────────────────┘
```

#### 22. PRICING MANAGEMENT
```
┌─────────────────────────────────────┐
│              ← Tarifas y Precios    │
│                                     │
│          💰 Configuración Actual    │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ⏰ Tarifa por Minuto            │ │
│  │                                 │ │
│  │ Lunes a Viernes: L 1.50         │ │
│  │ Fines de semana: L 2.00         │ │
│  │ Horario nocturno: L 1.00        │ │
│  │                                 │ │
│  │                        [Editar] │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📦 Paquetes de Minutos          │ │
│  │                                 │ │
│  │ 30 min - L 50                   │ │
│  │ 60 min - L 95                   │ │
│  │ 120 min - L 180                 │ │
│  │ Mensual - L 500                 │ │
│  │                                 │ │
│  │                        [Editar] │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📊 Descuentos Especiales        │ │
│  │                                 │ │
│  │ Estudiantes: -20%               │ │
│  │ Adultos mayores: -30%           │ │
│  │ Empleados: -50%                 │ │
│  │                                 │ │
│  │                        [Editar] │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 23. GUARD MANAGEMENT
```
┌─────────────────────────────────────┐
│              ← Gestionar Guardias   │
│                                     │
│     👥 Personal de Seguridad        │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🛡️ Carlos Mendoza              │ │
│  │    Turno: 06:00 - 14:00        │ │
│  │    Estado: ✅ En servicio       │ │
│  │    Reportes hoy: 3              │ │
│  │              [Editar] [Contactar]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🛡️ María López                 │ │
│  │    Turno: 14:00 - 22:00        │ │
│  │    Estado: 🟡 Descanso          │ │
│  │    Reportes hoy: 1              │ │
│  │              [Editar] [Contactar]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🛡️ Pedro González              │ │
│  │    Turno: 22:00 - 06:00        │ │
│  │    Estado: 🔴 Ausente           │ │
│  │    Último reporte: Ayer         │ │
│  │              [Editar] [Reemplazar]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  📅 Programar Turnos                │
│  ┌──────────┐  ┌──────────┐         │
│  │ 📋 Ver   │  │ + Agregar│         │
│  │ Horarios │  │ Guardia  │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

#### 24. REPORTS & ANALYTICS
```
┌─────────────────────────────────────┐
│              ← Reportes y Analytics │
│                                     │
│    📊 Dashboard Ejecutivo           │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 💰 Ingresos                     │ │
│  │                                 │ │
│  │ Hoy: L 5,250                    │ │
│  │ Esta semana: L 31,800           │ │
│  │ Este mes: L 125,400             │ │
│  │                                 │ │
│  │ 📈 +15% vs mes anterior         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Ocupación                    │ │
│  │                                 │ │
│  │ Promedio diario: 75%            │ │
│  │ Horario pico: 14:00-16:00       │ │
│  │ Espacios más usados: Zona A     │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👥 Usuarios                     │ │
│  │                                 │ │
│  │ Usuarios activos: 342           │ │
│  │ Nuevos este mes: 23             │ │
│  │ Retención: 89%                  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │ 📄 Export│  │ 📅 Config│         │
│  │   PDF    │  │ Reportes │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

#### 25. SYSTEM SETTINGS
```
┌─────────────────────────────────────┐
│              ← Configuración Sistema│
│                                     │
│      ⚙️ Configuración General       │
│                                     │
│  🏢 Información del Parking         │
│  ├ Nombre: "Parking Central"       │
│  ├ Dirección: Ave. República #123   │
│  ├ Teléfono: +504 2222-3333        │
│  └ Email: admin@parkingcentral.hn   │
│                                     │
│  ⏰ Horarios de Operación           │
│  ├ Lunes a Viernes: 06:00 - 24:00  │
│  ├ Fines de semana: 08:00 - 22:00  │
│  └ Feriados: Cerrado               │
│                                     │
│  🔧 Configuración Técnica           │
│  ├ Tiempo máximo sesión: 8 horas   │
│  ├ Tiempo gracia salida: 10 min    │
│  ├ Recordatorio pago: 15 min       │
│  └ Backup automático: Activado     │
│                                     │
│  📧 Notificaciones                  │
│  ├ Email reportes: Activado        │
│  ├ SMS alertas: Activado           │
│  └ Push notifications: Activado    │
│                                     │
│  🔒 Seguridad                       │
│  ├ Cambiar contraseña admin        │
│  ├ Gestionar PINs de acceso        │
│  └ Log de actividad sistema        │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      GUARDAR CAMBIOS        │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## KEY FEATURES REMOVED:
- ❌ Biometric authentication (fingerprint/face ID)
- ❌ Support calling functionality
- ❌ Live chat support
- ❌ Emergency assistance buttons

## KEY FEATURES MAINTAINED:
- ✅ SMS + PIN authentication for admin/guard roles
- ✅ QR code scanning for parking spaces
- ✅ Real-time parking monitoring
- ✅ Payment processing
- ✅ Role-based navigation (User/Guard/Admin)
- ✅ Incident reporting system
- ✅ Analytics and reporting
- ✅ User management
- ✅ Pricing configuration