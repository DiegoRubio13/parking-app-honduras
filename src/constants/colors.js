/**
 * PaRKING App - Professional Color System
 * 
 * Inspired by modern design systems like Stripe, Linear, and Airbnb
 * - Accessible contrast ratios (WCAG AA compliant)
 * - Clean and professional appearance
 * - Suitable for users with basic tech knowledge
 * - Works well in both light and dark modes
 */

const Colors = {
  // ===== PRIMARY COLORS =====
  primary: {
    // Deep Navy Blue - Professional and trustworthy
    50: '#F0F4F8',   // Very light background
    100: '#D9E2EC',  // Light background
    200: '#BCCCDC',  // Border/disabled states
    300: '#9FB3C8',  // Placeholder text
    400: '#829AB1',  // Secondary text
    500: '#627D98',  // Main text
    600: '#486581',  // Primary brand color
    700: '#334E68',  // Dark primary
    800: '#243B53',  // Very dark
    900: '#102A43',  // Darkest
  },

  // ===== SECONDARY COLORS =====
  secondary: {
    // Warm Gray - Modern and sophisticated
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },

  // ===== SEMANTIC COLORS =====
  success: {
    // Professional Green - Not too bright
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Main success color
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  warning: {
    // Sophisticated Amber - Professional alert
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main warning color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    // Refined Red - Not aggressive
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  info: {
    // Cool Blue - Informative and calming
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main info color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // ===== NEUTRAL GRAYS =====
  neutral: {
    // Perfect for text and backgrounds
    0: '#FFFFFF',     // Pure white
    50: '#FAFAFA',    // Almost white
    100: '#F5F5F5',   // Very light gray
    200: '#EEEEEE',   // Light gray
    300: '#E0E0E0',   // Border gray
    400: '#BDBDBD',   // Disabled text
    500: '#9E9E9E',   // Placeholder text
    600: '#757575',   // Secondary text
    700: '#616161',   // Primary text (light mode)
    800: '#424242',   // Dark text
    900: '#212121',   // Very dark text
  },

  // ===== GRADIENTS =====
  gradients: {
    primary: ['#486581', '#334E68'],
    success: ['#22C55E', '#16A34A'],
    warning: ['#F59E0B', '#D97706'],
    error: ['#EF4444', '#DC2626'],
    info: ['#3B82F6', '#2563EB'],
    subtle: ['#F7FAFC', '#EDF2F7'],
    
    // Enhanced gradients for premium UI
    premiumPrimary: ['#486581', '#334E68', '#243B53'],
    premiumSecondary: ['#718096', '#4A5568', '#2D3748'],
    glass: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
    darkGlass: ['rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.05)'],
  },

  // ===== LIGHT MODE THEME =====
  light: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceVariant: '#F5F5F5',
    
    primary: '#486581',
    onPrimary: '#FFFFFF',
    
    secondary: '#718096',
    onSecondary: '#FFFFFF',
    
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#BDBDBD',
    },
    
    border: '#E0E0E0',
    divider: '#EEEEEE',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // ===== DARK MODE THEME =====
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    
    primary: '#9FB3C8',
    onPrimary: '#102A43',
    
    secondary: '#A0AEC0',
    onSecondary: '#171923',
    
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD',
      disabled: '#757575',
    },
    
    border: '#424242',
    divider: '#2C2C2C',
    
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },

  // ===== PARKING SPECIFIC COLORS =====
  parking: {
    available: '#22C55E',      // Green for available spots
    occupied: '#EF4444',       // Red for occupied spots  
    reserved: '#F59E0B',       // Amber for reserved spots
    maintenance: '#9E9E9E',    // Gray for maintenance
    vip: '#8B5CF6',           // Purple for VIP spots
    
    // Status indicators
    active: '#22C55E',         // Active sessions
    paused: '#F59E0B',         // Paused sessions
    expired: '#EF4444',        // Expired sessions
    pending: '#3B82F6',        // Pending payments
  },

  // ===== PREMIUM MOBILITY COLORS =====
  mobility: {
    // Inspired by Uber, SpotHero, EasyPark
    black: '#000000',          // Premium black (Uber style)
    white: '#FFFFFF',          // Pure white
    trust: '#3B82F6',          // Trust and reliability  
    eco: '#10B981',           // Eco-friendly green
    premium: '#1F2937',        // Premium dark gray
    gold: '#F59E0B',          // Premium gold accent
    
    // Glass morphism effects
    glassPrimary: 'rgba(72, 101, 129, 0.8)',
    glassSecondary: 'rgba(113, 128, 150, 0.6)',
    glassBackground: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },

  // ===== SHADOWS & ELEVATION =====
  shadows: {
    // Material Design 3.0 inspired shadows
    xs: 'rgba(0, 0, 0, 0.05)',
    sm: 'rgba(0, 0, 0, 0.1)',
    md: 'rgba(0, 0, 0, 0.15)',
    lg: 'rgba(0, 0, 0, 0.2)',
    xl: 'rgba(0, 0, 0, 0.25)',
    
    // Colored shadows for premium feel
    primaryShadow: 'rgba(72, 101, 129, 0.3)',
    successShadow: 'rgba(34, 197, 94, 0.3)',
    warningShadow: 'rgba(245, 158, 11, 0.3)',
    errorShadow: 'rgba(239, 68, 68, 0.3)',
  },
};

// ===== USAGE HELPERS =====
export const getColorByRole = (role) => {
  switch (role) {
    case 'user':
      return Colors.info[600];
    case 'admin':
      return Colors.primary[600];
    case 'guard':
      return Colors.warning[600];
    default:
      return Colors.primary[600];
  }
};

export const getGradientByRole = (role) => {
  switch (role) {
    case 'user':
      return Colors.gradients.info;
    case 'admin':
      return Colors.gradients.primary;
    case 'guard':
      return Colors.gradients.warning;
    default:
      return Colors.gradients.primary;
  }
};

// ===== ACCESSIBILITY HELPERS =====
export const getContrastColor = (backgroundColor, lightColor = Colors.neutral[0], darkColor = Colors.neutral[900]) => {
  // Simple contrast logic - in production you might want to use a proper contrast calculation
  const isDark = backgroundColor.includes('800') || backgroundColor.includes('900') || backgroundColor === Colors.neutral[900];
  return isDark ? lightColor : darkColor;
};

export default Colors;