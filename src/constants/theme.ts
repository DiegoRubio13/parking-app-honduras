export const theme = {
  colors: {
    primary: '#1d4ed8',
    secondary: '#3b82f6', 
    background: '#f8fafc',
    card: '#ffffff',
    surface: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      card: '#ffffff',
      elevated: '#f8fafc'
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      500: '#f97316',
      600: '#ea580c',
    },
    indigo: {
      50: '#eef2ff',
      600: '#4f46e5',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8'
    },
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    border: '#cbd5e1'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 25
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  shadows: {
    sm: {
      shadowColor: '#2563eb',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#2563eb',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#2563eb',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: '#2563eb',
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.18,
      shadowRadius: 25,
      elevation: 8,
    }
  },
  layout: {
    headerPaddingTop: 60, // Safe area top + padding
    headerHeight: 120,
    tabBarHeight: 60,
    cardElevation: 4,
  },
  borders: {
    thin: 1,
    medium: 2,
    thick: 3,
  }
};

export type Theme = typeof theme;