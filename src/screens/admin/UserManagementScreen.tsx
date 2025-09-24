import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import {
  getUsers,
  toggleUserStatus,
  updateUserAdmin,
  deleteUserPermanent,
  searchUsers,
  getUserStats,
} from '../../services/adminService';
import { User, UserStats } from '../../services/userService';

interface UserManagementScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'client' | 'guard' | 'admin'>('all');

  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    clientsCount: 0,
    guardsCount: 0,
    adminsCount: 0,
  });

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users, activeFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const role = activeFilter === 'all' ? undefined : activeFilter;
      const { users: fetchedUsers } = await getUsers(role, undefined, 100);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply role filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(user => user.role === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchQuery) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadUsers(), loadUserStats()]);
    setRefreshing(false);
  }, [activeFilter]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddUser = () => {
    navigation.navigate('AddUser');
  };

  const handleUserAction = async (user: User, action: 'view' | 'edit' | 'suspend' | 'activate' | 'delete') => {
    switch (action) {
      case 'view':
        navigation.navigate('UserDetail', { user });
        break;

      case 'edit':
        navigation.navigate('UserEdit', { user });
        break;

      case 'suspend':
        Alert.alert(
          'Suspender Usuario',
          `¿Estás seguro de suspender a ${user.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Suspender',
              style: 'destructive',
              onPress: async () => {
                try {
                  await toggleUserStatus(user.uid, false);
                  await loadUsers();
                  Alert.alert('Éxito', 'Usuario suspendido correctamente');
                } catch (error) {
                  console.error('Error suspending user:', error);
                  Alert.alert('Error', 'No se pudo suspender el usuario');
                }
              }
            },
          ]
        );
        break;

      case 'activate':
        try {
          await toggleUserStatus(user.uid, true);
          await loadUsers();
          Alert.alert('Éxito', 'Usuario activado correctamente');
        } catch (error) {
          console.error('Error activating user:', error);
          Alert.alert('Error', 'No se pudo activar el usuario');
        }
        break;

      case 'delete':
        Alert.alert(
          'Eliminar Usuario',
          `¿Estás seguro de eliminar permanentemente a ${user.name}? Esta acción no se puede deshacer.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Eliminar',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteUserPermanent(user.uid);
                  await loadUsers();
                  Alert.alert('Éxito', 'Usuario eliminado correctamente');
                } catch (error) {
                  console.error('Error deleting user:', error);
                  Alert.alert('Error', 'No se pudo eliminar el usuario');
                }
              }
            },
          ]
        );
        break;
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return { text: 'Suspendido', style: styles.statusSuspended };
    }
    if (user.balance < 30) {
      return { text: 'Saldo Bajo', style: styles.statusLow };
    }
    return { text: 'Activo', style: styles.statusActive };
  };

  const getBalanceColor = (user: User) => {
    if (!user.isActive) return theme.colors.error;
    if (user.balance < 30) return theme.colors.warning;
    return theme.colors.success;
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'guard':
        return '#f59e0b';
      case 'client':
        return theme.colors.primary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'guard':
        return 'Guardia';
      case 'client':
        return 'Cliente';
      default:
        return role;
    }
  };

  const FilterButton = ({ filter, label }: { filter: typeof activeFilter; label: string }) => (
    <TouchableOpacity
      style={[styles.filterBtn, activeFilter === filter && styles.filterBtnActive]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterBtnText,
        activeFilter === filter && styles.filterBtnTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const UserCard = ({ user }: { user: User }) => {
    const statusBadge = getStatusBadge(user);
    const balanceColor = getBalanceColor(user);
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <View style={styles.userCard}>
        <View style={[styles.userCardHeader, { backgroundColor: getRoleBadgeColor(user.role) }]} />

        <View style={styles.userHeader}>
          <View style={[styles.userAvatar, { backgroundColor: `${getRoleBadgeColor(user.role)}20` }]}>
            <Text style={[styles.userAvatarText, { color: getRoleBadgeColor(user.role) }]}>
              {initials}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: `${getRoleBadgeColor(user.role)}20` }]}>
                <Text style={[styles.roleText, { color: getRoleBadgeColor(user.role) }]}>
                  {getRoleLabel(user.role)}
                </Text>
              </View>
            </View>
            <Text style={styles.userPhone}>{user.phone}</Text>
            {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
          </View>
        </View>

        <View style={styles.userDetails}>
          <View style={styles.userBalance}>
            <Ionicons name="wallet-outline" size={16} color={balanceColor} />
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              L {user.balance.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.statusBadge, statusBadge.style]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.metaText}>
              Desde: {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {user.lastLoginAt && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
              <Text style={styles.metaText}>
                Último acceso: {new Date(user.lastLoginAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnView]}
            onPress={() => handleUserAction(user, 'view')}
          >
            <Ionicons name="eye-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.actionBtnText}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnEdit]}
            onPress={() => handleUserAction(user, 'edit')}
          >
            <Ionicons name="create-outline" size={16} color="#f59e0b" />
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, user.isActive ? styles.btnSuspend : styles.btnActivate]}
            onPress={() => handleUserAction(user, user.isActive ? 'suspend' : 'activate')}
          >
            <Ionicons
              name={user.isActive ? "ban-outline" : "checkmark-circle-outline"}
              size={16}
              color={user.isActive ? theme.colors.error : theme.colors.success}
            />
            <Text style={styles.actionBtnText}>
              {user.isActive ? 'Suspender' : 'Activar'}
            </Text>
          </TouchableOpacity>
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
                <Text style={styles.backBtnText}>Volver</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={styles.titleText}>Gestionar Usuarios</Text>
              </View>
              <Text style={styles.subtitle}>{filteredUsers.length} usuarios</Text>
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
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {userStats.activeUsers}
              </Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {userStats.clientsCount}
              </Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {userStats.guardsCount}
              </Text>
              <Text style={styles.statLabel}>Guardias</Text>
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filtrar por rol:</Text>
            <View style={styles.filterButtons}>
              <FilterButton filter="all" label="Todos" />
              <FilterButton filter="client" label="Clientes" />
              <FilterButton filter="guard" label="Guardias" />
              <FilterButton filter="admin" label="Admins" />
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={theme.colors.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, teléfono o email..."
              placeholderTextColor={theme.colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* User Cards */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.text.muted} />
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Intenta con otro término de búsqueda' : 'Agrega tu primer usuario'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))
          )}

          {/* Add User Button */}
          <Button
            title="Agregar Usuario"
            onPress={handleAddUser}
            variant="primary"
            size="lg"
            style={styles.addUserBtn}
          />

          <View style={{ height: 30 }} />
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  filterBtnTextActive: {
    color: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    ...theme.shadows.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
  },
  userCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    marginBottom: 16,
    ...theme.shadows.md,
    position: 'relative',
  },
  userCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontWeight: '700',
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusLow: {
    backgroundColor: '#fef3c7',
  },
  statusSuspended: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  userMeta: {
    marginBottom: 12,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  btnView: {
    backgroundColor: theme.colors.blue[50],
  },
  btnEdit: {
    backgroundColor: '#fef3c7',
  },
  btnSuspend: {
    backgroundColor: '#fee2e2',
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
  addUserBtn: {
    marginVertical: 20,
  },
});

export default UserManagementScreen;