import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

/**
 * Professional Button Component for PaRKING App
 * 
 * @example
 * // Primary button
 * <Button title="Iniciar Sesión" onPress={handleLogin} />
 * 
 * // Secondary with icon
 * <Button 
 *   title="Cancelar" 
 *   variant="secondary" 
 *   leftIcon={<Icon name="close" />}
 *   onPress={handleCancel} 
 * />
 * 
 * // Loading state
 * <Button title="Guardando..." loading={isLoading} disabled />
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  style = {},
  textStyle = {},
  accessibilityLabel,
  testID,
}) => {
  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      primary: {
        container: {
          backgroundColor: disabled ? Colors.neutral[300] : Colors.primary[600],
          borderWidth: 0,
        },
        text: {
          color: disabled ? Colors.neutral[500] : Colors.neutral[0],
          fontWeight: '600',
        },
      },
      secondary: {
        container: {
          backgroundColor: disabled ? Colors.neutral[100] : Colors.secondary[100],
          borderWidth: 1,
          borderColor: disabled ? Colors.neutral[300] : Colors.secondary[300],
        },
        text: {
          color: disabled ? Colors.neutral[400] : Colors.secondary[700],
          fontWeight: '500',
        },
      },
      outline: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? Colors.neutral[300] : Colors.primary[600],
        },
        text: {
          color: disabled ? Colors.neutral[400] : Colors.primary[600],
          fontWeight: '500',
        },
      },
      ghost: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
        text: {
          color: disabled ? Colors.neutral[400] : Colors.primary[600],
          fontWeight: '500',
        },
      },
    };

    return variants[variant] || variants.primary;
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: {
        container: {
          height: 40,
          paddingHorizontal: 16,
          borderRadius: 10,
        },
        text: {
          fontSize: 15,
          lineHeight: 20,
          fontWeight: '600',
          letterSpacing: -0.1,
        },
      },
      medium: {
        container: {
          height: 48,
          paddingHorizontal: 20,
          borderRadius: 12,
        },
        text: {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: '600',
          letterSpacing: -0.2,
        },
      },
      large: {
        container: {
          height: 56,
          paddingHorizontal: 28,
          borderRadius: 14,
        },
        text: {
          fontSize: 17,
          lineHeight: 28,
          fontWeight: '700',
          letterSpacing: -0.3,
        },
      },
    };

    return sizes[size] || sizes.medium;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle = [
    styles.container,
    sizeStyles.container,
    variantStyles.container,
    style,
  ];

  const textStyles = [
    styles.text,
    sizeStyles.text,
    variantStyles.text,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? Colors.neutral[0] : Colors.primary[600]}
            style={styles.spinner}
          />
          <Text style={textStyles}>{title}</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <Text style={textStyles}>{title}</Text>
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
};

export default Button;