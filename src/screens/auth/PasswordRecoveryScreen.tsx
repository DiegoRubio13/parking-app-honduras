import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface PasswordRecoveryScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const validateHondurasPhone = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '');
  return cleanedPhone.length === 8;
};

const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  return cleaned.length <= 8 ? cleaned : cleaned.slice(0, 8);
};

export const PasswordRecoveryScreen: React.FC<PasswordRecoveryScreenProps> = ({ 
  navigation 
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handlePhoneChange = (text: string) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhoneNumber(formattedPhone);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!phoneNumber.trim()) {
      setError('El número de teléfono es requerido');
      return false;
    }

    if (!validateHondurasPhone(phoneNumber)) {
      setError('Ingresa un número válido de 8 dígitos');
      return false;
    }

    setError('');
    return true;
  };

  const handleSendPIN = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `+504${phoneNumber}`;
      
      // TODO: Implement password recovery logic
      console.log('Sending new PIN to:', fullPhoneNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'PIN enviado', 
        `Se ha enviado un nuevo PIN al número ${fullPhoneNumber}. Revisa tus mensajes de texto.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to login or to verification screen
              navigation.navigate('SMSVerificationScreen', {
                phoneNumber: fullPhoneNumber
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el PIN. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    // Navigate back to the login screen
    navigation.navigate('LoginScreen');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = phoneNumber.trim() && !error;

  return (
    <PhoneContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar acceso</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Refresh Icon */}
          <LinearGradient
            colors={[theme.colors.blue[200], theme.colors.blue[300]]}
            style={styles.iconContainer}
          >
            <Ionicons name="refresh" size={36} color={theme.colors.primary} />
          </LinearGradient>

          {/* Title */}
          <Text style={styles.title}>¿Olvidaste tu PIN?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Ingresa tu número de teléfono y te enviaremos un nuevo PIN
          </Text>

          {/* Phone Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de teléfono</Text>
            <View style={[
              styles.phoneInputContainer,
              error ? styles.inputError : null
            ]}>
              <Text style={styles.phonePrefix}>+504</Text>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder="________"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="numeric"
                maxLength={8}
                autoFocus
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Send PIN Button */}
          <Button
            title="ENVIAR NUEVO PIN"
            onPress={handleSendPIN}
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            size="lg"
            style={styles.sendPinButton}
          />

          {/* Back to Home Link */}
          <TouchableOpacity onPress={handleBackToHome}>
            <Text style={styles.backToHomeLink}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: theme.spacing.xxl,
  },
  backButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: theme.spacing.xxl,
    maxWidth: 280,
  },
  inputGroup: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'left',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  phonePrefix: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  phoneInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.md,
    fontWeight: theme.fontWeight.medium as any,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    textAlign: 'left',
  },
  sendPinButton: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  backToHomeLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
    textAlign: 'center',
  },
});

export default PasswordRecoveryScreen;