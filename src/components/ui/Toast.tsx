import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  position = 'top'
}) => {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.colors.success,
          backgroundColor: '#d1fae5'
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: theme.colors.error,
          backgroundColor: '#fee2e2'
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: theme.colors.warning,
          backgroundColor: '#fef3c7'
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: theme.colors.primary,
          backgroundColor: theme.colors.blue[50]
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.positionTop : styles.positionBottom,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: config.backgroundColor
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        <Text style={[styles.message, { color: config.color }]}>{message}</Text>
        <TouchableOpacity onPress={hide} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={config.color} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
    zIndex: 9999
  },
  positionTop: {
    top: Platform.OS === 'ios' ? 60 : 40
  },
  positionBottom: {
    bottom: Platform.OS === 'ios' ? 40 : 20
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium
  },
  closeButton: {
    padding: theme.spacing.xs
  }
});