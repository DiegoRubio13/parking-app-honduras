import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Professional QR Code Display Component for PaRKING App
 * 
 * @example
 * // Basic QR code
 * <QRDisplay value="parking-session-12345" />
 * 
 * // Large QR with custom styling
 * <QRDisplay 
 *   value="user-id-67890" 
 *   size={200}
 *   showAnimation={true}
 *   containerStyle={{ marginVertical: 20 }}
 * />
 * 
 * // QR with logo
 * <QRDisplay 
 *   value="https://parking.app/session/abc123"
 *   size={150}
 *   logoSource={/* Use static image source or Ionicons */}
 * />
 */
const QRDisplay = ({
  value,
  size = 'medium',
  showAnimation = true,
  backgroundColor = Colors.neutral[0],
  foregroundColor = Colors.neutral[900],
  logoSource = null,
  logoSize = 40,
  logoBackgroundColor = Colors.neutral[0],
  containerStyle = {},
  accessibilityLabel = 'Código QR',
  testID,
}) => {
  // Debug log to track the value being passed
  if (__DEV__) {
    console.log('QRDisplay received value:', value, 'type:', typeof value);
  }
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Get QR code size based on size prop
  const getQRSize = () => {
    if (typeof size === 'number') {
      return size;
    }

    const sizes = {
      small: Math.min(screenWidth * 0.4, 120),
      medium: Math.min(screenWidth * 0.6, 180),
      large: Math.min(screenWidth * 0.8, 240),
      xlarge: Math.min(screenWidth * 0.9, 280),
    };

    return sizes[size] || sizes.medium;
  };

  const qrSize = getQRSize();

  useEffect(() => {
    if (showAnimation) {
      // Animate QR code appearance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [showAnimation, scaleAnim, opacityAnim]);

  const animatedStyle = showAnimation
    ? {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }
    : {};

  const containerStyles = [
    styles.container,
    {
      width: qrSize + 32,
      height: qrSize + 32,
    },
    containerStyle,
  ];

  // Validate that value is not empty and has meaningful content
  const validateValue = (val) => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim();
    return trimmed.length > 0 && trimmed !== 'null' && trimmed !== 'undefined';
  };

  const qrValue = validateValue(value) ? value.trim() : 'LOADING...';
  
  // Final safety check - ensure qrValue is never empty or invalid
  const finalQrValue = (qrValue && qrValue.length > 0) ? qrValue : 'DEFAULT_QR_VALUE';

  return (
    <Animated.View
      style={[containerStyles, animatedStyle]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={styles.qrWrapper}>
        <QRCode
          value={finalQrValue}
          size={qrSize}
          backgroundColor={backgroundColor}
          color={foregroundColor}
          logo={logoSource}
          logoSize={logoSize}
          logoBackgroundColor={logoBackgroundColor}
          logoBorderRadius={4}
          quietZone={8}
          ecl="M" // Error correction level - Medium (15% damage recovery)
        />
      </View>
      
      {/* Subtle corner decorations */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    position: 'relative',
  },
  qrWrapper: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 8,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: Colors.primary[300],
    borderWidth: 2,
  },
  topLeft: {
    top: 8,
    left: 8,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 8,
    right: 8,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 4,
  },
});

QRDisplay.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    PropTypes.number,
  ]),
  showAnimation: PropTypes.bool,
  backgroundColor: PropTypes.string,
  foregroundColor: PropTypes.string,
  logoSource: PropTypes.oneOfType([
    PropTypes.object, // require() result
    PropTypes.number, // static resource
  ]),
  logoSize: PropTypes.number,
  logoBackgroundColor: PropTypes.string,
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
};

export default QRDisplay;