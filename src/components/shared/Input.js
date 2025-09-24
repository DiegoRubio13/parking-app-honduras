import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

/**
 * Professional Input Component for PaRKING App
 * 
 * @example
 * // Basic input
 * <Input 
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   placeholder="tu@email.com"
 * />
 * 
 * // Input with validation
 * <Input 
 *   label="Contraseña"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 *   state="error"
 *   helperText="Contraseña muy corta"
 * />
 * 
 * // Input with icons
 * <Input 
 *   label="Buscar"
 *   leftIcon={<SearchIcon />}
 *   rightIcon={<ClearIcon onPress={handleClear} />}
 * />
 */
const Input = ({
  label,
  value = '',
  onChangeText,
  placeholder = '',
  state = 'normal',
  helperText = '',
  leftIcon = null,
  rightIcon = null,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  style = {},
  containerStyle = {},
  inputStyle = {},
  labelStyle = {},
  helperTextStyle = {},
  accessibilityLabel,
  testID,
  onFocus,
  onBlur,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Get state configuration
  const getStateConfig = () => {
    const configs = {
      normal: {
        borderColor: isFocused ? Colors.primary[600] : Colors.neutral[300],
        backgroundColor: Colors.neutral[0],
        labelColor: isFocused ? Colors.primary[600] : Colors.neutral[600],
        textColor: Colors.neutral[900],
        helperColor: Colors.neutral[500],
      },
      error: {
        borderColor: Colors.error[500],
        backgroundColor: Colors.error[50],
        labelColor: Colors.error[600],
        textColor: Colors.neutral[900],
        helperColor: Colors.error[600],
      },
      success: {
        borderColor: Colors.success[500],
        backgroundColor: Colors.success[50],
        labelColor: Colors.success[600],
        textColor: Colors.neutral[900],
        helperColor: Colors.success[600],
      },
      disabled: {
        borderColor: Colors.neutral[200],
        backgroundColor: Colors.neutral[100],
        labelColor: Colors.neutral[400],
        textColor: Colors.neutral[500],
        helperColor: Colors.neutral[400],
      },
    };

    if (!editable) return configs.disabled;
    return configs[state] || configs.normal;
  };

  const config = getStateConfig();

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    animateLabel(true);
    onFocus && onFocus(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (!value) {
      animateLabel(false);
    }
    onBlur && onBlur(e);
  };

  // Animate label
  const animateLabel = (focused) => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Update label animation when value changes
  React.useEffect(() => {
    animateLabel(value ? true : isFocused);
  }, [value, isFocused]);

  // Animated label styles
  const animatedLabelStyle = {
    position: 'absolute',
    left: leftIcon ? 52 : 20,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [multiline ? 20 : 16, 8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: config.labelColor,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    {
      borderColor: config.borderColor,
      backgroundColor: config.backgroundColor,
      minHeight: multiline ? numberOfLines * 20 + 40 : 64,
    },
    style,
  ];

  const textInputStyles = [
    styles.textInput,
    {
      color: config.textColor,
      paddingLeft: leftIcon ? 52 : 20,
      paddingRight: rightIcon ? 52 : 20,
      textAlignVertical: multiline ? 'top' : 'center',
      paddingTop: multiline ? 16 : 0,
      paddingBottom: multiline ? 16 : 0,
    },
    inputStyle,
  ];

  const helperTextStyles = [
    styles.helperText,
    { color: config.helperColor },
    helperTextStyle,
  ];

  return (
    <View style={containerStyles}>
      <View style={inputContainerStyles}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        {/* Animated Label */}
        {label && (
          <Animated.Text style={[styles.label, animatedLabelStyle, labelStyle]}>
            {label}
          </Animated.Text>
        )}

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={label ? '' : placeholder}
          placeholderTextColor={Colors.neutral[400]}
          style={textInputStyles}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel || label}
          testID={testID}
          {...restProps}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Helper Text */}
      {helperText ? (
        <Text style={helperTextStyles}>
          {helperText}
        </Text>
      ) : null}

      {/* Character Counter */}
      {maxLength && value.length > maxLength * 0.8 ? (
        <Text style={[styles.characterCounter, { color: config.helperColor }]}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 26,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 24,
    includeFontPadding: false,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -12,
    zIndex: 2,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
    zIndex: 2,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 8,
    marginLeft: 20,
    fontWeight: '500',
  },
  characterCounter: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 8,
    marginRight: 20,
    opacity: 0.7,
    fontWeight: '500',
  },
});

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  placeholder: PropTypes.string,
  state: PropTypes.oneOf(['normal', 'error', 'success', 'disabled']),
  helperText: PropTypes.string,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  maxLength: PropTypes.number,
  keyboardType: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  autoCapitalize: PropTypes.string,
  autoCorrect: PropTypes.bool,
  editable: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  helperTextStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

export default Input;