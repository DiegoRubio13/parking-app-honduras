import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

// Navigation prop types
interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Phone validation for Honduras format
const validateHondurasPhone = (phone: string): boolean => {
  // Honduras phone format: 8 digits (removing +504 prefix)
  const cleanedPhone = phone.replace(/\D/g, '');
  return cleanedPhone.length === 8;
};

const formatPhoneNumber = (text: string): string => {
  // Remove all non-digits
  const cleaned = text.replace(/\D/g, '');
  // Limit to 8 digits (Honduras format)
  return cleaned.length <= 8 ? cleaned : cleaned.slice(0, 8);
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useI18n();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [userName, setUserName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const { sendCode, verifyCode, isLoading } = useAuth();

  const handlePhoneChange = (text: string) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhoneNumber(formattedPhone);
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(t.common.error, t.auth.phoneRequired);
      return;
    }

    if (!validateHondurasPhone(phoneNumber)) {
      Alert.alert(t.common.error, t.auth.phoneInvalid);
      return;
    }

    try {
      const result = await sendCode(`+504${phoneNumber}`);

      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        setStep('verification');
        Alert.alert(t.common.success, t.auth.codeSentSuccess);
      } else {
        Alert.alert(t.common.error, result.error || t.auth.codeSentError);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.auth.codeSentError);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(t.common.error, t.auth.codeRequired);
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert(t.common.error, t.auth.codeInvalid);
      return;
    }

    try {
      const result = await verifyCode(
        verificationId,
        verificationCode,
        `+504${phoneNumber}`,
        showNameInput ? userName : undefined
      );

      if (result.success) {
        // Authentication was successful - the AppNavigator will automatically
        // redirect to the appropriate role-based screen based on user data
        Alert.alert(t.common.success, t.auth.verificationSuccess);
      } else {
        if (result.error === 'new_user_needs_name') {
          setShowNameInput(true);
          Alert.alert(t.common.error, t.auth.nameRequired);
        } else {
          Alert.alert(t.common.error, result.error || t.auth.verificationError);
        }
      }
    } catch (error) {
      Alert.alert(t.common.error, t.auth.verificationError);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setVerificationCode('');
    setVerificationId('');
    setShowNameInput(false);
    setUserName('');
  };

  const handleRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  const handleSpecialAccess = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <PhoneContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={[theme.colors.blue[800], theme.colors.blue[600]]}
              style={styles.logoContainer}
            >
              <Image
                source={require('../../../assets/parking-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </LinearGradient>
            <Text style={styles.logoText}>ParKing</Text>
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>{t.auth.welcomeBack}</Text>

          {step === 'phone' ? (
            <>
              {/* Phone Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>{t.auth.phoneNumber}</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.prefixContainer}>
                    <Text style={styles.prefixText}>+504</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder={t.auth.phoneNumberPlaceholder}
                    placeholderTextColor={theme.colors.text.muted}
                    keyboardType="numeric"
                    maxLength={8}
                    autoFocus
                  />
                </View>
              </View>

              {/* Continue Button */}
              <Button
                title={t.auth.sendCode}
                onPress={handleSendCode}
                loading={isLoading}
                disabled={!phoneNumber.trim() || isLoading}
                size="md"
                style={styles.continueButton}
              />
            </>
          ) : (
            <>
              {/* Verification Code Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>{t.auth.verificationCode}</Text>
                <Text style={styles.phoneHint}>{t.auth.codeSentTo} +504{phoneNumber}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.codeInput}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder={t.auth.verificationCodePlaceholder}
                    placeholderTextColor={theme.colors.text.muted}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              {/* Name Input (if needed for new users) */}
              {showNameInput && (
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>{t.auth.fullName}</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.nameInput}
                      value={userName}
                      onChangeText={setUserName}
                      placeholder={t.auth.fullNamePlaceholder}
                      placeholderTextColor={theme.colors.text.muted}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Verify Button */}
              <Button
                title={t.auth.verify}
                onPress={handleVerifyCode}
                loading={isLoading}
                disabled={!verificationCode.trim() || isLoading || (showNameInput && !userName.trim())}
                size="md"
                style={styles.continueButton}
              />

              {/* Back Button */}
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color={theme.colors.text.muted} />
                <Text style={styles.backButtonText}>{t.auth.changeNumber}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>{t.auth.noAccount}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>{t.auth.register}</Text>
            </TouchableOpacity>
          </View>

          {/* Special Access Button */}
          <TouchableOpacity onPress={handleSpecialAccess} style={styles.specialAccessButton}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.specialAccessText}>{t.auth.specialAccess}</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  logoImage: {
    width: 70,
    height: 70,
    tintColor: 'white',
  },
  logoText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.primary,
    letterSpacing: -1,
  },
  welcomeText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 31,
  },
  inputSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  prefixContainer: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  prefixText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  phoneInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium as any,
    letterSpacing: 1,
  },
  phoneHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  codeInput: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium as any,
    letterSpacing: 8,
    textAlign: 'center',
  },
  nameInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium as any,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.muted,
    fontWeight: theme.fontWeight.medium as any,
  },
  continueButton: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  registerSection: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 21,
  },
  registerLink: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  specialAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.blue[50],
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
  },
  specialAccessText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
  },
});

export default LoginScreen;