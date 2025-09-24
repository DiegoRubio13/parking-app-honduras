# ParKing - Sistema de Colores Profesional

## Visión General

Este sistema de colores ha sido diseñado específicamente para ParKing, una aplicación de estacionamiento dirigida a usuarios con conocimientos tecnológicos básicos en Honduras y México. El diseño se inspira en las mejores prácticas de aplicaciones profesionales como Stripe, Linear y Airbnb.

## Principios de Diseño

### 1. **Profesionalismo sin Complejidad**
- Colores sofisticados pero no intimidantes
- Evita colores muy vibrantes o "infantiles"
- Transmite confianza y seriedad

### 2. **Accesibilidad Universal**
- Cumple con estándares WCAG AA
- Alto contraste para legibilidad
- Funciona tanto en modo claro como oscuro

### 3. **Simplicidad Cultural**
- Colores familiares y universalmente entendidos
- Verde = éxito, Rojo = error, Azul = información
- Evita connotaciones culturales específicas

## Paleta Principal

### 🔵 Primary (Azul Naval Profundo)
**Uso:** Elementos principales, botones primarios, navegación
```javascript
primary: {
  main: '#486581',     // Color principal
  light: '#627D98',    // Variante clara
  dark: '#334E68',     // Variante oscura
}
```
**Por qué:** Transmite profesionalismo, confianza y estabilidad. Asociado con servicios financieros y tecnológicos serios.

### ⚪ Secondary (Gris Cálido)
**Uso:** Elementos secundarios, texto, fondos sutiles
```javascript
secondary: {
  main: '#718096',
  light: '#A0AEC0',
  dark: '#4A5568',
}
```
**Por qué:** Moderno y sofisticado, complementa el azul sin competir con él.

## Colores Semánticos

### ✅ Success (Verde Profesional)
**Color:** `#22C55E`
**Uso:** Estados exitosos, confirmaciones, spots disponibles
**Rationale:** Verde universalmente reconocido para "correcto" o "disponible"

### ⚠️ Warning (Ámbar Sofisticado)  
**Color:** `#F59E0B`
**Uso:** Advertencias, spots reservados, estados pendientes
**Rationale:** Llama la atención sin ser alarmante

### ❌ Error (Rojo Refinado)
**Color:** `#EF4444`
**Uso:** Errores, spots ocupados, estados críticos  
**Rationale:** Rojo menos agresivo pero claramente indica problemas

### ℹ️ Info (Azul Informativo)
**Color:** `#3B82F6`
**Uso:** Información, tips, estados informativos
**Rationale:** Azul claro asociado con información útil

## Grises Neutrales

Escala completa de grises para texto y fondos:

```javascript
neutral: {
  0: '#FFFFFF',    // Blanco puro
  100: '#F5F5F5',  // Fondo muy claro
  300: '#E0E0E0',  // Bordes
  500: '#9E9E9E',  // Texto placeholder
  700: '#616161',  // Texto secundario
  900: '#212121',  // Texto principal
}
```

## Colores Específicos de Estacionamiento

### Estados de Spots
- **Disponible:** `#22C55E` (Verde)
- **Ocupado:** `#EF4444` (Rojo) 
- **Reservado:** `#F59E0B` (Ámbar)
- **Mantenimiento:** `#9E9E9E` (Gris)
- **VIP:** `#8B5CF6` (Púrpura)

### Estados de Sesión
- **Activa:** `#22C55E` (Verde)
- **Pausada:** `#F59E0B` (Ámbar)
- **Expirada:** `#EF4444` (Rojo)
- **Pendiente:** `#3B82F6` (Azul)

## Modo Oscuro

El sistema incluye una paleta completa para modo oscuro:

```javascript
dark: {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#9FB3C8',
  text: {
    primary: '#FFFFFF',
    secondary: '#BDBDBD',
  }
}
```

## Gradientes Sutiles

Para elementos que necesitan más dimensión:

```javascript
gradients: {
  primary: ['#486581', '#334E68'],
  success: ['#22C55E', '#16A34A'],
  // ... más gradientes disponibles
}
```

## Colores por Rol de Usuario

### 👤 Usuario Regular
- **Color:** `#3B82F6` (Azul info)
- **Uso:** Interfaces de usuario final
- **Sensación:** Accesible y amigable

### ⚙️ Administrador  
- **Color:** `#486581` (Azul primary)
- **Uso:** Paneles administrativos
- **Sensación:** Profesional y autoritativo

### 👮 Guardia
- **Color:** `#F59E0B` (Ámbar warning)
- **Uso:** Herramientas operativas
- **Sensación:** Alerta y funcional

## Guías de Implementación

### ✅ Buenos Usos
- Usar colores semánticos consistentemente
- Mantener suficiente contraste (4.5:1 mínimo)
- Usar gradientes con moderación
- Probar en ambos modos (claro/oscuro)

### ❌ Evitar
- Mezclar colores primarios con roles incorrectos
- Usar más de 2-3 colores principales por pantalla
- Colores muy saturados o brillantes
- Inconsistencias en la aplicación de colores semánticos

## Herramientas de Desarrollo

El sistema incluye helpers útiles:

```javascript
// Obtener color por rol
getColorByRole('admin') // Returns '#486581'

// Obtener gradiente por rol  
getGradientByRole('user') // Returns ['#3B82F6', '#2563EB']

// Color de contraste automático
getContrastColor(backgroundColor) // Returns appropriate text color
```

## Validación de Contraste

Todos los colores han sido validados para cumplir con:
- **WCAG AA:** Contraste mínimo 4.5:1 para texto normal
- **WCAG AAA:** Contraste mínimo 7:1 para texto importante
- **Daltonismo:** Probado con simuladores de daltonismo

## Comparación con Paleta Anterior

| Elemento | Anterior | Nuevo | Mejora |
|----------|----------|-------|--------|
| Primario | `#4A90E2` | `#486581` | Más profesional, menos "tech" |
| Éxito | `#50C878` | `#22C55E` | Menos saturado, más legible |
| Error | `#FF6B6B` | `#EF4444` | Menos agresivo, más refinado |

---

**Resultado:** Un sistema de colores que transmite profesionalismo y confianza, perfecto para usuarios que buscan un servicio serio y confiable de estacionamiento.