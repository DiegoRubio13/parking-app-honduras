import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

// Navigation types
type ClientStackParamList = {
  Purchase: undefined;
  Home: undefined;
  Profile: undefined;
  History: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'Purchase'>;

interface PurchasePackage {
  id: string;
  minutes: number;
  price: number;
  costPerMinute: number;
  savings?: number;
  popular?: boolean;
  description: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  disabled?: boolean;
}

// Safe hardcoded packages to avoid service dependencies
const SAFE_PACKAGES: PurchasePackage[] = [
  {
    id: '60min',
    minutes: 60,
    price: 3000,
    costPerMinute: 50,
    description: 'Ideal para visitas cortas'
  },
  {
    id: '120min',
    minutes: 120,
    price: 5500,
    costPerMinute: 45.83,
    savings: 500,
    popular: true,
    description: 'Perfecto para citas y compras'
  },
  {
    id: '300min',
    minutes: 300,
    price: 12000,
    costPerMinute: 40,
    savings: 3000,
    description: 'Ideal para jornadas laborales'
  }
];

const SAFE_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    icon: 'card-outline',
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
  const [selectedPackage, setSelectedPackage] = useState<string | null>('120min');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  // Safe access to user data with fallbacks
  const safeUserData = userData || {};
  const actualBalance = safeUserData.balance || 0;
  const userName = safeUserData.name || 'Usuario';

  const packages = SAFE_PACKAGES;
  const paymentMethods = SAFE_PAYMENT_METHODS;

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

    // Safe check for user data
    if (!userData || !userData.uid) {
      Alert.alert('Error', 'Datos de usuario no disponibles. Por favor inicia sesión nuevamente.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate purchase processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      if (!selectedPkg) {
        throw new Error('Paquete no encontrado');
      }

      // Simulate success
      Alert.alert(
        '¡Compra Exitosa!',
        `Has comprado ${selectedPkg.minutes} minutos por $${selectedPkg.price.toLocaleString()}. ${
          selectedPaymentMethod === 'cash'
            ? 'Tus minutos han sido agregados a tu cuenta.'
            : 'Recibirás una confirmación por SMS.'
        }`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              setSelectedPackage('120min');
              setSelectedPaymentMethod('transfer');
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }
          }
        ]
      );

      // Refresh user data
      if (refreshUserData) {
        await refreshUserData();
      }

    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Error en la Compra',
        'No se pudo procesar tu compra. Por favor intenta nuevamente.',
        [{ text: 'OK' }]
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

          {packages.map((pkg) => (
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
                <Text style={styles.packagePrice}>${pkg.price.toLocaleString()}</Text>
              </View>

              <Text style={styles.packageDescription}>{pkg.description}</Text>

              <View style={styles.packageFooter}>
                <Text style={styles.packageCostPerMinute}>
                  ${pkg.costPerMinute.toFixed(0)}/min
                </Text>
                {pkg.savings && (
                  <Text style={styles.packageSavings}>
                    Ahorras ${pkg.savings.toLocaleString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
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
        </View>

        <View style={styles.purchaseSection}>
          <Button
            title={isProcessing ? 'Procesando...' : 'Confirmar Compra'}
            onPress={processPurchase}
            disabled={!selectedPackage || isProcessing}
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
});