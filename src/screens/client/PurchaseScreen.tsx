import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import {
  getPaymentPackages,
  processPurchaseTransaction,
  getUserPaymentMethods,
  createStripePaymentTransaction
} from '../../services/paymentService';
import type { PaymentPackage } from '../../services/paymentService';
import type { StoredPaymentMethod } from '../../types/payment';

// Navigation types
type ClientStackParamList = {
  Purchase: undefined;
  Home: undefined;
  Profile: undefined;
  History: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'Purchase'>;

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  disabled?: boolean;
}

const SAFE_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    icon: 'card',
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    icon: 'swap-horizontal-outline',
    description: 'Transferencia inmediata'
  },
  {
    id: 'cash',
    name: 'Efectivo',
    icon: 'cash-outline',
    description: 'Pago en efectivo al guardia'
  }
];

export const PurchaseScreen: React.FC<Props> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const { confirmPayment } = useStripe();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [packages, setPackages] = useState<PaymentPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [savedCards, setSavedCards] = useState<StoredPaymentMethod[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Safe access to user data with fallbacks
  const safeUserData = userData || {};
  const actualBalance = safeUserData.balance || 0;
  const userName = safeUserData.name || 'Usuario';

  const paymentMethods = SAFE_PAYMENT_METHODS;

  useEffect(() => {
    loadPaymentPackages();
    if (userData?.uid) {
      loadSavedCards();
    }
  }, [userData]);

  const loadPaymentPackages = async () => {
    try {
      setIsLoadingPackages(true);
      const loadedPackages = await getPaymentPackages();
      setPackages(loadedPackages);
      // Auto-select the popular package if available
      const popularPackage = loadedPackages.find(pkg => pkg.popular);
      if (popularPackage) {
        setSelectedPackage(popularPackage.id);
      } else if (loadedPackages.length > 0) {
        setSelectedPackage(loadedPackages[0].id);
      }
    } catch (error) {
      console.error('Error loading payment packages:', error);
      Alert.alert('Error', 'No se pudieron cargar los paquetes de pago');
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const loadSavedCards = async () => {
    if (!userData?.uid) return;

    setIsLoadingCards(true);
    try {
      const cards = await getUserPaymentMethods(userData.uid);
      setSavedCards(cards);
      // Auto-select default card
      const defaultCard = cards.find(card => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard.id);
      }
    } catch (error) {
      console.error('Error loading saved cards:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const processPurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Por favor selecciona un paquete');
      return;
    }

    if (!userData || !userData.uid) {
      Alert.alert('Error', 'Datos de usuario no disponibles. Por favor inicia sesión nuevamente.');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      await processStripePayment();
      return;
    }

    setIsProcessing(true);

    try {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      if (!selectedPkg) {
        throw new Error('Paquete no encontrado');
      }

      const transaction = await processPurchaseTransaction(
        userData.uid,
        selectedPackage,
        selectedPaymentMethod as 'transfer' | 'cash' | 'card'
      );

      const successMessage = selectedPaymentMethod === 'cash'
        ? 'Tus minutos han sido agregados a tu cuenta.'
        : 'Tu transacción está pendiente de confirmación.';

      Alert.alert(
        '¡Compra Exitosa!',
        `Has comprado ${selectedPkg.minutes} minutos por L ${selectedPkg.price.toLocaleString()}. ${successMessage}`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              const popularPackage = packages.find(pkg => pkg.popular);
              setSelectedPackage(popularPackage ? popularPackage.id : packages[0]?.id || null);
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }
          }
        ]
      );

      if (refreshUserData) {
        await refreshUserData();
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Error en la Compra',
        error.message || 'No se pudo procesar tu compra.',
        [
          { text: 'Reintentar', onPress: processPurchase },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processStripePayment = async () => {
    if (!userData?.uid) return;
    if (!selectedCard && savedCards.length > 0) {
      Alert.alert('Error', 'Por favor selecciona una tarjeta');
      return;
    }

    setIsProcessing(true);

    try {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      if (!selectedPkg) {
        throw new Error('Paquete no encontrado');
      }

      // Create payment intent on backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPkg.price * 100, // Convert to centavos
          currency: 'hnl',
          userId: userData.uid,
          packageId: selectedPackage,
          paymentMethodId: selectedCard ? savedCards.find(c => c.id === selectedCard)?.stripePaymentMethodId : null
        }),
      });

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create transaction record
      await createStripePaymentTransaction(
        userData.uid,
        selectedPackage,
        paymentIntentId,
        selectedCard || ''
      );

      Alert.alert(
        '¡Pago Exitoso!',
        `Has comprado ${selectedPkg.minutes} minutos por L ${selectedPkg.price.toLocaleString()}. Tus minutos serán acreditados inmediatamente.`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              if (refreshUserData) refreshUserData();
              if (navigation.canGoBack()) navigation.goBack();
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Stripe payment error:', error);
      Alert.alert(
        'Error en el Pago',
        error.message || 'No se pudo procesar el pago con tarjeta.',
        [
          { text: 'Reintentar', onPress: processStripePayment },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.primary, '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comprar Minutos</Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance Actual</Text>
          <Text style={styles.balanceAmount}>
            {actualBalance} minutos
          </Text>
          <Text style={styles.welcomeText}>¡Hola {userName}!</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona un Paquete</Text>

          {isLoadingPackages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Cargando paquetes...</Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay paquetes disponibles</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadPaymentPackages}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  selectedPackage === pkg.id && styles.packageCardSelected,
                  pkg.popular && styles.packageCardPopular
                ]}
                onPress={() => handlePackageSelect(pkg.id)}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
                  </View>
                )}

                <View style={styles.packageHeader}>
                  <Text style={styles.packageMinutes}>{pkg.minutes} min</Text>
                  <Text style={styles.packagePrice}>L {pkg.price.toLocaleString()}</Text>
                </View>

                <Text style={styles.packageDescription}>{pkg.description}</Text>

                <View style={styles.packageFooter}>
                  <Text style={styles.packageCostPerMinute}>
                    L {pkg.costPerMinute.toFixed(2)}/min
                  </Text>
                  {pkg.savings && (
                    <Text style={styles.packageSavings}>
                      Ahorras L {pkg.savings.toLocaleString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPaymentMethod === method.id && styles.paymentCardSelected,
                method.disabled && styles.paymentCardDisabled
              ]}
              onPress={() => !method.disabled && handlePaymentMethodSelect(method.id)}
              disabled={method.disabled}
            >
              <View style={styles.paymentCardContent}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={selectedPaymentMethod === method.id ? theme.colors.primary : theme.colors.text.secondary}
                />
                <View style={styles.paymentCardText}>
                  <Text style={[
                    styles.paymentCardTitle,
                    selectedPaymentMethod === method.id && styles.paymentCardTitleSelected
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={styles.paymentCardDescription}>
                    {method.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Card Selection */}
          {selectedPaymentMethod === 'card' && (
            <View style={styles.cardSelectionSection}>
              {isLoadingCards ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
              ) : savedCards.length > 0 ? (
                <>
                  <Text style={styles.cardSelectionTitle}>Selecciona una tarjeta</Text>
                  {savedCards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.savedCardOption,
                        selectedCard === card.id && styles.savedCardOptionSelected
                      ]}
                      onPress={() => setSelectedCard(card.id)}
                    >
                      <View style={styles.savedCardOptionContent}>
                        <Ionicons
                          name="card"
                          size={20}
                          color={selectedCard === card.id ? theme.colors.primary : theme.colors.text.secondary}
                        />
                        <Text style={[
                          styles.savedCardOptionText,
                          selectedCard === card.id && styles.savedCardOptionTextSelected
                        ]}>
                          {card.brand.toUpperCase()} •••• {card.last4}
                        </Text>
                        {card.isDefault && (
                          <View style={styles.defaultBadgeSmall}>
                            <Text style={styles.defaultBadgeSmallText}>Predeterminada</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.addCardButton}
                    onPress={() => navigation.navigate('PaymentMethod' as any)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.addCardButtonText}>Agregar nueva tarjeta</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.noCardsContainer}>
                  <Ionicons name="card-outline" size={48} color={theme.colors.text.muted} />
                  <Text style={styles.noCardsText}>No tienes tarjetas guardadas</Text>
                  <TouchableOpacity
                    style={styles.addFirstCardButton}
                    onPress={() => navigation.navigate('PaymentMethod' as any)}
                  >
                    <Text style={styles.addFirstCardButtonText}>Agregar Tarjeta</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.purchaseSection}>
          <Button
            title={isProcessing ? 'Procesando...' : 'Confirmar Compra'}
            onPress={processPurchase}
            disabled={!selectedPackage || isProcessing || isLoadingPackages}
            style={styles.purchaseButton}
          />
        </View>
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 15,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: theme.colors.primary,
  },
  packageCardPopular: {
    borderColor: '#10b981',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageMinutes: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageCostPerMinute: {
    fontSize: 12,
    color: theme.colors.text.muted,
  },
  packageSavings: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    borderColor: theme.colors.primary,
  },
  paymentCardDisabled: {
    opacity: 0.5,
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentCardText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  paymentCardTitleSelected: {
    color: theme.colors.primary,
  },
  paymentCardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  purchaseSection: {
    padding: 20,
    paddingBottom: 40,
  },
  purchaseButton: {
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Card Selection Styles
  cardSelectionSection: {
    marginTop: 16,
    backgroundColor: theme.colors.blue[50],
    borderRadius: 12,
    padding: 16,
  },
  cardSelectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  savedCardOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  savedCardOptionSelected: {
    borderColor: theme.colors.primary,
  },
  savedCardOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedCardOptionText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  savedCardOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  defaultBadgeSmall: {
    backgroundColor: theme.colors.blue[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeSmallText: {
    fontSize: 10,
    color: theme.colors.blue[600],
    fontWeight: '600',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  addCardButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  noCardsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noCardsText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 12,
    marginBottom: 16,
  },
  addFirstCardButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstCardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});