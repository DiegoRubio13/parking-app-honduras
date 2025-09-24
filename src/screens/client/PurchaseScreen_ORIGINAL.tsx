import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { User } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { PAYMENT_PACKAGES, createPurchaseTransaction } from '../../services/paymentService';

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

interface PurchaseScreenProps extends Props {
  user?: User;
  currentBalance?: number;
  onPurchase?: (packageId: string, paymentMethod: string) => Promise<boolean>;
}

export const PurchaseScreen: React.FC<PurchaseScreenProps> = ({ 
  navigation, 
  user,
  currentBalance,
  onPurchase 
}) => {
  const { userData, refreshUserData } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>('120min');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('transfer');
  const [transferReference, setTransferReference] = useState<string>('');
  const [showReferenceInput, setShowReferenceInput] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const actualBalance = userData?.balance || currentBalance || 0;

  const packages = PAYMENT_PACKAGES;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Tarjeta',
      icon: 'card',
      description: 'Débito/Crédito',
      disabled: true
    },
    {
      id: 'transfer',
      name: 'Transferencias',
      icon: 'swap-horizontal',
      description: 'Transferencia bancaria'
    },
    {
      id: 'cash',
      name: 'Efectivo',
      icon: 'cash',
      description: 'Pago en efectivo'
    }
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.disabled) {
      Alert.alert(
        'Método no disponible',
        'Los pagos con tarjeta estarán disponibles en la próxima versión de la aplicación.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setSelectedPaymentMethod(methodId);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Por favor selecciona un paquete de minutos');
      return;
    }

    const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPkg) return;

    const paymentMethodName = paymentMethods.find(method => method.id === selectedPaymentMethod)?.name || 'Tarjeta';

    Alert.alert(
      'Confirmar Compra',
      `Paquete: ${selectedPkg.minutes} minutos\n` +
      `Precio: L${selectedPkg.price}\n` +
      `Método: ${paymentMethodName}\n\n` +
      `Tu nuevo saldo será: ${actualBalance + selectedPkg.minutes} minutos`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: processPurchase 
        }
      ]
    );
  };

  const processPurchase = async () => {
    if (!selectedPackage || !userData) return;

    setIsProcessing(true);

    try {
      // Get reference if needed for transfer
      let reference = undefined;
      if (selectedPaymentMethod === 'transfer') {
        const result = await new Promise<string | null>((resolve) => {
          Alert.prompt(
            'Referencia de Transferencia',
            'Ingresa el número de referencia de tu transferencia bancaria:',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
              { text: 'Confirmar', onPress: (text) => resolve(text || '') }
            ],
            'plain-text'
          );
        });
        
        if (result === null) {
          setIsProcessing(false);
          return;
        }
        reference = result;
      }

      // Create the transaction in Firebase
      // Double check userData is still available (defensive programming)
      if (!userData) {
        Alert.alert('Error', 'Datos de usuario no disponibles. Por favor inicia sesión nuevamente.');
        setIsProcessing(false);
        return;
      }

      const result = await createPurchaseTransaction(
        userData.uid,
        userData.phone,
        userData.name,
        selectedPackage,
        selectedPaymentMethod as 'transfer' | 'cash' | 'card',
        reference
      );

      if (result.success) {
        // Refresh user data to get updated balance
        await refreshUserData();
        
        const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
        const message = selectedPaymentMethod === 'cash' 
          ? 'Tus minutos han sido agregados a tu cuenta.'
          : 'Tu compra está pendiente de confirmación. Los minutos se agregarán una vez confirmado el pago.';
        
        Alert.alert(
          'Compra Exitosa',
          message,
          [{ text: 'Continuar', onPress: handleGoBack }]
        );
      } else {
        throw new Error(result.error || 'Error creating transaction');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Error en la Compra',
        error.message || 'Hubo un problema procesando tu pago. Intenta nuevamente.',
        [{ text: 'Entendido' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getNewBalance = () => {
    if (!selectedPackage) return actualBalance;
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
    return actualBalance + (selectedPkg?.minutes || 0);
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[800], theme.colors.blue[600]]}
        style={styles.header}
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comprar Minutos</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Tu saldo actual</Text>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceAmount}>{actualBalance}</Text>
            <Text style={styles.balanceUnit}>min</Text>
          </View>
          {selectedPackage && (
            <Text style={styles.newBalancePreview}>
              Nuevo saldo: {getNewBalance()} min
            </Text>
          )}
        </View>

        {/* Package Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elige tu paquete</Text>
          
          {packages.map((pkg) => (
            <Animated.View
              key={pkg.id}
              style={[
                { transform: [{ scale: selectedPackage === pkg.id ? scaleAnim : 1 }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.packageCard,
                  selectedPackage === pkg.id && styles.selectedPackage,
                  pkg.popular && styles.popularPackage
                ]}
                onPress={() => handleSelectPackage(pkg.id)}
                activeOpacity={0.7}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.packageHeader}>
                  <View style={styles.packageMinutes}>
                    <Text style={styles.minutesNumber}>{pkg.minutes}</Text>
                    <Text style={styles.minutesLabel}>min</Text>
                  </View>
                  <View style={styles.packagePrice}>
                    <Text style={styles.priceSymbol}>L</Text>
                    <Text style={styles.priceNumber}>{pkg.price}</Text>
                  </View>
                </View>
                
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                
                <View style={styles.packageFooter}>
                  <Text style={styles.costPerMinute}>
                    L{pkg.costPerMinute.toFixed(2)} por minuto
                  </Text>
                  {pkg.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>Ahorra L{pkg.savings}</Text>
                    </View>
                  )}
                </View>
                
                {selectedPackage === pkg.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          
          <View style={styles.paymentGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                  method.disabled && styles.disabledPaymentMethod
                ]}
                onPress={() => handleSelectPaymentMethod(method.id)}
                activeOpacity={method.disabled ? 1 : 0.7}
                disabled={method.disabled}
              >
                <View style={styles.paymentIconContainer}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={24} 
                    color={method.disabled ? theme.colors.text.muted : selectedPaymentMethod === method.id ? theme.colors.blue[600] : theme.colors.text.secondary} 
                  />
                  {method.disabled && (
                    <Ionicons 
                      name="lock-closed" 
                      size={16} 
                      color={theme.colors.text.muted}
                      style={styles.lockIcon}
                    />
                  )}
                </View>
                <Text style={[
                  styles.paymentMethodName,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethodName,
                  method.disabled && styles.disabledPaymentMethodName
                ]}>
                  {method.name}
                </Text>
                <Text style={[
                  styles.paymentMethodDescription,
                  method.disabled && styles.disabledPaymentMethodDescription
                ]}>
                  {method.description}
                </Text>
                
                {selectedPaymentMethod === method.id && (
                  <View style={styles.paymentSelectedIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.blue[600]} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Purchase Button */}
        <View style={styles.purchaseSection}>
          <Button
            title={
              isProcessing 
                ? 'Procesando...' 
                : selectedPackage 
                  ? `Comprar ${packages.find(p => p.id === selectedPackage)?.minutes} min por L${packages.find(p => p.id === selectedPackage)?.price}`
                  : 'Selecciona un paquete'
            }
            onPress={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            loading={isProcessing}
            size="lg"
            style={styles.purchaseButton}
          />
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color={theme.colors.blue[600]} />
          <Text style={styles.infoText}>
            Tus minutos no expiran y se acumulan con tu saldo actual
          </Text>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Todas las transacciones están protegidas con encriptación SSL
          </Text>
        </View>
      </ScrollView>
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
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  balanceLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceAmount: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.blue[600],
  },
  balanceUnit: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  newBalancePreview: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    marginTop: theme.spacing.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    margin: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  packageCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...theme.shadows.md,
  },
  selectedPackage: {
    borderColor: theme.colors.blue[600],
    backgroundColor: theme.colors.blue[50],
  },
  popularPackage: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: theme.spacing.lg,
    backgroundColor: '#FFD700',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  popularBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  packageMinutes: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  minutesNumber: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.primary,
  },
  minutesLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  packagePrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.success,
    marginRight: 2,
  },
  priceNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  packageDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costPerMinute: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
  },
  savingsBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  savingsText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  paymentMethod: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...theme.shadows.sm,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.blue[600],
    backgroundColor: theme.colors.blue[50],
  },
  disabledPaymentMethod: {
    backgroundColor: theme.colors.gray[100],
    borderColor: theme.colors.gray[300],
    opacity: 0.6,
  },
  paymentMethodName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  selectedPaymentMethodName: {
    color: theme.colors.blue[600],
  },
  disabledPaymentMethodName: {
    color: theme.colors.text.muted,
  },
  paymentMethodDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  disabledPaymentMethodDescription: {
    color: theme.colors.text.muted,
    opacity: 0.7,
  },
  paymentIconContainer: {
    position: 'relative',
  },
  lockIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
  paymentSelectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  purchaseSection: {
    margin: theme.spacing.lg,
  },
  purchaseButton: {
    marginBottom: theme.spacing.lg,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  securityText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});