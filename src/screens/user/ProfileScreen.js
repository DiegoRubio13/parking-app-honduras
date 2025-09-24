/**
 * PaRKING Profile Screen - Clean Seamless Design
 * 
 * Complete redesign without SafeAreaView divisions
 * Professional user profile with modern UI
 * All functionality preserved
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc } from 'firebase/firestore';

import { Button, Card, LoadingSpinner } from '../../components/shared';
import { logoutUser } from '../../store/authSlice';
import { getUserTransactions } from '../../store/purchaseSlice';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userTransactions } = useSelector((state) => state.purchase);
  
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    totalSpent: 0,
    averageSessionTime: 0,
    joinDate: null,
    minutesBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(30);

  useEffect(() => {
    loadUserData();
    loadTransactionHistory();
    
    // Initialize animations
    fadeIn.value = withTiming(1, { duration: 600 });
    slideUp.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserStats({
          totalSessions: userData.total_sessions || 0,
          totalSpent: userData.total_spent || 0,
          averageSessionTime: userData.average_session_time || 0,
          joinDate: userData.created_at,
          minutesBalance: userData.minutes_balance || 0,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    if (!user?.id) return;
    
    try {
      await dispatch(getUserTransactions({ userPhone: user.id, limitCount: 5 }));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone || phone.length < 8) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('504') && cleaned.length === 11) {
      return `+504 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateMembershipDays = () => {
    if (!userStats?.joinDate) return 0;
    const joinDate = new Date(userStats.joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: '¡Descarga PaRKING! La app más fácil para pagar estacionamiento por minutos en Honduras. 🚗🎯',
        title: 'PaRKING - Estacionamiento Inteligente',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              Alert.alert(
                'Error',
                'Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Soporte Técnico',
      'Contáctanos para cualquier problema o consulta:\n\nTeléfono: +504 9999-9999\nEmail: soporte@parking.com\nWhatsApp: +504 9999-9999',
      [
        { text: 'Cerrar' },
        { text: 'Llamar', onPress: () => {/* Implementar llamada */} }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. Se eliminarán todos tus datos y historial.\n\n¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Contacta Soporte',
              'Para eliminar tu cuenta, por favor contacta a nuestro equipo de soporte.',
              [{ text: 'Entendido' }]
            );
          },
        },
      ]
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <LinearGradient
          colors={['#2563eb', '#1d4ed8']}
          style={styles.loadingContainer}
        >
          <LoadingSpinner size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  const membershipDays = calculateMembershipDays();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Seamless Header with User Info */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8', '#1e40af']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <TouchableOpacity onPress={handleShareApp} style={styles.shareButton}>
              <Ionicons name="share" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile Card in Header */}
        <View style={styles.userProfileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#2563eb" />
          </View>
          <View style={styles.userInfoHeader}>
            <Text style={styles.userName}>Usuario PaRKING</Text>
            <Text style={styles.userPhone}>
              {formatPhoneNumber(user?.phone || user?.id)}
            </Text>
            <Text style={styles.userMembership}>
              Miembro desde hace {membershipDays} días
            </Text>
          </View>
          <View style={styles.balanceDisplay}>
            <Text style={styles.balanceLabel}>Saldo actual</Text>
            <Text style={styles.balanceValue}>{userStats?.minutesBalance || 0} min</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AnimatedView style={[styles.content, animatedStyle]}>
          {/* Statistics Grid */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Tu actividad</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#059669' }]}>
                  <Ionicons name="time" size={24} color="white" />
                </View>
                <Text style={styles.statValue}>{userStats?.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Sesiones totales</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#f59e0b' }]}>
                  <Ionicons name="trending-up" size={24} color="white" />
                </View>
                <Text style={styles.statValue}>L{(userStats?.totalSpent || 0).toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total gastado</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="speedometer" size={24} color="white" />
              </View>
              <Text style={styles.statValue}>{Math.round(userStats?.averageSessionTime || 0)} min</Text>
              <Text style={styles.statLabel}>Promedio por sesión</Text>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.sectionLink}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            
            {userTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {userTransactions.slice(0, 3).map((transaction, index) => (
                  <View key={transaction.id || index} style={styles.transactionCard}>
                    <View style={styles.transactionIcon}>
                      <Ionicons name="add-circle" size={20} color="#059669" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>
                        +{transaction.minutes_purchased} minutos
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      L{transaction.amount_paid}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>Sin transacciones aún</Text>
                <Text style={styles.emptySubtext}>
                  Tus compras de minutos aparecerán aquí
                </Text>
              </View>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración</Text>
            
            <View style={styles.settingsList}>
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => navigation.navigate('History')}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconWrapper, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="time" size={20} color="#2563eb" />
                  </View>
                  <Text style={styles.settingText}>Historial completo</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={handleShareApp}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconWrapper, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="share" size={20} color="#059669" />
                  </View>
                  <Text style={styles.settingText}>Compartir PaRKING</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={handleSupport}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconWrapper, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="help-circle" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.settingText}>Soporte técnico</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, styles.dangerItem]} 
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconWrapper, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="trash" size={20} color="#dc2626" />
                  </View>
                  <Text style={[styles.settingText, { color: '#dc2626' }]}>
                    Eliminar cuenta
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out" size={24} color="#dc2626" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerContent: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // User Profile in Header
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoHeader: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  userMembership: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  balanceDisplay: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 24,
    paddingTop: 0,
    marginTop: -20,
  },
  
  // Statistics
  statsContainer: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  
  // Transactions
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: -0.2,
  },
  
  // Empty State
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Settings
  settingsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    marginTop: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    letterSpacing: -0.1,
  },
});

export default ProfileScreen;