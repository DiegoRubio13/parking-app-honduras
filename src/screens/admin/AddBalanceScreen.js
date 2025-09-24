import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';
import { addMinutesToUser, MINUTE_PACKAGES } from '../../store/purchaseSlice';
import Colors from '../../constants/colors';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

/**
 * AddBalanceScreen - Formulario profesional para agregar saldo a usuarios
 * Incluye búsqueda de usuarios, paquetes predefinidos, métodos de pago y confirmación
 */
const AddBalanceScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { isLoading: purchaseLoading } = useSelector((state) => state.purchase);
  const insets = useSafeAreaInsets();
  
  // Estados principales
  const [step, setStep] = useState(1); // 1: Buscar usuario, 2: Seleccionar paquete, 3: Confirmar
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Estados de búsqueda de usuario
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);

  // Estados de paquete y pago
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  // Estados del historial de recargas
  const [recentRecharges, setRecentRecharges] = useState([
    {
      id: '1',
      userName: 'María González',
      userPhone: '+504 9876-5432',
      amount: 500,
      minutes: 250,
      method: 'cash',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    },
    {
      id: '2',
      userName: 'Carlos Ruiz',
      userPhone: '+504 8765-4321',
      amount: 300,
      minutes: 150,
      method: 'transfer',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    },
  ]);

  // Use Firebase packages
  const packages = MINUTE_PACKAGES.map(pkg => ({
    id: pkg.id,
    name: `${pkg.minutes} minutos`,
    amount: pkg.price,
    minutes: pkg.minutes,
    description: pkg.description,
    discount: pkg.discount
  }));

  // Buscar usuarios
  const searchUsers = useCallback(async (query) => {
    if (query.length < 8) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      
      // Clean phone number for search
      const phoneNumber = query.replace(/\D/g, '');
      
      // Search in Firebase users collection
      const userRef = doc(db, 'users', phoneNumber);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setSearchResults([{
          id: phoneNumber,
          name: userData.name || 'Usuario',
          phone: userData.phone || phoneNumber,
          email: userData.email || 'Sin email',
          balance: userData.minutes_balance || 0,
          totalSpent: userData.total_spent || 0,
          status: 'active',
          lastActivity: userData.last_activity ? new Date(userData.last_activity) : new Date(),
        }]);
      } else {
        setSearchResults([]);
        Alert.alert('Usuario no encontrado', 'No existe un usuario con ese número de teléfono');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setSearching(false);
    }
  }, []);

  // Procesar recarga
  const processRecharge = async () => {
    try {
      setProcessing(true);

      if (!selectedUser || !selectedPackage) {
        throw new Error('Datos incompletos para procesar la recarga');
      }

      // Use Firebase purchase system
      const result = await dispatch(addMinutesToUser({
        userPhone: selectedUser.id,
        packageId: selectedPackage.id,
        paymentMethod: paymentMethod,
        adminId: currentUser?.id || 'admin'
      })).unwrap();

      // Create new recharge record for local display
      const newRecharge = {
        id: result.transaction_id,
        userName: selectedUser.name,
        userPhone: selectedUser.phone,
        amount: result.amount_paid,
        minutes: result.minutes_purchased,
        method: result.payment_method,
        date: new Date(result.timestamp),
      };

      // Update local history
      setRecentRecharges([newRecharge, ...recentRecharges.slice(0, 4)]);

      Alert.alert(
        'Recarga Exitosa',
        `Se agregaron ${result.minutes_purchased} minutos por L.${result.amount_paid} al usuario ${selectedUser.name}\n\nNuevo saldo: ${result.user_new_balance} minutos`,
        [
          {
            text: 'Hacer Otra Recarga',
            onPress: () => resetForm(),
          },
          {
            text: 'Ver Dashboard',
            onPress: () => navigation.navigate('AdminDashboard'),
          },
        ]
      );

    } catch (error) {
      console.error('Error processing recharge:', error);
      Alert.alert('Error', 'No se pudo procesar la recarga');
    } finally {
      setProcessing(false);
    }
  };

  // Reiniciar formulario
  const resetForm = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedPackage(null);
    setCustomAmount('');
    setPaymentMethod('cash');
    setNotes('');
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
    }).format(amount);
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return date.toLocaleDateString();
  };

  // Renderizar paso 1: Buscar usuario
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Buscar Usuario</Text>
      <Text style={styles.stepSubtitle}>
        Ingresa el nombre, teléfono o email del usuario
      </Text>

      <Input
        label="Buscar Usuario"
        placeholder="Nombre, teléfono o email..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          searchUsers(text);
        }}
        style={styles.searchInput}
      />

      {searching && (
        <View style={styles.searchingContainer}>
          <LoadingSpinner size="small" />
          <Text style={styles.searchingText}>Buscando usuarios...</Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.resultsTitle}>Usuarios encontrados:</Text>
          {searchResults.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userResult}
              onPress={() => {
                setSelectedUser(user);
                setStep(2);
              }}
            >
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userPhone}>{user.phone}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.userStats}>
                <Text style={[
                  styles.userBalance,
                  user.balance < 30 && { color: Colors.warning[600] }
                ]}>
                  {user.balance} min
                </Text>
                <Text style={styles.userStatus}>
                  {user.status === 'active' ? 'Activo' : 'Suspendido'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {searchQuery.length >= 3 && searchResults.length === 0 && !searching && (
        <Card style={styles.noResultsCard}>
          <Text style={styles.noResultsText}>No se encontraron usuarios</Text>
          <Text style={styles.noResultsSubtext}>
            Verifica que los datos sean correctos
          </Text>
        </Card>
      )}
    </View>
  );

  // Renderizar paso 2: Seleccionar paquete
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seleccionar Paquete</Text>
      <Text style={styles.stepSubtitle}>
        Usuario: {selectedUser?.name} ({selectedUser?.phone})
      </Text>

      <View style={styles.packagesGrid}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              selectedPackage?.id === pkg.id && styles.packageCardSelected
            ]}
            onPress={() => setSelectedPackage(pkg)}
          >
            <Text style={[
              styles.packageName,
              selectedPackage?.id === pkg.id && styles.packageNameSelected
            ]}>
              {pkg.name}
            </Text>
            {pkg.id !== 'custom' && (
              <>
                <Text style={[
                  styles.packageAmount,
                  selectedPackage?.id === pkg.id && styles.packageAmountSelected
                ]}>
                  {formatCurrency(pkg.amount)}
                </Text>
                <Text style={[
                  styles.packageMinutes,
                  selectedPackage?.id === pkg.id && styles.packageMinutesSelected
                ]}>
                  {pkg.minutes} minutos
                </Text>
              </>
            )}
            <Text style={[
              styles.packageDescription,
              selectedPackage?.id === pkg.id && styles.packageDescriptionSelected
            ]}>
              {pkg.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedPackage?.id === 'custom' && (
        <Input
          label="Monto Personalizado (Lempiras)"
          placeholder="0.00"
          value={customAmount}
          onChangeText={setCustomAmount}
          keyboardType="numeric"
          style={styles.customInput}
        />
      )}

      {selectedPackage && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de Recarga</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Usuario:</Text>
            <Text style={styles.summaryValue}>{selectedUser?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Saldo actual:</Text>
            <Text style={styles.summaryValue}>{selectedUser?.balance} min</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monto:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(selectedPackage?.id === 'custom' 
                ? parseFloat(customAmount) || 0 
                : selectedPackage?.amount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Minutos a agregar:</Text>
            <Text style={styles.summaryValue}>
              {selectedPackage?.id === 'custom'
                ? Math.floor((parseFloat(customAmount) || 0) * 0.5)
                : selectedPackage?.minutes} min
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Nuevo saldo:</Text>
            <Text style={styles.summaryTotal}>
              {selectedUser?.balance + (selectedPackage?.id === 'custom'
                ? Math.floor((parseFloat(customAmount) || 0) * 0.5)
                : selectedPackage?.minutes)} min
            </Text>
          </View>
        </Card>
      )}
    </View>
  );

  // Renderizar paso 3: Confirmar pago
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirmar Recarga</Text>
      <Text style={styles.stepSubtitle}>
        Revisa los datos y confirma el método de pago
      </Text>

      <Text style={styles.sectionLabel}>Método de Pago</Text>
      <View style={styles.paymentMethods}>
        {[
          { key: 'cash', label: 'Efectivo', icon: '💵' },
          { key: 'transfer', label: 'Transferencia', icon: '🏦' },
          { key: 'card', label: 'Tarjeta', icon: '💳' },
        ].map(method => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.paymentMethodButton,
              paymentMethod === method.key && styles.paymentMethodButtonActive
            ]}
            onPress={() => setPaymentMethod(method.key)}
          >
            <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === method.key && styles.paymentMethodTextActive
            ]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Notas (opcional)"
        placeholder="Información adicional..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.notesInput}
      />

      <Card style={styles.finalSummaryCard}>
        <Text style={styles.finalSummaryTitle}>Confirmación de Recarga</Text>
        
        <View style={styles.finalSummarySection}>
          <Text style={styles.finalSummarySubtitle}>Usuario</Text>
          <Text style={styles.finalSummaryText}>{selectedUser?.name}</Text>
          <Text style={styles.finalSummarySubtext}>{selectedUser?.phone}</Text>
        </View>

        <View style={styles.finalSummarySection}>
          <Text style={styles.finalSummarySubtitle}>Paquete</Text>
          <Text style={styles.finalSummaryText}>
            {selectedPackage?.name} - {formatCurrency(
              selectedPackage?.id === 'custom' 
                ? parseFloat(customAmount) || 0 
                : selectedPackage?.amount
            )}
          </Text>
          <Text style={styles.finalSummarySubtext}>
            {selectedPackage?.id === 'custom'
              ? Math.floor((parseFloat(customAmount) || 0) * 0.5)
              : selectedPackage?.minutes} minutos
          </Text>
        </View>

        <View style={styles.finalSummarySection}>
          <Text style={styles.finalSummarySubtitle}>Método de Pago</Text>
          <Text style={styles.finalSummaryText}>
            {paymentMethod === 'cash' ? 'Efectivo' : 
             paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta'}
          </Text>
        </View>

        {notes.trim() && (
          <View style={styles.finalSummarySection}>
            <Text style={styles.finalSummarySubtitle}>Notas</Text>
            <Text style={styles.finalSummaryText}>{notes}</Text>
          </View>
        )}
      </Card>
    </View>
  );

  // Renderizar historial de recargas recientes
  const renderRecentRecharges = () => (
    <View style={styles.historySection}>
      <Text style={styles.historyTitle}>Recargas Recientes</Text>
      {recentRecharges.map((recharge) => (
        <Card key={recharge.id} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyUserName}>{recharge.userName}</Text>
            <Text style={styles.historyAmount}>{formatCurrency(recharge.amount)}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyPhone}>{recharge.userPhone}</Text>
            <Text style={styles.historyMinutes}>{recharge.minutes} min</Text>
          </View>
          <View style={styles.historyFooter}>
            <Text style={styles.historyMethod}>
              {recharge.method === 'cash' ? 'Efectivo' : 
               recharge.method === 'transfer' ? 'Transferencia' : 'Tarjeta'}
            </Text>
            <Text style={styles.historyTime}>{formatRelativeTime(recharge.date)}</Text>
          </View>
        </Card>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
      
      {/* Top Safe Area with Header Color */}
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="car-outline" size={24} color="white" />
          <Text style={styles.title}>Agregar Saldo</Text>
        </View>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Paso {step} de 3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Historial solo en paso 1 */}
        {step === 1 && renderRecentRecharges()}

        {/* Espacio inferior */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Footer con botones de navegación */}
      <View style={styles.footer}>
        {step > 1 && (
          <Button
            title="Anterior"
            variant="outline"
            onPress={() => setStep(step - 1)}
            style={styles.backButton}
          />
        )}
        
        {step === 1 && (
          <Button
            title="Cancelar"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        )}

        {step === 2 && selectedPackage && (
          selectedPackage.id === 'custom' ? (
            <Button
              title="Continuar"
              onPress={() => setStep(3)}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              style={styles.nextButton}
            />
          ) : (
            <Button
              title="Continuar"
              onPress={() => setStep(3)}
              style={styles.nextButton}
            />
          )
        )}

        {step === 3 && (
          <Button
            title={processing ? "Procesando..." : "Confirmar Recarga"}
            onPress={processRecharge}
            loading={processing}
            disabled={processing}
            style={styles.confirmButton}
          />
        )}
        </View>
      </KeyboardAvoidingView>
      
      {/* Bottom Safe Area with Footer Color */}
      <View style={[styles.bottomSafeArea, { height: insets.bottom, backgroundColor: Colors.neutral[0] }]} />
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
  bottomSafeArea: {
    backgroundColor: Colors.neutral[0],
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  stepIndicator: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[0],
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.success[500],
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 24,
    letterSpacing: -0.2,
  },
  searchInput: {
    marginBottom: 16,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.neutral[600],
  },
  searchResults: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 12,
  },
  userResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success[600],
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 11,
    color: Colors.neutral[500],
    textTransform: 'uppercase',
  },
  noResultsCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 20,
  },
  packageCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    alignItems: 'center',
  },
  packageCardSelected: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 8,
  },
  packageNameSelected: {
    color: Colors.primary[600],
  },
  packageAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success[600],
    marginBottom: 4,
  },
  packageAmountSelected: {
    color: Colors.primary[600],
  },
  packageMinutes: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  packageMinutesSelected: {
    color: Colors.primary[600],
  },
  packageDescription: {
    fontSize: 12,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  packageDescriptionSelected: {
    color: Colors.primary[600],
  },
  customInput: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: Colors.info[50],
    borderColor: Colors.info[200],
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.info[800],
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.info[700],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.info[800],
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.info[200],
    marginVertical: 8,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.info[800],
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  paymentMethodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    margin: 6,
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodButtonActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[600],
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  paymentMethodTextActive: {
    color: Colors.primary[600],
  },
  notesInput: {
    marginBottom: 20,
  },
  finalSummaryCard: {
    backgroundColor: Colors.success[50],
    borderColor: Colors.success[200],
    borderWidth: 1,
  },
  finalSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  finalSummarySection: {
    marginBottom: 12,
  },
  finalSummarySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success[700],
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  finalSummaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.success[800],
  },
  finalSummarySubtext: {
    fontSize: 14,
    color: Colors.success[700],
  },
  historySection: {
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  historyCard: {
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.success[600],
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyPhone: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  historyMinutes: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyMethod: {
    fontSize: 11,
    color: Colors.neutral[500],
    textTransform: 'uppercase',
  },
  historyTime: {
    fontSize: 11,
    color: Colors.neutral[500],
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
  },
  backButton: {
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  confirmButton: {
    flex: 1,
  },
  bottomSpace: {
    height: 30,
  },
});

export default AddBalanceScreen;