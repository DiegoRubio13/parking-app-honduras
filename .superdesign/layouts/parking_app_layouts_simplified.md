# PaRKING App - Simplified Layouts (19 Screens)
## Sistema Simple: Solo Registro Techado/No Techado

### AUTHENTICATION SCREENS (5) - Sin cambios

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

### CLIENT SCREENS (7) - Actualizadas

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

#### 8. ZONE SELECTION (NUEVA)
```
┌─────────────────────────────────────┐
│              ← Seleccionar Zona     │
│                                     │
│         ¿Dónde vas a estacionar?    │
│                                     │
│    ┌─────────────────────────────┐   │
│    │          🏠 TECHADO         │   │
│    │                             │   │
│    │     Zona cubierta           │   │
│    │     Tarifa: L 2.00/min      │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │         ☀️ NO TECHADO       │   │
│    │                             │   │
│    │     Zona al aire libre      │   │
│    │     Tarifa: L 1.50/min      │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│          Estadísticas de hoy:       │
│       🏠 Techado: 65% ocupado       │
│       ☀️ No techado: 45% ocupado    │
│                                     │
│         [Confirmar selección]       │
└─────────────────────────────────────┘
```

#### 9. HOME SCREEN (Parked - Active Session)
```
┌─────────────────────────────────────┐
│  🅿️ PaRKING              👤  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ ⏱️  SESIÓN ACTIVA           │   │
│    │                             │   │
│    │     00:32:15                │   │
│    │                             │   │
│    │ Zona: 🏠 Techado            │   │
│    │ Costo actual: L64.00        │   │
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
│  💰 86 min restantes                │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  📊      │  │   📞     │         │
│  │ Ver      │  │ Reportar │         │
│  │ Stats    │  │Problema  │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

#### 10. PURCHASE SCREEN
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

#### 11. PAYMENT METHOD SCREEN
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

#### 12. PROFILE SCREEN
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
│  │ 🏠 65%   │  │ ☀️ 35%   │         │
│  │ Techado  │  │No techado│         │
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

#### 13. HISTORY SCREEN
```
┌─────────────────────────────────────┐
│              ← Historial            │
│                                     │
│     📅 [Hoy] [Semana] [🏠] [☀️]    │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🏠 Hoy 14:30 - 15:15           │ │
│  │    Zona: Techado                │ │
│  │    Tiempo: 45 min               │ │
│  │    Costo: L 90.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ☀️ Ayer 09:00 - 09:30          │ │
│  │    Zona: No techado             │ │
│  │    Tiempo: 30 min               │ │
│  │    Costo: L 45.00               │ │
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
│       Sesiones: 45 (🏠30 / ☀️15)   │
│       Tiempo promedio: 32 min      │
└─────────────────────────────────────┘
```

### GUARD SCREENS (3) - Simplificadas

#### 14. GUARD DASHBOARD
```
┌─────────────────────────────────────┐
│  🛡️ GUARDIA              🔓  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Resumen del Día          │   │
│    │                             │   │
│    │ 🏠 Techado: 45 vehículos    │   │
│    │ ☀️ No techado: 32 vehículos  │   │
│    │ Ingresos generados: L2,150  │   │
│    │ Total sesiones: 77          │   │
│    │                             │   │
│    └─────────────────────────────┘   │
│                                     │
│  ⚡ Acciones Rápidas                │
│  ┌──────────┐  ┌──────────┐         │
│  │  🚗      │  │   ⚠️     │         │
│  │ Registrar│  │ Reportar │         │
│  │ Entrada  │  │Incidente │         │
│  └──────────┘  └──────────┘         │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  📋      │  │   📊     │         │
│  │ Lista de │  │Ver Stats │         │
│  │ Turnos   │  │del Día   │         │
│  └──────────┘  └──────────┘         │
│                                     │
│  🚨 Alertas Recientes:              │
│  • Usuario sin saldo suficiente     │
│  • Sistema funcionando normal       │
│                                     │
│    [Ver todas las alertas]         │
└─────────────────────────────────────┘
```

#### 15. ENTRY REGISTRATION (NUEVA)
```
┌─────────────────────────────────────┐
│              ← Registrar Entrada    │
│                                     │
│       👋 Nuevo vehículo entrando    │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Usuario (opcional)          │   │
│    │ +504 ________________       │   │
│    └─────────────────────────────┘   │
│                                     │
│         ¿Dónde va a estacionar?     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │    🏠 ZONA TECHADA         ●│   │
│    │    Tarifa: L 2.00/min       │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │    ☀️ ZONA NO TECHADA      ○│   │
│    │    Tarifa: L 1.50/min       │   │
│    └─────────────────────────────┘   │
│                                     │
│    Notas adicionales:               │
│    ┌─────────────────────────────┐   │
│    │ _________________________   │   │
│    │ _________________________   │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      REGISTRAR ENTRADA      │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 16. INCIDENT REPORT
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
│    │ Zona afectada              │   │
│    │ [🏠] Techada [☀️] No techada │   │
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

