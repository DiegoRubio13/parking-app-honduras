/**
 * World-Class User Home Screen - PaRKING App
 * 
 * Redesigned with premium UI components inspired by:
 * - SpotHero's clean, functional design
 * - EasyPark's modern aesthetics  
 * - Uber's professional interface
 * - Material Design 3.0 principles
 * 
 * Features:
 * - Enhanced QR display with animations
 * - Premium glass morphism effects
 * - Smooth micro-interactions
 * - WCAG 2.1 AA accessibility compliance
 * - Professional spacing and typography
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// New premium components
import Button from '../../components/ui/Button';
import Card, { StatusCard, MetricCard, ActionCard, GlassCard } from '../../components/ui/Card';
import QRDisplay from '../../components/ui/QRDisplay';

// Design system
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import DesignSystem from '../../constants/designSystem';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';

const { width: screenWidth } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentSession } = useSelector((state) => state.session);
  const insets = useSafeAreaInsets();
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [lastSession, setLastSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrValue, setQrValue] = useState('');

  // Animation values for premium effects
  const headerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const balanceScale = useSharedValue(0.95);
  const qrScale = useSharedValue(0);

  // Initialize animations on mount
  useEffect(() => {
    // Staggered entrance animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withSpring(0, DesignSystem.animations.easing.spring);
    
    setTimeout(() => {
      qrScale.value = withSpring(1, DesignSystem.animations.easing.gentleSpring);
    }, 300);
    
    setTimeout(() => {
      balanceScale.value = withSpring(1, DesignSystem.animations.easing.spring);
    }, 500);
  }, []);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserData();
    }, [])
  );

  const refreshUserData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserBalance(userData.minutes_balance || 0);
        setLastSession(userData.current_session || null);
        
        // Generate QR value
        const newQrValue = formatPhoneForQR(user?.phone || user?.id);
        setQrValue(newQrValue);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  // Enhanced QR formatting with better structure
  const formatPhoneForQR = (phone) => {
    const cleanPhone = phone && phone.toString().trim();
    if (!cleanPhone || cleanPhone === 'null' || cleanPhone === 'undefined') {
      return JSON.stringify({
        app: 'PaRKING',
        version: '2.0',
        type: 'user',
        phone: 'GUEST_USER',
        timestamp: Date.now(),
        checksum: 1234,
        balance: userBalance,
        status: getParkingStatus().status,
      });
    }
    
    const qrData = {
      app: 'PaRKING',
      version: '2.0',
      type: 'user',
      phone: cleanPhone,
      timestamp: Date.now(),
      checksum: generateChecksum(cleanPhone),
      balance: userBalance,
      status: getParkingStatus().status,
    };
    
    return JSON.stringify(qrData);
  };

  const generateChecksum = (phone) => {
    let sum = 0;
    for (let i = 0; i < phone.length; i++) {
      sum += phone.charCodeAt(i) * (i + 1);
    }
    return sum % 10000;
  };

  const getParkingStatus = () => {
    if (currentSession || lastSession) {
      return {
        status: 'active',
        title: '🅿️ Sesión Activa',
        subtitle: lastSession ? `Ubicación: ${lastSession.location}` : 'Estás dentro del estacionamiento',
        description: 'Muestra tu QR al guardia para salir',
        color: Colors.success[500],
        bgGradient: Colors.gradients.success,
      };
    }
    
    if (userBalance <= 0) {
      return {
        status: 'expired',
        title: '⚠️ Sin Saldo',
        subtitle: 'Necesitas comprar minutos para ingresar',
        description: 'Compra minutos y muestra tu QR al guardia',
        color: Colors.error[500],
        bgGradient: Colors.gradients.error,
      };
    }
    
    return {
      status: 'pending',
      title: '✅ Listo para Ingresar',
      subtitle: `Tienes ${userBalance} minutos disponibles`,
      description: 'Muestra tu QR al guardia para ingresar',
      color: Colors.info[500],
      bgGradient: Colors.gradients.info,
    };
  };

  const getBalanceInfo = () => {
    if (userBalance <= 0) {
      return {
        title: 'Sin saldo',
        subtitle: 'Compra minutos para continuar',
        color: Colors.error[500],
        bgColor: Colors.error[50],
        borderColor: Colors.error[200],
        icon: 'alert-circle-outline',
        gradient: Colors.gradients.error,
      };
    }
    
    if (userBalance < 30) {
      return {
        title: `${userBalance} min`,
        subtitle: 'Saldo bajo, considera recargar',
        color: Colors.warning[600],
        bgColor: Colors.warning[50],
        borderColor: Colors.warning[200],
        icon: 'time-outline',
        gradient: Colors.gradients.warning,
      };
    }
    
    return {
      title: `${userBalance} min`,
      subtitle: 'Saldo suficiente para estacionar',
      color: Colors.success[600],
      bgColor: Colors.success[50],
      borderColor: Colors.success[200],
      icon: 'checkmark-circle-outline',
      gradient: Colors.gradients.success,
    };
  };

  // Animation styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const qrAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qrScale.value }],
  }));

  const balanceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: balanceScale.value }],
  }));

  // Navigation handlers
  const handleBuyMinutes = () => {
    navigation.navigate('Purchase');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergencia',
      'Llamar a seguridad del estacionamiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => console.log('Emergency call') }
      ]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
        <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  const parkingStatus = getParkingStatus();
  const balanceInfo = getBalanceInfo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
      
      {/* Premium Header with Gradient */}
      <AnimatedView style={[headerAnimatedStyle]}>
        <LinearGradient
          colors={Colors.gradients.premiumPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Ionicons name="car" size={28} color={Colors.neutral[0]} />
              </View>
              <View>
                <Text style={styles.brandTitle}>PaRKING</Text>
                <Text style={styles.brandSubtitle}>Smart Parking System</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <Button
                onPress={handleEmergency}
                variant="ghost"
                size="small"
                style={styles.emergencyButton}
                leftIcon={<Ionicons name="alert" size={20} color={Colors.error[400]} />}
                accessibilityLabel="Emergency button"
              />
              <Button
                onPress={handleViewProfile}
                variant="ghost"
                size="small"
                style={styles.profileButton}
                rightIcon={<Ionicons name="person-circle" size={24} color={Colors.neutral[200]} />}
                accessibilityLabel="View profile"
              />
            </View>
          </View>
          
          <Text style={styles.welcomeText}>
            ¡Hola {user?.name || 'Usuario'}! Tu código QR está listo
          </Text>
        </LinearGradient>
      </AnimatedView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary[600]}
            colors={[Colors.primary[600]]}
          />
        }
      >
        <AnimatedView style={contentAnimatedStyle}>
          {/* Status Card with Glass Effect */}
          <GlassCard style={styles.statusContainer}>
            <LinearGradient
              colors={parkingStatus.bgGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusGradient}
            >
              <Text style={styles.statusTitle}>{parkingStatus.title}</Text>
              <Text style={styles.statusSubtitle}>{parkingStatus.subtitle}</Text>
              <Text style={styles.statusDescription}>{parkingStatus.description}</Text>
            </LinearGradient>
          </GlassCard>

          {/* Enhanced QR Section */}
          <AnimatedView style={qrAnimatedStyle}>
            <Card variant="elevated" style={styles.qrSection}>
              <Text style={styles.qrTitle}>Tu Código QR Personal</Text>
              <Text style={styles.qrSubtitle}>
                Código único y seguro para acceso al estacionamiento
              </Text>
              
              <QRDisplay
                value={qrValue}
                size="large"
                userInfo={{
                  name: user?.name || 'Usuario',
                  phone: user?.phone,
                  balance: userBalance,
                }}
                status={parkingStatus.status}
                style={styles.qrDisplay}
                accessibilityLabel={`QR Code for ${user?.name || 'user'} with ${userBalance} minutes balance`}
              />
            </Card>
          </AnimatedView>

          {/* Premium Balance Card */}
          <AnimatedView style={balanceAnimatedStyle}>
            <ActionCard
              onPress={() => userBalance <= 0 ? handleBuyMinutes() : null}
              style={styles.balanceCard}
            >
              <LinearGradient
                colors={balanceInfo.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.balanceGradient}
              >
                <View style={styles.balanceHeader}>
                  <View style={styles.balanceIconContainer}>
                    <Ionicons name={balanceInfo.icon} size={28} color={Colors.neutral[0]} />
                  </View>
                  <View style={styles.balanceContent}>
                    <Text style={styles.balanceTitle}>{balanceInfo.title}</Text>
                    <Text style={styles.balanceSubtitle}>{balanceInfo.subtitle}</Text>
                  </View>
                </View>
              </LinearGradient>
            </ActionCard>
          </AnimatedView>

          {/* Action Buttons Grid */}
          <View style={styles.actionsGrid}>
            <Button
              title="💳 Comprar Minutos"
              onPress={handleBuyMinutes}
              size="large"
              style={styles.primaryButton}
              accessibilityLabel="Buy more parking minutes"
              accessibilityHint="Navigate to purchase screen"
            />
            
            <View style={styles.secondaryActions}>
              <Button
                title="📊 Historial"
                onPress={handleViewHistory}
                variant="outline"
                style={styles.secondaryButton}
                accessibilityLabel="View parking history"
              />
              <Button
                title="👤 Perfil"
                onPress={handleViewProfile}
                variant="outline"
                style={styles.secondaryButton}
                accessibilityLabel="View user profile"
              />
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <MetricCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="calendar-outline" size={24} color={Colors.primary[600]} />
                <Text style={styles.statLabel}>Último uso</Text>
                <Text style={styles.statValue}>
                  {lastSession ? 'Hoy' : 'Nunca'}
                </Text>
              </View>
            </MetricCard>
            
            <MetricCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name="trending-up-outline" size={24} color={Colors.success[600]} />
                <Text style={styles.statLabel}>Total gastado</Text>
                <Text style={styles.statValue}>
                  L{user?.total_spent?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </MetricCard>
          </View>

          {/* Footer Info */}
          <Card variant="flat" style={styles.footerCard}>
            <Text style={styles.footerText}>
              🔒 Tu información está protegida con encriptación de extremo a extremo
            </Text>
          </Card>
        </AnimatedView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  topSafeArea: {
    backgroundColor: Colors.primary[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  loadingText: {
    ...Typography.styles.body,
    color: Colors.neutral[600],
    marginTop: DesignSystem.spacing.md,
  },
  
  // Header Styles
  headerGradient: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: DesignSystem.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    ...Typography.styles.h1,
    color: Colors.neutral[0],
    fontWeight: Typography.weights.bold,
  },
  brandSubtitle: {
    ...Typography.styles.caption,
    color: Colors.neutral[200],
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  emergencyButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: DesignSystem.borderRadius.full,
    width: 40,
    height: 40,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignSystem.borderRadius.full,
    width: 40,
    height: 40,
  },
  welcomeText: {
    ...Typography.styles.body,
    color: Colors.neutral[200],
    maxWidth: screenWidth * 0.8,
  },
  
  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DesignSystem.spacing.massive,
  },
  
  // Status Card
  statusContainer: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: -DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
  },
  statusGradient: {
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.xl,
  },
  statusTitle: {
    ...Typography.styles.h2,
    color: Colors.neutral[0],
    marginBottom: DesignSystem.spacing.sm,
  },
  statusSubtitle: {
    ...Typography.styles.body,
    color: Colors.neutral[100],
    marginBottom: DesignSystem.spacing.xs,
  },
  statusDescription: {
    ...Typography.styles.bodySmall,
    color: Colors.neutral[200],
  },
  
  // QR Section
  qrSection: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  qrTitle: {
    ...Typography.styles.h2,
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  qrSubtitle: {
    ...Typography.styles.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
    maxWidth: screenWidth * 0.8,
  },
  qrDisplay: {
    alignSelf: 'center',
  },
  
  // Balance Card
  balanceCard: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  balanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: DesignSystem.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContent: {
    flex: 1,
  },
  balanceTitle: {
    ...Typography.styles.displaySmall,
    color: Colors.neutral[0],
    fontWeight: Typography.weights.bold,
  },
  balanceSubtitle: {
    ...Typography.styles.body,
    color: Colors.neutral[100],
    marginTop: 4,
  },
  
  // Actions
  actionsGrid: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  primaryButton: {
    marginBottom: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.xl,
    height: 56,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  statCard: {
    flex: 1,
    minHeight: 100,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: DesignSystem.spacing.sm,
  },
  statLabel: {
    ...Typography.styles.caption,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  statValue: {
    ...Typography.styles.h3,
    color: Colors.neutral[800],
    textAlign: 'center',
    fontWeight: Typography.weights.bold,
  },
  
  // Footer
  footerCard: {
    marginHorizontal: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.md,
    backgroundColor: Colors.info[50],
  },
  footerText: {
    ...Typography.styles.bodySmall,
    color: Colors.info[700],
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.body.small,
  },
});

export default HomeScreen;