import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

// Navigation prop types
interface AdminGuardsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Guard interface
interface Guard {
  id: string;
  name: string;
  pin: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'inactive';
  todayEntries: number;
  lastActivity?: Date;
}

// Guard stats interface
interface GuardStats {
  total: number;
  active: number;
  inactive: number;
}

export const AdminGuardsScreen: React.FC<AdminGuardsScreenProps> = ({ navigation }) => {
  const [guards, setGuards] = useState<Guard[]>([
    {
      id: '1',
      name: 'Pedro Martínez',
      pin: '****56',
      shift: 'morning',
      status: 'active',
      todayEntries: 23,
      lastActivity: new Date(),
    },
    {
      id: '2',
      name: 'Ana García',
      pin: '****89',
      shift: 'afternoon',
      status: 'active',
      todayEntries: 18,
      lastActivity: new Date(),
    },
    {
      id: '3',
      name: 'Luis Hernández',
      pin: '****23',
      shift: 'night',
      status: 'inactive',
      todayEntries: 0,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  
  const [guardStats, setGuardStats] = useState<GuardStats>({
    total: 5,
    active: 4,
    inactive: 1,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddGuard = () => {
    Alert.alert('Agregar Guardia', 'Función para agregar nuevo guardia');
  };

  const handleGuardAction = (guardId: string, action: 'edit' | 'changePIN' | 'activate' | 'deactivate') => {
    const guard = guards.find(g => g.id === guardId);
    if (!guard) return;

    switch (action) {
      case 'edit':
        Alert.alert('Editar Guardia', `Editar información de ${guard.name}`);
        break;
      case 'changePIN':
        Alert.alert(
          'Cambiar PIN',
          `¿Generar nuevo PIN para ${guard.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Generar',
              onPress: () => {
                const newPin = Math.random().toString().slice(-2);
                setGuards(prev => prev.map(g => 
                  g.id === guardId ? { ...g, pin: `****${newPin}` } : g
                ));
                Alert.alert('PIN Actualizado', `Nuevo PIN generado para ${guard.name}`);
              }
            },
          ]
        );
        break;
      case 'activate':
        setGuards(prev => prev.map(g => 
          g.id === guardId ? { ...g, status: 'active' as const } : g
        ));
        Alert.alert('Éxito', `${guard.name} ha sido activado`);
        break;
      case 'deactivate':
        Alert.alert(
          'Desactivar Guardia',
          `¿Estás seguro de desactivar a ${guard.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Desactivar',
              style: 'destructive',
              onPress: () => {
                setGuards(prev => prev.map(g => 
                  g.id === guardId ? { ...g, status: 'inactive' as const } : g
                ));
                Alert.alert('Éxito', `${guard.name} ha sido desactivado`);
              }
            },
          ]
        );
        break;
    }
  };

  const getShiftText = (shift: Guard['shift']): string => {
    switch (shift) {
      case 'morning':
        return 'Mañana (6-14h)';
      case 'afternoon':
        return 'Tarde (14-22h)';
      case 'night':
        return 'Noche (22-6h)';
      default:
        return 'Mañana (6-14h)';
    }
  };

  const getShiftColor = (shift: Guard['shift']): string => {
    switch (shift) {
      case 'morning':
        return '#fef3c7';
      case 'afternoon':
        return theme.colors.blue[100];
      case 'night':
        return '#f3e8ff';
      default:
        return '#fef3c7';
    }
  };

  const getStatusBadge = (status: Guard['status']) => {
    switch (status) {
      case 'active':
        return { text: 'Activo', style: styles.statusActive };
      case 'inactive':
        return { text: 'Inactivo', style: styles.statusInactive };
      default:
        return { text: 'Activo', style: styles.statusActive };
    }
  };

  const formatLastActivity = (lastActivity?: Date, status?: Guard['status']) => {
    if (status === 'inactive') {
      return 'Ayer';
    }
    return `${lastActivity?.getHours() || 0} entradas`;
  };

  const GuardCard = ({ guard }: { guard: Guard }) => {
    const statusBadge = getStatusBadge(guard.status);
    const initials = guard.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
      <View style={styles.guardCard}>
        <View style={styles.guardCardHeader} />
        
        <View style={styles.guardHeader}>
          <View style={[styles.guardAvatar, { backgroundColor: getShiftColor(guard.shift) }]}>
            <Text style={styles.guardAvatarText}>{initials}</Text>
          </View>
          <View style={styles.guardInfo}>
            <Text style={styles.guardName}>{guard.name}</Text>
            <Text style={styles.guardPin}>PIN: {guard.pin}</Text>
          </View>
        </View>

        <View style={styles.guardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>Turno: {getShiftText(guard.shift)}</Text>
            <View style={[styles.statusBadge, statusBadge.style]}>
              <Text style={styles.statusText}>{statusBadge.text}</Text>
            </View>
          </View>
          <View style={styles.guardStats}>
            <Ionicons name="bar-chart-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.statLabel}>
              {guard.status === 'active' ? 'Hoy:' : 'Última:'}
            </Text>
            <Text style={styles.statValue}>
              {guard.status === 'active' ? `${guard.todayEntries} entradas` : formatLastActivity(guard.lastActivity, guard.status)}
            </Text>
          </View>
        </View>

        <View style={styles.guardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnEdit]}
            onPress={() => handleGuardAction(guard.id, 'edit')}
          >
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
          {guard.status === 'active' ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnPin]}
              onPress={() => handleGuardAction(guard.id, 'changePIN')}
            >
              <Text style={styles.actionBtnText}>Cambiar PIN</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnActivate]}
              onPress={() => handleGuardAction(guard.id, 'activate')}
            >
              <Text style={styles.actionBtnText}>Activar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
                <Text style={styles.backBtnText}>Guardias</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="shield-checkmark-outline" size={24} color="white" />
                <Text style={styles.titleText}>Gestionar Guardias</Text>
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
          {/* Guard Cards */}
          {guards.map((guard) => (
            <GuardCard key={guard.id} guard={guard} />
          ))}

          {/* Add Guard Button */}
          <Button
            title="Agregar Guardia"
            onPress={handleAddGuard}
            variant="primary"
            size="lg"
            style={styles.addGuardBtn}
          />

          {/* Guard Stats Summary */}
          <View style={styles.guardStatsSummary}>
            <View style={styles.guardStatsSummaryHeader} />
            <View style={styles.statsTitle}>
              <Ionicons name="pie-chart-outline" size={16} color={theme.colors.text.primary} />
              <Text style={styles.statsTitleText}>Estadísticas de Guardias</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsText}>
                Total guardias: {guardStats.total}{'\n'}
                <Text style={[styles.statsText, { color: theme.colors.success }]}>
                  ✓ Activos: {guardStats.active}
                </Text>
                <Text style={styles.statsText}> • </Text>
                <Text style={[styles.statsText, { color: theme.colors.error }]}>
                  ⚬ Inactivos: {guardStats.inactive}
                </Text>
              </Text>
            </View>
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
  guardCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 16,
    ...theme.shadows.md,
    position: 'relative',
  },
  guardCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  guardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  guardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.warning,
  },
  guardInfo: {
    flex: 1,
  },
  guardName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  guardPin: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  guardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  guardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  guardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  btnEdit: {
    backgroundColor: '#fef3c7',
  },
  btnPin: {
    backgroundColor: theme.colors.blue[100],
  },
  btnActivate: {
    backgroundColor: '#d1fae5',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  addGuardBtn: {
    marginVertical: 20,
  },
  guardStatsSummary: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 30,
    ...theme.shadows.md,
    position: 'relative',
  },
  guardStatsSummaryHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  statsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statsTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statsContent: {
    // No additional styles needed
  },
  statsText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default AdminGuardsScreen;