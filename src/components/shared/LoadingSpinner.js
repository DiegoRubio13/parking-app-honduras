import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

/**
 * Professional Loading Spinner Component for PaRKING App
 * 
 * @example
 * // Basic spinner
 * <LoadingSpinner />
 * 
 * // Large spinner with custom color
 * <LoadingSpinner size="large" color={Colors.primary[600]} />
 * 
 * // Overlay spinner for full-screen loading
 * <LoadingSpinner 
 *   size="medium" 
 *   showOverlay={true}
 *   overlayColor="rgba(255,255,255,0.8)"
 * />
 */
const LoadingSpinner = ({
  size = 'medium',
  color = Colors.primary[600],
  showOverlay = false,
  overlayColor = 'rgba(0,0,0,0.3)',
  style = {},
  accessibilityLabel = 'Cargando',
  testID,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Get spinner size
  const getSpinnerSize = () => {
    const sizes = {
      small: 20,
      medium: 32,
      large: 48,
      xlarge: 64,
    };

    return typeof size === 'number' ? size : sizes[size] || sizes.medium;
  };

  const spinnerSize = getSpinnerSize();

  useEffect(() => {
    // Create spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Create subtle breathing animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Start animations
    spinAnimation.start();
    breathingAnimation.start();

    return () => {
      spinAnimation.stop();
      breathingAnimation.stop();
    };
  }, [spinValue, scaleValue]);

  // Convert animated value to rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderSpinner = () => (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderTopColor: color,
          borderRightColor: `${color}40`, // 25% opacity
          borderBottomColor: `${color}20`, // 12% opacity
          borderLeftColor: `${color}60`, // 37% opacity
          borderWidth: Math.max(2, spinnerSize / 16),
          transform: [
            { rotate: spin },
            { scale: scaleValue },
          ],
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    />
  );

  // If overlay is requested, wrap spinner in overlay
  if (showOverlay) {
    return (
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <View style={styles.overlayContent}>
          {renderSpinner()}
        </View>
      </View>
    );
  }

  return renderSpinner();
};

// Alternative dot-based spinner
export const DotSpinner = ({
  size = 'medium',
  color = Colors.primary[600],
  style = {},
  accessibilityLabel = 'Cargando',
  testID,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  const getDotSize = () => {
    const sizes = {
      small: 4,
      medium: 6,
      large: 8,
    };
    return sizes[size] || sizes.medium;
  };

  const dotSize = getDotSize();

  useEffect(() => {
    const createDotAnimation = (animValue, delay) => 
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ]),
      );

    const animations = [
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 150),
      createDotAnimation(dot3Anim, 300),
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const getDotStyle = (animValue) => ({
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: color,
    marginHorizontal: dotSize / 2,
    transform: [{
      scale: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.3],
      }),
    }],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  });

  return (
    <View
      style={[styles.dotContainer, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View style={getDotStyle(dot1Anim)} />
      <Animated.View style={getDotStyle(dot2Anim)} />
      <Animated.View style={getDotStyle(dot3Anim)} />
    </View>
  );
};

const styles = StyleSheet.create({
  spinner: {
    borderStyle: 'solid',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

LoadingSpinner.propTypes = {
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    PropTypes.number,
  ]),
  color: PropTypes.string,
  showOverlay: PropTypes.bool,
  overlayColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
};

DotSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
};

export default LoadingSpinner;