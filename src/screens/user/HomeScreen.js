/**
 * PaRKING Home Screen - Clean Redesign
 * 
 * Complete redesign without SafeAreaView divisions
 * Full-screen seamless experience
 * All functionality preserved
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
  StatusBar,
} from 'react-native';
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
} from 'react-native-reanimated';

// New premium components
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import QRDisplay from '../../components/ui/QRDisplay';

// Design system
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import DesignSystem from '../../constants/designSystem';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentSession } = useSelector((state) => state.session);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [lastSession, setLastSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrValue, setQrValue] = useState('');

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);

  // Initialize animations
  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800 });
    slideUp.value = withSpring(0, { damping: 15, stiffness: 150 });
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
      };
    }
    
    if (userBalance <= 0) {
      return {
        status: 'expired',
        title: '⚠️ Sin Saldo',
        subtitle: 'Necesitas comprar minutos para ingresar',
        description: 'Compra minutos y muestra tu QR al guardia',
        color: Colors.error[500],
      };
    }
    
    return {
      status: 'pending',
      title: '✅ Listo para Ingresar',
      subtitle: `Tienes ${userBalance} minutos disponibles`,
      description: 'Muestra tu QR al guardia para ingresar',
      color: Colors.success[500],
    };
  };

  // Animation styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <LinearGradient
          colors={['#2563eb', '#1d4ed8', '#1e40af']}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>Cargando...</Text>
        </LinearGradient>
      </View>
    );
  }

  const parkingStatus = getParkingStatus();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Full-screen seamless header */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8', '#1e40af']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="car" size={32} color="white" />
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
              style={styles.emergencyBtn}
              leftIcon={<Ionicons name="alert" size={20} color="#ef4444" />}
              accessibilityLabel="Emergency button"
            />
            <Button
              onPress={handleViewProfile}
              variant="ghost"
              size="small"
              style={styles.profileBtn}
              rightIcon={<Ionicons name="person-circle" size={28} color="rgba(255,255,255,0.9)" />}
              accessibilityLabel="View profile"
            />
          </View>
        </View>
        
        <Text style={styles.welcomeText}>
          ¡Hola {user?.name || 'Usuario'}! Tu código QR está listo
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      >
        <AnimatedView style={[styles.content, animatedStyle]}>
          {/* Status Card */}
          <Card style={styles.statusCard}>
            <View style={[styles.statusIndicator, { backgroundColor: parkingStatus.color }]} />
            <Text style={styles.statusTitle}>{parkingStatus.title}</Text>
            <Text style={styles.statusSubtitle}>{parkingStatus.subtitle}</Text>
            <Text style={styles.statusDescription}>{parkingStatus.description}</Text>
          </Card>

          {/* QR Section - Main focus */}
          <Card style={styles.qrCard}>
            <Text style={styles.qrTitle}>Tu Código QR Personal</Text>
            <Text style={styles.qrSubtitle}>
              Código único y seguro para acceso al estacionamiento
            </Text>
            
            <View style={styles.qrContainer}>
              <QRDisplay
                value={qrValue}
                size="large"
                userInfo={{
                  name: user?.name || 'Usuario',
                  phone: user?.phone,
                  balance: userBalance,
                }}
                status={parkingStatus.status}
                accessibilityLabel={`QR Code for ${user?.name || 'user'} with ${userBalance} minutes balance`}
              />
            </View>
          </Card>

          {/* Balance Display */}
          <Card style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceIcon}>
                <Ionicons 
                  name={userBalance > 0 ? "time" : "alert-circle"} 
                  size={32} 
                  color={userBalance > 0 ? Colors.success[600] : Colors.error[600]} 
                />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceTitle}>
                  {userBalance > 0 ? `${userBalance} min` : 'Sin saldo'}
                </Text>
                <Text style={styles.balanceSubtitle}>
                  {userBalance > 0 ? 'Tiempo disponible' : 'Necesitas recargar'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="💳 Comprar Minutos"
              onPress={handleBuyMinutes}
              size="large"
              style={styles.primaryButton}
              accessibilityLabel="Buy more parking minutes"
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

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={24} color="#2563eb" />
              <Text style={styles.statLabel}>Último uso</Text>
              <Text style={styles.statValue}>
                {lastSession ? 'Hoy' : 'Nunca'}
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up-outline" size={24} color="#059669" />
              <Text style={styles.statLabel}>Total gastado</Text>
              <Text style={styles.statValue}>
                L{user?.total_spent?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              🔒 Tu información está protegida con encriptación de extremo a extremo
            </Text>
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  
  // Header - Seamless full-screen
  headerContainer: {
    paddingTop: 60, // Status bar + padding
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 20,
    width: 44,
    height: 44,
  },
  profileBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 44,
    height: 44,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: screenWidth * 0.85,
    lineHeight: 24,
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 0,
    marginTop: -20, // Overlap with header
  },
  
  // Status Card
  statusCard: {
    marginBottom: 24,
    padding: 20,
    position: 'relative',
    borderRadius: 16,
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  // QR Section
  qrCard: {
    marginBottom: 24,
    padding: 32,
    alignItems: 'center',
    borderRadius: 20,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  qrContainer: {
    alignItems: 'center',
  },
  
  // Balance Card
  balanceCard: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  balanceSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  
  // Actions
  actionsContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 16,
    height: 56,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  
  // Footer
  footerInfo: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;