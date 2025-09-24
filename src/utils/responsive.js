import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints based on device types
export const BREAKPOINTS = {
  small: 320,   // iPhone SE and similar
  medium: 375,  // iPhone 12 Mini, iPhone 13 Mini
  large: 414,   // iPhone 12, iPhone 13
  xlarge: 428,  // iPhone 12 Pro Max, iPhone 13 Pro Max
  tablet: 768,  // iPad and larger
};

// Device type detection
export const getDeviceType = () => {
  if (width <= BREAKPOINTS.medium) return 'small';
  if (width <= BREAKPOINTS.large) return 'medium';
  if (width <= BREAKPOINTS.xlarge) return 'large';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'medium'; // default
};

// Responsive scaling functions
export const scale = (size) => {
  const baseWidth = 375; // iPhone 12 Mini width as base
  return (width / baseWidth) * size;
};

export const verticalScale = (size) => {
  const baseHeight = 667; // iPhone SE height as base
  return (height / baseHeight) * size;
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Typography scaling
export const getFontSize = (size) => {
  const deviceType = getDeviceType();
  const scaleFactor = {
    small: 0.9,
    medium: 1,
    large: 1.1,
    tablet: 1.2,
  };
  
  return Math.round(size * (scaleFactor[deviceType] || 1));
};

// Spacing utilities
export const getSpacing = (spacing) => {
  const deviceType = getDeviceType();
  const spacingMultiplier = {
    small: 0.9,
    medium: 1,
    large: 1,
    tablet: 1.2,
  };
  
  return spacing * (spacingMultiplier[deviceType] || 1);
};

// Icon size scaling
export const getIconSize = (size) => {
  const deviceType = getDeviceType();
  const iconScale = {
    small: 0.9,
    medium: 1,
    large: 1,
    tablet: 1.1,
  };
  
  return Math.round(size * (iconScale[deviceType] || 1));
};

// Safe area utilities
export const getSafeAreaPadding = () => {
  const deviceType = getDeviceType();
  
  if (Platform.OS === 'ios') {
    // iOS notch handling
    const hasNotch = height >= 812 && width >= 375;
    
    return {
      top: hasNotch ? 44 : 20,
      bottom: hasNotch ? 34 : 0,
    };
  }
  
  // Android status bar
  return {
    top: 24,
    bottom: 0,
  };
};

// Responsive layout helpers
export const getLayoutConfig = () => {
  const deviceType = getDeviceType();
  
  return {
    // Container padding
    containerPadding: getSpacing(deviceType === 'tablet' ? 32 : 24),
    
    // Card margins
    cardMargin: getSpacing(deviceType === 'tablet' ? 20 : 16),
    
    // Button heights
    buttonHeight: {
      small: moderateScale(36),
      medium: moderateScale(44),
      large: moderateScale(52),
    },
    
    // Input heights
    inputHeight: moderateScale(44),
    
    // Header height
    headerHeight: moderateScale(56),
    
    // Tab bar height
    tabBarHeight: moderateScale(60),
  };
};

// Grid system
export const getGridColumns = () => {
  const deviceType = getDeviceType();
  
  if (deviceType === 'tablet') return 3;
  if (deviceType === 'large') return 2;
  return 1;
};

// Responsive image dimensions
export const getImageDimensions = (aspectRatio = 1) => {
  const deviceType = getDeviceType();
  const maxWidth = width - (getSpacing(48)); // Account for padding
  
  return {
    width: maxWidth,
    height: maxWidth / aspectRatio,
  };
};

// Screen utilities
export const isSmallDevice = () => getDeviceType() === 'small';
export const isMediumDevice = () => getDeviceType() === 'medium';
export const isLargeDevice = () => getDeviceType() === 'large';
export const isTablet = () => getDeviceType() === 'tablet';

// Orientation detection
export const isPortrait = () => height > width;
export const isLandscape = () => width > height;

export default {
  scale,
  verticalScale,
  moderateScale,
  getFontSize,
  getSpacing,
  getIconSize,
  getSafeAreaPadding,
  getLayoutConfig,
  getGridColumns,
  getImageDimensions,
  getDeviceType,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  isPortrait,
  isLandscape,
  BREAKPOINTS,
};