import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getActiveSessions, endParkingSession, updateActiveSessionTime } from '../../store/sessionSlice';
import Colors from '../../constants/colors';
import { Button, Card } from '../../components/shared';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'low_balance', 'overtime'
  const [selectedUser, setSelectedUser] = useState(null);
  
  const dispatch = useDispatch();
  const { activeSessions, isLoading } = useSelector(state => state.session);
  const { user: currentGuard } = useSelector(state => state.auth);
  
  // Auto-refresh every 30 seconds
  const intervalRef = useRef(null);
  
  useEffect(() => {
    loadActiveSessions();
    
    // Set up auto-refresh
    intervalRef.current = setInterval(() => {
      loadActiveSessions();
    }, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const loadActiveSessions = async () => {
    try {
      // Use the new real-time update function
      await dispatch(updateActiveSessionTime()).unwrap();
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Fallback to basic session loading
      try {
        await dispatch(getActiveSessions()).unwrap();
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveSessions();
    setRefreshing(false);
  };
  
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const calculateElapsedTime = (entryTime) => {
    const now = new Date();
    const entry = new Date(entryTime);
    const diffInMinutes = Math.floor((now - entry) / (1000 * 60));
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const calculateRemainingBalance = (userData, entryTime) => {
    const elapsedMinutes = Math.floor((new Date() - new Date(entryTime)) / (1000 * 60));
    return Math.max(0, (userData.minutes_balance || 0) - elapsedMinutes);
  };
  
  const handleEmergencyExit = (session) => {
    Alert.alert(
      'Salida de Emergencia',
      `¿Confirmar salida manual para el usuario ${session.user_phone}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Salida',
          style: 'destructive',
          onPress: () => processEmergencyExit(session)
        }
      ]
    );
  };
  
  const processEmergencyExit = async (session) => {
    try {
      await dispatch(endParkingSession({ userPhone: session.user_phone })).unwrap();
      Alert.alert('Éxito', 'Salida de emergencia procesada correctamente');
      loadActiveSessions();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo procesar la salida');
    }
  };
  
  const handleUserSearch = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setSearchText(cleanPhone);
  };
  
  const getFilteredSessions = () => {
    let filtered = activeSessions;
    
    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter(session => 
        session.user_phone.includes(searchText.trim())
      );
    }
    
    // Apply status filter
    switch (filter) {
      case 'low_balance':
        filtered = filtered.filter(session => {
          const remaining = calculateRemainingBalance(session.user_data, session.entry_time);
          return remaining <= 30; // Less than 30 minutes
        });
        break;
      case 'overtime':
        filtered = filtered.filter(session => {
          const remaining = calculateRemainingBalance(session.user_data, session.entry_time);
          return remaining <= 0; // No balance left
        });
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    return filtered;
  };
  
  const renderFilterButton = (filterKey, label, count) => {
    const isActive = filter === filterKey;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive
        ]}
        onPress={() => setFilter(filterKey)}
      >
        <Text style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive
        ]}>
          {label}
        </Text>
        <Text style={[
          styles.filterButtonCount,
          isActive && styles.filterButtonCountActive
        ]}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderUserCard = ({ item: session }) => {
    const userData = session.user_data || {};
    const elapsedTime = calculateElapsedTime(session.entry_time);
    const remainingBalance = calculateRemainingBalance(userData, session.entry_time);
    const isLowBalance = remainingBalance <= 30;
    const isOvertime = remainingBalance <= 0;
    
    const statusColor = isOvertime ? Colors.error[500] : 
                       isLowBalance ? Colors.warning[500] : 
                       Colors.success[500];
    
    const statusText = isOvertime ? 'SIN SALDO' : 
                      isLowBalance ? 'SALDO BAJO' : 
                      'ACTIVO';
    
    return (
      <Card style={styles.userCard} variant="elevated">
        <View style={styles.userCardHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userPhone}>📱 {session.user_phone}</Text>
            <Text style={styles.entryTime}>Entrada: {formatTime(session.entry_time)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.userCardBody}>
          <View style={styles.timeInfo}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Tiempo transcurrido</Text>
              <Text style={styles.timeValue}>{elapsedTime}</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Saldo restante</Text>
              <Text style={[
                styles.timeValue,
                { color: isLowBalance ? Colors.warning[600] : Colors.success[600] }
              ]}>
                {remainingBalance} min
              </Text>
            </View>
          </View>
          
          {(isLowBalance || isOvertime) && (
            <TouchableOpacity
              style={[
                styles.emergencyButton,
                { backgroundColor: isOvertime ? Colors.error[500] : Colors.warning[500] }
              ]}
              onPress={() => handleEmergencyExit(session)}
            >
              <Text style={styles.emergencyButtonText}>
                {isOvertime ? '🚨 SALIDA INMEDIATA' : '⚠️ REVISAR USUARIO'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };
  
  const filteredSessions = getFilteredSessions();
  const lowBalanceSessions = activeSessions.filter(session => {
    const remaining = calculateRemainingBalance(session.user_data, session.entry_time);
    return remaining <= 30;
  });
  const overtimeSessions = activeSessions.filter(session => {
    const remaining = calculateRemainingBalance(session.user_data, session.entry_time);
    return remaining <= 0;
  });
  
  return (
    <View style={styles.container}>
      {/* Top Safe Area */}
      <View style={[styles.topSafeArea, { height: insets.top }]} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Dashboard Guardia</Text>
              <Text style={styles.headerSubtitle}>Monitoreo en tiempo real</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>EN LÍNEA</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{activeSessions.length}</Text>
          <Text style={styles.statsLabel}>Usuarios Activos</Text>
        </View>
        <View style={[styles.statsCard, styles.warningStats]}>
          <Text style={[styles.statsValue, { color: Colors.warning[600] }]}>
            {lowBalanceSessions.length}
          </Text>
          <Text style={styles.statsLabel}>Saldo Bajo</Text>
        </View>
        <View style={[styles.statsCard, styles.errorStats]}>
          <Text style={[styles.statsValue, { color: Colors.error[600] }]}>
            {overtimeSessions.length}
          </Text>
          <Text style={styles.statsLabel}>Sin Saldo</Text>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de teléfono..."
          placeholderTextColor={Colors.light.text.disabled}
          value={searchText}
          onChangeText={handleUserSearch}
          keyboardType="numeric"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.searchClear}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todos', activeSessions.length)}
        {renderFilterButton('low_balance', 'Saldo Bajo', lowBalanceSessions.length)}
        {renderFilterButton('overtime', 'Sin Saldo', overtimeSessions.length)}
      </View>
      
      {/* Users List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        style={styles.usersList}
        contentContainerStyle={styles.usersListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary[600]]}
            tintColor={Colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏠</Text>
            <Text style={styles.emptyStateTitle}>
              {searchText.trim() ? 'Sin resultados' : 'No hay usuarios activos'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchText.trim() 
                ? 'No se encontraron usuarios con ese número'
                : 'Cuando los usuarios ingresen aparecerán aquí'
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* Auto-refresh indicator */}
      <View style={styles.autoRefreshIndicator}>
        <Text style={styles.autoRefreshText}>
          🔄 Actualiza cada 30 segundos
        </Text>
      </View>
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
  
  // Header
  header: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginTop: 2,
    letterSpacing: -0.1,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.success[200],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success[500],
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success[600],
    letterSpacing: 0.5,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  warningStats: {
    borderColor: Colors.warning[200],
    backgroundColor: Colors.warning[25] || Colors.warning[50],
  },
  errorStats: {
    borderColor: Colors.error[200],
    backgroundColor: Colors.error[25] || Colors.error[50],
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text.primary,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 13,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.light.text.primary,
    letterSpacing: -0.1,
    fontWeight: '500',
  },
  searchClear: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  searchClearText: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    fontWeight: '600',
  },
  
  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[300],
    shadowColor: Colors.primary[600],
    shadowOpacity: 0.1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text.secondary,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  filterButtonTextActive: {
    color: Colors.primary[600],
    fontWeight: '700',
  },
  filterButtonCount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text.primary,
    letterSpacing: -0.3,
  },
  filterButtonCountActive: {
    color: Colors.primary[600],
  },
  
  // Users List
  usersList: {
    flex: 1,
  },
  usersListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  userCard: {
    marginBottom: 16,
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
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userPhone: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  entryTime: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    letterSpacing: -0.1,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.neutral[0],
  },
  userCardBody: {
    gap: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.light.text.secondary,
    marginBottom: 6,
    letterSpacing: -0.1,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text.primary,
    letterSpacing: -0.2,
  },
  emergencyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[0],
    letterSpacing: -0.1,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.light.text.disabled,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.1,
    fontWeight: '500',
  },
  
  // Auto-refresh
  autoRefreshIndicator: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.primary[700],
  },
  autoRefreshText: {
    fontSize: 13,
    color: Colors.neutral[0],
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});

export default DashboardScreen;