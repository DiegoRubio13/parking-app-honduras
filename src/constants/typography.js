/**
 * PaRKING App - Professional Typography System
 * 
 * Based on research from SpotHero, EasyPark, Uber, and modern design systems
 * - Inter font family for exceptional legibility
 * - 8-point grid system for consistent spacing
 * - Accessible font sizes (minimum 16px for body text)
 * - Optimized line heights and letter spacing
 * - WCAG 2.1 AA compliant contrast and sizing
 */

const Typography = {
  // ===== FONT FAMILIES =====
  fonts: {
    // Primary font - Inter (excellent for mobile interfaces)
    primary: {
      ios: 'Inter',
      android: 'Inter', 
      web: 'Inter, system-ui, -apple-system, sans-serif',
    },
    
    // Secondary font - System fonts for native feel
    secondary: {
      ios: 'SF Pro Display',
      android: 'Roboto',
      web: 'Inter',
    },
    
    // Monospace font - For QR codes, technical info
    mono: {
      ios: 'SF Mono',
      android: 'Roboto Mono',
      web: 'JetBrains Mono, Consolas, monospace',
    },
  },

  // ===== FONT SIZES (8-point grid system) =====
  sizes: {
    // Display sizes for hero elements
    display: {
      large: 40,    // 5 units - App branding
      medium: 32,   // 4 units - Screen titles
      small: 28,    // 3.5 units - Section headers
    },
    
    // Heading sizes
    heading: {
      h1: 24,       // 3 units - Main titles
      h2: 20,       // 2.5 units - Subtitles
      h3: 18,       // 2.25 units - Section headers
      h4: 16,       // 2 units - Subsection headers
    },
    
    // Body text (minimum 16px for accessibility)
    body: {
      large: 18,    // 2.25 units - Large body text
      regular: 16,  // 2 units - Default body text
      small: 14,    // 1.75 units - Secondary text
    },
    
    // Caption and small text
    caption: {
      large: 12,    // 1.5 units - Small labels
      regular: 10,  // 1.25 units - Tiny labels (use sparingly)
    },
  },

  // ===== FONT WEIGHTS =====
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // ===== LINE HEIGHTS =====
  lineHeights: {
    // Tight - For headings and display text
    tight: 1.1,
    
    // Normal - For body text
    normal: 1.5,
    
    // Relaxed - For longer reading
    relaxed: 1.6,
    
    // Loose - For accessibility
    loose: 1.8,
  },

  // ===== LETTER SPACING =====
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.1,
    wider: 0.25,
    widest: 0.5,
  },

  // ===== PREDEFINED TEXT STYLES =====
  styles: {
    // Display styles
    displayLarge: {
      fontSize: 40,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    
    displayMedium: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      letterSpacing: -0.3,
    },
    
    displaySmall: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
      letterSpacing: -0.2,
    },

    // Heading styles
    h1: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
      letterSpacing: -0.3,
    },
    
    h2: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    
    h3: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: -0.1,
    },
    
    h4: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: 0,
    },

    // Body styles
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 28,
      letterSpacing: 0,
    },
    
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.1,
    },

    // Caption styles
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    
    captionSmall: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 14,
      letterSpacing: 0.2,
    },

    // Special styles
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    
    input: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: 0,
    },

    // QR Code and technical text
    mono: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    },
    
    monoSmall: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0,
    },
  },

  // ===== RESPONSIVE BREAKPOINTS =====
  breakpoints: {
    small: 375,     // iPhone SE
    medium: 414,    // iPhone Pro
    large: 768,     // iPad
    xlarge: 1024,   // iPad Pro
  },

  // ===== ACCESSIBILITY HELPERS =====
  accessibility: {
    // Minimum touch target size
    minTouchTarget: 44,
    
    // Minimum font sizes for readability
    minFontSize: 12,
    minBodyFontSize: 16,
    
    // Recommended line heights for accessibility
    minLineHeight: 1.3,
    recommendedLineHeight: 1.5,
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get font family based on platform
 * @param {string} type - 'primary', 'secondary', or 'mono'
 * @returns {string} Font family
 */
export const getFontFamily = (type = 'primary') => {
  const fonts = Typography.fonts[type];
  
  // Platform detection (simplified for React Native)
  if (typeof navigator !== 'undefined') {
    const platform = navigator.platform;
    if (platform.includes('iPhone') || platform.includes('iPad')) {
      return fonts.ios;
    }
    if (platform.includes('Android')) {
      return fonts.android;
    }
  }
  
  return fonts.primary || fonts.ios;
};

/**
 * Create responsive font size
 * @param {number} baseSize - Base font size
 * @param {number} screenWidth - Current screen width
 * @returns {number} Adjusted font size
 */
export const getResponsiveFontSize = (baseSize, screenWidth) => {
  if (screenWidth < Typography.breakpoints.small) {
    return Math.max(baseSize * 0.9, Typography.accessibility.minFontSize);
  }
  if (screenWidth > Typography.breakpoints.large) {
    return baseSize * 1.1;
  }
  return baseSize;
};

/**
 * Get text style with color
 * @param {string} styleName - Style name from Typography.styles
 * @param {string} color - Text color
 * @returns {object} Complete text style
 */
export const getTextStyle = (styleName, color = '#212121') => {
  const baseStyle = Typography.styles[styleName] || Typography.styles.body;
  return {
    ...baseStyle,
    color,
    fontFamily: getFontFamily('primary'),
  };
};

/**
 * Generate text styles for different themes
 * @param {object} colorTheme - Color theme object
 * @returns {object} Complete text styles
 */
export const generateTextStyles = (colorTheme) => {
  const styles = {};

  // Defensive check to prevent "Cannot convert undefined value to object" error
  if (!Typography.styles || typeof Typography.styles !== 'object') {
    console.warn('Typography.styles is not available, returning empty styles');
    return {};
  }

  Object.keys(Typography.styles).forEach(styleName => {
    styles[styleName] = {
      ...Typography.styles[styleName],
      fontFamily: getFontFamily('primary'),
      color: colorTheme.text?.primary || '#212121',
    };
    
    // Create variants with different colors
    styles[`${styleName}Secondary`] = {
      ...styles[styleName],
      color: colorTheme.text?.secondary || '#616161',
    };
    
    styles[`${styleName}Disabled`] = {
      ...styles[styleName],
      color: colorTheme.text?.disabled || '#BDBDBD',
    };
  });
  
  return styles;
};

export default Typography;