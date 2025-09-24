/**
 * PaRKING Purchase Screen - Clean Seamless Design
 * 
 * Complete redesign without SafeAreaView divisions
 * Professional payment flow with modern UI
 * All functionality preserved
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { MINUTE_PACKAGES, addMinutesToUser } from '../../store/purchaseSlice';
// DEMO MODE - Firebase imports commented out for mockup
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../services/firebase';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

const PurchaseScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.purchase);
  
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(user?.minutes_balance || 0);

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(30);

  useEffect(() => {
    // Auto-select the popular package
    const popularPackage = MINUTE_PACKAGES.find(pkg => pkg.popular);
    if (popularPackage) {
      setSelectedPackage(popularPackage);
    }
    
    // Initialize animations
    fadeIn.value = withTiming(1, { duration: 600 });
    slideUp.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUserBalance();
    }, [user?.id])
  );

  const refreshUserBalance = async () => {
    if (!user?.id) return;
    
    try {
      // DEMO MODE - Mock Firebase user balance fetch
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Mock user data for demo
      const mockUserData = {
        minutes_balance: Math.floor(Math.random() * 500) + 50, // Random balance between 50-550
      };
      
      setCurrentBalance(mockUserData.minutes_balance);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
    
    /* DEMO MODE - Original Firebase code commented out
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
    */
  };

  const paymentMethods = [
    {
      id: 'cash',
      title: 'Efectivo',
      description: 'Paga con efectivo al administrador',
      icon: 'cash',
      color: '#059669',
      available: true,
    },
    {
      id: 'transfer',
      title: 'Transferencia',
      description: 'Banco Atlántida o BAC',
      icon: 'phone-portrait',
      color: '#2563eb',
      available: true,
    },
    {
      id: 'card',
      title: 'Tarjeta',
      description: 'Próximamente disponible',
      icon: 'card',
      color: '#6b7280',
      available: false,
    },
  ];

  const calculateSavings = (packageData) => {
    const basePrice = (packageData.minutes / 60) * 60;
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
      
      const result = await dispatch(addMinutesToUser({
        userPhone: user.id,
        packageId: selectedPackage.id,
        paymentMethod: selectedPaymentMethod,
        adminId: 'manual_purchase'
      })).unwrap();
      
      Alert.alert(
        'Compra Exitosa',
        `¡Compra completada!\n\n• ${selectedPackage.minutes} minutos agregados\n• Total pagado: L${selectedPackage.price}\n• Método: ${selectedMethod.title}\n• Nuevo saldo: ${result.user_new_balance} minutos`,
        [{ text: 'Continuar', onPress: () => navigation.goBack() }]
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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

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
            <Ionicons name="time" size={28} color="#2563eb" />
          </View>
          <View style={styles.packageTitle}>
            <Text style={styles.packageMinutes}>{packageData.minutes} minutos</Text>
            <Text style={styles.packageDescription}>{packageData.description}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedIcon}>
              <Ionicons name="checkmark-circle" size={28} color="#059669" />
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
          { backgroundColor: method.available ? `${method.color}15` : '#f3f4f6' }
        ]}>
          <Ionicons
            name={method.icon}
            size={24}
            color={method.available ? method.color : '#6b7280'}
          />
        </View>
        
        <View style={styles.paymentContent}>
          <Text style={[
            styles.paymentTitle,
            !method.available && { color: '#6b7280' }
          ]}>
            {method.title}
          </Text>
          <Text style={styles.paymentDescription}>{method.description}</Text>
        </View>
        
        {isSelected && method.available && (
          <Ionicons name="checkmark-circle" size={24} color="#059669" />
        )}
        
        {!method.available && (
          <Ionicons name="lock-closed" size={20} color="#6b7280" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Seamless header */}
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comprar Minutos</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Balance display in header */}
        <View style={styles.balanceHeader}>
          <View style={styles.balanceIcon}>
            <Ionicons name="wallet" size={24} color="white" />
          </View>
          <View>
            <Text style={styles.balanceLabel}>Tu saldo actual</Text>
            <Text style={styles.balanceValue}>{currentBalance} minutos</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView style={[styles.content, animatedStyle]}>
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
        </AnimatedView>
      </ScrollView>

      {/* Purchase Button - Fixed footer */}
      <View style={styles.footer}>
        <Button
          title={selectedPackage ? `Comprar por L${selectedPackage.price}` : 'Selecciona un paquete'}
          onPress={handlePurchaseFlow}
          disabled={!selectedPackage || !selectedPaymentMethod || isLoading}
          loading={isLoading}
          leftIcon={<Ionicons name="card" size={20} color="white" />}
          size="large"
          style={styles.purchaseButton}
        />
      </View>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Ionicons name="help-circle" size={48} color="#2563eb" />
            <Text style={styles.modalTitle}>Confirmar Compra</Text>
            <Text style={styles.modalText}>
              ¿Confirmas la compra de {selectedPackage?.minutes} minutos por L{selectedPackage?.price}?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setShowConfirmation(false)}
                style={styles.modalButtonCancel}
              />
              <Button
                title="Confirmar"
                onPress={handleConfirmPurchase}
                style={styles.modalButtonConfirm}
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
    backgroundColor: '#f8fafc',
  },
  
  // Header
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 0,
    marginTop: -20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 24,
  },
  
  // Packages
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
    shadowColor: '#059669',
    shadowOpacity: 0.15,
  },
  packageCardPopular: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  packageIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageTitle: {
    flex: 1,
  },
  packageMinutes: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#6b7280',
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
    marginBottom: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 2,
  },
  currencyCode: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  savingsContainer: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  
  // Payment Methods
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMethodSelected: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4',
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  // Summary
  summaryCard: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  
  // Footer
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  purchaseButton: {
    borderRadius: 16,
    height: 56,
  },
  
  // Modal
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: width * 0.9,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    height: 48,
  },
  modalButtonConfirm: {
    flex: 1,
    height: 48,
  },
});

export default PurchaseScreen;