import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  Share,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

/**
 * UsersScreen - Gestión completa de usuarios
 * Incluye lista de usuarios, CRUD completo, filtros avanzados y bulk operations
 */
const UsersScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lowBalanceUsers: 0,
    suspendedUsers: 0,
  });

  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Estados para gestión de usuarios
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    phone: '',
    email: '',
    balance: '',
    status: 'active',
  });
  const [savingUser, setSavingUser] = useState(false);

  // Aplicar filtro inicial si viene de otra pantalla
  useEffect(() => {
    if (route?.params?.filter === 'low_balance') {
      setSelectedFilter('low_balance');
    }
  }, [route?.params]);

  // Cargar datos de usuarios
  const loadUsersData = useCallback(async () => {
    try {
      // Simulación de carga de datos - en producción vendría de Firebase/API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUsers = [
        {
          id: '1',
          name: 'María González',
          phone: '+504 9876-5432',
          email: 'maria.gonzalez@email.com',
          balance: 150, // minutos
          totalSpent: 2500,
          status: 'active',
          lastActivity: new Date(2024, 11, 7, 14, 30),
          createdAt: new Date(2024, 10, 15),
          sessions: 45,
          averageSession: 32,
        },
        {
          id: '2',
          name: 'Carlos Ruiz',
          phone: '+504 8765-4321',
          email: 'carlos.ruiz@email.com',
          balance: 25, // saldo bajo
          totalSpent: 1800,
          status: 'active',
          lastActivity: new Date(2024, 11, 7, 10, 15),
          createdAt: new Date(2024, 10, 20),
          sessions: 38,
          averageSession: 28,
        },
        {
          id: '3',
          name: 'Ana López',
          phone: '+504 7654-3210',
          email: 'ana.lopez@email.com',
          balance: 200,
          totalSpent: 3200,
          status: 'suspended',
          lastActivity: new Date(2024, 11, 5, 16, 45),
          createdAt: new Date(2024, 9, 10),
          sessions: 52,
          averageSession: 35,
        },
        {
          id: '4',
          name: 'José Martínez',
          phone: '+504 6543-2109',
          email: 'jose.martinez@email.com',
          balance: 300,
          totalSpent: 4100,
          status: 'active',
          lastActivity: new Date(2024, 11, 7, 12, 20),
          createdAt: new Date(2024, 8, 5),
          sessions: 67,
          averageSession: 40,
        },
        {
          id: '5',
          name: 'Lucía Hernández',
          phone: '+504 5432-1098',
          email: 'lucia.hernandez@email.com',
          balance: 15, // saldo bajo
          totalSpent: 980,
          status: 'active',
          lastActivity: new Date(2024, 11, 6, 18, 10),
          createdAt: new Date(2024, 11, 1),
          sessions: 12,
          averageSession: 25,
        },
      ];

      const mockStats = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === 'active').length,
        lowBalanceUsers: mockUsers.filter(u => u.balance < 30).length,
        suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
      };

      setUsers(mockUsers);
      setUserStats(mockStats);
      filterUsers(mockUsers, searchQuery, selectedFilter, sortBy);

    } catch (error) {
      console.error('Error loading users data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de usuarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedFilter, sortBy]);

  // Filtrar usuarios
  const filterUsers = (usersList, query, filter, sort) => {
    let filtered = [...usersList];

    // Filtro por búsqueda (nombre o teléfono)
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.phone.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
      );
    }

    // Filtro por estado/condición
    switch (filter) {
      case 'active':
        filtered = filtered.filter(user => user.status === 'active');
        break;
      case 'suspended':
        filtered = filtered.filter(user => user.status === 'suspended');
        break;
      case 'low_balance':
        filtered = filtered.filter(user => user.balance < 30);
        break;
      case 'high_spenders':
        filtered = filtered.filter(user => user.totalSpent > 2000);
        break;
      case 'new_users':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(user => user.createdAt >= thirtyDaysAgo);
        break;
    }

    // Ordenamiento
    switch (sort) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'balance':
        filtered.sort((a, b) => b.balance - a.balance);
        break;
      case 'spent':
        filtered.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
    }

    setFilteredUsers(filtered);
  };

  // Función de recarga
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsersData();
  }, [loadUsersData]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUsersData();
  }, [loadUsersData]);

  // Actualizar filtros cuando cambien los parámetros
  useEffect(() => {
    filterUsers(users, searchQuery, selectedFilter, sortBy);
  }, [users, searchQuery, selectedFilter, sortBy]);

  // Guardar usuario (crear o editar)
  const handleSaveUser = async () => {
    if (!userFormData.name || !userFormData.phone) {
      Alert.alert('Error', 'Nombre y teléfono son obligatorios');
      return;
    }

    try {
      setSavingUser(true);

      // Simulación de guardar - en producción sería llamada a Firebase/API
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (editingUser) {
        // Editar usuario existente
        const updatedUsers = users.map(user =>
          user.id === editingUser.id
            ? {
                ...user,
                name: userFormData.name,
                phone: userFormData.phone,
                email: userFormData.email,
                balance: parseFloat(userFormData.balance) || user.balance,
                status: userFormData.status,
              }
            : user
        );
        setUsers(updatedUsers);
        Alert.alert('Éxito', 'Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        const newUser = {
          id: Date.now().toString(),
          name: userFormData.name,
          phone: userFormData.phone,
          email: userFormData.email,
          balance: parseFloat(userFormData.balance) || 0,
          totalSpent: 0,
          status: userFormData.status,
          lastActivity: new Date(),
          createdAt: new Date(),
          sessions: 0,
          averageSession: 0,
        };
        setUsers([newUser, ...users]);
        Alert.alert('Éxito', 'Usuario creado correctamente');
      }

      // Limpiar formulario y cerrar modal
      setUserFormData({
        name: '',
        phone: '',
        email: '',
        balance: '',
        status: 'active',
      });
      setEditingUser(null);
      setShowUserModal(false);

    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'No se pudo guardar el usuario');
    } finally {
      setSavingUser(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = (user) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar a ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulación de eliminar - en producción sería llamada a Firebase/API
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const updatedUsers = users.filter(u => u.id !== user.id);
              setUsers(updatedUsers);
              
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  // Suspender/Reactivar usuario
  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspender' : 'reactivar';

    Alert.alert(
      'Confirmar Acción',
      `¿Estás seguro de que quieres ${action} a ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              // Simulación - en producción sería llamada a Firebase/API
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const updatedUsers = users.map(u =>
                u.id === user.id ? { ...u, status: newStatus } : u
              );
              setUsers(updatedUsers);
              
              Alert.alert('Éxito', `Usuario ${action === 'suspender' ? 'suspendido' : 'reactivado'} correctamente`);
            } catch (error) {
              Alert.alert('Error', `No se pudo ${action} el usuario`);
            }
          },
        },
      ]
    );
  };

  // Exportar datos de usuarios
  const exportUsersData = async () => {
    try {
      const reportText = `
REPORTE DE USUARIOS PARKING
===========================

Total usuarios: ${userStats.totalUsers}
Usuarios activos: ${userStats.activeUsers}
Usuarios suspendidos: ${userStats.suspendedUsers}
Usuarios con saldo bajo: ${userStats.lowBalanceUsers}

LISTA DE USUARIOS:
${filteredUsers.map(u => 
  `${u.name} (${u.phone}) - Balance: ${u.balance} min - Estado: ${u.status} - Gastado: L.${u.totalSpent}`
).join('\n')}
      `;

      await Share.share({
        message: reportText,
        title: 'Reporte de Usuarios PaRKING',
      });

    } catch (error) {
      console.error('Error exporting users data:', error);
      Alert.alert('Error', 'No se pudo exportar el reporte');
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
    }).format(amount);
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} días`;
  };

  // Renderizar tarjeta de usuario
  const renderUser = ({ item: user }) => {
    const isLowBalance = user.balance < 30;
    const statusColors = {
      active: Colors.success[500],
      suspended: Colors.error[500],
    };

    return (
      <Card style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[user.status] }]}>
                <Text style={styles.statusText}>
                  {user.status === 'active' ? 'Activo' : 'Suspendido'}
                </Text>
              </View>
            </View>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Saldo</Text>
            <Text style={[
              styles.statValue,
              isLowBalance && { color: Colors.warning[600] }
            ]}>
              {user.balance} min
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Gastado</Text>
            <Text style={styles.statValue}>{formatCurrency(user.totalSpent)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sesiones</Text>
            <Text style={styles.statValue}>{user.sessions}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Última Actividad</Text>
            <Text style={styles.statValueSmall}>{formatRelativeTime(user.lastActivity)}</Text>
          </View>
        </View>

        {isLowBalance && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ Saldo bajo - Menos de 30 minutos</Text>
          </View>
        )}

        <View style={styles.userActions}>
          <Button
            title="Editar"
            variant="outline"
            size="small"
            style={styles.actionButton}
            onPress={() => {
              setEditingUser(user);
              setUserFormData({
                name: user.name,
                phone: user.phone,
                email: user.email,
                balance: user.balance.toString(),
                status: user.status,
              });
              setShowUserModal(true);
            }}
          />
          <Button
            title={user.status === 'active' ? 'Suspender' : 'Reactivar'}
            variant={user.status === 'active' ? 'secondary' : 'primary'}
            size="small"
            style={styles.actionButton}
            onPress={() => handleToggleUserStatus(user)}
          />
          <Button
            title="Eliminar"
            variant="outline"
            size="small"
            style={[styles.actionButton, { borderColor: Colors.error[500] }]}
            textStyle={{ color: Colors.error[500] }}
            onPress={() => handleDeleteUser(user)}
          />
        </View>
      </Card>
    );
  };

  // Renderizar estadísticas de usuarios
  const renderUserStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Estadísticas de Usuarios</Text>
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statCardLabel}>Total</Text>
          <Text style={styles.statCardValue}>{userStats.totalUsers}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statCardLabel}>Activos</Text>
          <Text style={[styles.statCardValue, { color: Colors.success[600] }]}>
            {userStats.activeUsers}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statCardLabel}>Saldo Bajo</Text>
          <Text style={[styles.statCardValue, { color: Colors.warning[600] }]}>
            {userStats.lowBalanceUsers}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statCardLabel}>Suspendidos</Text>
          <Text style={[styles.statCardValue, { color: Colors.error[600] }]}>
            {userStats.suspendedUsers}
          </Text>
        </Card>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
        
        {/* Top Safe Area with Primary Color */}
        <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
        
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
        
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />
      
      {/* Top Safe Area with Primary Color */}
      <View style={[styles.topSafeArea, { height: insets.top, backgroundColor: Colors.primary[600] }]} />
      
      <View style={styles.contentContainer}>
      {/* Header con acciones */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="car-outline" size={24} color="#065f46" />
          <Text style={styles.title}>Gestión de Usuarios</Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="Nuevo Usuario"
            variant="primary"
            size="small"
            onPress={() => {
              setEditingUser(null);
              setUserFormData({
                name: '',
                phone: '',
                email: '',
                balance: '',
                status: 'active',
              });
              setShowUserModal(true);
            }}
            style={styles.headerButton}
          />
          <Button
            title="Exportar"
            variant="outline"
            size="small"
            onPress={exportUsersData}
            style={styles.headerButton}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Estadísticas */}
        {renderUserStats()}

        {/* Filtros y búsqueda */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <Button
              title="Filtros"
              variant={showFilters ? 'primary' : 'outline'}
              size="small"
              onPress={() => setShowFilters(!showFilters)}
            />
          </View>

          {showFilters && (
            <Card style={styles.filtersCard}>
              <Text style={styles.filtersTitle}>Filtros</Text>
              
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Estado/Condición:</Text>
                <View style={styles.filterButtons}>
                  {[
                    { key: 'all', label: 'Todos' },
                    { key: 'active', label: 'Activos' },
                    { key: 'suspended', label: 'Suspendidos' },
                    { key: 'low_balance', label: 'Saldo Bajo' },
                    { key: 'high_spenders', label: 'Top Gastadores' },
                    { key: 'new_users', label: 'Nuevos' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterButton,
                        selectedFilter === item.key && styles.filterButtonActive
                      ]}
                      onPress={() => setSelectedFilter(item.key)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedFilter === item.key && styles.filterButtonTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Ordenar por:</Text>
                <View style={styles.filterButtons}>
                  {[
                    { key: 'recent', label: 'Actividad' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'balance', label: 'Saldo' },
                    { key: 'spent', label: 'Gastado' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.filterButton,
                        sortBy === item.key && styles.filterButtonActive
                      ]}
                      onPress={() => setSortBy(item.key)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        sortBy === item.key && styles.filterButtonTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Lista de usuarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Usuarios ({filteredUsers.length})
          </Text>
          
          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No hay usuarios que mostrar</Text>
                <Text style={styles.emptySubtext}>
                  Ajusta los filtros o crea nuevos usuarios
                </Text>
              </Card>
            }
          />
        </View>

        {/* Espacio inferior */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal para crear/editar usuario */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[50]} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Text>
            <Button
              title="Cancelar"
              variant="ghost"
              size="small"
              onPress={() => setShowUserModal(false)}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Nombre Completo"
              placeholder="Nombre del usuario"
              value={userFormData.name}
              onChangeText={(text) => setUserFormData(prev => ({ ...prev, name: text }))}
            />

            <Input
              label="Número de Teléfono"
              placeholder="+504 0000-0000"
              value={userFormData.phone}
              onChangeText={(text) => setUserFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />

            <Input
              label="Email (opcional)"
              placeholder="email@ejemplo.com"
              value={userFormData.email}
              onChangeText={(text) => setUserFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Saldo Inicial (minutos)"
              placeholder="0"
              value={userFormData.balance}
              onChangeText={(text) => setUserFormData(prev => ({ ...prev, balance: text }))}
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>Estado del Usuario</Text>
            <View style={styles.statusButtons}>
              {[
                { key: 'active', label: 'Activo' },
                { key: 'suspended', label: 'Suspendido' },
              ].map(status => (
                <TouchableOpacity
                  key={status.key}
                  style={[
                    styles.statusButton,
                    userFormData.status === status.key && styles.statusButtonActive
                  ]}
                  onPress={() => setUserFormData(prev => ({ ...prev, status: status.key }))}
                >
                  <Text style={[
                    styles.statusButtonText,
                    userFormData.status === status.key && styles.statusButtonTextActive
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={savingUser ? "Guardando..." : editingUser ? "Actualizar Usuario" : "Crear Usuario"}
              onPress={handleSaveUser}
              loading={savingUser}
              disabled={!userFormData.name || !userFormData.phone}
              style={styles.modalButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
      </View>
      
      {/* Bottom Safe Area with Background Color */}
      <View style={[styles.bottomSafeArea, { height: insets.bottom, backgroundColor: Colors.neutral[50] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[600], // Mismo color que el header para el SafeArea
  },
  topSafeArea: {
    backgroundColor: Colors.primary[600],
  },
  bottomSafeArea: {
    backgroundColor: Colors.neutral[50],
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: Colors.neutral[600],
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: Colors.primary[600],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -1,
    shadowColor: Colors.primary[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral[0],
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary[600],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
  },
  filtersCard: {
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    margin: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  filterButtonTextActive: {
    color: Colors.neutral[0],
  },
  userCard: {
    marginBottom: 12,
  },
  userHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.neutral[0],
  },
  userPhone: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  userStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statItem: {
    width: '48%',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  statValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  warningBanner: {
    backgroundColor: Colors.warning[50],
    borderLeftColor: Colors.warning[500],
    borderLeftWidth: 4,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning[700],
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionButton: {
    margin: 4,
    flex: 1,
    minWidth: 80,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginBottom: 8,
    marginTop: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    margin: 6,
    flex: 1,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: Colors.primary[600],
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  statusButtonTextActive: {
    color: Colors.neutral[0],
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  modalButton: {
    width: '100%',
  },
  bottomSpace: {
    height: 30,
  },
});

export default UsersScreen;