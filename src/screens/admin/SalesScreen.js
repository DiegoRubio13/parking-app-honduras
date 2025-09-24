import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  Share,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

/**
 * SalesScreen - Gestión completa de ventas y transacciones
 * Incluye lista de transacciones, agregar saldo manual, filtros y reportes
 */
const SalesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    todayCount: 0,
    topPaymentMethod: '',
  });

  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Estados para agregar saldo manual
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [addBalanceData, setAddBalanceData] = useState({
    phone: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  });
  const [addingBalance, setAddingBalance] = useState(false);

  // Cargar datos de ventas
  const loadSalesData = useCallback(async () => {
    try {
      // Simulación de carga de datos - en producción vendría de Firebase/API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTransactions = [
        {
          id: '1',
          userId: 'user1',
          userPhone: '+504 9876-5432',
          userName: 'María González',
          amount: 500,
          minutes: 250,
          paymentMethod: 'cash',
          type: 'recharge',
          status: 'completed',
          date: new Date(2024, 11, 7, 10, 30),
          notes: 'Recarga manual - efectivo',
          adminId: 'admin1',
        },
        {
          id: '2',
          userId: 'user2',
          userPhone: '+504 8765-4321',
          userName: 'Carlos Ruiz',
          amount: 300,
          minutes: 150,
          paymentMethod: 'transfer',
          type: 'recharge',
          status: 'completed',
          date: new Date(2024, 11, 7, 9, 15),
          notes: 'Transferencia Banco Atlántida',
        },
        {
          id: '3',
          userId: 'user3',
          userPhone: '+504 7654-3210',
          userName: 'Ana López',
          amount: 200,
          minutes: 100,
          paymentMethod: 'card',
          type: 'recharge',
          status: 'completed',
          date: new Date(2024, 11, 7, 8, 45),
          notes: 'Tarjeta Visa terminada en 1234',
        },
        {
          id: '4',
          userId: 'user4',
          userPhone: '+504 6543-2109',
          userName: 'José Martínez',
          amount: 1000,
          minutes: 500,
          paymentMethod: 'cash',
          type: 'recharge',
          status: 'completed',
          date: new Date(2024, 11, 6, 16, 20),
          notes: 'Recarga manual - efectivo',
          adminId: 'admin1',
        },
        {
          id: '5',
          userId: 'user5',
          userPhone: '+504 5432-1098',
          userName: 'Lucía Hernández',
          amount: 750,
          minutes: 375,
          paymentMethod: 'transfer',
          type: 'recharge',
          status: 'pending',
          date: new Date(2024, 11, 7, 11, 0),
          notes: 'Pendiente verificación transferencia',
        },
      ];

      const mockSummary = {
        todayTotal: 1000,
        weekTotal: 5500,
        monthTotal: 25000,
        todayCount: 4,
        topPaymentMethod: 'Efectivo (45%)',
      };

      setTransactions(mockTransactions);
      setSalesSummary(mockSummary);
      filterTransactions(mockTransactions, searchQuery, selectedDateRange, selectedPaymentMethod);

    } catch (error) {
      console.error('Error loading sales data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de ventas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedDateRange, selectedPaymentMethod]);

  // Filtrar transacciones
  const filterTransactions = (transactionsList, query, dateRange, paymentMethod) => {
    let filtered = [...transactionsList];

    // Filtro por búsqueda (teléfono o nombre)
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.userPhone.toLowerCase().includes(lowerQuery) ||
        transaction.userName.toLowerCase().includes(lowerQuery)
      );
    }

    // Filtro por fecha
    const now = new Date();
    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(transaction => new Date(transaction.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = filtered.filter(transaction => new Date(transaction.date) >= monthAgo);
        break;
    }

    // Filtro por método de pago
    if (paymentMethod !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === paymentMethod);
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  };

  // Función de recarga
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSalesData();
  }, [loadSalesData]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  // Actualizar filtros cuando cambien los parámetros
  useEffect(() => {
    filterTransactions(transactions, searchQuery, selectedDateRange, selectedPaymentMethod);
  }, [transactions, searchQuery, selectedDateRange, selectedPaymentMethod]);

  // Agregar saldo manualmente
  const handleAddBalance = async () => {
    if (!addBalanceData.phone || !addBalanceData.amount) {
      Alert.alert('Error', 'Teléfono y monto son obligatorios');
      return;
    }

    try {
      setAddingBalance(true);

      // Simulación de agregar saldo - en producción sería llamada a Firebase/API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newTransaction = {
        id: Date.now().toString(),
        userId: 'manual_user',
        userPhone: addBalanceData.phone,
        userName: 'Usuario Manual',
        amount: parseFloat(addBalanceData.amount),
        minutes: parseFloat(addBalanceData.amount) * 0.5, // 1 Lempira = 0.5 minutos
        paymentMethod: addBalanceData.paymentMethod,
        type: 'recharge',
        status: 'completed',
        date: new Date(),
        notes: addBalanceData.notes || 'Recarga manual',
        adminId: 'current_admin',
      };

      // Actualizar estado local
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);

      // Limpiar formulario y cerrar modal
      setAddBalanceData({
        phone: '',
        amount: '',
        paymentMethod: 'cash',
        notes: '',
      });
      setShowAddBalanceModal(false);

      Alert.alert('Éxito', 'Saldo agregado correctamente');

    } catch (error) {
      console.error('Error adding balance:', error);
      Alert.alert('Error', 'No se pudo agregar el saldo');
    } finally {
      setAddingBalance(false);
    }
  };

  // Exportar reporte de ventas
  const exportSalesReport = async () => {
    try {
      const reportData = {
        dateRange: selectedDateRange,
        totalTransactions: filteredTransactions.length,
        totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
        transactions: filteredTransactions,
      };

      const reportText = `
REPORTE DE VENTAS PARKING
========================

Período: ${selectedDateRange === 'today' ? 'Hoy' : selectedDateRange === 'week' ? 'Esta semana' : 'Este mes'}
Total transacciones: ${reportData.totalTransactions}
Monto total: L. ${reportData.totalAmount.toFixed(2)}

TRANSACCIONES:
${filteredTransactions.map(t => 
  `${t.date.toLocaleDateString()} - ${t.userName} (${t.userPhone}) - L.${t.amount} - ${t.paymentMethod}`
).join('\n')}
      `;

      await Share.share({
        message: reportText,
        title: 'Reporte de Ventas PaRKING',
      });

    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'No se pudo exportar el reporte');
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
    }).format(amount);
  };

  // Renderizar tarjeta de transacción
  const renderTransaction = ({ item }) => {
    const statusColors = {
      completed: Colors.success[500],
      pending: Colors.warning[500],
      failed: Colors.error[500],
    };

    const paymentMethodLabels = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      card: 'Tarjeta',
    };

    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionUser}>{item.userName}</Text>
            <Text style={styles.transactionPhone}>{item.userPhone}</Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={styles.transactionAmountText}>
              {formatCurrency(item.amount)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
              <Text style={styles.statusText}>
                {item.status === 'completed' ? 'Completado' : 
                 item.status === 'pending' ? 'Pendiente' : 'Fallido'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.transactionDetail}>
            <Text style={styles.detailLabel}>Minutos:</Text>
            <Text style={styles.detailValue}>{item.minutes}</Text>
          </View>
          <View style={styles.transactionDetail}>
            <Text style={styles.detailLabel}>Método:</Text>
            <Text style={styles.detailValue}>{paymentMethodLabels[item.paymentMethod]}</Text>
          </View>
          <View style={styles.transactionDetail}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>
              {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {item.notes && (
          <View style={styles.transactionNotes}>
            <Text style={styles.notesLabel}>Notas:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </Card>
    );
  };

  // Renderizar resumen de ventas
  const renderSalesSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resumen de Ventas</Text>
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Hoy</Text>
          <Text style={styles.summaryValue}>{formatCurrency(salesSummary.todayTotal)}</Text>
          <Text style={styles.summarySubtext}>{salesSummary.todayCount} transacciones</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Esta Semana</Text>
          <Text style={styles.summaryValue}>{formatCurrency(salesSummary.weekTotal)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Este Mes</Text>
          <Text style={styles.summaryValue}>{formatCurrency(salesSummary.monthTotal)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Método Top</Text>
          <Text style={styles.summaryValueSmall}>{salesSummary.topPaymentMethod}</Text>
        </Card>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
        
        {/* Top Safe Area with Primary Color */}
        <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
        
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Cargando ventas...</Text>
        </View>
        
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
      
      {/* Top Safe Area with Primary Color */}
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
      
      <View style={styles.contentContainer}>
      {/* Header con acciones */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="car-outline" size={24} color="white" />
          <Text style={styles.title}>Gestión de Ventas</Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="Agregar Saldo"
            variant="primary"
            size="small"
            onPress={() => setShowAddBalanceModal(true)}
            style={styles.headerButton}
          />
          <Button
            title="Exportar"
            variant="outline"
            size="small"
            onPress={exportSalesReport}
            style={styles.headerButton}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen de ventas */}
        {renderSalesSummary()}

        {/* Filtros y búsqueda */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Buscar por teléfono o nombre..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <Button
              title="Filtros"
              variant={showFilters ? 'primary' : 'outline'}
              size="small"
              onPress={() => setShowFilters(!showFilters)}
            />
          </View>

          {showFilters && (
            <Card style={styles.filtersCard}>
              <Text style={styles.filtersTitle}>Filtros</Text>
              
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Período:</Text>
                <View style={styles.filterButtons}>
                  {[
                    { key: 'today', label: 'Hoy' },
                    { key: 'week', label: 'Semana' },
                    { key: 'month', label: 'Mes' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterButton,
                        selectedDateRange === item.key && styles.filterButtonActive
                      ]}
                      onPress={() => setSelectedDateRange(item.key)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedDateRange === item.key && styles.filterButtonTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Método de Pago:</Text>
                <View style={styles.filterButtons}>
                  {[
                    { key: 'all', label: 'Todos' },
                    { key: 'cash', label: 'Efectivo' },
                    { key: 'transfer', label: 'Transferencia' },
                    { key: 'card', label: 'Tarjeta' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterButton,
                        selectedPaymentMethod === item.key && styles.filterButtonActive
                      ]}
                      onPress={() => setSelectedPaymentMethod(item.key)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedPaymentMethod === item.key && styles.filterButtonTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Lista de transacciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Transacciones ({filteredTransactions.length})
          </Text>
          
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No hay transacciones que mostrar</Text>
                <Text style={styles.emptySubtext}>
                  Ajusta los filtros o agrega nuevas recargas
                </Text>
              </Card>
            }
          />
        </View>

        {/* Espacio inferior */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal para agregar saldo */}
      <Modal
        visible={showAddBalanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddBalanceModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[50]} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Saldo Manual</Text>
            <Button
              title="Cancelar"
              variant="ghost"
              size="small"
              onPress={() => setShowAddBalanceModal(false)}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Número de Teléfono"
              placeholder="+504 0000-0000"
              value={addBalanceData.phone}
              onChangeText={(text) => setAddBalanceData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />

            <Input
              label="Monto (Lempiras)"
              placeholder="0.00"
              value={addBalanceData.amount}
              onChangeText={(text) => setAddBalanceData(prev => ({ ...prev, amount: text }))}
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>Método de Pago</Text>
            <View style={styles.paymentMethods}>
              {[
                { key: 'cash', label: 'Efectivo' },
                { key: 'transfer', label: 'Transferencia' },
                { key: 'card', label: 'Tarjeta' },
              ].map(method => (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.paymentMethodButton,
                    addBalanceData.paymentMethod === method.key && styles.paymentMethodButtonActive
                  ]}
                  onPress={() => setAddBalanceData(prev => ({ ...prev, paymentMethod: method.key }))}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    addBalanceData.paymentMethod === method.key && styles.paymentMethodTextActive
                  ]}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Notas (opcional)"
              placeholder="Información adicional..."
              value={addBalanceData.notes}
              onChangeText={(text) => setAddBalanceData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />

            {addBalanceData.amount && (
              <Card style={styles.previewCard}>
                <Text style={styles.previewTitle}>Vista Previa</Text>
                <Text style={styles.previewText}>
                  Monto: {formatCurrency(parseFloat(addBalanceData.amount) || 0)}
                </Text>
                <Text style={styles.previewText}>
                  Minutos: {Math.floor((parseFloat(addBalanceData.amount) || 0) * 0.5)}
                </Text>
              </Card>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={addingBalance ? "Procesando..." : "Agregar Saldo"}
              onPress={handleAddBalance}
              loading={addingBalance}
              disabled={!addBalanceData.phone || !addBalanceData.amount}
              style={styles.modalButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
      </View>
      
      {/* Bottom Safe Area with Background Color */}
      <View style={[styles.bottomSafeArea, { height: insets.bottom, backgroundColor: Colors.neutral[50] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[600], // Mismo color que el header para el SafeArea
  },
  topSafeArea: {
    backgroundColor: Colors.primary[600],
  },
  bottomSafeArea: {
    backgroundColor: Colors.neutral[50],
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[600],
    letterSpacing: -0.2,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: Colors.primary[600],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -1,
    shadowColor: Colors.primary[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral[0],
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  summaryCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[600],
    marginBottom: 2,
  },
  summaryValueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 11,
    color: Colors.neutral[500],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
  },
  filtersCard: {
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    margin: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  filterButtonTextActive: {
    color: Colors.neutral[0],
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  transactionPhone: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success[600],
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.neutral[0],
  },
  transactionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  transactionDetail: {
    flexDirection: 'row',
    marginRight: 16,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  transactionNotes: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: Colors.neutral[600],
    fontStyle: 'italic',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginBottom: 8,
    marginTop: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  paymentMethodButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    margin: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  paymentMethodButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  paymentMethodTextActive: {
    color: Colors.neutral[0],
  },
  previewCard: {
    backgroundColor: Colors.info[50],
    borderColor: Colors.info[200],
    borderWidth: 1,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.info[800],
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: Colors.info[700],
    marginBottom: 4,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  modalButton: {
    width: '100%',
  },
  bottomSpace: {
    height: 30,
  },
});

export default SalesScreen;