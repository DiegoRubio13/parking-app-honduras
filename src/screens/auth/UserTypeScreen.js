import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUserType } from '../../store/authSlice';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

/**
 * Professional User Type Selection Screen for PaRKING App
 * Displays three user types with professional design and clear CTAs
 */
const UserTypeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const handleUserTypeSelection = (type) => {
    dispatch(setUserType(type));
    navigation.navigate('Login');
  };

  const getUserTypeConfig = () => {
    return [
      {
        type: 'user',
        title: 'Usuario',
        description: 'Genera tu código QR y paga por minutos de estacionamiento',
        icon: 'qr-code',
        gradient: [Colors.info[500], Colors.info[600]],
        lightBg: Colors.info[50],
        borderColor: Colors.info[200],
        iconBg: Colors.info[100],
      },
      {
        type: 'guard',
        title: 'Guardia',
        description: 'Escanea códigos QR para registrar entradas y salidas',
        icon: 'scan-circle',
        gradient: [Colors.warning[500], Colors.warning[600]],
        lightBg: Colors.warning[50],
        borderColor: Colors.warning[200],
        iconBg: Colors.warning[100],
      },
      {
        type: 'admin',
        title: 'Administrador',
        description: 'Gestiona usuarios, ventas y configuraciones del sistema',
        icon: 'settings',
        gradient: [Colors.primary[600], Colors.primary[700]],
        lightBg: Colors.primary[50],
        borderColor: Colors.primary[200],
        iconBg: Colors.primary[100],
      },
    ];
  };

  const userTypes = getUserTypeConfig();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary[600]} barStyle="light-content" />
      
      {/* Top Safe Area with Gradient Color */}
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.gradients.subtle[0] }]} />
      
      <LinearGradient
        colors={Colors.gradients.subtle}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-outline" size={48} color={Colors.primary[600]} />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.title}>PaRKING</Text>
              <Text style={styles.subtitle}>Sistema de Estacionamiento Inteligente</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>¿Cómo vas a usar PaRKING hoy?</Text>
            <Text style={styles.questionSubtitle}>
              Selecciona tu tipo de usuario para comenzar
            </Text>
          </View>
          
          <View style={styles.optionsContainer}>
            {userTypes.map((userType, index) => (
              <TouchableOpacity
                key={userType.type}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: userType.lightBg,
                    borderColor: userType.borderColor,
                  }
                ]}
                onPress={() => handleUserTypeSelection(userType.type)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar ${userType.title}`}
                accessibilityHint={userType.description}
              >
                <View style={styles.optionContent}>
                  {/* Icon Container */}
                  <View style={[
                    styles.optionIconContainer,
                    { backgroundColor: userType.iconBg }
                  ]}>
                    <Ionicons 
                      name={userType.icon} 
                      size={32} 
                      color={userType.gradient[0]} 
                    />
                  </View>
                  
                  {/* Text Content */}
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionTitle, 
                      { color: userType.gradient[0] }
                    ]}>
                      {userType.title}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {userType.description}
                    </Text>
                  </View>
                  
                  {/* Arrow Icon */}
                  <View style={styles.optionArrow}>
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color={userType.gradient[0]} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Tienes problemas? Contacta soporte técnico
          </Text>
        </View>
      </LinearGradient>
      
      {/* Bottom Safe Area with Gradient End Color */}
      <View style={[styles.bottomSafeArea, { height: insets.bottom, backgroundColor: Colors.gradients.subtle[1] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gradients.subtle[0],
  },
  topSafeArea: {
    backgroundColor: Colors.gradients.subtle[0],
  },
  bottomSafeArea: {
    backgroundColor: Colors.gradients.subtle[1],
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  brandText: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[600],
    fontWeight: '500',
    maxWidth: width * 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  questionContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  optionArrow: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: Colors.light.text.disabled,
    textAlign: 'center',
  },
});

export default UserTypeScreen;