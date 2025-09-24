import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface AdminPricingScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Pricing package interface
interface PricingPackage {
  id: string;
  minutes: number;
  price: number;
  displayName: string;
}

// Pricing configuration interface
interface PricingConfig {
  ratePerMinute: number;
  packages: PricingPackage[];
  taxRate: number;
}

export const AdminPricingScreen: React.FC<AdminPricingScreenProps> = ({ navigation }) => {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    ratePerMinute: 1.50,
    packages: [
      { id: '1', minutes: 60, price: 20.00, displayName: '60 min' },
      { id: '2', minutes: 120, price: 35.00, displayName: '120 min' },
      { id: '3', minutes: 240, price: 60.00, displayName: '240 min' },
    ],
    taxRate: 15,
  });

  const [tempRate, setTempRate] = useState(pricingConfig.ratePerMinute.toString());
  const [tempTax, setTempTax] = useState(pricingConfig.taxRate.toString());
  const [refreshing, setRefreshing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const rateChanged = parseFloat(tempRate) !== pricingConfig.ratePerMinute;
    const taxChanged = parseFloat(tempTax) !== pricingConfig.taxRate;
    setHasChanges(rateChanged || taxChanged);
  }, [tempRate, tempTax, pricingConfig]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Cambios sin guardar',
        '¿Estás seguro de salir sin guardar los cambios?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir sin guardar', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleUpdateRate = () => {
    const newRate = parseFloat(tempRate);
    if (isNaN(newRate) || newRate <= 0) {
      Alert.alert('Error', 'Por favor ingresa una tarifa válida');
      return;
    }

    Alert.alert(
      'Actualizar Tarifa',
      `¿Confirmas cambiar la tarifa a L ${newRate.toFixed(2)} por minuto?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setPricingConfig(prev => ({ ...prev, ratePerMinute: newRate }));
            Alert.alert('Éxito', 'Tarifa actualizada correctamente');
          }
        },
      ]
    );
  };

  const handleUpdateTax = () => {
    const newTax = parseFloat(tempTax);
    if (isNaN(newTax) || newTax < 0 || newTax > 100) {
      Alert.alert('Error', 'Por favor ingresa un porcentaje de IVA válido (0-100)');
      return;
    }

    Alert.alert(
      'Actualizar IVA',
      `¿Confirmas cambiar el IVA a ${newTax}%?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setPricingConfig(prev => ({ ...prev, taxRate: newTax }));
            Alert.alert('Éxito', 'IVA actualizado correctamente');
          }
        },
      ]
    );
  };

  const handleEditPackage = (packageId: string) => {
    const pkg = pricingConfig.packages.find(p => p.id === packageId);
    if (!pkg) return;

    Alert.alert(
      'Editar Paquete',
      `Editar paquete de ${pkg.displayName} - L ${pkg.price.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => console.log('Edit package:', packageId) },
      ]
    );
  };

  const handleAddPackage = () => {
    Alert.alert(
      'Nuevo Paquete',
      'Función para agregar un nuevo paquete de minutos',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear', onPress: () => console.log('Add new package') },
      ]
    );
  };

  const handleSaveChanges = () => {
    if (!hasChanges) {
      Alert.alert('Sin cambios', 'No hay cambios para guardar');
      return;
    }

    Alert.alert(
      'Guardar Cambios',
      'Los cambios se aplicarán inmediatamente a todos los usuarios. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: () => {
            // Apply changes
            setPricingConfig(prev => ({
              ...prev,
              ratePerMinute: parseFloat(tempRate),
              taxRate: parseFloat(tempTax),
            }));
            setHasChanges(false);
            Alert.alert('Éxito', 'Cambios guardados correctamente');
          }
        },
      ]
    );
  };

  const PackageItem = ({ pkg }: { pkg: PricingPackage }) => (
    <View style={styles.packageItem}>
      <View style={styles.packageInfo}>
        <View style={styles.packageIcon}>
          <Text style={styles.packageIconText}>{pkg.minutes}</Text>
        </View>
        <View style={styles.packageDetails}>
          <Text style={styles.packageName}>{pkg.displayName}</Text>
          <Text style={styles.packagePrice}>L {pkg.price.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => handleEditPackage(pkg.id)}
      >
        <Text style={styles.editBtnText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PhoneContainer>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#7c2d12', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
                <Ionicons name="arrow-back-outline" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.backBtnText}>Tarifas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="card-outline" size={24} color="white" />
                <Text style={styles.titleText}>Tarifas y Precios</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Rate per Minute Section */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Ionicons name="time-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.sectionTitleText}>Tarifa por minuto</Text>
            </View>
            <View style={styles.rateCard}>
              <View style={styles.rateCardHeader} />
              <Text style={styles.currentRate}>
                Tarifa actual: L {pricingConfig.ratePerMinute.toFixed(2)}/min
              </Text>
              <View style={styles.rateInputGroup}>
                <Text style={styles.inputLabel}>Nueva tarifa:</Text>
                <TextInput
                  style={styles.rateInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={tempRate}
                  onChangeText={setTempRate}
                />
              </View>
              <Button
                title="Actualizar"
                onPress={handleUpdateRate}
                variant="primary"
                size="md"
                style={styles.updateBtn}
              />
            </View>
          </View>

          {/* Packages Section */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Ionicons name="gift-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.sectionTitleText}>Paquetes de Minutos</Text>
            </View>
            <View style={styles.packagesSection}>
              <View style={styles.packagesSectionHeader} />
              {pricingConfig.packages.map((pkg) => (
                <PackageItem key={pkg.id} pkg={pkg} />
              ))}
              <TouchableOpacity style={styles.addPackageBtn} onPress={handleAddPackage}>
                <Ionicons name="add-outline" size={16} color={theme.colors.success} />
                <Text style={styles.addPackageBtnText}>Nuevo Paquete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tax Section */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Ionicons name="business-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.sectionTitleText}>Configuración IVA</Text>
            </View>
            <View style={styles.taxSection}>
              <View style={styles.taxSectionHeader} />
              <Text style={styles.currentRate}>
                IVA actual: {pricingConfig.taxRate}%
              </Text>
              <View style={styles.rateInputGroup}>
                <Text style={styles.inputLabel}>Nuevo IVA:</Text>
                <TextInput
                  style={styles.rateInput}
                  placeholder="15"
                  keyboardType="numeric"
                  value={tempTax}
                  onChangeText={setTempTax}
                />
              </View>
              <Button
                title="Actualizar"
                onPress={handleUpdateTax}
                variant="primary"
                size="md"
                style={styles.updateBtn}
              />
            </View>
          </View>

          {/* Save Changes Button */}
          <Button
            title="Guardar Cambios"
            onPress={handleSaveChanges}
            variant="primary"
            size="lg"
            style={!hasChanges ? [styles.saveChangesBtn, styles.saveChangesBtnDisabled] : styles.saveChangesBtn}
            disabled={!hasChanges}
          />

          {/* Warning Note */}
          <View style={styles.warningNote}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.warning} />
            <Text style={styles.warningNoteText}>
              Cambios aplicarán inmediatamente a todos los usuarios
            </Text>
          </View>
        </ScrollView>
      </View>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.3,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    alignItems: 'center',
  },
  titleMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  rateCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  rateCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  currentRate: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  rateInputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  rateInput: {
    width: '100%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.card,
  },
  updateBtn: {
    // Additional styles if needed
  },
  packagesSection: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  packagesSectionHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  packageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packageIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  packageDetails: {
    // No additional styles needed
  },
  packageName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  addPackageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addPackageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  taxSection: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.md,
    position: 'relative',
  },
  taxSectionHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  saveChangesBtn: {
    marginBottom: 20,
  },
  saveChangesBtnDisabled: {
    opacity: 0.5,
  },
  warningNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 30,
  },
  warningNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
});

export default AdminPricingScreen;