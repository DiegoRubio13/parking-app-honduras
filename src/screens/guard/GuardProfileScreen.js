import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../../store/authSlice';
import { getActiveSessions } from '../../store/sessionSlice';
import Colors from '../../constants/colors';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';

const { width: screenWidth } = Dimensions.get('window');

/**
 * GuardProfileScreen - Pantalla de perfil del guardia
 * Muestra estadísticas del turno y opciones de configuración
 */
const GuardProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeSessions } = useSelector((state) => state.session);
  
  const [shiftStartTime] = useState(new Date());
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const [shiftStats, setShiftStats] = useState({
    scansCount: 0,
    entriesCount: 0,
    exitsCount: 0,
  });

  useEffect(() => {
    // Cargar sesiones activas
    dispatch(getActiveSessions());
    
    // Simular estadísticas del turno
    const interval = setInterval(() => {
      setShiftStats(prev => ({
        scansCount: prev.scansCount + Math.floor(Math.random() * 2),
        entriesCount: prev.entriesCount + Math.floor(Math.random() * 1),
        exitsCount: prev.exitsCount + Math.floor(Math.random() * 1),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getShiftDuration = () => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - shiftStartTime) / 60000);
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };
  
  const getCurrentShift = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 6 && hour < 14) return 'Mañana (06:00 - 14:00)';
    if (hour >= 14 && hour < 22) return 'Tarde (14:00 - 22:00)';
    return 'Noche (22:00 - 06:00)';
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Hubo un problema al cerrar sesión.');
            }
          }
        }
      ]
    );
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  return (
    <View style={styles.container}>
      {/* Top Safe Area */}
      <View style={[styles.topSafeArea, { height: insets.top }]} />
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert('Configuración', 'Próximamente disponible')}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.primary[600]} />
        </TouchableOpacity>
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
              <Ionicons name="shield-checkmark" size={40} color={Colors.primary[600]} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Guardia de Seguridad</Text>
              <Text style={styles.userPhone}>ID: GUARD_{user?.id || '001'}</Text>
              <Text style={styles.userShift}>{getCurrentShift()}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>ACTIVO</Text>
            </View>
          </View>
        </Card>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={24} color={Colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{getShiftDuration()}</Text>
            <Text style={styles.statLabel}>Duración del turno</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="qr-code" size={24} color={Colors.info[600]} />
            </View>
            <Text style={styles.statValue}>{shiftStats.scansCount}</Text>
            <Text style={styles.statLabel}>QRs escaneados</Text>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="enter" size={24} color={Colors.success[600]} />
            </View>
            <Text style={styles.statValue}>{shiftStats.entriesCount}</Text>
            <Text style={styles.statLabel}>Entradas</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="exit" size={24} color={Colors.warning[600]} />
            </View>
            <Text style={styles.statValue}>{shiftStats.exitsCount}</Text>
            <Text style={styles.statLabel}>Salidas</Text>
          </Card>
        </View>

        {/* Current Status Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estado Actual</Text>
          </View>
          
          <View style={styles.statusCards}>
            <Card style={styles.statusCard}>
              <View style={styles.statusIcon}>
                <Ionicons name="people" size={20} color={Colors.success[600]} />
              </View>
              <Text style={styles.statusValue}>{activeSessions?.length || 0}</Text>
              <Text style={styles.statusLabel}>Usuarios dentro</Text>
            </Card>
            
            <Card style={styles.statusCard}>
              <View style={styles.statusIcon}>
                <Ionicons name="warning" size={20} color={Colors.warning[600]} />
              </View>
              <Text style={[styles.statusValue, { color: Colors.warning[600] }]}>
                {Math.floor(Math.random() * 5)}
              </Text>
              <Text style={styles.statusLabel}>Alertas</Text>
            </Card>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleScanQR}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="qr-code" size={24} color={Colors.primary[600]} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Escanear Código QR</Text>
              <Text style={styles.quickActionSubtitle}>Registrar entrada o salida de usuarios</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="analytics" size={24} color={Colors.info[600]} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Ver Dashboard</Text>
              <Text style={styles.quickActionSubtitle}>Monitorear usuarios activos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color={Colors.neutral[600]} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Notificaciones</Text>
                  <Text style={styles.settingDescription}>Recibir alertas y notificaciones</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.neutral[300], true: Colors.primary[200] }}
                thumbColor={notifications ? Colors.primary[600] : Colors.neutral[400]}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="refresh" size={20} color={Colors.neutral[600]} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingText}>Auto-actualizar</Text>
                  <Text style={styles.settingDescription}>Actualizar datos automáticamente</Text>
                </View>
              </View>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                trackColor={{ false: Colors.neutral[300], true: Colors.primary[200] }}
                thumbColor={autoRefresh ? Colors.primary[600] : Colors.neutral[400]}
              />
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  topSafeArea: {
    backgroundColor: Colors.light.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.surface,
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // User Card
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
  userShift: {
    fontSize: 13,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: Colors.success[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.success[500],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral[0],
    letterSpacing: 0.5,
  },
  
  // Statistics Grid
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
  
  // Sections
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text.primary,
    letterSpacing: -0.2,
  },
  
  // Status Cards
  statusCards: {
    flexDirection: 'row',
    gap: 16,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.success[600],
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  statusLabel: {
    fontSize: 13,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Quick Actions
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    fontWeight: '500',
  },
  
  // Settings
  settingsList: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
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
    flex: 1,
  },
  settingInfo: {
    marginLeft: 16,
  },
  settingText: {
    fontSize: 17,
    color: Colors.light.text.primary,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  
  // Logout Button
  logoutButton: {
    marginTop: 40,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
  },
});

export default GuardProfileScreen;