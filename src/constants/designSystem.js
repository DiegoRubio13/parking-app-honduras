/**
 * PaRKING App - Comprehensive Design System
 * 
 * Based on research from top parking and mobility apps:
 * - SpotHero's clean layout system
 * - EasyPark's premium spacing
 * - Uber's sophisticated elevations
 * - Material Design 3.0 principles
 * - 8-point grid system for perfect consistency
 */

const DesignSystem = {
  // ===== 8-POINT SPACING SYSTEM =====
  spacing: {
    // Base unit: 4px (0.5 rem)
    xs: 4,     // 0.5 units - Minimal padding
    sm: 8,     // 1 unit - Small padding
    md: 16,    // 2 units - Standard padding
    lg: 24,    // 3 units - Large padding
    xl: 32,    // 4 units - Extra large padding
    xxl: 40,   // 5 units - Section spacing
    xxxl: 48,  // 6 units - Screen spacing
    
    // Special spacing
    mini: 2,   // 0.25 units - Tight spacing
    huge: 64,  // 8 units - Major sections
    massive: 80, // 10 units - Screen margins
  },

  // ===== BORDER RADIUS =====
  borderRadius: {
    none: 0,
    sm: 4,     // Minimal rounding
    md: 8,     // Standard buttons/cards
    lg: 12,    // Large cards
    xl: 16,    // Featured cards
    xxl: 24,   // Hero elements
    full: 9999, // Circular elements
    
    // Specific use cases
    button: 8,
    card: 12,
    modal: 16,
    qr: 8,     // QR code container
  },

  // ===== SHADOWS & ELEVATION =====
  shadows: {
    // iOS-style shadows (cleaner, more professional)
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    
    xs: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 32,
      elevation: 12,
    },
    
    // Colored shadows for premium effects
    primaryShadow: {
      shadowColor: '#486581',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    
    successShadow: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    
    warningShadow: {
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    
    errorShadow: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // ===== LAYOUT CONSTANTS =====
  layout: {
    // Screen dimensions (based on common device sizes)
    screenPadding: 16,      // Standard screen edge padding
    sectionSpacing: 32,     // Space between major sections
    componentSpacing: 16,   // Space between components
    
    // Header dimensions
    headerHeight: 56,       // Standard header height
    tabBarHeight: 80,       // Tab bar height (with safe area)
    
    // Component dimensions
    buttonHeight: 48,       // Standard button height
    inputHeight: 48,        // Standard input height
    cardMinHeight: 80,      // Minimum card height
    
    // QR Code specific
    qrCodeSize: {
      small: 120,           // 1.5cm equivalent
      medium: 160,          // 2cm equivalent
      large: 200,           // 2.5cm equivalent
      xlarge: 240,          // 3cm equivalent
    },
    
    // Grid system
    gridColumns: 12,
    gridGutter: 16,
    
    // Breakpoints
    breakpoints: {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
    },
  },

  // ===== ANIMATION TIMINGS =====
  animations: {
    // Duration (milliseconds)
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    
    // Easing curves
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Custom curves for React Native
      spring: {
        damping: 15,
        stiffness: 150,
        velocity: 0,
      },
      
      gentleSpring: {
        damping: 20,
        stiffness: 100,
        velocity: 0,
      },
      
      bouncySpring: {
        damping: 10,
        stiffness: 200,
        velocity: 0,
      },
    },
    
    // Common animation configs
    fadeIn: {
      duration: 300,
      easing: 'ease-out',
    },
    
    slideIn: {
      duration: 350,
      easing: 'ease-out',
    },
    
    buttonPress: {
      duration: 150,
      scale: 0.95,
    },
    
    qrGeneration: {
      duration: 800,
      easing: 'spring',
    },
  },

  // ===== COMPONENT DEFAULTS =====
  components: {
    // Button styles
    button: {
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      minWidth: 120,
    },
    
    buttonSmall: {
      height: 36,
      borderRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minWidth: 80,
    },
    
    buttonLarge: {
      height: 56,
      borderRadius: 12,
      paddingHorizontal: 32,
      paddingVertical: 16,
      minWidth: 160,
    },
    
    // Card styles
    card: {
      borderRadius: 12,
      padding: 16,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    
    cardSmall: {
      borderRadius: 8,
      padding: 12,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    
    cardLarge: {
      borderRadius: 16,
      padding: 24,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    
    // Input styles
    input: {
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: '#FFFFFF',
    },
    
    inputFocused: {
      borderColor: '#486581',
      borderWidth: 2,
      shadowColor: '#486581',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    // QR Code container
    qrContainer: {
      borderRadius: 8,
      padding: 24,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // ===== ACCESSIBILITY =====
  accessibility: {
    // Minimum touch target size (WCAG guidelines)
    minTouchTarget: 44,
    
    // Recommended spacing for touch targets
    touchTargetSpacing: 8,
    
    // High contrast ratios
    contrastRatios: {
      aa: 4.5,        // WCAG AA standard
      aaa: 7,         // WCAG AAA standard
      large: 3,       // Large text AA standard
    },
    
    // Focus indicators
    focusIndicator: {
      borderWidth: 2,
      borderColor: '#486581',
      borderRadius: 4,
    },
  },

  // ===== GLASS MORPHISM EFFECTS =====
  glassMorphism: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    },
    
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
      borderColor: 'rgba(0, 0, 0, 0.2)',
      borderWidth: 1,
    },
    
    primary: {
      backgroundColor: 'rgba(72, 101, 129, 0.15)',
      borderColor: 'rgba(72, 101, 129, 0.2)',
      borderWidth: 1,
    },
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Generate consistent spacing based on 8-point grid
 * @param {number} units - Number of 8px units
 * @returns {number} Calculated spacing
 */
export const spacing = (units) => units * 8;

/**
 * Get shadow style based on elevation level
 * @param {string} level - Shadow level (xs, sm, md, lg, xl)
 * @returns {object} Shadow style object
 */
export const getShadow = (level = 'sm') => {
  return DesignSystem.shadows[level] || DesignSystem.shadows.sm;
};

/**
 * Create responsive dimensions based on screen size
 * @param {number} baseSize - Base size
 * @param {number} screenWidth - Current screen width
 * @returns {number} Responsive size
 */
export const getResponsiveSize = (baseSize, screenWidth) => {
  if (screenWidth < DesignSystem.layout.breakpoints.mobile) {
    return baseSize * 0.9;
  }
  if (screenWidth > DesignSystem.layout.breakpoints.tablet) {
    return baseSize * 1.1;
  }
  return baseSize;
};

/**
 * Generate component style with consistent design system values
 * @param {string} componentType - Type of component
 * @param {object} customStyles - Custom style overrides
 * @returns {object} Complete component style
 */
export const getComponentStyle = (componentType, customStyles = {}) => {
  const baseStyle = DesignSystem.components[componentType] || {};
  return {
    ...baseStyle,
    ...customStyles,
  };
};

/**
 * Create animation configuration
 * @param {string} type - Animation type
 * @param {object} customConfig - Custom animation config
 * @returns {object} Animation configuration
 */
export const getAnimation = (type, customConfig = {}) => {
  const baseAnimation = DesignSystem.animations[type] || DesignSystem.animations.normal;
  return {
    ...baseAnimation,
    ...customConfig,
  };
};

export default DesignSystem;