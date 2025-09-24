import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, LoadingSpinner } from '../../components/shared';
import { MINUTE_PACKAGES, addMinutesToUser } from '../../store/purchaseSlice';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc } from 'firebase/firestore';
// DEMO MODE - Firebase imports commented out for mockup
// import { db } from '../../services/firebase';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

/**
 * Professional Purchase Screen for PaRKING App
 * Displays minute packages with payment methods and confirmation flow
 */
const PurchaseScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, lastPurchase } = useSelector((state) => state.purchase);
  const insets = useSafeAreaInsets();
  
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(user?.minutes_balance || 0);

  // Auto-select the popular package on load
  useEffect(() => {
    const popularPackage = MINUTE_PACKAGES.find(pkg => pkg.popular);
    if (popularPackage) {
      setSelectedPackage(popularPackage);
    }
  }, []);

  // Refresh balance when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserBalance();
    }, [user?.id])
  );

  const refreshUserBalance = async () => {
    if (!user?.id) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setCurrentBalance(userData.minutes_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const paymentMethods = [
    {
      id: 'cash',
      title: 'Efectivo',
      description: 'Paga con efectivo al administrador',
      icon: 'cash',
      color: Colors.success[600],
      available: true,
    },
    {
      id: 'transfer',
      title: 'Transferencia',
      description: 'Banco Atlántida o BAC',
      icon: 'phone-portrait',
      color: Colors.info[600],
      available: true,
    },
    {
      id: 'card',
      title: 'Tarjeta',
      description: 'Próximamente disponible',
      icon: 'card',
      color: Colors.neutral[400],
      available: false,
    },
  ];

  const calculateSavings = (packageData) => {
    const basePrice = (packageData.minutes / 60) * 60; // L60 per hour base price
    const savings = basePrice - packageData.price;
    const percentage = Math.round((savings / basePrice) * 100);
    return { savings, percentage };
  };

  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData);
  };

  const handlePaymentMethodSelect = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method.available) {
      Alert.alert('No disponible', 'Este método de pago aún no está disponible.');
      return;
    }
    setSelectedPaymentMethod(methodId);
  };

  const handlePurchaseFlow = () => {
    if (!selectedPackage || !selectedPaymentMethod) {
      Alert.alert('Selección incompleta', 'Por favor selecciona un paquete y método de pago.');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmPurchase = async () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    try {
      setShowConfirmation(false);
      
      // Dispatch real purchase action to Firebase
      const result = await dispatch(addMinutesToUser({
        userPhone: user.id,
        packageId: selectedPackage.id,
        paymentMethod: selectedPaymentMethod,
        adminId: 'manual_purchase'
      })).unwrap();
      
      Alert.alert(
        'Compra Exitosa',
        `¡Compra completada!\n\n• ${selectedPackage.minutes} minutos agregados\n• Total pagado: L${selectedPackage.price}\n• Método: ${selectedMethod.title}\n• Nuevo saldo: ${result.user_new_balance} minutos`,
        [
          { text: 'Continuar', onPress: () => navigation.goBack() }
        ]
      );
      
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Error en la compra',
        error || 'No se pudo completar la compra. Inténtalo de nuevo.',
        [
          { text: 'Reintentar', onPress: () => setShowConfirmation(true) },
          { text: 'Cancelar', onPress: () => setShowConfirmation(false) }
        ]
      );
    }
  };

  const renderPackageCard = (packageData) => {
    const savings = calculateSavings(packageData);
    const isSelected = selectedPackage?.id === packageData.id;
    
    return (
      <TouchableOpacity
        key={packageData.id}
        onPress={() => handlePackageSelect(packageData)}
        activeOpacity={0.8}
        style={[
          styles.packageCard,
          isSelected && styles.packageCardSelected,
          packageData.popular && styles.packageCardPopular,
        ]}
      >
        {packageData.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MÁS POPULAR</Text>
          </View>
        )}
        
        <View style={styles.packageHeader}>
          <View style={styles.packageIcon}>
            <Ionicons name="time" size={24} color={Colors.primary[600]} />
          </View>
          <View style={styles.packageTitle}>
            <Text style={styles.packageMinutes}>{packageData.minutes} minutos</Text>
            <Text style={styles.packageDescription}>{packageData.description}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedIcon}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success[600]} />
            </View>
          )}
        </View>

        <View style={styles.packagePricing}>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>L</Text>
            <Text style={styles.price}>{packageData.price}</Text>
            <Text style={styles.currencyCode}>{packageData.currency}</Text>
          </View>
          
          {savings.savings > 0 && (
            <View style={styles.savingsContainer}>
              <Text style={styles.savingsText}>
                Ahorras L{savings.savings.toFixed(2)} ({savings.percentage}%)
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedPaymentMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        onPress={() => handlePaymentMethodSelect(method.id)}
        disabled={!method.available}
        style={[
          styles.paymentMethod,
          isSelected && styles.paymentMethodSelected,
          !method.available && styles.paymentMethodDisabled,
        ]}
        activeOpacity={0.8}
      >
        <View style={[
          styles.paymentIcon,
          { backgroundColor: method.available ? `${method.color}15` : Colors.neutral[100] }
        ]}>
          <Ionicons
            name={method.icon}
            size={20}
            color={method.available ? method.color : Colors.neutral[400]}
          />
        </View>
        
        <View style={styles.paymentContent}>
          <Text style={[
            styles.paymentTitle,
            !method.available && { color: Colors.neutral[400] }
          ]}>
            {method.title}
          </Text>
          <Text style={styles.paymentDescription}>{method.description}</Text>
        </View>
        
        {isSelected && method.available && (
          <Ionicons name="checkmark-circle" size={20} color={Colors.success[600]} />
        )}
        
        {!method.available && (
          <Ionicons name="lock-closed" size={16} color={Colors.neutral[400]} />
        )}
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Comprar Minutos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Balance */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <Ionicons name="wallet" size={20} color={Colors.info[600]} />
            <Text style={styles.balanceLabel}>Tu saldo actual</Text>
            <Text style={styles.balanceValue}>
              {currentBalance} minutos
            </Text>
          </View>
        </Card>

        {/* Package Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona tu paquete</Text>
          <Text style={styles.sectionSubtitle}>
            Elige la cantidad de minutos que necesitas
          </Text>
          
          <View style={styles.packagesContainer}>
            {MINUTE_PACKAGES.map(renderPackageCard)}
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <Text style={styles.sectionSubtitle}>
            ¿Cómo quieres pagar?
          </Text>
          
          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Purchase Summary */}
        {selectedPackage && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de compra</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Paquete:</Text>
              <Text style={styles.summaryValue}>{selectedPackage.minutes} minutos</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Precio:</Text>
              <Text style={styles.summaryValue}>L{selectedPackage.price}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Método:</Text>
              <Text style={styles.summaryValue}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.title || 'No seleccionado'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total a pagar:</Text>
              <Text style={styles.summaryTotalValue}>L{selectedPackage.price}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.footer}>
        <Button
          title={selectedPackage ? `Comprar por L${selectedPackage.price}` : 'Selecciona un paquete'}
          onPress={handlePurchaseFlow}
          disabled={!selectedPackage || !selectedPaymentMethod || isLoading}
          loading={isLoading}
          leftIcon={<Ionicons name="card" size={20} color="white" />}
          size="large"
        />
      </View>
      <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />

      {/* Confirmation Modal */}
      {showConfirmation && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Ionicons name="help-circle" size={48} color={Colors.primary[600]} />
            <Text style={styles.modalTitle}>Confirmar Compra</Text>
            <Text style={styles.modalText}>
              ¿Confirmas la compra de {selectedPackage?.minutes} minutos por L{selectedPackage?.price}?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setShowConfirmation(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Confirmar"
                onPress={handleConfirmPurchase}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
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
  bottomSafeArea: {
    backgroundColor: Colors.neutral[0],
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
  balanceCard: {
    marginBottom: 32,
    backgroundColor: Colors.info[50],
    borderColor: Colors.info[200],
    borderWidth: 0,
    borderRadius: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceLabel: {
    fontSize: 15,
    color: Colors.light.text.secondary,
    flex: 1,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.info[700],
    letterSpacing: -0.2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.light.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    position: 'relative',
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  packageCardSelected: {
    borderColor: Colors.success[500],
    backgroundColor: Colors.success[50],
    shadowColor: Colors.success[500],
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  packageCardPopular: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  packageTitle: {
    flex: 1,
  },
  packageMinutes: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text.primary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    lineHeight: 20,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  packagePricing: {
    alignItems: 'flex-start',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text.primary,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text.primary,
    marginLeft: 2,
    letterSpacing: -0.5,
  },
  currencyCode: {
    fontSize: 12,
    color: Colors.light.text.secondary,
    marginLeft: 4,
  },
  savingsContainer: {
    backgroundColor: Colors.success[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.success[700],
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    gap: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMethodSelected: {
    borderColor: Colors.success[500],
    backgroundColor: Colors.success[50],
    shadowColor: Colors.success[500],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  paymentDescription: {
    fontSize: 13,
    color: Colors.light.text.secondary,
    lineHeight: 18,
  },
  summaryCard: {
    marginTop: 8,
    backgroundColor: Colors.neutral[50],
    borderColor: Colors.neutral[200],
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text.primary,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.neutral[0],
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: width * 0.9,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});

export default PurchaseScreen;