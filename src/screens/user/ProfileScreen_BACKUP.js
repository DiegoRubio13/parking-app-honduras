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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc } from 'firebase/firestore';
import { Button, Card, LoadingSpinner } from '../../components/shared';
import { logoutUser } from '../../store/authSlice';
import { getUserTransactions } from '../../store/purchaseSlice';
import Colors from '../../constants/colors';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';

const { width } = Dimensions.get('window');

/**
 * Professional Profile Screen for PaRKING App
 * Displays user information, statistics, and settings
 */
const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userTransactions } = useSelector((state) => state.purchase);
  const insets = useSafeAreaInsets();
  
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    totalSpent: 0,
    averageSessionTime: 0,
    joinDate: null,
    minutesBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadTransactionHistory();
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
    // Convert 50412345678 to +504 1234-5678
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
    if (!userStats.joinDate) return 0;
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: '#ffffff' }]} />
        <LoadingSpinner size="large" showOverlay />
        <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
      </View>
    );
  }

  const membershipDays = calculateMembershipDays();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: '#ffffff' }]} />
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <Button
          onPress={handleShareApp}
          variant="ghost"
          rightIcon={<Ionicons name="share" size={20} color={Colors.primary[600]} />}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={Colors.primary[600]} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Usuario PaRKING</Text>
              <Text style={styles.userPhone}>
                {formatPhoneNumber(user?.phone || user?.id)}
              </Text>
              <Text style={styles.userMembership}>
                Miembro desde hace {membershipDays} días
              </Text>
            </View>
          </View>
        </Card>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="wallet" size={24} color={Colors.success[600]} />
            </View>
            <Text style={styles.statValue}>{userStats.minutesBalance}</Text>
            <Text style={styles.statLabel}>Minutos disponibles</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={24} color={Colors.info[600]} />
            </View>
            <Text style={styles.statValue}>{userStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sesiones totales</Text>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="trending-up" size={24} color={Colors.warning[600]} />
            </View>
            <Text style={styles.statValue}>L{userStats.totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total gastado</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="speedometer" size={24} color={Colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{Math.round(userStats.averageSessionTime)}min</Text>
            <Text style={styles.statLabel}>Promedio por sesión</Text>
          </Card>
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
                <Card key={transaction.id || index} style={styles.transactionCard}>
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionIcon}>
                      <Ionicons name="add-circle" size={20} color={Colors.success[600]} />
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
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>Sin transacciones aún</Text>
              <Text style={styles.emptySubtext}>
                Tus compras de minutos aparecerán aquí
              </Text>
            </Card>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('History')}>
              <View style={styles.settingLeft}>
                <Ionicons name="time" size={20} color={Colors.neutral[600]} />
                <Text style={styles.settingText}>Historial completo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleShareApp}>
              <View style={styles.settingLeft}>
                <Ionicons name="share" size={20} color={Colors.neutral[600]} />
                <Text style={styles.settingText}>Compartir PaRKING</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleSupport}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle" size={20} color={Colors.neutral[600]} />
                <Text style={styles.settingText}>Soporte técnico</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <View style={styles.settingsList}>
            <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <Ionicons name="trash" size={20} color={Colors.error[600]} />
                <Text style={[styles.settingText, { color: Colors.error[600] }]}>Eliminar cuenta</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.error[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="outline"
          leftIcon={<Ionicons name="log-out" size={20} color={Colors.error[600]} />}
          style={[styles.logoutButton, { borderColor: Colors.error[300] }]}
          textStyle={{ color: Colors.error[600] }}
        />
      </ScrollView>
      <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  topSafeArea: {
    backgroundColor: Colors.neutral[0],
  },
  bottomSafeArea: {
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.neutral[0],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    marginBottom: 32,
    borderRadius: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: Colors.neutral[0],
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary[200],
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  userPhone: {
    fontSize: 15,
    color: Colors.light.text.secondary,
    fontFamily: 'monospace',
    marginBottom: 6,
    fontWeight: '500',
  },
  userMembership: {
    fontSize: 13,
    color: Colors.success[600],
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    backgroundColor: Colors.neutral[0],
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text.primary,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  section: {
    marginTop: 32,
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
    color: Colors.light.text.primary,
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor: Colors.neutral[0],
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success[200],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.light.text.secondary,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success[600],
    letterSpacing: -0.2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text.secondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.text.disabled,
    textAlign: 'center',
  },
  settingsList: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingText: {
    fontSize: 17,
    color: Colors.light.text.primary,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  logoutButton: {
    marginTop: 40,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
  },
});

export default ProfileScreen;