#### 17. SHIFT SCHEDULE
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

### ADMIN SCREENS (4) - Actualizadas

#### 18. ADMIN DASHBOARD
```
┌─────────────────────────────────────┐
│  ⚡ ADMIN                 🔧  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Estadísticas del Día     │   │
│    │                             │   │
│    │ Ingresos: L 5,250           │   │
│    │ 🏠 Techado: 89 sesiones     │   │
│    │ ☀️ No techado: 67 sesiones   │   │
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
│  📈 Estadísticas Zonas:             │
│  • 🏠 Techado: 65% preferencia      │
│  • ☀️ No techado: 35% preferencia   │
│                                     │
│    [Ver panel completo]            │
└─────────────────────────────────────┘
```

#### 19. USER MANAGEMENT
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
│  │    🏠 65% techado / ☀️ 35%      │ │
│  │              [Editar] [Bloquear]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👤 María González               │ │
│  │    +504 9999-5678              │ │
│  │    💰 45 min | ⚠️ Deuda        │ │
│  │    Prefiere: 🏠 Techado         │ │
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

#### 20. PRICING MANAGEMENT
```
┌─────────────────────────────────────┐
│              ← Tarifas y Precios    │
│                                     │
│          💰 Configuración Actual    │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ⏰ Tarifas por Zona             │ │
│  │                                 │ │
│  │ 🏠 Zona Techada:                │ │
│  │   L 2.00/min (L-V)              │ │
│  │   L 2.50/min (S-D)              │ │
│  │                                 │ │
│  │ ☀️ Zona No Techada:             │ │
│  │   L 1.50/min (L-V)              │ │
│  │   L 2.00/min (S-D)              │ │
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

#### 21. REPORTS & ANALYTICS
```
┌─────────────────────────────────────┐
│              ← Reportes y Analytics │
│                                     │
│    📊 Dashboard Ejecutivo           │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 💰 Ingresos por Zona            │ │
│  │                                 │ │
│  │ 🏠 Techado: L 3,200             │ │
│  │ ☀️ No techado: L 2,050          │ │
│  │ Total: L 5,250                  │ │
│  │                                 │ │
│  │ 📈 +15% vs mes anterior         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Preferencias de Zona         │ │
│  │                                 │ │
│  │ 🏠 Techado: 65% (89 sesiones)   │ │
│  │ ☀️ No techado: 35% (67 sesiones)│ │
│  │ Horario pico: 14:00-16:00       │ │
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

## PANTALLAS ELIMINADAS:
- ❌ QR Scanner Screen (no hay espacios específicos)
- ❌ Live Monitoring Screen (no hay sensores)
- ❌ Vehicle Verification Screen (no hay asignación de espacios)
- ❌ Parking Map Screen (no hay mapa de espacios)
- ❌ Guard Management Screen (simplificado)
- ❌ System Settings Screen (simplificado)

## FUNCIONES CLAVE DEL SISTEMA SIMPLIFICADO:
- ✅ Solo registro de zona: Techado vs No Techado
- ✅ Diferentes tarifas por zona
- ✅ Estadísticas de preferencia de zona
- ✅ Guardia registra entradas manualmente
- ✅ Sistema de tiempo y cobro automático
- ✅ Reportes por zona para administración