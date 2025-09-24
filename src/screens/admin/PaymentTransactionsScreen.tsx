import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { 
  getPendingTransactions, 
  confirmTransaction, 
  rejectTransaction,
  PaymentTransaction,
  getAllTransactions 
} from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';

interface PaymentTransactionsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

export const PaymentTransactionsScreen: React.FC<PaymentTransactionsScreenProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const [pendingTransactions, setPendingTransactions] = useState<PaymentTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<PaymentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const [pending, all] = await Promise.all([
        getPendingTransactions(),
        getAllTransactions()
      ]);
      setPendingTransactions(pending);
      setAllTransactions(all.slice(0, 50)); // Limit to 50 recent transactions
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, []);

  const handleConfirmTransaction = async (transactionId: string) => {
    if (!userData?.uid) return;

    Alert.alert(
      'Confirmar Transacción',
      '¿Estás seguro de que deseas confirmar esta transacción? Los minutos se agregarán al saldo del usuario.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            const result = await confirmTransaction(transactionId, userData.uid);
            if (result.success) {
              Alert.alert('Éxito', 'Transacción confirmada exitosamente');
              await loadTransactions();
            } else {
              Alert.alert('Error', result.error || 'Error confirmando transacción');
            }
          }
        }
      ]
    );
  };

  const handleRejectTransaction = async (transactionId: string) => {
    if (!userData?.uid) return;

    Alert.alert(
      'Rechazar Transacción',
      '¿Estás seguro de que deseas rechazar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rechazar', 
          style: 'destructive',
          onPress: async () => {
            const result = await rejectTransaction(transactionId, userData.uid);
            if (result.success) {
              Alert.alert('Éxito', 'Transacción rechazada');
              await loadTransactions();
            } else {
              Alert.alert('Error', result.error || 'Error rechazando transacción');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'failed': return theme.colors.error;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Rechazada';
      default: return status;
    }
  };

  const TransactionCard = ({ transaction }: { transaction: PaymentTransaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionUser}>
          <Text style={styles.transactionUserName}>{transaction.userName}</Text>
          <Text style={styles.transactionUserPhone}>{transaction.userPhone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
          <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Paquete:</Text>
          <Text style={styles.transactionValue}>{transaction.minutes} minutos</Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Monto:</Text>
          <Text style={styles.transactionValue}>L{transaction.amount}</Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Método:</Text>
          <Text style={styles.transactionValue}>
            {transaction.method === 'transfer' ? 'Transferencia' : 
             transaction.method === 'cash' ? 'Efectivo' : 'Tarjeta'}
          </Text>
        </View>
        {transaction.reference && (
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Referencia:</Text>
            <Text style={styles.transactionValue}>{transaction.reference}</Text>
          </View>
        )}
        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Fecha:</Text>
          <Text style={styles.transactionValue}>{formatDate(transaction.createdAt)}</Text>
        </View>
      </View>

      {transaction.status === 'pending' && (
        <View style={styles.transactionActions}>
          <Button
            title="Confirmar"
            onPress={() => handleConfirmTransaction(transaction.id)}
            variant="primary"
            size="sm"
            style={styles.confirmButton}
          />
          <Button
            title="Rechazar"
            onPress={() => handleRejectTransaction(transaction.id)}
            variant="outline"
            size="sm"
            style={styles.rejectButton}
            textStyle={{ color: theme.colors.error }}
          />
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    const transactions = activeTab === 'pending' ? pendingTransactions : allTransactions;
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando transacciones...</Text>
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="receipt-outline" 
            size={64} 
            color={theme.colors.text.muted} 
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'pending' ? 'No hay transacciones pendientes' : 'No hay transacciones'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'pending' 
              ? 'Todas las transacciones están procesadas'
              : 'Aún no se han realizado transacciones'
            }
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </ScrollView>
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#7c2d12', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transacciones</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pendientes ({pendingTransactions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Todas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {renderContent()}
      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium as any,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold as any,
  },
  transactionsList: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  transactionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  transactionUser: {
    flex: 1,
  },
  transactionUserName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  transactionUserPhone: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
  },
  transactionDetails: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  transactionValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    flex: 1,
    borderColor: theme.colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default PaymentTransactionsScreen;