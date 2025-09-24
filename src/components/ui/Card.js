/**
 * Premium Card Component
 * 
 * Based on SpotHero, EasyPark, and modern card designs
 * - Glass morphism effects for premium feel
 * - Consistent elevation and shadows
 * - Responsive and accessible design
 * - Multiple variants for different contexts
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Colors from '../../constants/colors';
import DesignSystem from '../../constants/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Card = ({
  // Content
  children,
  
  // Variants
  variant = 'default', // default, elevated, glass, outline, flat
  size = 'medium', // small, medium, large
  
  // Styling
  style,
  contentStyle,
  backgroundColor,
  
  // Interaction
  onPress,
  onLongPress,
  pressable = false,
  
  // Animation
  animated = true,
  hoverEffect = true,
  
  // Special effects
  gradient = false,
  gradientColors,
  glassMorphism = false,
  
  // Accessibility
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(1);

  // Handle press animations
  const handlePressIn = () => {
    if (animated && (pressable || onPress)) {
      scale.value = withSpring(0.98, DesignSystem.animations.easing.spring);
      elevation.value = withTiming(1.5, { duration: DesignSystem.animations.fast });
    }
  };

  const handlePressOut = () => {
    if (animated && (pressable || onPress)) {
      scale.value = withSpring(1, DesignSystem.animations.easing.gentleSpring);
      elevation.value = withTiming(1, { duration: DesignSystem.animations.fast });
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedShadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = variant === 'elevated' ? 0.15 * elevation.value : 0.1;
    const shadowRadius = variant === 'elevated' ? 8 * elevation.value : 8;
    
    return {
      shadowOpacity,
      shadowRadius,
    };
  });

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: backgroundColor || Colors.neutral[0],
          ...DesignSystem.shadows.lg,
          borderWidth: 0,
        };
      
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          ...DesignSystem.shadows.sm,
        };
      
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: Colors.neutral[200],
          borderWidth: 1,
          shadowColor: 'transparent',
          elevation: 0,
        };
      
      case 'flat':
        return {
          backgroundColor: backgroundColor || Colors.neutral[50],
          borderWidth: 0,
          shadowColor: 'transparent',
          elevation: 0,
        };
      
      default: // default
        return {
          backgroundColor: backgroundColor || Colors.neutral[0],
          ...DesignSystem.shadows.md,
          borderWidth: 0,
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          borderRadius: DesignSystem.components.cardSmall.borderRadius,
          padding: DesignSystem.components.cardSmall.padding,
          minHeight: DesignSystem.layout.cardMinHeight * 0.8,
        };
      
      case 'large':
        return {
          borderRadius: DesignSystem.components.cardLarge.borderRadius,
          padding: DesignSystem.components.cardLarge.padding,
          minHeight: DesignSystem.layout.cardMinHeight * 1.5,
        };
      
      default: // medium
        return {
          borderRadius: DesignSystem.components.card.borderRadius,
          padding: DesignSystem.components.card.padding,
          minHeight: DesignSystem.layout.cardMinHeight,
        };
    }
  };

  // Combine all styles
  const cardStyles = [
    {
      ...getSizeStyles(),
      ...getVariantStyles(),
    },
    animatedShadowStyle,
    style,
  ];

  const contentStyles = [
    {
      flex: 1,
    },
    contentStyle,
  ];

  // Glass morphism effect
  const renderGlassMorphism = () => {
    if (!glassMorphism && variant !== 'glass') return null;
    
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: getSizeStyles().borderRadius,
          backgroundColor: Colors.mobility.glassBackground,
          borderColor: Colors.mobility.glassBorder,
          borderWidth: 1,
        }}
      />
    );
  };

  // Gradient background
  const renderGradient = () => {
    if (!gradient) return null;
    
    const colors = gradientColors || Colors.gradients.subtle;
    
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: getSizeStyles().borderRadius,
        }}
      />
    );
  };

  // Render content
  const renderContent = () => (
    <>
      {renderGradient()}
      {renderGlassMorphism()}
      <View style={contentStyles}>
        {children}
      </View>
    </>
  );

  // If pressable, use TouchableOpacity
  if (pressable || onPress || onLongPress) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, cardStyles]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole || 'button'}
      >
        {renderContent()}
      </AnimatedTouchable>
    );
  }

  // Otherwise, use regular View
  return (
    <AnimatedView
      style={[animatedStyle, cardStyles]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      {renderContent()}
    </AnimatedView>
  );
};

// Predefined card variants for common use cases
export const QRCard = ({ children, ...props }) => (
  <Card
    variant="elevated"
    size="large"
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      ...DesignSystem.components.qrContainer,
    }}
    {...props}
  >
    {children}
  </Card>
);

export const StatusCard = ({ status, children, ...props }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'available':
        return Colors.success[50];
      case 'warning':
      case 'reserved':
        return Colors.warning[50];
      case 'error':
      case 'occupied':
        return Colors.error[50];
      case 'info':
      case 'pending':
        return Colors.info[50];
      default:
        return Colors.neutral[50];
    }
  };

  return (
    <Card
      backgroundColor={getStatusColor()}
      {...props}
    >
      {children}
    </Card>
  );
};

export const MetricCard = ({ metric, value, trend, children, ...props }) => (
  <Card
    variant="elevated"
    size="medium"
    pressable
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
    }}
    {...props}
  >
    {children}
  </Card>
);

export const ActionCard = ({ children, ...props }) => (
  <Card
    variant="elevated"
    pressable
    animated
    hoverEffect
    style={{
      ...DesignSystem.shadows.primaryShadow,
    }}
    {...props}
  >
    {children}
  </Card>
);

export const GlassCard = ({ children, ...props }) => (
  <Card
    variant="glass"
    glassMorphism
    {...props}
  >
    {children}
  </Card>
);

export default Card;