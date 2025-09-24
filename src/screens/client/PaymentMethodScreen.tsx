import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import {
  saveStripePaymentMethod,
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../../services/paymentService';
import type { StoredPaymentMethod } from '../../types/payment';

// Navigation prop types
interface PaymentMethodScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

interface PaymentMethod {
  id: string;
  type: 'transfer' | 'cash';
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  details: string[];
  recommended?: boolean;
}

interface BankAccount {
  id: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  description: string;
}

export const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const { createPaymentMethod } = useStripe();
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountReference, setAccountReference] = useState<string>('');
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [savedCards, setSavedCards] = useState<StoredPaymentMethod[]>([]);
  const [cardholderName, setCardholderName] = useState('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'transfer',
      title: 'Tarjeta de Crédito/Débito',
      description: 'Pago seguro con Stripe',
      icon: 'card',
      color: theme.colors.blue[600],
      recommended: true,
      details: [
        'Procesamiento seguro con tecnología Stripe',
        'Aceptamos Visa, Mastercard y más',
        'Pago instantáneo en Lempiras (HNL)',
        'Guarda tus tarjetas de forma segura',
        'Confirmación automática de pago',
      ],
    },
    {
      id: 'transfer',
      type: 'transfer',
      title: 'Transferencia Bancaria',
      description: 'Pago desde tu banco',
      icon: 'swap-horizontal',
      color: theme.colors.blue[500],
      details: [
        'Compatible con bancos hondureños',
        'Confirmación en 24-48 horas',
        'Sin cargos adicionales',
        'Requiere validación manual',
      ],
    },
    {
      id: 'cash',
      type: 'cash',
      title: 'Efectivo',
      description: 'Pago directo al guardia',
      icon: 'cash',
      color: theme.colors.blue[400],
      details: [
        'Pago en el momento del servicio',
        'Disponible en todos los estacionamientos',
        'Requiere monto exacto o cambio',
        'Recibo físico o digital',
      ],
    },
  ];

  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    if (!userData?.uid) return;

    setIsLoadingMethods(true);
    try {
      const methods = await getUserPaymentMethods(userData.uid);
      setSavedCards(methods);
    } catch (error) {
      console.error('Error loading saved cards:', error);
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const bankAccounts: BankAccount[] = [
    {
      id: 'bac',
      bank: 'BAC Honduras',
      accountType: 'Cuenta Corriente',
      accountNumber: '3510-1234-5678',
      accountHolder: 'ParKing Honduras S.A.',
      description: 'Transferencias 24/7 con confirmación inmediata',
    },
    {
      id: 'bancatlan',
      bank: 'Banco Atlántida',
      accountType: 'Cuenta de Ahorros',
      accountNumber: '1122-3344-5566',
      accountHolder: 'ParKing Honduras S.A.',
      description: 'Red más amplia de cajeros y sucursales',
    },
    {
      id: 'ficohsa',
      bank: 'Banco Ficohsa',
      accountType: 'Cuenta Corriente',
      accountNumber: '7788-9900-1122',
      accountHolder: 'ParKing Honduras S.A.',
      description: 'Transferencias ACH sin comisiones',
    },
    {
      id: 'banpais',
      bank: 'Banpaís',
      accountType: 'Cuenta de Ahorros',
      accountNumber: '4455-6677-8899',
      accountHolder: 'ParKing Honduras S.A.',
      description: 'Ideal para transferencias frecuentes',
    },
  ];

  const handleSavePaymentMethod = async () => {
    if (selectedMethod === 'card') {
      if (!cardComplete) {
        Alert.alert('Error', 'Por favor completa la información de tu tarjeta');
        return;
      }
      if (!cardholderName.trim()) {
        Alert.alert('Error', 'Por favor ingresa el nombre del titular');
        return;
      }
      await handleSaveCard();
      return;
    }

    if (selectedMethod === 'transfer' && !selectedBank) {
      Alert.alert('Error', 'Por favor selecciona un banco para las transferencias');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving payment method:', {
        method: selectedMethod,
        bank: selectedBank,
        reference: accountReference,
        setAsDefault: saveAsDefault,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Método de Pago Configurado',
        `Tu método de pago preferido ha sido ${saveAsDefault ? 'configurado como predeterminado' : 'guardado'} exitosamente.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el método de pago. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCard = async () => {
    if (!userData?.uid) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar una tarjeta');
      return;
    }

    setIsLoading(true);
    try {
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        billingDetails: {
          name: cardholderName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error('No se pudo crear el método de pago');
      }

      await saveStripePaymentMethod(
        userData.uid,
        paymentMethod.id,
        {
          brand: paymentMethod.Card?.brand || 'unknown',
          last4: paymentMethod.Card?.last4 || '0000',
          expMonth: paymentMethod.Card?.expMonth || 0,
          expYear: paymentMethod.Card?.expYear || 0,
        },
        saveAsDefault
      );

      Alert.alert(
        'Tarjeta Guardada',
        'Tu tarjeta ha sido guardada exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              loadSavedCards();
              navigation.goBack();
            },
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la tarjeta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    Alert.alert(
      'Eliminar Tarjeta',
      '¿Estás seguro que deseas eliminar esta tarjeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(cardId);
              await loadSavedCards();
              Alert.alert('Éxito', 'Tarjeta eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la tarjeta');
            }
          },
        },
      ]
    );
  };

  const handleSetDefaultCard = async (cardId: string) => {
    if (!userData?.uid) return;

    try {
      await setDefaultPaymentMethod(userData.uid, cardId);
      await loadSavedCards();
      Alert.alert('Éxito', 'Tarjeta configurada como predeterminada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarjeta');
    }
  };

  const handleTestTransfer = () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Primero selecciona un banco');
      return;
    }

    const bank = bankAccounts.find(b => b.id === selectedBank);
    Alert.alert(
      'Información de Transferencia',
      `Banco: ${bank?.bank}\n` +
      `Tipo: ${bank?.accountType}\n` +
      `Número: ${bank?.accountNumber}\n` +
      `Titular: ${bank?.accountHolder}\n\n` +
      `Realiza una transferencia de L 1.00 como prueba y usa el número de referencia en el campo correspondiente.`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Copiar Cuenta',
          onPress: () => {
            // TODO: Copy account number to clipboard
            Alert.alert('Copiado', 'Número de cuenta copiado al portapapeles');
          },
        },
      ]
    );
  };

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodCard,
          isSelected && styles.selectedMethodCard,
          { borderColor: isSelected ? method.color : 'transparent' }
        ]}
        onPress={() => setSelectedMethod(method.id)}
      >
        {method.recommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMENDADO</Text>
          </View>
        )}
        
        <View style={styles.methodHeader}>
          <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
            <Ionicons name={method.icon} size={28} color={method.color} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>{method.title}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>
          </View>
          <View style={[
            styles.radioButton,
            isSelected && styles.selectedRadioButton,
            { borderColor: method.color }
          ]}>
            {isSelected && (
              <View style={[styles.radioButtonInner, { backgroundColor: method.color }]} />
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.methodDetails}>
            <Text style={styles.detailsTitle}>Características:</Text>
            {method.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <Ionicons name="checkmark-circle" size={16} color={method.color} />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderBankSelection = () => {
    if (selectedMethod !== 'transfer') return null;

    return (
      <View style={styles.bankSelection}>
        <Text style={styles.sectionTitle}>Selecciona tu Banco</Text>
        <Text style={styles.sectionDescription}>
          Elige el banco desde el cual realizarás las transferencias para tus pagos de estacionamiento.
        </Text>

        {bankAccounts.map((bank) => (
          <TouchableOpacity
            key={bank.id}
            style={[
              styles.bankCard,
              selectedBank === bank.id && styles.selectedBankCard
            ]}
            onPress={() => setSelectedBank(bank.id)}
          >
            <View style={styles.bankHeader}>
              <Text style={styles.bankName}>{bank.bank}</Text>
              <View style={[
                styles.radioButton,
                selectedBank === bank.id && styles.selectedRadioButton
              ]}>
                {selectedBank === bank.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </View>
            
            <Text style={styles.accountType}>{bank.accountType}</Text>
            <Text style={styles.accountNumber}>{bank.accountNumber}</Text>
            <Text style={styles.accountHolder}>A nombre de: {bank.accountHolder}</Text>
            <Text style={styles.bankDescription}>{bank.description}</Text>
          </TouchableOpacity>
        ))}

        {/* Reference Input */}
        <View style={styles.referenceSection}>
          <Text style={styles.inputLabel}>Número de Referencia (Opcional)</Text>
          <Text style={styles.inputDescription}>
            Si realizaste una transferencia de prueba, ingresa el número de referencia aquí
          </Text>
          <TextInput
            style={styles.referenceInput}
            placeholder="Ej: REF123456789"
            placeholderTextColor={theme.colors.text.muted}
            value={accountReference}
            onChangeText={setAccountReference}
          />
          
          <Button
            title="PROBAR TRANSFERENCIA"
            onPress={handleTestTransfer}
            variant="outline"
            size="sm"
            style={styles.testButton}
          />
        </View>
      </View>
    );
  };

  const renderCardInput = () => {
    if (selectedMethod !== 'card') return null;

    return (
      <View style={styles.cardInputSection}>
        <Text style={styles.sectionTitle}>Agregar Nueva Tarjeta</Text>

        <View style={styles.cardInputCard}>
          <Text style={styles.inputLabel}>Nombre del Titular</Text>
          <TextInput
            style={styles.cardNameInput}
            placeholder="Como aparece en la tarjeta"
            placeholderTextColor={theme.colors.text.muted}
            value={cardholderName}
            onChangeText={setCardholderName}
            autoCapitalize="words"
          />

          <Text style={[styles.inputLabel, { marginTop: theme.spacing.md }]}>Información de Tarjeta</Text>
          <CardField
            postalCodeEnabled={false}
            cardStyle={{
              backgroundColor: theme.colors.card,
              textColor: theme.colors.text.primary,
              placeholderColor: theme.colors.text.muted,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.md,
            }}
            style={styles.cardField}
            onCardChange={(cardDetails) => {
              setCardComplete(cardDetails.complete);
            }}
          />

          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.blue[600]} />
            <Text style={styles.securityText}>
              Tus datos están protegidos con encriptación de nivel bancario
            </Text>
          </View>
        </View>

        {/* Saved Cards */}
        {savedCards.length > 0 && (
          <View style={styles.savedCardsSection}>
            <Text style={styles.sectionTitle}>Tarjetas Guardadas</Text>
            {isLoadingMethods ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              savedCards.map((card) => (
                <View key={card.id} style={styles.savedCardItem}>
                  <View style={styles.savedCardInfo}>
                    <Ionicons
                      name="card"
                      size={24}
                      color={theme.colors.blue[600]}
                    />
                    <View style={styles.savedCardDetails}>
                      <Text style={styles.savedCardBrand}>
                        {card.brand.toUpperCase()} •••• {card.last4}
                      </Text>
                      <Text style={styles.savedCardExpiry}>
                        Vence {card.expMonth}/{card.expYear}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.savedCardActions}>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Predeterminada</Text>
                      </View>
                    )}
                    {!card.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefaultCard(card.id)}
                        style={styles.cardActionButton}
                      >
                        <Text style={styles.cardActionText}>Usar</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteCard(card.id)}
                      style={styles.cardDeleteButton}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  const renderCashInstructions = () => {
    if (selectedMethod !== 'cash') return null;

    return (
      <View style={styles.cashInstructions}>
        <Text style={styles.sectionTitle}>Instrucciones para Pago en Efectivo</Text>

        <View style={styles.instructionCard}>
          <LinearGradient
            colors={[theme.colors.blue[400], theme.colors.blue[500]]}
            style={styles.instructionGradient}
          >
            <Ionicons name="information-circle" size={24} color="white" />
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>¿Cómo funciona?</Text>
              <Text style={styles.instructionText}>
                Al salir del estacionamiento, el guardia te informará el monto total a pagar.
                Puedes pagar en efectivo directamente y recibir tu comprobante.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.cashTips}>
          <Text style={styles.tipsTitle}>Consejos para pago en efectivo:</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Ten efectivo disponible o verifica si hay cajero cerca</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Los guardias pueden tener cambio limitado</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Solicita tu comprobante para tus registros</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Considera usar tarjeta para mayor comodidad</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[50], theme.colors.background]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Método de Pago</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payment Methods */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Selecciona tu Método de Pago</Text>
            <Text style={styles.sectionDescription}>
              Configura cómo prefieres pagar por tus servicios de estacionamiento.
            </Text>

            {paymentMethods.map(method => renderPaymentMethodCard(method))}
          </View>

          {/* Card Input */}
          {renderCardInput()}

          {/* Bank Selection for Transfer */}
          {renderBankSelection()}

          {/* Cash Instructions */}
          {renderCashInstructions()}

          {/* Default Setting */}
          <View style={styles.defaultSection}>
            <TouchableOpacity
              style={styles.defaultToggle}
              onPress={() => setSaveAsDefault(!saveAsDefault)}
            >
              <View style={styles.defaultContent}>
                <Ionicons name="star" size={20} color={theme.colors.blue[600]} />
                <Text style={styles.defaultText}>Usar como método predeterminado</Text>
              </View>
              <View style={[styles.toggle, saveAsDefault && styles.toggleActive]}>
                <View style={[styles.toggleThumb, saveAsDefault && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
            <Text style={styles.defaultDescription}>
              Este método se usará automáticamente para todos tus pagos futuros.
            </Text>
          </View>

          {/* Save Button */}
          <Button
            title="GUARDAR CONFIGURACIÓN"
            onPress={handleSavePaymentMethod}
            loading={isLoading}
            style={styles.saveButton}
          />
        </ScrollView>
      </LinearGradient>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  methodsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  methodCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
    position: 'relative',
  },
  selectedMethodCard: {
    backgroundColor: theme.colors.blue[50],
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  recommendedText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    letterSpacing: 0.5,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  methodDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: theme.colors.blue[600],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.blue[600],
  },
  methodDetails: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.blue[100],
  },
  detailsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  // Bank Selection Styles
  bankSelection: {
    marginBottom: theme.spacing.xl,
  },
  bankCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  selectedBankCard: {
    backgroundColor: theme.colors.blue[50],
    borderColor: theme.colors.blue[300],
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bankName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  accountType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  accountNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.blue[600],
    marginBottom: theme.spacing.xs,
  },
  accountHolder: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  bankDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
    fontStyle: 'italic',
  },
  referenceSection: {
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inputDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  referenceInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  testButton: {
    alignSelf: 'flex-start',
  },
  // Cash Instructions Styles
  cashInstructions: {
    marginBottom: theme.spacing.xl,
  },
  instructionCard: {
    marginBottom: theme.spacing.lg,
  },
  instructionGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  instructionContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  instructionTitle: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    marginBottom: theme.spacing.sm,
  },
  instructionText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  cashTips: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  tipsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  tipBullet: {
    fontSize: theme.fontSize.md,
    color: theme.colors.blue[600],
    marginRight: theme.spacing.sm,
    fontWeight: theme.fontWeight.bold as any,
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  // Default Section Styles
  defaultSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  defaultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.blue[600],
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  defaultDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  saveButton: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  // Card Input Styles
  cardInputSection: {
    marginBottom: theme.spacing.xl,
  },
  cardInputCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  cardNameInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardField: {
    height: 50,
    marginVertical: theme.spacing.md,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  securityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  // Saved Cards Styles
  savedCardsSection: {
    marginTop: theme.spacing.xl,
  },
  savedCardItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  savedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedCardDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  savedCardBrand: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  savedCardExpiry: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  savedCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  defaultBadge: {
    backgroundColor: theme.colors.blue[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.blue[600],
    fontWeight: theme.fontWeight.semibold as any,
  },
  cardActionButton: {
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  cardActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.blue[600],
    fontWeight: theme.fontWeight.semibold as any,
  },
  cardDeleteButton: {
    padding: theme.spacing.sm,
  },
});

export default PaymentMethodScreen;