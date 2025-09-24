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
interface AdminUsersScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

// User interface
interface AdminUser {
  id: string;
  name: string;
  phone: string;
  balance: number; // in minutes
  status: 'active' | 'low_balance' | 'suspended';
  sessions: number;
  createdAt: Date;
}

// User stats interface
interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'Juan Carlos Pérez',
      phone: '+504 9999-9999',
      balance: 150,
      status: 'active',
      sessions: 45,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'María López',
      phone: '+504 8888-8888',
      balance: 25,
      status: 'low_balance',
      sessions: 12,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Carlos Ruiz',
      phone: '+504 7777-7777',
      balance: 0,
      status: 'suspended',
      sessions: 89,
      createdAt: new Date(),
    },
  ]);

  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [userStats, setUserStats] = useState<UserStats>({
    total: 847,
    active: 823,
    inactive: 24,
  });

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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

  const handleAddUser = () => {
    navigation.navigate('AddUser');
  };

  const handleUserAction = (userId: string, action: 'view' | 'edit' | 'suspend' | 'activate') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

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
              onPress: () => {
                setUsers(prev => prev.map(u => 
                  u.id === userId ? { ...u, status: 'suspended' as const } : u
                ));
              }
            },
          ]
        );
        break;
      case 'activate':
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: 'active' as const } : u
        ));
        break;
    }
  };

  const getStatusBadge = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return { text: 'Activo', style: styles.statusActive };
      case 'low_balance':
        return { text: 'Saldo Bajo', style: styles.statusLow };
      case 'suspended':
        return { text: 'Suspendido', style: styles.statusSuspended };
      default:
        return { text: 'Activo', style: styles.statusActive };
    }
  };

  const getBalanceColor = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'low_balance':
        return theme.colors.warning;
      case 'suspended':
        return theme.colors.error;
      default:
        return theme.colors.success;
    }
  };

  const UserCard = ({ user }: { user: AdminUser }) => {
    const statusBadge = getStatusBadge(user.status);
    const balanceColor = getBalanceColor(user.status);
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
      <View style={styles.userCard}>
        <View style={styles.userCardHeader} />
        
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
        </View>

        <View style={styles.userDetails}>
          <View style={styles.userBalance}>
            <Ionicons name="time-outline" size={16} color={balanceColor} />
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              {user.balance} min
            </Text>
          </View>
          <View style={[styles.statusBadge, statusBadge.style]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        </View>

        <View style={styles.userSessions}>
          <Ionicons name="bar-chart-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.userSessionsText}>{user.sessions} sesiones</Text>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnView]}
            onPress={() => handleUserAction(user.id, 'view')}
          >
            <Text style={styles.actionBtnText}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnEdit]}
            onPress={() => handleUserAction(user.id, 'edit')}
          >
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, user.status === 'suspended' ? styles.btnActivate : styles.btnSuspend]}
            onPress={() => handleUserAction(user.id, user.status === 'suspended' ? 'activate' : 'suspend')}
          >
            <Text style={styles.actionBtnText}>
              {user.status === 'suspended' ? 'Activar' : 'Suspender'}
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
                <Text style={styles.backBtnText}>Gestión</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.title}>
              <View style={styles.titleMain}>
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={styles.titleText}>Gestionar Usuarios</Text>
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
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={theme.colors.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar usuario..."
              placeholderTextColor={theme.colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* User Cards */}
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}

          {/* Add User Button */}
          <Button
            title="Agregar Usuario"
            onPress={handleAddUser}
            variant="primary"
            size="lg"
            style={styles.addUserBtn}
          />

          {/* User Stats */}
          <View style={styles.userStats}>
            <View style={styles.userStatsHeader} />
            <View style={styles.statsTitle}>
              <Ionicons name="pie-chart-outline" size={16} color={theme.colors.text.primary} />
              <Text style={styles.statsTitleText}>Estadísticas de Usuarios</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsText}>
                Total usuarios: {userStats.total}{'\n'}
                <Text style={[styles.statsText, { color: theme.colors.success }]}>
                  ✓ Activos: {userStats.active}
                </Text>
                <Text style={styles.statsText}> • </Text>
                <Text style={[styles.statsText, { color: theme.colors.error }]}>
                  ✗ Inactivos: {userStats.inactive}
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
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceAmount: {
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
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
    color: theme.colors.success,
  },
  userSessions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  userSessionsText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  btnView: {
    backgroundColor: theme.colors.blue[100],
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
  userStats: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 30,
    ...theme.shadows.md,
    position: 'relative',
  },
  userStatsHeader: {
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

export default AdminUsersScreen;