import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle
} from 'react-native';
import { theme } from '../../constants/theme';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  fullScreen = false,
  overlay = false,
  style
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
    style
  ];

  return (
    <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={theme.colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </Animated.View>
  );
};

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity
        },
        style
      ]}
    />
  );
};

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.cardSkeleton}>
          <View style={styles.cardHeader}>
            <Skeleton width={60} height={60} borderRadius={30} />
            <View style={styles.cardHeaderText}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
            </View>
          </View>
          <View style={styles.cardBody}>
            <Skeleton width="100%" height={12} />
            <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
            <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </>
  );
};

interface ListSkeletonProps {
  count?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={styles.listItemText}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </>
  );
};

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.buttonLoading}>
      <ActivityIndicator size="small" color="white" />
    </View>
  );
};

interface InlineLoadingProps {
  message?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ message }) => {
  return (
    <View style={styles.inlineLoading}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    zIndex: 1000
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000
  },
  content: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium
  },
  skeleton: {
    backgroundColor: theme.colors.border
  },
  cardSkeleton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: theme.spacing.md
  },
  cardBody: {
    marginTop: theme.spacing.md
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm
  },
  listItemText: {
    flex: 1,
    marginLeft: theme.spacing.md
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md
  },
  inlineMessage: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary
  }
});