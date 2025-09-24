import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { theme } from '../../constants/theme';

interface UserDetailScreenProps {
  navigation: any;
  route: {
    params: {
      user: {
        id: string;
        name: string;
        phone: string;
        balance: number;
        status: 'active' | 'low_balance' | 'suspended';
        sessions: number;
        createdAt: Date;
      };
    };
  };
}

export const UserDetailScreen: React.FC<UserDetailScreenProps> = ({ navigation, route }) => {
  const { user } = route.params;
  const [userDetails] = useState(user);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEditUser = () => {
    navigation.navigate('UserEdit', { user: userDetails });
  };

  const handleSuspendUser = () => {
    Alert.alert(
      'Suspender Usuario',
      `¿Estás seguro de suspender a ${userDetails.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Suspender',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Éxito', 'Usuario suspendido correctamente');
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleActivateUser = () => {
    Alert.alert('Éxito', 'Usuario activado correctamente');
    navigation.goBack();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Activo', color: theme.colors.success, bgColor: '#d1fae5' };
      case 'low_balance':
        return { text: 'Saldo Bajo', color: theme.colors.warning, bgColor: '#fef3c7' };
      case 'suspended':
        return { text: 'Suspendido', color: theme.colors.error, bgColor: '#fee2e2' };
      default:
        return { text: 'Activo', color: theme.colors.success, bgColor: '#d1fae5' };
    }
  };

  const statusBadge = getStatusBadge(userDetails.status);
  const initials = userDetails.name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Mock session history data
  const sessionHistory = [
    { id: '1', date: '15 Sep 2024', duration: '45 min', location: 'Multiplaza', amount: 'L 25' },
    { id: '2', date: '14 Sep 2024', duration: '30 min', location: 'City Mall', amount: 'L 20' },
    { id: '3', date: '13 Sep 2024', duration: '60 min', location: 'Mall Cascadas', amount: 'L 30' },
    { id: '4', date: '12 Sep 2024', duration: '25 min', location: 'Multiplaza', amount: 'L 15' },
    { id: '5', date: '11 Sep 2024', duration: '40 min', location: 'City Mall', amount: 'L 25' },
  ];

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#7c2d12', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles del Usuario</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditUser}>
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardHeader} />

          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userDetails.name}</Text>
              <Text style={styles.userPhone}>{userDetails.phone}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
              <Text style={[styles.statusText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
          </View>

          <View style={styles.balanceSection}>
            <View style={styles.balanceItem}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.balanceLabel}>Saldo Actual</Text>
              <Text style={styles.balanceValue}>{userDetails.balance} min</Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="bar-chart-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.balanceLabel}>Total Sesiones</Text>
              <Text style={styles.balanceValue}>{userDetails.sessions}</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información de la Cuenta</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.infoLabel}>Fecha de Registro</Text>
            </View>
            <Text style={styles.infoValue}>15 Ago 2024</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.infoLabel}>ID de Usuario</Text>
            </View>
            <Text style={styles.infoValue}>{userDetails.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.infoLabel}>Última Actividad</Text>
            </View>
            <Text style={styles.infoValue}>15 Sep 2024</Text>
          </View>
        </View>

        {/* Session History */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Historial de Sesiones (Últimas 5)</Text>

          {sessionHistory.map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>{session.date}</Text>
                <Text style={styles.sessionLocation}>{session.location}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDuration}>{session.duration}</Text>
                <Text style={styles.sessionAmount}>{session.amount}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Ver Historial Completo</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editActionButton} onPress={handleEditUser}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.editActionText}>Editar Usuario</Text>
          </TouchableOpacity>

          {userDetails.status === 'suspended' ? (
            <TouchableOpacity style={styles.activateButton} onPress={handleActivateUser}>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.activateButtonText}>Activar Usuario</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.suspendButton} onPress={handleSuspendUser}>
              <Ionicons name="ban-outline" size={20} color="white" />
              <Text style={styles.suspendButtonText}>Suspender Usuario</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + 20,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
    position: 'relative',
  },
  profileCardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: theme.colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  balanceValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  historyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  sessionLocation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  sessionDetails: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sessionAmount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.success,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.blue[200],
    flex: 1,
    justifyContent: 'center',
  },
  editActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  suspendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    justifyContent: 'center',
  },
  suspendButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: 'white',
    marginLeft: theme.spacing.xs,
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    justifyContent: 'center',
  },
  activateButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: 'white',
    marginLeft: theme.spacing.xs,
  },
});

export default UserDetailScreen;