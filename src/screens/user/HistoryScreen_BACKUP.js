import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, LoadingSpinner, InfoCard } from '../../components/shared';
import { getUserSessions } from '../../store/sessionSlice';
import { getUserTransactions } from '../../store/purchaseSlice';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

/**
 * Professional History Screen for PaRKING App
 * Displays user sessions history with filters and export functionality
 */
const HistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userSessions, isLoading } = useSelector((state) => state.session);
  const { userTransactions } = useSelector((state) => state.purchase);
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'purchases'
  const [refreshing, setRefreshing] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    loadHistoryData();
  }, [user]);

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
    await loadHistoryData();
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

  const getSessionStatusInfo = (session) => {
    switch (session.status) {
      case 'completed':
        return {
          icon: 'checkmark-circle',
          color: Colors.success[600],
          text: 'Completada',
        };
      case 'active':
        return {
          icon: 'time',
          color: Colors.info[600],
          text: 'Activa',
        };
      case 'completed_insufficient_balance':
        return {
          icon: 'alert-circle',
          color: Colors.warning[600],
          text: 'Saldo insuficiente',
        };
      default:
        return {
          icon: 'help-circle',
          color: Colors.neutral[500],
          text: 'Desconocida',
        };
    }
  };

  const renderSessionItem = ({ item: session }) => {
    const statusInfo = getSessionStatusInfo(session);
    
    return (
      <Card style={styles.historyItem}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Ionicons name="car" size={20} color={Colors.primary[600]} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Sesión de Estacionamiento</Text>
            <Text style={styles.itemSubtitle}>
              {formatDateTime(session.entry_time)}
            </Text>
          </View>
          <View style={styles.statusBadge}>
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
    );
  };

  const renderTransactionItem = ({ item: transaction }) => {
    return (
      <Card style={styles.historyItem}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: Colors.success[100] }]}>
            <Ionicons name="add-circle" size={20} color={Colors.success[600]} />
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
    );
  };

  const renderEmptyState = () => {
    const isSessionsTab = activeTab === 'sessions';
    
    return (
      <InfoCard style={styles.emptyState}>
        <Ionicons 
          name={isSessionsTab ? "car-outline" : "card-outline"} 
          size={48} 
          color={Colors.neutral[400]} 
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
    );
  };

  const currentData = activeTab === 'sessions' 
    ? getFilteredData(userSessions || []) 
    : getFilteredData(userTransactions || []);

  return (
    <View style={styles.container}>
      <View style={[styles.topSafeArea, { height: insets.top }]} />
      {/* Header */}
      <View style={styles.header}>
        <Button
          onPress={() => navigation.goBack()}
          variant="ghost"
          leftIcon={<Ionicons name="arrow-back" size={20} color={Colors.primary[600]} />}
        />
        <Text style={styles.headerTitle}>Historial</Text>
        <Button
          onPress={exportHistoryData}
          variant="ghost"
          rightIcon={<Ionicons name="share" size={20} color={Colors.primary[600]} />}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sessions' && styles.activeTab
          ]}
          onPress={() => setActiveTab('sessions')}
        >
          <Ionicons 
            name="car" 
            size={20} 
            color={activeTab === 'sessions' ? Colors.primary[600] : Colors.neutral[500]} 
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
          onPress={() => setActiveTab('purchases')}
        >
          <Ionicons 
            name="card" 
            size={20} 
            color={activeTab === 'purchases' ? Colors.primary[600] : Colors.neutral[500]} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'purchases' && styles.activeTabText
          ]}>
            Compras ({userTransactions?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Periodo:</Text>
        {['all', 'week', 'month'].map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.filterChip,
              filterPeriod === period && styles.activeFilterChip
            ]}
            onPress={() => setFilterPeriod(period)}
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
              colors={[Colors.primary[600]]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
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
    letterSpacing: -0.2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: 24,
    paddingBottom: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[500],
    letterSpacing: -0.1,
  },
  activeTabText: {
    color: Colors.primary[600],
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    gap: 12,
  },
  filtersLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text.secondary,
    letterSpacing: -0.1,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    borderWidth: 1.5,
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
  activeFilterChip: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[400],
    shadowColor: Colors.primary[600],
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
    letterSpacing: -0.1,
  },
  activeFilterChipText: {
    color: Colors.primary[700],
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  historyItem: {
    marginBottom: 16,
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 15,
    color: Colors.light.text.secondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.success[600],
    letterSpacing: -0.2,
  },
  itemDetails: {
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: Colors.light.text.secondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text.primary,
    letterSpacing: -0.1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    marginTop: 40,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: Colors.neutral[0],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text.secondary,
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text.disabled,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.7,
    fontWeight: '500',
  },
});

export default HistoryScreen;