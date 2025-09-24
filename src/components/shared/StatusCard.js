import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

/**
 * Professional Status Card Component for PaRKING App
 * 
 * @example
 * // Inside parking status
 * <StatusCard 
 *   status="inside"
 *   title="Estás dentro del estacionamiento"
 *   subtitle="Tiempo: 2h 15min"
 *   onPress={handleStatusPress}
 * />
 * 
 * // Outside status
 * <StatusCard 
 *   status="outside"
 *   title="Fuera del estacionamiento"
 *   subtitle="Toca para iniciar sesión"
 * />
 * 
 * // Error state
 * <StatusCard 
 *   status="error"
 *   title="Error de conexión"
 *   subtitle="Verifica tu conexión a internet"
 *   actionText="Reintentar"
 *   onActionPress={handleRetry}
 * />
 */
const StatusCard = ({
  status = 'outside',
  title,
  subtitle,
  description,
  actionText,
  onPress,
  onActionPress,
  disabled = false,
  style = {},
  accessibilityLabel,
  testID,
}) => {
  // Get status configuration
  const getStatusConfig = () => {
    const configs = {
      inside: {
        backgroundColor: Colors.parking.active,
        backgroundLight: Colors.success[50],
        borderColor: Colors.success[200],
        iconColor: Colors.success[600],
        titleColor: Colors.success[800],
        subtitleColor: Colors.success[600],
        indicator: '●',
        statusText: 'ACTIVO',
      },
      outside: {
        backgroundColor: Colors.neutral[500],
        backgroundLight: Colors.neutral[50],
        borderColor: Colors.neutral[200],
        iconColor: Colors.neutral[600],
        titleColor: Colors.neutral[800],
        subtitleColor: Colors.neutral[600],
        indicator: '○',
        statusText: 'INACTIVO',
      },
      loading: {
        backgroundColor: Colors.info[500],
        backgroundLight: Colors.info[50],
        borderColor: Colors.info[200],
        iconColor: Colors.info[600],
        titleColor: Colors.info[800],
        subtitleColor: Colors.info[600],
        indicator: '◐',
        statusText: 'PROCESANDO',
      },
      error: {
        backgroundColor: Colors.error[500],
        backgroundLight: Colors.error[50],
        borderColor: Colors.error[200],
        iconColor: Colors.error[600],
        titleColor: Colors.error[800],
        subtitleColor: Colors.error[600],
        indicator: '⚠',
        statusText: 'ERROR',
      },
      paused: {
        backgroundColor: Colors.warning[500],
        backgroundLight: Colors.warning[50],
        borderColor: Colors.warning[200],
        iconColor: Colors.warning[600],
        titleColor: Colors.warning[800],
        subtitleColor: Colors.warning[600],
        indicator: '⏸',
        statusText: 'PAUSADO',
      },
      expired: {
        backgroundColor: Colors.error[400],
        backgroundLight: Colors.error[50],
        borderColor: Colors.error[200],
        iconColor: Colors.error[600],
        titleColor: Colors.error[800],
        subtitleColor: Colors.error[600],
        indicator: '⏰',
        statusText: 'EXPIRADO',
      },
    };

    return configs[status] || configs.outside;
  };

  const config = getStatusConfig();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: config.backgroundLight,
      borderColor: config.borderColor,
    },
    disabled && styles.disabled,
    style,
  ];

  const CardContent = () => (
    <>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <Text style={[styles.indicator, { color: config.backgroundColor }]}>
            {config.indicator}
          </Text>
          <Text style={[styles.statusText, { color: config.iconColor }]}>
            {config.statusText}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: config.titleColor }]}>
            {title}
          </Text>
        )}
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: config.subtitleColor }]}>
            {subtitle}
          </Text>
        )}
        
        {description && (
          <Text style={[styles.description, { color: config.subtitleColor }]}>
            {description}
          </Text>
        )}
      </View>

      {/* Action Button */}
      {actionText && onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: config.borderColor }]}
          onPress={onActionPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, { color: config.iconColor }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  // If onPress is provided, make the entire card touchable
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled }}
        testID={testID}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={containerStyle}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1.5,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  actionButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

StatusCard.propTypes = {
  status: PropTypes.oneOf([
    'inside',
    'outside', 
    'loading',
    'error',
    'paused',
    'expired'
  ]),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  actionText: PropTypes.string,
  onPress: PropTypes.func,
  onActionPress: PropTypes.func,
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
};

export default StatusCard;