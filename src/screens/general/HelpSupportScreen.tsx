import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface HelpSupportScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
  color: string;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'report'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: '¿Cómo funciona el sistema de estacionamiento?',
      answer: 'El sistema ParKing utiliza códigos QR únicos para cada usuario. Al llegar al estacionamiento, el guardia escanea tu código QR para registrar tu entrada. Al salir, se escanea nuevamente para calcular el tiempo y cobrar la tarifa correspondiente.',
      expanded: false,
    },
    {
      id: '2',
      question: '¿Qué métodos de pago acepta la aplicación?',
      answer: 'Actualmente aceptamos transferencias bancarias y pagos en efectivo. Estamos trabajando en integrar más métodos de pago como tarjetas de crédito y débito.',
      expanded: false,
    },
    {
      id: '3',
      question: '¿Puedo reservar un espacio de estacionamiento?',
      answer: 'Por ahora el sistema funciona por orden de llegada. Sin embargo, estamos desarrollando una función de reservas que estará disponible próximamente.',
      expanded: false,
    },
    {
      id: '4',
      question: '¿Qué hago si pierdo mi código QR?',
      answer: 'Si pierdes acceso a tu código QR, puedes regenerar uno nuevo desde la configuración de tu perfil. Ve a "Mi QR Personal" y selecciona "Regenerar código".',
      expanded: false,
    },
    {
      id: '5',
      question: '¿Cómo veo mi historial de estacionamientos?',
      answer: 'Puedes ver todo tu historial desde la pantalla principal. Allí encontrarás detalles de cada sesión incluyendo ubicación, tiempo y costo.',
      expanded: false,
    },
    {
      id: '6',
      question: '¿El sistema funciona las 24 horas?',
      answer: 'Sí, ParKing funciona las 24 horas del día, 7 días a la semana. Sin embargo, algunos estacionamientos pueden tener horarios específicos.',
      expanded: false,
    },
  ]);

  const supportOptions: SupportOption[] = [
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chatea con nuestro equipo de soporte',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => handleWhatsAppContact(),
    },
    {
      id: 'phone',
      title: 'Llamada',
      description: '+504 2222-3333',
      icon: 'call',
      color: theme.colors.blue[600],
      action: () => handlePhoneCall(),
    },
    {
      id: 'email',
      title: 'Email',
      description: 'soporte@parking.hn',
      icon: 'mail',
      color: theme.colors.blue[500],
      action: () => handleEmailContact(),
    },
    {
      id: 'schedule',
      title: 'Horarios',
      description: 'Lun - Vie: 8:00 AM - 6:00 PM',
      icon: 'time',
      color: theme.colors.text.secondary,
      action: () => {},
    },
  ];

  const handleWhatsAppContact = async () => {
    const phoneNumber = '+50422223333';
    const message = 'Hola, necesito ayuda con ParKing';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir WhatsApp. Asegúrate de tener la aplicación instalada.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    }
  };

  const handlePhoneCall = async () => {
    const phoneNumber = 'tel:+50422223333';
    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'No se puede realizar la llamada');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la llamada');
    }
  };

  const handleEmailContact = async () => {
    const email = 'mailto:soporte@parking.hn?subject=Consulta%20ParKing&body=Describe%20tu%20consulta%20aquí...';
    try {
      const supported = await Linking.canOpenURL(email);
      if (supported) {
        await Linking.openURL(email);
      } else {
        Alert.alert('Error', 'No se puede abrir el cliente de correo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el correo');
    }
  };

  const handleToggleFAQ = (id: string) => {
    setFaqs(prevFaqs =>
      prevFaqs.map(faq =>
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      )
    );
  };

  const handleSubmitReport = async () => {
    if (!reportMessage.trim()) {
      Alert.alert('Error', 'Por favor escribe tu reporte');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement report submission logic
      console.log('Submitting report:', reportMessage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Reporte Enviado',
        'Tu reporte ha sido enviado exitosamente. Nuestro equipo lo revisará pronto.',
        [
          {
            text: 'OK',
            onPress: () => {
              setReportMessage('');
              setActiveTab('faq');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFAQTab = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en preguntas frecuentes..."
          placeholderTextColor={theme.colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* FAQ List */}
      <View style={styles.faqContainer}>
        {filteredFAQs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => handleToggleFAQ(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={faq.expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.text.secondary}
              />
            </View>
            {faq.expanded && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderContactTab = () => (
    <View style={styles.contactContainer}>
      <Text style={styles.contactTitle}>Canales de Atención</Text>
      <Text style={styles.contactDescription}>
        Nuestro equipo está listo para ayudarte. Elige el canal que prefieras:
      </Text>

      <View style={styles.supportOptions}>
        {supportOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.supportOption}
            onPress={option.action}
            disabled={option.id === 'schedule'}
          >
            <View style={[styles.supportIcon, { backgroundColor: `${option.color}20` }]}>
              <Ionicons name={option.icon} size={24} color={option.color} />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>{option.title}</Text>
              <Text style={styles.supportDescription}>{option.description}</Text>
            </View>
            {option.id !== 'schedule' && (
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReportTab = () => (
    <View style={styles.reportContainer}>
      <Text style={styles.reportTitle}>Reportar un Problema</Text>
      <Text style={styles.reportDescription}>
        Describe el problema que experimentaste para que podamos ayudarte mejor.
      </Text>

      <View style={styles.reportForm}>
        <Text style={styles.inputLabel}>Descripción del problema</Text>
        <TextInput
          style={styles.reportTextArea}
          placeholder="Describe detalladamente el problema que experimentaste..."
          placeholderTextColor={theme.colors.text.muted}
          value={reportMessage}
          onChangeText={setReportMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Button
          title="ENVIAR REPORTE"
          onPress={handleSubmitReport}
          loading={isLoading}
          disabled={!reportMessage.trim()}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.reportTips}>
        <Text style={styles.tipsTitle}>Consejos para un mejor reporte:</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Incluye detalles específicos del problema</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Menciona cuándo ocurrió el problema</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Si aplica, incluye el código QR o ubicación</Text>
        </View>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
            onPress={() => setActiveTab('faq')}
          >
            <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
              FAQ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
            onPress={() => setActiveTab('contact')}
          >
            <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
              Contacto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'report' && styles.activeTab]}
            onPress={() => setActiveTab('report')}
          >
            <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>
              Reportar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'faq' && renderFAQTab()}
          {activeTab === 'contact' && renderContactTab()}
          {activeTab === 'report' && renderReportTab()}
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
  tabNavigation: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    ...theme.shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.blue[600],
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: 'white',
    fontWeight: theme.fontWeight.bold as any,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  // FAQ Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
  },
  faqContainer: {
    marginBottom: theme.spacing.xl,
  },
  faqItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  faqAnswer: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },
  // Contact Styles
  contactContainer: {
    marginBottom: theme.spacing.xl,
  },
  contactTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  contactDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  supportOptions: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[50],
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  supportDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  // Report Styles
  reportContainer: {
    marginBottom: theme.spacing.xl,
  },
  reportTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  reportDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  reportForm: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  reportTextArea: {
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    minHeight: 120,
    marginBottom: theme.spacing.lg,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: '100%',
  },
  reportTips: {
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
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
});

export default HelpSupportScreen;