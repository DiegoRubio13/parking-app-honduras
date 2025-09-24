import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Accessibility utilities for improving app usability for all users
 */

// Accessibility labels in Spanish and English
export const accessibilityLabels = {
  es: {
    // Navigation
    back: 'Volver',
    close: 'Cerrar',
    menu: 'Menú',
    home: 'Inicio',
    profile: 'Perfil',
    settings: 'Configuración',

    // Actions
    submit: 'Enviar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    save: 'Guardar',
    search: 'Buscar',

    // Parking
    startParking: 'Iniciar estacionamiento',
    endParking: 'Finalizar estacionamiento',
    parkingSpot: 'Espacio de estacionamiento',
    qrCode: 'Código QR',

    // Payment
    addBalance: 'Agregar saldo',
    selectPackage: 'Seleccionar paquete',
    processPayment: 'Procesar pago',

    // Status
    loading: 'Cargando',
    error: 'Error',
    success: 'Éxito',
  },
  en: {
    // Navigation
    back: 'Back',
    close: 'Close',
    menu: 'Menu',
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',

    // Actions
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    search: 'Search',

    // Parking
    startParking: 'Start parking',
    endParking: 'End parking',
    parkingSpot: 'Parking spot',
    qrCode: 'QR Code',

    // Payment
    addBalance: 'Add balance',
    selectPackage: 'Select package',
    processPayment: 'Process payment',

    // Status
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
  },
};

/**
 * Get accessibility label based on current language
 */
export const getAccessibilityLabel = (
  key: keyof typeof accessibilityLabels.es,
  language: 'es' | 'en' = 'es'
): string => {
  return accessibilityLabels[language][key] || key;
};

/**
 * Create accessibility props for touchable elements
 */
export const createAccessibleTouchableProps = (
  label: string,
  hint?: string,
  role: 'button' | 'link' | 'menu' | 'menuitem' | 'tab' = 'button'
) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role,
});

/**
 * Create accessibility props for text inputs
 */
export const createAccessibleInputProps = (
  label: string,
  value?: string,
  isRequired: boolean = false,
  hint?: string
) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityValue: value ? { text: value } : undefined,
  accessibilityHint: hint,
  accessibilityRequired: Platform.OS === 'ios' && isRequired,
});

/**
 * Create accessibility props for images
 */
export const createAccessibleImageProps = (
  label: string,
  isDecorative: boolean = false
) => ({
  accessible: !isDecorative,
  accessibilityLabel: isDecorative ? undefined : label,
  accessibilityRole: 'image' as const,
});

/**
 * Announce message to screen readers
 */
export const announceForAccessibility = (message: string): void => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    AccessibilityInfo.announceForAccessibility(message);
  }
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('Error checking screen reader status:', error);
    return false;
  }
};

/**
 * Check if reduce motion is enabled
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    console.error('Error checking reduce motion status:', error);
    return false;
  }
};

/**
 * Create focus trap for modal dialogs
 */
export const createModalAccessibilityProps = (isVisible: boolean) => ({
  accessible: true,
  accessibilityViewIsModal: isVisible,
  accessibilityLiveRegion: isVisible ? ('polite' as const) : undefined,
});

/**
 * Format currency for screen readers
 */
export const formatCurrencyForAccessibility = (
  amount: number,
  currency: string = 'HNL',
  language: 'es' | 'en' = 'es'
): string => {
  const formattedAmount = amount.toFixed(2);
  if (language === 'es') {
    return `${formattedAmount} lempiras`;
  }
  return `${formattedAmount} ${currency}`;
};

/**
 * Format time duration for screen readers
 */
export const formatDurationForAccessibility = (
  minutes: number,
  language: 'es' | 'en' = 'es'
): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (language === 'es') {
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''} y ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    }
    return `${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}`;
  } else {
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
};

/**
 * Format date for screen readers
 */
export const formatDateForAccessibility = (
  date: Date | string,
  language: 'es' | 'en' = 'es'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (language === 'es') {
    return dateObj.toLocaleDateString('es-HN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Create accessible heading props
 */
export const createHeadingProps = (level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => ({
  accessible: true,
  accessibilityRole: 'header' as const,
  accessibilityLevel: level,
});

/**
 * Create accessible list props
 */
export const createListProps = (itemCount: number) => ({
  accessible: true,
  accessibilityRole: 'list' as const,
  accessibilityHint: `Lista con ${itemCount} elemento${itemCount !== 1 ? 's' : ''}`,
});

/**
 * Create accessible alert props
 */
export const createAlertProps = (
  type: 'info' | 'warning' | 'error' | 'success',
  message: string
) => ({
  accessible: true,
  accessibilityRole: 'alert' as const,
  accessibilityLabel: `${type}: ${message}`,
  accessibilityLiveRegion: 'assertive' as const,
});

/**
 * Minimum touch target size (44x44 points per Apple/Android guidelines)
 */
export const MINIMUM_TOUCH_TARGET_SIZE = 44;

/**
 * Create hit slop for small touchable elements
 */
export const createHitSlop = (size: number = MINIMUM_TOUCH_TARGET_SIZE) => {
  const hitSlop = (size - MINIMUM_TOUCH_TARGET_SIZE) / 2;
  return {
    top: hitSlop,
    bottom: hitSlop,
    left: hitSlop,
    right: hitSlop,
  };
};

/**
 * Color contrast helpers
 */
export const colorContrast = {
  // WCAG AA compliant color combinations for normal text (4.5:1 ratio)
  text: {
    onWhite: '#000000',
    onBlack: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
  },

  // WCAG AA compliant color combinations for large text (3:1 ratio)
  largeText: {
    onWhite: '#595959',
    onBlack: '#A6A6A6',
  },
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Set focus to first element with error
   */
  focusFirstError: (errorRefs: React.RefObject<any>[]) => {
    const firstErrorRef = errorRefs.find(ref => ref.current);
    if (firstErrorRef?.current) {
      firstErrorRef.current.focus();
    }
  },

  /**
   * Set focus to element by ref
   */
  setFocus: (ref: React.RefObject<any>) => {
    if (ref.current) {
      ref.current.focus();
    }
  },
};

export default {
  accessibilityLabels,
  getAccessibilityLabel,
  createAccessibleTouchableProps,
  createAccessibleInputProps,
  createAccessibleImageProps,
  announceForAccessibility,
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  createModalAccessibilityProps,
  formatCurrencyForAccessibility,
  formatDurationForAccessibility,
  formatDateForAccessibility,
  createHeadingProps,
  createListProps,
  createAlertProps,
  MINIMUM_TOUCH_TARGET_SIZE,
  createHitSlop,
  colorContrast,
  focusUtils,
};