import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation types - assuming a client stack navigator
type ClientStackParamList = {
  HomeNotLogged: undefined;
  Login: undefined;
  Register: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'HomeNotLogged'>;

const { width } = Dimensions.get('window');

export const HomeNotLoggedScreen: React.FC<Props> = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[800], theme.colors.blue[600], theme.colors.blue[500]]}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-outline" size={60} color="white" />
            </View>
            <Text style={styles.title}>ParKing</Text>
            <Text style={styles.subtitle}>Tu estacionamiento inteligente</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name="qr-code" size={32} color={theme.colors.blue[600]} />
              </View>
              <Text style={styles.featureTitle}>Código QR Personal</Text>
              <Text style={styles.featureDescription}>
                Accede al estacionamiento con tu código QR único y seguro
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name="time" size={32} color={theme.colors.blue[600]} />
              </View>
              <Text style={styles.featureTitle}>Control de Tiempo</Text>
              <Text style={styles.featureDescription}>
                Compra minutos y monitorea tu saldo en tiempo real
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={32} color={theme.colors.blue[600]} />
              </View>
              <Text style={styles.featureTitle}>Seguro y Confiable</Text>
              <Text style={styles.featureDescription}>
                Sistema encriptado de extremo a extremo para tu seguridad
              </Text>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>¿Por qué elegir ParKing?</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.benefitText}>Sin esperas en filas</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.benefitText}>Pago digital seguro</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.benefitText}>Historial de sesiones</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={styles.benefitText}>Soporte 24/7</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              size="lg"
              style={styles.loginButton}
            />
            
            <Button
              title="Crear Cuenta Nueva"
              onPress={handleRegister}
              variant="outline"
              size="lg"
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al usar ParKing aceptas nuestros términos y condiciones
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: theme.fontSize.xxxl + 8,
    fontWeight: theme.fontWeight.extrabold,
    color: 'white',
    marginBottom: theme.spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: theme.spacing.xxl,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  benefitsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  benefitText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  actionsContainer: {
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
  },
  registerButton: {
    borderColor: 'white',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});