import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Button, Card, LoadingSpinner, InfoCard } from '../../components/shared';
import { getUserSessions } from '../../store/sessionSlice';
import { getUserTransactions } from '../../store/purchaseSlice';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

/**
 * Seamless History Screen for PaRKING App
 * Displays user sessions history with filters and export functionality
 */
const HistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userSessions, isLoading } = useSelector((state) => state.session);
  const { userTransactions } = useSelector((state) => state.purchase);
  
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'purchases'
  const [refreshing, setRefreshing] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'week', 'month'

  // Animation values
  const headerOpacity = useSharedValue(1);
  const tabTranslateX = useSharedValue(0);
  const filterScale = useSharedValue(1);

  useEffect(() => {
    loadHistoryData();
  }, [user]);

  useEffect(() => {
    // Animate tab transition
    tabTranslateX.value = withSpring(activeTab === 'sessions' ? 0 : 1);
  }, [activeTab]);

  const loadHistoryData = async () => {
    if (!user?.id) return;
    
    try {
      await Promise.all([
        dispatch(getUserSessions({ userPhone: user.id, limitCount: 50 })),
        dispatch(getUserTransactions({ userPhone: user.id, limitCount: 50 }))
      ]);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    headerOpacity.value = withTiming(0.8);
    await loadHistoryData();
    headerOpacity.value = withTiming(1);
    setRefreshing(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getFilteredData = (data) => {
    if (filterPeriod === 'all') return data;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (filterPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.entry_time || item.timestamp);
      return itemDate >= filterDate;
    });
  };

  const exportHistoryData = async () => {
    try {
      filterScale.value = withSpring(0.95, undefined, () => {
        filterScale.value = withSpring(1);
      });

      const sessionsText = userSessions.map(session => 
        `Sesión: ${formatDateTime(session.entry_time)} - ${formatDuration(session.minutes_used)} - L${session.total_cost?.toFixed(2) || '0.00'}`
      ).join('\n');
      
      const transactionsText = userTransactions.map(transaction => 
        `Compra: ${formatDateTime(transaction.timestamp)} - ${transaction.minutes_purchased} min - L${transaction.amount_paid}`
      ).join('\n');
      
      const fullText = `Historial PaRKING - ${user?.phone}\n\nSESIONES:\n${sessionsText}\n\nCOMPRAS:\n${transactionsText}`;
      
      await Share.share({
        message: fullText,
        title: 'Historial PaRKING',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el historial');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (period) => {
    filterScale.value = withSpring(0.9, undefined, () => {
      filterScale.value = withSpring(1);
      runOnJS(setFilterPeriod)(period);
    });
  };

  const getSessionStatusInfo = (session) => {
    switch (session.status) {
      case 'completed':
        return {
          icon: 'checkmark-circle',
          color: '#059669',
          text: 'Completada',
        };
      case 'active':
        return {
          icon: 'time',
          color: '#0891b2',
          text: 'Activa',
        };
      case 'completed_insufficient_balance':
        return {
          icon: 'alert-circle',
          color: '#d97706',
          text: 'Saldo insuficiente',
        };
      default:
        return {
          icon: 'help-circle',
          color: '#6b7280',
          text: 'Desconocida',
        };
    }
  };

  const renderSessionItem = ({ item: session, index }) => {
    const statusInfo = getSessionStatusInfo(session);
    
    return (
      <Animated.View
        entering={FadeIn.delay(index * 100).springify()}
        exiting={FadeOut.springify()}
      >
        <Card style={styles.historyItem}>
          <View style={styles.itemHeader}>
            <View style={styles.itemIcon}>
              <Ionicons name="car" size={20} color="#ffffff" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Sesión de Estacionamiento</Text>
              <Text style={styles.itemSubtitle}>
                {formatDateTime(session.entry_time)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: statusInfo.color + '20' }]}>
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duración:</Text>
              <Text style={styles.detailValue}>
                {formatDuration(session.minutes_used || 0)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Costo:</Text>
              <Text style={styles.detailValue}>
                L{session.total_cost?.toFixed(2) || '0.00'}
              </Text>
            </View>
            {session.exit_time && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Salida:</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(session.exit_time)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderTransactionItem = ({ item: transaction, index }) => {
    return (
      <Animated.View
        entering={FadeIn.delay(index * 100).springify()}
        exiting={FadeOut.springify()}
      >
        <Card style={styles.historyItem}>
          <View style={styles.itemHeader}>
            <View style={[styles.itemIcon, styles.transactionIcon]}>
              <Ionicons name="add-circle" size={20} color="#ffffff" />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Compra de Minutos</Text>
              <Text style={styles.itemSubtitle}>
                {formatDateTime(transaction.timestamp)}
              </Text>
            </View>
            <Text style={styles.transactionAmount}>
              L{transaction.amount_paid}
            </Text>
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minutos:</Text>
              <Text style={styles.detailValue}>
                +{transaction.minutes_purchased}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Método:</Text>
              <Text style={styles.detailValue}>
                {transaction.payment_method === 'cash' ? 'Efectivo' : 
                 transaction.payment_method === 'transfer' ? 'Transferencia' : 'Otro'}
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderEmptyState = () => {
    const isSessionsTab = activeTab === 'sessions';
    
    return (
      <Animated.View entering={FadeIn.delay(300)}>
        <InfoCard style={styles.emptyState}>
          <Ionicons 
            name={isSessionsTab ? "car-outline" : "card-outline"} 
            size={48} 
            color="#9ca3af" 
          />
          <Text style={styles.emptyTitle}>
            {isSessionsTab ? 'Sin sesiones aún' : 'Sin compras aún'}
          </Text>
          <Text style={styles.emptyText}>
            {isSessionsTab 
              ? 'Tus sesiones de estacionamiento aparecerán aquí'
              : 'Tus compras de minutos aparecerán aquí'
            }
          </Text>
          <Button
            title={isSessionsTab ? 'Ir a Inicio' : 'Comprar Minutos'}
            onPress={() => navigation.navigate(isSessionsTab ? 'Home' : 'Purchase')}
            variant="outline"
            size="small"
            style={{ marginTop: 16 }}
          />
        </InfoCard>
      </Animated.View>
    );
  };

  const currentData = activeTab === 'sessions' 
    ? getFilteredData(userSessions || []) 
    : getFilteredData(userTransactions || []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const filterAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: filterScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Seamless Header with LinearGradient */}
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <LinearGradient
          colors={['#2563eb', '#1d4ed8', '#1e40af']}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Historial</Text>
            
            <TouchableOpacity
              style={styles.exportButton}
              onPress={exportHistoryData}
            >
              <Ionicons name="share" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Main Content with negative margin for seamless overlap */}
      <View style={styles.contentContainer}>
        {/* Tabs Section */}
        <Animated.View 
          style={styles.tabsSection}
          entering={SlideInDown.delay(200).springify()}
        >
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'sessions' && styles.activeTab
              ]}
              onPress={() => handleTabChange('sessions')}
            >
              <Ionicons 
                name="car" 
                size={20} 
                color={activeTab === 'sessions' ? '#2563eb' : '#6b7280'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'sessions' && styles.activeTabText
              ]}>
                Sesiones ({userSessions?.length || 0})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'purchases' && styles.activeTab
              ]}
              onPress={() => handleTabChange('purchases')}
            >
              <Ionicons 
                name="card" 
                size={20} 
                color={activeTab === 'purchases' ? '#2563eb' : '#6b7280'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'purchases' && styles.activeTabText
              ]}>
                Compras ({userTransactions?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filter Options */}
        <Animated.View style={[styles.filtersSection, filterAnimatedStyle]}>
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersLabel}>Periodo:</Text>
            {['all', 'week', 'month'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.filterChip,
                  filterPeriod === period && styles.activeFilterChip
                ]}
                onPress={() => handleFilterChange(period)}
              >
                <Text style={[
                  styles.filterChipText,
                  filterPeriod === period && styles.activeFilterChipText
                ]}>
                  {period === 'all' ? 'Todos' : period === 'week' ? 'Última semana' : 'Último mes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* History List */}
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
          </View>
        ) : (
          <FlatList
            data={currentData}
            keyExtractor={(item) => item.id || item.session_id || Math.random().toString()}
            renderItem={activeTab === 'sessions' ? renderSessionItem : renderTransactionItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    zIndex: 10,
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginTop: -24,
  },
  tabsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: -0.2,
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  filtersSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  filtersLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: -0.2,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  activeFilterChip: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: -0.1,
  },
  activeFilterChipText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  historyItem: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  transactionIcon: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  itemSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: -0.3,
  },
  itemDetails: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginTop: 40,
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.7,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});

export default HistoryScreen;