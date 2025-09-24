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
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
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

const validateInternationalPhone = (phone: string, dialCode: string): boolean => {
  const cleanedPhone = phone.replace(/\D/g, '');
  if (cleanedPhone.length < 6 || cleanedPhone.length > 15) {
    return false;
  }
  return true;
};

const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  return cleaned.length <= 15 ? cleaned : cleaned.slice(0, 15);
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useI18n();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [userName, setUserName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('HN');
  const [callingCode, setCallingCode] = useState<string>('504');
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
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

    if (!validateInternationalPhone(phoneNumber, callingCode)) {
      Alert.alert(t.common.error, 'Número de teléfono inválido');
      return;
    }

    try {
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
      console.log('Sending SMS to:', fullPhoneNumber);
      const result = await sendCode(fullPhoneNumber);

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
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
      const result = await verifyCode(
        verificationId,
        verificationCode,
        fullPhoneNumber,
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

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setShowCountryPicker(false);
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
                  <TouchableOpacity
                    style={styles.countryPickerButton}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <CountryPicker
                      countryCode={countryCode}
                      withFilter
                      withFlag
                      withCallingCode
                      withEmoji
                      onSelect={onSelectCountry}
                      visible={showCountryPicker}
                      onClose={() => setShowCountryPicker(false)}
                    />
                    <Text style={styles.prefixText}>+{callingCode}</Text>
                    <Ionicons name="chevron-down" size={16} color={theme.colors.text.muted} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder="1234567890"
                    placeholderTextColor={theme.colors.text.muted}
                    keyboardType="numeric"
                    maxLength={15}
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
                <Text style={styles.phoneHint}>{t.auth.codeSentTo} +{callingCode}{phoneNumber}</Text>
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
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
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