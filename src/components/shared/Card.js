import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

/**
 * Professional Card Component for PaRKING App
 * Base container component with consistent shadows, borders, and spacing
 * 
 * @example
 * // Basic card
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 * 
 * // Pressable card with custom padding
 * <Card 
 *   onPress={handlePress} 
 *   padding="large"
 *   variant="elevated"
 * >
 *   <Text>Pressable card content</Text>
 * </Card>
 * 
 * // Card with custom styling
 * <Card 
 *   variant="outlined" 
 *   style={{ backgroundColor: Colors.primary[50] }}
 * >
 *   <CustomContent />
 * </Card>
 */
const Card = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  onPress,
  disabled = false,
  style = {},
  accessibilityLabel,
  accessibilityRole,
  testID,
}) => {
  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      elevated: {
        backgroundColor: Colors.neutral[0],
        borderWidth: 0,
        shadowColor: Colors.neutral[900],
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      },
      outlined: {
        backgroundColor: Colors.neutral[0],
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        shadowColor: Colors.neutral[900],
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      filled: {
        backgroundColor: Colors.neutral[50],
        borderWidth: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
    };

    return variants[variant] || variants.elevated;
  };

  // Get padding styles
  const getPaddingStyles = () => {
    if (typeof padding === 'number') {
      return { padding };
    }

    const paddings = {
      none: { padding: 0 },
      small: { padding: 12 },
      medium: { padding: 16 },
      large: { padding: 20 },
      xlarge: { padding: 24 },
    };

    return paddings[padding] || paddings.medium;
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();

  const containerStyle = [
    styles.container,
    variantStyles,
    paddingStyles,
    disabled && styles.disabled,
    style,
  ];

  // If onPress is provided, render as TouchableOpacity
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise render as regular View
  return (
    <View
      style={containerStyle}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
};

// Specialized card variants
export const InfoCard = ({ children, ...props }) => (
  <Card
    variant="elevated"
    style={{ backgroundColor: Colors.info[50], borderColor: Colors.info[200] }}
    {...props}
  >
    {children}
  </Card>
);

export const WarningCard = ({ children, ...props }) => (
  <Card
    variant="elevated"
    style={{ backgroundColor: Colors.warning[50], borderColor: Colors.warning[200] }}
    {...props}
  >
    {children}
  </Card>
);

export const ErrorCard = ({ children, ...props }) => (
  <Card
    variant="elevated"
    style={{ backgroundColor: Colors.error[50], borderColor: Colors.error[200] }}
    {...props}
  >
    {children}
  </Card>
);

export const SuccessCard = ({ children, ...props }) => (
  <Card
    variant="elevated"
    style={{ backgroundColor: Colors.success[50], borderColor: Colors.success[200] }}
    {...props}
  >
    {children}
  </Card>
);

// Gradient card (requires LinearGradient from expo-linear-gradient)
export const GradientCard = ({ 
  children, 
  colors = Colors.gradients.primary,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  ...props 
}) => {
  // Note: This would require expo-linear-gradient to be installed
  // For now, we'll use a fallback solid color
  return (
    <Card
      variant="elevated"
      style={{ 
        backgroundColor: colors[0],
        // If LinearGradient is available, this would be replaced with gradient
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 4,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
});

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['elevated', 'outlined', 'filled', 'ghost']),
  padding: PropTypes.oneOfType([
    PropTypes.oneOf(['none', 'small', 'medium', 'large', 'xlarge']),
    PropTypes.number,
  ]),
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  accessibilityRole: PropTypes.string,
  testID: PropTypes.string,
};

// PropTypes for specialized cards
const specializedCardPropTypes = {
  children: PropTypes.node.isRequired,
};

InfoCard.propTypes = specializedCardPropTypes;
WarningCard.propTypes = specializedCardPropTypes;
ErrorCard.propTypes = specializedCardPropTypes;
SuccessCard.propTypes = specializedCardPropTypes;

GradientCard.propTypes = {
  ...specializedCardPropTypes,
  colors: PropTypes.arrayOf(PropTypes.string),
  start: PropTypes.object,
  end: PropTypes.object,
};

export default Card;