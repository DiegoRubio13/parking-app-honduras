import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';

type RoleSelectionNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'RoleSelection'>,
  StackNavigationProp<RootStackParamList>
>;

interface RoleSelectionScreenProps {
  navigation: RoleSelectionNavigationProp;
}

interface PinDotProps {
  filled: boolean;
}

const PinDot: React.FC<PinDotProps> = ({ filled }) => (
  <View style={[styles.pinDot, filled && styles.pinDotFilled]}>
    {filled && <View style={styles.pinDotInner} />}
  </View>
);

interface KeypadButtonProps {
  number?: string;
  onPress: () => void;
  isDelete?: boolean;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({ number, onPress, isDelete }) => (
  <TouchableOpacity
    style={[styles.keypadButton, isDelete && styles.deleteButton]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.keypadButtonText, isDelete && styles.deleteButtonText]}>
      {isDelete ? 'Borrar' : number}
    </Text>
  </TouchableOpacity>
);

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation }) => {
  const [pin, setPIN] = useState<string[]>(Array(6).fill(''));
  const [actualPin, setActualPin] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNumberPress = (number: string) => {
    if (currentIndex < 6) {
      const newPin = [...pin];
      const newActualPin = [...actualPin];
      newPin[currentIndex] = '●';
      newActualPin[currentIndex] = number;
      setPIN(newPin);
      setActualPin(newActualPin);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = () => {
    if (currentIndex > 0) {
      const newPin = [...pin];
      const newActualPin = [...actualPin];
      const newIndex = currentIndex - 1;
      newPin[newIndex] = '';
      newActualPin[newIndex] = '';
      setPIN(newPin);
      setActualPin(newActualPin);
      setCurrentIndex(newIndex);
    }
  };

  const handleAccess = async () => {
    const enteredPin = pin.filter(digit => digit !== '').length;
    
    if (enteredPin !== 6) {
      Alert.alert('Error', 'Por favor ingresa el PIN completo de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const pinString = actualPin.join('');
      
      // Simulate API call for authorization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // PIN validation logic for different roles
      // In a real app, these would be stored securely in Firebase
      if (pinString === '000000') {
        // Admin access - update user role in Firebase
        Alert.alert('Acceso autorizado', 'Bienvenido Panel Administrativo', [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Update user role to admin in Firebase
              // For now, just navigate - role will be updated in Firebase later
              navigation.reset({
                index: 0,
                routes: [{ name: 'Admin' }],
              });
            }
          }
        ]);
      } else if (pinString === '123456') {
        // Guard access - update user role in Firebase
        Alert.alert('Acceso autorizado', 'Bienvenido Panel de Guardia', [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Update user role to guard in Firebase
              // For now, just navigate - role will be updated in Firebase later
              navigation.reset({
                index: 0,
                routes: [{ name: 'Guard' }],
              });
            }
          }
        ]);
      } else {
        Alert.alert('PIN Incorrecto', 'El PIN ingresado no es válido');
        // Reset PIN on invalid entry
        setPIN(Array(6).fill(''));
        setActualPin(Array(6).fill(''));
        setCurrentIndex(0);
      }
    } catch (error) {
      Alert.alert('Error', 'PIN incorrecto. Inténtalo de nuevo.');
      // Reset PIN on error
      setPIN(Array(6).fill(''));
      setActualPin(Array(6).fill(''));
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientAccess = () => {
    Alert.alert('Acceso de Cliente', 'Bienvenido Cliente', [
      {
        text: 'OK',
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Client' }],
          });
        }
      }
    ]);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderKeypad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    return (
      <View style={styles.keypad}>
        {numbers.map((number) => (
          <KeypadButton
            key={number}
            number={number}
            onPress={() => handleNumberPress(number)}
          />
        ))}
        <KeypadButton
          isDelete
          onPress={handleDelete}
        />
        <KeypadButton
          number="0"
          onPress={() => handleNumberPress('0')}
        />
        <View style={styles.keySpacer} />
      </View>
    );
  };

  return (
    <PhoneContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Acceso especial</Text>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Icon */}
          <LinearGradient
            colors={[theme.colors.blue[200], theme.colors.blue[300]]}
            style={styles.iconContainer}
          >
            <Ionicons name="car-outline" size={60} color={theme.colors.blue[600]} />
          </LinearGradient>

          {/* Title */}
          <Text style={styles.title}>Acceso especial</Text>

          {/* Description */}
          <Text style={styles.description}>Ingresa tu PIN de acceso</Text>

          {/* PIN Dots */}
          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <PinDot key={index} filled={digit !== ''} />
            ))}
          </View>

          {/* Keypad */}
          {renderKeypad()}

          {/* Access Buttons */}
          <Button
            title="ACCEDER (STAFF)"
            onPress={handleAccess}
            loading={isLoading}
            disabled={pin.filter(digit => digit !== '').length !== 6 || isLoading}
            size="lg"
            style={styles.accessButton}
          />
          
          <Button
            title="ACCESO CLIENTE"
            onPress={handleClientAccess}
            variant="primary"
            size="lg"
            style={[styles.accessButton, styles.clientButton]}
          />
        </ScrollView>
      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
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
  iconImage: {
    width: 40,
    height: 40,
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
  },
  pinContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  pinDot: {
    width: 50,
    height: 60,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  pinDotFilled: {
    borderColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  pinDotInner: {
    width: 12,
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  keypad: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  keypadButton: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  keypadButtonText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.blue[100],
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.primary,
  },
  keySpacer: {
    width: 56,
    height: 56,
  },
  accessButton: {
    width: '100%',
  },
  clientButton: {
    marginTop: theme.spacing.md,
  },
});

export default RoleSelectionScreen;