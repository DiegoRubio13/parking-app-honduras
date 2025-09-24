import React, { useState, useRef, useEffect } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { completeRegistration } from '../../services/authService';

type SMSVerificationScreenProps = NativeStackScreenProps<AuthStackParamList, 'SMSVerification'>;

export const SMSVerificationScreen: React.FC<SMSVerificationScreenProps> = ({
  navigation,
  route
}) => {
  const { t } = useI18n();
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));
  const { sendCode, verifyCode } = useAuth();

  const phoneNumber = route?.params?.phone || '+504 9999-9999';
  const verificationId = route?.params?.verificationId || '';
  const confirmationResult = route?.params?.confirmationResult;
  const isRegistration = route?.params?.isRegistration || false;
  const registerData = route?.params?.registerData;

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow digits
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = numericValue;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (numericValue.length === 1 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');

    if (code.length !== 6) {
      Alert.alert(t.common.error, t.auth.codeInvalid);
      return;
    }

    setIsLoading(true);
    try {
      let result;

      if (isRegistration) {
        // Complete registration flow
        result = await completeRegistration(
          verificationId,
          code,
          phoneNumber,
          confirmationResult
        );
      } else {
        // Login flow
        result = await verifyCode(
          verificationId,
          code,
          phoneNumber,
          undefined,
          confirmationResult
        );
      }

      if (result.success) {
        // Navigation will be handled by the auth state listener in AppNavigator
        // The user will be redirected based on their role automatically
        Alert.alert(t.common.success, t.auth.verificationSuccess);
      } else {
        Alert.alert(t.common.error, result.error || t.auth.verificationError);
        // Clear the code inputs on error
        setVerificationCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert(t.common.error, t.auth.verificationError);
      // Clear the code inputs on error
      setVerificationCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      const result = await sendCode(phoneNumber);

      if (result.success) {
        // Reset timer
        setResendTimer(30);
        setCanResend(false);

        Alert.alert(t.common.success, t.auth.codeSentSuccess);
      } else {
        Alert.alert(t.common.error, result.error || t.auth.codeSentError);
      }
    } catch (error) {
      Alert.alert(t.common.error, t.auth.codeSentError);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    return phone.replace(/(\+504)(\d{4})(\d{4})/, '$1 $2-$3');
  };

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
          <Text style={styles.headerTitle}>{t.auth.smsVerification}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Phone Icon */}
          <LinearGradient
            colors={[theme.colors.blue[200], theme.colors.blue[300]]}
            style={styles.iconContainer}
          >
            <Ionicons name="phone-portrait-outline" size={36} color={theme.colors.primary} />
          </LinearGradient>

          {/* Title */}
          <Text style={styles.title}>{t.auth.verificationCode}</Text>

          {/* Description */}
          <Text style={styles.description}>{t.auth.codeSentTo}</Text>
          <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>

          {/* Code Inputs */}
          <View style={styles.codeContainer}>
            {verificationCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit !== '' && styles.codeInputFilled
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Text */}
          <TouchableOpacity onPress={handleResendCode} disabled={!canResend}>
            <Text style={[styles.resendText, canResend && styles.resendTextActive]}>
              {canResend ? t.auth.resendCode : `${t.auth.resendIn} (${resendTimer}s)`}
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <Button
            title={t.auth.verify}
            onPress={handleVerify}
            loading={isLoading}
            disabled={verificationCode.join('').length !== 6 || isLoading}
            size="lg"
            style={styles.verifyButton}
          />
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
    marginBottom: theme.spacing.xs,
  },
  phoneNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  codeInput: {
    width: 50,
    height: 60,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    ...theme.shadows.sm,
  },
  codeInputFilled: {
    borderColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  resendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  resendTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold as any,
  },
  verifyButton: {
    width: '100%',
  },
});

export default SMSVerificationScreen;