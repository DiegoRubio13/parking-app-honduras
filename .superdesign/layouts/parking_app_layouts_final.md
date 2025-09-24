# PaRKING App - Final Simplified Layouts (18 Screens)
## Sistema Ultra Simple: Una sola tarifa, sin zonas

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

### CLIENT SCREENS (6) - Simplificadas

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
│    │ Tarifa: L 1.50/min          │   │
│    │ Costo actual: L 48.00       │   │
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
│  💰 102 min restantes               │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │  📊      │  │   📞     │         │
│  │ Ver      │  │ Reportar │         │
│  │ Stats    │  │Problema  │         │
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
│    │        L 45.00              │   │
│    │                        [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │      60 MINUTOS             │   │
│    │        L 85.00              │   │
│    │   💥 Ahorra L5          [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │     120 MINUTOS             │   │
│    │       L 160.00              │   │
│    │   💥 Ahorra L20         [+] │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │     PAQUETE MENSUAL         │   │
│    │       L 450.00              │   │
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
│    60 minutos - L 85.00             │
│    IVA (15%) - L 12.75              │
│    ────────────────────             │
│    Total: L 97.75                   │
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
│  │ L 1,250  │  │ 89%      │         │
│  │ Gastado  │  │Cliente   │         │
│  │  Total   │  │ Activo   │         │
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
│  │    Tiempo: 45 min               │ │
│  │    Tarifa: L 1.50/min           │ │
│  │    Costo: L 67.50               │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Ayer 09:00 - 09:30          │ │
│  │    Tiempo: 30 min               │ │
│  │    Tarifa: L 1.50/min           │ │
│  │    Costo: L 45.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 💳 Recarga - 15 Ene             │ │
│  │    +60 minutos                  │ │
│  │    Monto: L 85.00               │ │
│  └─────────────────────────────────┘ │
│                                     │
│            [Exportar PDF]           │
│                                     │
│         📊 Estadísticas             │
│       Total gastado: L 1,120       │
│       Sesiones: 45                 │
│       Tiempo promedio: 32 min      │
│       Tarifa promedio: L 1.50/min  │
└─────────────────────────────────────┘
```

### GUARD SCREENS (3) - Simplificadas

#### 13. GUARD DASHBOARD
```
┌─────────────────────────────────────┐
│  🛡️ GUARDIA              🔓  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Resumen del Día          │   │
│    │                             │   │
│    │ Vehículos registrados: 77   │   │
│    │ Sesiones activas: 23        │   │
│    │ Ingresos generados: L1,925  │   │
│    │ Promedio por sesión: 28min  │   │
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
│  🚨 Alertas del sistema:            │
│  • Sistema funcionando normal       │
│  • 3 usuarios con saldo bajo        │
│                                     │
│    [Ver todas las alertas]         │
└─────────────────────────────────────┘
```

#### 14. ENTRY REGISTRATION
```
┌─────────────────────────────────────┐
│              ← Registrar Entrada    │
│                                     │
│       👋 Nuevo vehículo entrando    │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Placa del vehículo          │   │
│    │ HNP-____                    │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Usuario (opcional)          │   │
│    │ +504 ________________       │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Tarifa actual: L 1.50/min   │   │
│    │                             │   │
│    │ El cobro se iniciará        │   │
│    │ automáticamente             │   │
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

#### 15. INCIDENT REPORT
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
│    │ Placa del vehículo         │   │
│    │ HNP-____                   │   │
│    └─────────────────────────────┘   │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ Hora del incidente         │   │
│    │ [14:30]                    │   │
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

#### 16. SHIFT SCHEDULE
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

#### 17. ADMIN DASHBOARD
```
┌─────────────────────────────────────┐
│  ⚡ ADMIN                 🔧  ☰     │
│                                     │
│    ┌─────────────────────────────┐   │
│    │ 📊 Estadísticas del Día     │   │
│    │                             │   │
│    │ Ingresos: L 4,685           │   │
│    │ Total sesiones: 156         │   │
│    │ Promedio por sesión: 28min  │   │
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
│  📈 Resumen de operaciones:         │
│  • Tarifa actual: L 1.50/min       │
│  • Ocupación promedio: 72%         │
│  • 3 incidentes reportados         │
│                                     │
│    [Ver panel completo]            │
└─────────────────────────────────────┘
```

#### 18. USER MANAGEMENT
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
│  │    Últimas sesiones: 5 esta sem │ │
│  │              [Editar] [Bloquear]│ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👤 María González               │ │
│  │    +504 9999-5678              │ │
│  │    💰 15 min | ⚠️ Saldo bajo   │ │
│  │    Tiempo promedio: 45 min     │ │
│  │              [Editar] [Recargar]│ │
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

#### 19. PRICING MANAGEMENT
```
┌─────────────────────────────────────┐
│              ← Tarifas y Precios    │
│                                     │
│          💰 Configuración Actual    │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ⏰ Tarifa General               │ │
│  │                                 │ │
│  │ Lunes a Viernes: L 1.50/min     │ │
│  │ Fines de semana: L 2.00/min     │ │
│  │ Horario nocturno: L 1.20/min    │ │
│  │ (después de las 20:00)          │ │
│  │                                 │ │
│  │                        [Editar] │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📦 Paquetes de Minutos          │ │
│  │                                 │ │
│  │ 30 min - L 45                   │ │
│  │ 60 min - L 85 (ahorra L5)       │ │
│  │ 120 min - L 160 (ahorra L20)    │ │
│  │ Mensual - L 450 (ilimitado)     │ │
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

#### 20. REPORTS & ANALYTICS
```
┌─────────────────────────────────────┐
│              ← Reportes y Analytics │
│                                     │
│    📊 Dashboard Ejecutivo           │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 💰 Ingresos                     │ │
│  │                                 │ │
│  │ Hoy: L 4,685                    │ │
│  │ Esta semana: L 28,950           │ │
│  │ Este mes: L 118,200             │ │
│  │                                 │ │
│  │ 📈 +12% vs mes anterior         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🚗 Estadísticas de Uso          │ │
│  │                                 │ │
│  │ Sesiones hoy: 156               │ │
│  │ Tiempo promedio: 28 min         │ │
│  │ Horario pico: 14:00-16:00       │ │
│  │ Ocupación máxima: 87%           │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 👥 Usuarios                     │ │
│  │                                 │ │
│  │ Usuarios activos: 342           │ │
│  │ Nuevos este mes: 23             │ │
│  │ Retención: 89%                  │ │
│  │ Saldo promedio: 67 min          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │ 📄 Export│  │ 📅 Config│         │
│  │   PDF    │  │ Reportes │         │
│  └──────────┘  └──────────┘         │
│                                     │
│         ⚡ L 1.50 tarifa actual     │
└─────────────────────────────────────┘
```

## CARACTERÍSTICAS ELIMINADAS:
- ❌ Todo lo relacionado con zonas techadas/no techadas
- ❌ Zone Selection Screen
- ❌ Diferenciación de tarifas por zona
- ❌ Estadísticas de zona
- ❌ Live Monitoring
- ❌ Vehicle Verification
- ❌ Parking Map

## SISTEMA FINAL ULTRA SIMPLE:
- ✅ Una sola tarifa: L 1.50/min (variable por admin)
- ✅ Registro manual de entradas por guardia
- ✅ Sistema automático de tiempo y cobro
- ✅ Gestión de saldos de usuarios
- ✅ Reportes básicos de ingresos y uso
- ✅ Roles: Usuario/Guardia/Admin con SMS+PIN
- ✅ Total: 18 pantallas esenciales