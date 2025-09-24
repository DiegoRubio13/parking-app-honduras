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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import { registerUser } from '../../services/authService';
import type { RegisterData } from '../../services/authService';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateHondurasPhone = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '');
  return cleanedPhone.length === 8;
};

const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  return cleaned.length <= 8 ? cleaned : cleaned.slice(0, 8);
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    let processedValue = value;
    
    // Special handling for phone number
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t.auth.nameRequired;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t.auth.nameMinLength;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = t.auth.phoneRequired;
    } else if (!validateHondurasPhone(formData.phone)) {
      newErrors.phone = t.auth.phoneInvalid;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t.auth.emailRequired;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.auth.emailInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const fullPhoneNumber = `+504${formData.phone}`;
      const registrationData: RegisterData = {
        name: formData.name,
        phone: fullPhoneNumber,
        email: formData.email,
        role: 'client'
      };

      const result = await registerUser(registrationData);

      if (result.success && result.verificationId) {
        Alert.alert(
          t.common.success,
          t.auth.registrationSuccess,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to SMS verification
                navigation.navigate('SMSVerificationScreen', {
                  phoneNumber: fullPhoneNumber,
                  verificationId: result.verificationId,
                  confirmationResult: result.confirmationResult,
                  isRegistration: true,
                  registerData: registrationData
                });
              }
            }
          ]
        );
      } else {
        Alert.alert(t.common.error, result.error || t.auth.registrationError);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.auth.registrationError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = formData.name.trim() && formData.phone.trim() && formData.email.trim();

  return (
    <PhoneContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.auth.registration}</Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>{t.auth.createNewAccount}</Text>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.auth.fullName}</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.name && styles.inputFieldError
                ]}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder={t.auth.fullNamePlaceholder}
                placeholderTextColor={theme.colors.text.muted}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.auth.phoneNumber}</Text>
              <View style={[
                styles.phoneInputContainer,
                errors.phone && styles.inputFieldError
              ]}>
                <Text style={styles.phonePrefix}>+504</Text>
                <TextInput
                  style={styles.phoneInput}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="________"
                  placeholderTextColor={theme.colors.text.muted}
                  keyboardType="numeric"
                  maxLength={8}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
              </View>
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.auth.email}</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.email && styles.inputFieldError
                ]}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder={t.auth.emailPlaceholder}
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <Button
              title={t.auth.register.toUpperCase()}
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isFormValid || isLoading}
              size="lg"
              style={styles.registerButton}
            />

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>{t.auth.alreadyHaveAccount}</Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>{t.auth.login}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  inputField: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    ...theme.shadows.sm,
  },
  inputFieldError: {
    borderColor: theme.colors.error,
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
  },
  registerButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 21,
  },
  loginLink: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
});

export default RegisterScreen;