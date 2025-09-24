import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface UsageGuideScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  details: string[];
  tips?: string[];
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
  color: string;
}

const { width } = Dimensions.get('window');

export const UsageGuideScreen: React.FC<UsageGuideScreenProps> = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Cómo comenzar a usar ParKing',
      color: theme.colors.blue[600],
      steps: [
        {
          id: 'register',
          title: 'Crear tu Cuenta',
          description: 'Regístrate con tu número de teléfono',
          icon: 'person-add',
          details: [
            'Abre la aplicación ParKing',
            'Selecciona "Registrarse"',
            'Ingresa tu número de teléfono (+504)',
            'Verifica el código SMS que recibirás',
            'Completa tu perfil con nombre y datos básicos',
          ],
          tips: [
            'Asegúrate de usar un número válido hondureño',
            'El código SMS puede tardar hasta 2 minutos',
          ],
        },
        {
          id: 'profile',
          title: 'Configurar Perfil',
          description: 'Completa tu información personal',
          icon: 'person',
          details: [
            'Ve a "Mi Perfil" desde el menú principal',
            'Agrega tu nombre completo',
            'Sube una foto de perfil (opcional)',
            'Configura tu método de pago preferido',
            'Activa las notificaciones importantes',
          ],
          tips: [
            'Una foto de perfil ayuda a los guardias a identificarte',
            'Mantén tu información actualizada',
          ],
        },
        {
          id: 'qr-code',
          title: 'Tu Código QR Personal',
          description: 'Aprende sobre tu identificación única',
          icon: 'qr-code',
          details: [
            'Ve a "Mi QR Personal" en configuración',
            'Tu código QR es único e intransferible',
            'Los guardias lo escanearan para identificarte',
            'Puedes regenerar el código si es necesario',
            'Guarda una captura de pantalla como respaldo',
          ],
          tips: [
            'No compartas tu código QR con extraños',
            'Si pierdes tu teléfono, regenera el código inmediatamente',
          ],
        },
      ],
    },
    {
      id: 'parking-process',
      title: 'Proceso de Estacionamiento',
      description: 'Cómo usar el estacionamiento paso a paso',
      color: theme.colors.blue[500],
      steps: [
        {
          id: 'arrival',
          title: 'Al Llegar',
          description: 'Qué hacer cuando llegas al estacionamiento',
          icon: 'car',
          details: [
            'Busca al guardia en la entrada',
            'Muestra tu código QR en la pantalla',
            'El guardia escaneará tu código',
            'Se registrará tu hora de entrada automáticamente',
            'Estaciona en el espacio que te asignen',
          ],
          tips: [
            'Ten tu teléfono listo con el código QR visible',
            'Asegúrate de que la pantalla esté limpia y brillante',
          ],
        },
        {
          id: 'parking',
          title: 'Durante el Estacionamiento',
          description: 'Qué puedes hacer mientras tu vehículo está estacionado',
          icon: 'time',
          details: [
            'Revisa el tiempo transcurrido en la app',
            'Recibe notificaciones de tiempo límite',
            'Extiende tu tiempo si es necesario',
            'Consulta tu ubicación de estacionamiento',
            'Ve el costo acumulado en tiempo real',
          ],
          tips: [
            'Configura alertas antes de que se acabe tu tiempo',
            'Toma una foto de dónde estacionaste',
          ],
        },
        {
          id: 'departure',
          title: 'Al Salir',
          description: 'Proceso para retirar tu vehículo',
          icon: 'exit',
          details: [
            'Ve hacia la salida con tu vehículo',
            'Muestra tu código QR al guardia',
            'Se calculará el tiempo total y costo',
            'Realiza el pago según el método configurado',
            'Recibe tu comprobante digital',
          ],
          tips: [
            'Ten tu método de pago listo',
            'Guarda el comprobante para tus registros',
          ],
        },
      ],
    },
    {
      id: 'payments',
      title: 'Pagos y Tarifas',
      description: 'Cómo funcionan los pagos en ParKing',
      color: theme.colors.blue[400],
      steps: [
        {
          id: 'payment-methods',
          title: 'Métodos de Pago',
          description: 'Opciones disponibles para pagar',
          icon: 'card',
          details: [
            'Transferencia bancaria (recomendado)',
            'Pago en efectivo al guardia',
            'Planes prepagos mensuales',
            'Configuración de método predeterminado',
            'Historial completo de transacciones',
          ],
          tips: [
            'Las transferencias son más rápidas y seguras',
            'Los pagos en efectivo requieren cambio exacto',
          ],
        },
        {
          id: 'pricing',
          title: 'Estructura de Precios',
          description: 'Cómo se calculan las tarifas',
          icon: 'calculator',
          details: [
            'Tarifa base por la primera hora',
            'Costo adicional por hora extra',
            'Descuentos por tiempo prolongado',
            'Tarifas especiales los fines de semana',
            'Planes mensuales con ahorro significativo',
          ],
          tips: [
            'Los planes mensuales son más económicos para uso frecuente',
            'Consulta las tarifas específicas por ubicación',
          ],
        },
      ],
    },
    {
      id: 'tips-tricks',
      title: 'Consejos y Trucos',
      description: 'Maximiza tu experiencia con ParKing',
      color: theme.colors.blue[300],
      steps: [
        {
          id: 'efficiency',
          title: 'Uso Eficiente',
          description: 'Consejos para ahorrar tiempo y dinero',
          icon: 'bulb',
          details: [
            'Planifica tu tiempo de estacionamiento',
            'Usa notificaciones para gestionar el tiempo',
            'Considera planes mensuales si usas frecuentemente',
            'Mantén actualizada tu información de pago',
            'Revisa el historial para analizar patrones',
          ],
          tips: [
            'Los primeros 15 minutos suelen ser gratuitos',
            'Programa recordatorios para evitar multas',
          ],
        },
        {
          id: 'troubleshooting',
          title: 'Solución de Problemas',
          description: 'Qué hacer si algo no funciona',
          icon: 'construct',
          details: [
            'QR no se escanea: limpia la pantalla y aumenta brillo',
            'App lenta: cierra y vuelve a abrir la aplicación',
            'Pago fallido: verifica tu método de pago',
            'No encuentras tu auto: usa la función de ubicación',
            'Contacta soporte si el problema persiste',
          ],
          tips: [
            'Mantén la app actualizada',
            'Ten siempre una opción de pago de respaldo',
          ],
        },
      ],
    },
  ];

  const handleStepToggle = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  const getCurrentSection = () => {
    return guideSections.find(section => section.id === activeSection);
  };

  const renderStepCard = (step: GuideStep) => {
    const isExpanded = expandedStep === step.id;

    return (
      <TouchableOpacity
        key={step.id}
        style={styles.stepCard}
        onPress={() => handleStepToggle(step.id)}
        activeOpacity={0.7}
      >
        <View style={styles.stepHeader}>
          <View style={[styles.stepIcon, { backgroundColor: `${getCurrentSection()?.color}20` }]}>
            <Ionicons name={step.icon} size={24} color={getCurrentSection()?.color} />
          </View>
          <View style={styles.stepTitleContainer}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.text.secondary}
          />
        </View>

        {isExpanded && (
          <View style={styles.stepContent}>
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Pasos detallados:</Text>
              {step.details.map((detail, index) => (
                <View key={index} style={styles.detailItem}>
                  <View style={styles.detailNumber}>
                    <Text style={styles.detailNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>

            {step.tips && step.tips.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>Consejos útiles:</Text>
                {step.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Guía de Uso</Text>
        </View>

        {/* Section Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sectionNavigation}
          contentContainerStyle={styles.sectionNavigationContent}
        >
          {guideSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionTab,
                activeSection === section.id && styles.activeSectionTab,
                { backgroundColor: activeSection === section.id ? section.color : 'transparent' }
              ]}
              onPress={() => handleSectionChange(section.id)}
            >
              <Text style={[
                styles.sectionTabText,
                activeSection === section.id && styles.activeSectionTabText
              ]}>
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          {getCurrentSection() && (
            <>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={[getCurrentSection()!.color, `${getCurrentSection()!.color}80`]}
                  style={styles.sectionHeaderGradient}
                >
                  <Text style={styles.sectionTitle}>{getCurrentSection()!.title}</Text>
                  <Text style={styles.sectionDescription}>
                    {getCurrentSection()!.description}
                  </Text>
                </LinearGradient>
              </View>

              {/* Steps */}
              <View style={styles.stepsContainer}>
                {getCurrentSection()!.steps.map((step) => renderStepCard(step))}
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Acciones Rápidas</Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="call" size={20} color={theme.colors.blue[600]} />
                    <Text style={styles.actionButtonText}>Contactar Soporte</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="help-circle" size={20} color={theme.colors.blue[600]} />
                    <Text style={styles.actionButtonText}>FAQ</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title="VER VIDEO TUTORIAL"
                  onPress={() => {
                    // TODO: Navigate to video tutorial or open external link
                  }}
                  variant="outline"
                  style={styles.tutorialButton}
                />
              </View>
            </>
          )}
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
  sectionNavigation: {
    maxHeight: 50,
    marginBottom: theme.spacing.lg,
  },
  sectionNavigationContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeSectionTab: {
    borderColor: 'transparent',
  },
  sectionTabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
  },
  activeSectionTabText: {
    color: 'white',
    fontWeight: theme.fontWeight.bold as any,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderGradient: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.fontSize.md,
    color: 'white',
    opacity: 0.9,
  },
  stepsContainer: {
    marginBottom: theme.spacing.xl,
  },
  stepCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  stepContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  detailsSection: {
    marginBottom: theme.spacing.lg,
  },
  detailsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  detailNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  detailNumberText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.blue[700],
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  tipsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  tipBullet: {
    fontSize: theme.fontSize.sm,
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
  quickActions: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  quickActionsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.blue[600],
    marginLeft: theme.spacing.sm,
    fontWeight: theme.fontWeight.medium as any,
  },
  tutorialButton: {
    width: '100%',
  },
});

export default UsageGuideScreen;