import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface SubscriptionPlansScreenProps {
  navigation: any;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  featured: boolean;
  features: string[];
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'BÁSICO',
    price: 99,
    featured: false,
    color: '#3b82f6',
    features: [
      '1 emergencia por mes',
      'Grúa hasta 5km',
      'Soporte 8am-6pm',
      'Servicios básicos',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 179,
    featured: true,
    color: '#f59e0b',
    features: [
      '2 emergencias por mes',
      'Grúa hasta 15km',
      'Todas las categorías',
      'Soporte 24/7',
      'Técnico certificado',
      'Prioridad alta',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 299,
    featured: false,
    color: '#8b5cf6',
    features: [
      'Emergencias ilimitadas',
      'Grúa hasta 30km',
      'Prioridad máxima',
      'Técnico especializado',
      'Reembolso combustible',
      'Servicio premium 24/7',
    ],
  },
];

export const SubscriptionPlansScreen: React.FC<SubscriptionPlansScreenProps> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>('premium');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    Alert.alert(
      'Confirmar Suscripción',
      `¿Confirmas la suscripción al plan ${plan.name} por L ${plan.price}/mes?\n\nPrimer mes gratis - puedes cancelar cuando quieras.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Suscribirme',
          onPress: () => {
            Alert.alert('¡Suscripción Exitosa!', `Ya tienes acceso al plan ${plan.name}. Tu primer mes es gratis.`);
            navigation.goBack();
          }
        },
      ]
    );
  };

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => {
    const isSelected = selectedPlan === plan.id;

    return (
      <TouchableOpacity
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
        ]}
        onPress={() => handleSelectPlan(plan.id)}
        activeOpacity={0.8}
      >
        {plan.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>MÁS POPULAR</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: `${plan.color}15` }]}>
            <Ionicons
              name={plan.featured ? "star" : plan.id === 'vip' ? "diamond" : "shield-checkmark"}
              size={24}
              color={plan.color}
            />
          </View>
          <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
          <View style={styles.planPricing}>
            <Text style={styles.planPrice}>L {plan.price}</Text>
            <Text style={styles.planPeriod}>/mes</Text>
          </View>
        </View>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => handleSelectPlan(plan.id)}
          style={[
            styles.selectButton,
            isSelected && styles.selectedButton
          ]}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.selectButtonText,
            isSelected && styles.selectedButtonText
          ]}>
            SELECCIONAR {plan.name}
          </Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#dc2626', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Planes SOS</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.headerSubtitle}>Elige tu plan de protección vehicular</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plans */}
        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        {/* Benefits Info */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.benefitsTitle}>Beneficios incluidos</Text>
          </View>
          <Text style={styles.benefitsText}>
            • Primer mes completamente gratis{'\n'}
            • Cancela cuando quieras, sin compromisos{'\n'}
            • Soporte especializado en emergencias{'\n'}
            • Red de proveedores certificados{'\n'}
            • Respuesta rápida garantizada
          </Text>
        </View>

        {/* Subscribe Button */}
        {selectedPlan && (
          <View style={styles.subscribeSection}>
            <Button
              title="SUSCRIBIRME AHORA"
              onPress={handleSubscribe}
              variant="primary"
              size="lg"
              style={styles.subscribeButton}
            />
            <Text style={styles.subscribeNote}>
              Tu primer mes es gratis. Puedes cancelar en cualquier momento.
            </Text>
          </View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  plansContainer: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  planCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    position: 'relative',
    ...theme.shadows.md,
  },
  featuredPlanCard: {
    borderColor: '#f59e0b',
  },
  selectedPlanCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: '#f0f9ff',
  },
  featuredBadge: {
    position: 'absolute',
    top: -10,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: '#f59e0b',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    zIndex: 1,
  },
  featuredBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    letterSpacing: 0.5,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  planIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  planName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    marginBottom: theme.spacing.xs,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.text.primary,
  },
  planPeriod: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  planFeatures: {
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  selectButton: {
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
  },
  selectedButtonText: {
    color: 'white',
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  benefitsCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  benefitsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  benefitsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  subscribeSection: {
    alignItems: 'center',
  },
  subscribeButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  subscribeNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});

export default SubscriptionPlansScreen;