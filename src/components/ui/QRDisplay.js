/**
 * Enhanced QR Display Component
 * 
 * World-class QR display inspired by SpotHero and EasyPark
 * - Perfect contrast ratios for QR scanning
 * - Smooth generation animations
 * - Accessibility compliant
 * - Status indicators and user feedback
 * - Professional styling with breathing room
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import DesignSystem from '../../constants/designSystem';
import { QRCard } from './Card';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);

const QRDisplay = ({
  // QR Data
  value,
  size = 'large',
  
  // User Information
  userInfo,
  status = 'active',
  
  // Styling
  style,
  containerStyle,
  backgroundColor = Colors.neutral[0],
  foregroundColor = Colors.mobility.black,
  
  // Animation
  animated = true,
  regenerateAnimation = true,
  
  // Accessibility
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  // Animation values
  const qrScale = useSharedValue(0);
  const qrOpacity = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const statusOpacity = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-200);

  // Get QR size based on prop and screen dimensions
  const getQRSize = () => {
    const maxSize = screenWidth - (DesignSystem.spacing.xl * 2);
    
    switch (size) {
      case 'small':
        return Math.min(DesignSystem.layout.qrCodeSize.small, maxSize * 0.6);
      case 'medium':
        return Math.min(DesignSystem.layout.qrCodeSize.medium, maxSize * 0.7);
      case 'large':
        return Math.min(DesignSystem.layout.qrCodeSize.large, maxSize * 0.8);
      case 'xlarge':
        return Math.min(DesignSystem.layout.qrCodeSize.xlarge, maxSize * 0.9);
      default:
        return Math.min(DesignSystem.layout.qrCodeSize.large, maxSize * 0.8);
    }
  };

  const qrSize = getQRSize();

  // Generate QR code with animation
  const generateQR = async (newValue = value) => {
    if (!animated) {
      setCurrentValue(newValue);
      return;
    }

    setIsGenerating(true);
    
    // Fade out current QR
    qrOpacity.value = withTiming(0, { duration: DesignSystem.animations.fast });
    qrScale.value = withTiming(0.8, { duration: DesignSystem.animations.fast });
    
    // Wait for fade out
    setTimeout(() => {
      setCurrentValue(newValue);
      
      // Animate in new QR
      qrOpacity.value = withSpring(1, DesignSystem.animations.easing.spring);
      qrScale.value = withSequence(
        withTiming(1.1, { duration: DesignSystem.animations.normal }),
        withSpring(1, DesignSystem.animations.easing.gentleSpring)
      );
      
      setIsGenerating(false);
    }, DesignSystem.animations.fast);
  };

  // Initial animation
  useEffect(() => {
    if (animated) {
      qrOpacity.value = withSpring(1, {
        ...DesignSystem.animations.easing.spring,
        delay: 200,
      });
      qrScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, {
          ...DesignSystem.animations.easing.spring,
          delay: 200,
        })
      );
    } else {
      qrOpacity.value = 1;
      qrScale.value = 1;
    }
  }, []);

  // Update QR when value changes
  useEffect(() => {
    if (value !== currentValue) {
      generateQR(value);
    }
  }, [value]);

  // Status animation
  useEffect(() => {
    statusOpacity.value = withSequence(
      withTiming(0.3, { duration: DesignSystem.animations.fast }),
      withTiming(1, { duration: DesignSystem.animations.fast })
    );
  }, [status]);

  // Shimmer animation for loading
  useEffect(() => {
    if (isGenerating) {
      shimmerTranslate.value = withSequence(
        withTiming(qrSize + 100, { duration: 1200 }),
        withTiming(-200, { duration: 0 }),
        withTiming(qrSize + 100, { duration: 1200 }),
      );
    }
  }, [isGenerating, qrSize]);

  // Animated styles
  const qrAnimatedStyle = useAnimatedStyle(() => ({
    opacity: qrOpacity.value,
    transform: [{ scale: qrScale.value }],
  }));

  const statusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    if (!isGenerating) return { opacity: 0 };
    
    return {
      opacity: interpolate(shimmerTranslate.value, [-200, 0, qrSize, qrSize + 100], [0, 0.6, 0.6, 0]),
      transform: [{ translateX: shimmerTranslate.value }],
    };
  });

  // Get status color and text
  const getStatusInfo = () => {
    switch (status) {
      case 'active':
        return {
          color: Colors.success[500],
          text: 'Active Session',
          backgroundColor: Colors.success[50],
        };
      case 'paused':
        return {
          color: Colors.warning[500],
          text: 'Session Paused',
          backgroundColor: Colors.warning[50],
        };
      case 'expired':
        return {
          color: Colors.error[500],
          text: 'Session Expired',
          backgroundColor: Colors.error[50],
        };
      case 'pending':
        return {
          color: Colors.info[500],
          text: 'Payment Pending',
          backgroundColor: Colors.info[50],
        };
      default:
        return {
          color: Colors.neutral[500],
          text: 'Ready to Scan',
          backgroundColor: Colors.neutral[50],
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <QRCard
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: DesignSystem.spacing.xl,
        },
        containerStyle,
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `QR Code for ${userInfo?.name || 'user'}`}
      accessibilityHint={accessibilityHint || 'Show this QR code to the guard for parking access'}
      accessibilityRole="image"
    >
      {/* Status Indicator */}
      <AnimatedView
        style={[
          statusAnimatedStyle,
          {
            paddingHorizontal: DesignSystem.spacing.md,
            paddingVertical: DesignSystem.spacing.sm,
            borderRadius: DesignSystem.borderRadius.full,
            backgroundColor: statusInfo.backgroundColor,
            marginBottom: DesignSystem.spacing.lg,
          },
        ]}
      >
        <Text
          style={[
            Typography.styles.caption,
            {
              color: statusInfo.color,
              fontWeight: Typography.weights.semiBold,
              textAlign: 'center',
            },
          ]}
        >
          {statusInfo.text}
        </Text>
      </AnimatedView>

      {/* QR Code Container */}
      <View
        style={[
          {
            width: qrSize + (DesignSystem.spacing.lg * 2),
            height: qrSize + (DesignSystem.spacing.lg * 2),
            backgroundColor: backgroundColor,
            borderRadius: DesignSystem.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            ...DesignSystem.shadows.sm,
          },
          style,
        ]}
      >
        {/* Shimmer Loading Effect */}
        <AnimatedView
          style={[
            shimmerAnimatedStyle,
            {
              position: 'absolute',
              top: 0,
              left: -200,
              width: 200,
              height: '100%',
              borderRadius: DesignSystem.borderRadius.md,
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.4)',
              'rgba(255, 255, 255, 0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
              borderRadius: DesignSystem.borderRadius.md,
            }}
          />
        </AnimatedView>

        {/* QR Code */}
        <AnimatedView style={qrAnimatedStyle}>
          {currentValue ? (
            <QRCode
              value={currentValue}
              size={qrSize}
              color={foregroundColor}
              backgroundColor={backgroundColor}
              logo={null}
              logoSize={0}
              quietZone={DesignSystem.spacing.md}
              enableLinearGradient={false}
              logoBorderRadius={0}
              ecl="M" // Medium error correction level
            />
          ) : (
            <View
              style={{
                width: qrSize,
                height: qrSize,
                backgroundColor: Colors.neutral[100],
                borderRadius: DesignSystem.borderRadius.sm,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={[
                  Typography.styles.body,
                  {
                    color: Colors.neutral[400],
                    textAlign: 'center',
                  },
                ]}
              >
                No QR Data
              </Text>
            </View>
          )}
        </AnimatedView>
      </View>

      {/* User Information */}
      {userInfo && (
        <View
          style={{
            marginTop: DesignSystem.spacing.lg,
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              Typography.styles.h3,
              {
                color: Colors.neutral[800],
                textAlign: 'center',
                marginBottom: DesignSystem.spacing.sm,
              },
            ]}
          >
            {userInfo.name || 'Guest User'}
          </Text>
          
          {userInfo.phone && (
            <Text
              style={[
                Typography.styles.mono,
                {
                  color: Colors.neutral[600],
                  textAlign: 'center',
                  fontSize: Typography.sizes.body.small,
                },
              ]}
            >
              {userInfo.phone}
            </Text>
          )}
          
          {userInfo.balance !== undefined && (
            <View
              style={{
                marginTop: DesignSystem.spacing.sm,
                paddingHorizontal: DesignSystem.spacing.md,
                paddingVertical: DesignSystem.spacing.sm,
                backgroundColor: Colors.primary[50],
                borderRadius: DesignSystem.borderRadius.sm,
              }}
            >
              <Text
                style={[
                  Typography.styles.caption,
                  {
                    color: Colors.primary[600],
                    fontWeight: Typography.weights.semiBold,
                  },
                ]}
              >
                Balance: ${userInfo.balance.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Instructions */}
      <View
        style={{
          marginTop: DesignSystem.spacing.lg,
          paddingHorizontal: DesignSystem.spacing.md,
        }}
      >
        <Text
          style={[
            Typography.styles.bodySmall,
            {
              color: Colors.neutral[600],
              textAlign: 'center',
              lineHeight: Typography.lineHeights.relaxed * Typography.sizes.body.small,
            },
          ]}
        >
          Show this QR code to the guard to enter or exit the parking area
        </Text>
      </View>
    </QRCard>
  );
};

export default QRDisplay;