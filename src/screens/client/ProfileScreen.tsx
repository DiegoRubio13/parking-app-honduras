import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { updateUser, getUserStats } from '../../services/userService';
import { getUserParkingHistory } from '../../services/parkingService';
import { getUserTransactions } from '../../services/paymentService';

// Navigation types
type ClientStackParamList = {
  Profile: undefined;
  Home: undefined;
  History: undefined;
  Purchase: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

type Props = NativeStackScreenProps<ClientStackParamList, 'Profile'>;

interface ProfileScreenProps extends Props {
  onLogout?: () => void;
}

interface UserStats {
  totalSessions: number;
  totalSpent: number;
  averageSessionTime: number;
  memberSince: Date;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  navigation, 
  onLogout 
}) => {
  const { userData, refreshUserData, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ totalSessions: 0, totalSpent: 0, averageSessionTime: 0, memberSince: new Date() });
  const [loading, setLoading] = useState(true);

  // Initialize state from user data
  useEffect(() => {
    if (userData?.name) {
      setEditedName(userData.name);
    }
    if (userData?.email) {
      setEditedEmail(userData.email);
    }
    if (userData?.settings) {
      setNotificationsEnabled(userData.settings.notifications);
    }
  }, [userData]);

  // Load user statistics
  useEffect(() => {
    const loadUserStats = async () => {
      if (!userData?.uid) return;
      
      setLoading(true);
      try {
        // Get user's parking sessions
        const sessions = await getUserParkingHistory(userData.uid);
        const completedSessions = sessions.filter(s => s.status === 'completed');
        
        // Get user's transactions
        const transactions = await getUserTransactions(userData.uid);
        const purchaseTransactions = transactions.filter(t => t.type === 'purchase' && t.status === 'completed');
        
        // Calculate stats
        const totalSessions = completedSessions.length;
        const totalSpent = purchaseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const averageSessionTime = totalSessions > 0 ? totalDuration / totalSessions : 0;
        
        setUserStats({
          totalSessions,
          totalSpent,
          averageSessionTime,
          memberSince: userData.createdAt ? new Date(userData.createdAt) : new Date()
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, [userData?.uid]);


  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    try {
      const updates = {
        name: editedName.trim(),
        email: editedEmail.trim(),
      };

      if (!userData?.uid) {
        Alert.alert('Error', 'No se pudo obtener información del usuario');
        return;
      }

      const success = await updateUser(userData.uid, {
        name: updates.name,
        email: updates.email,
        settings: {
          ...userData.settings,
          notifications: notificationsEnabled
        }
      });
      
      if (success) {
        await refreshUserData();
        setIsEditing(false);
        Alert.alert('Perfil Actualizado', 'Tus datos han sido guardados correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al actualizar el perfil');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(userData?.name || '');
    setEditedEmail(userData?.email || '');
    setIsEditing(false);
  };


  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesion');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Función no disponible', 'Esta función estará disponible próximamente');
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <PhoneContainer>
      <LinearGradient
        colors={[theme.colors.blue[800], theme.colors.blue[600]]}
        style={styles.header}
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity 
            onPress={isEditing ? handleCancelEdit : handleEditProfile} 
            style={styles.editButton}
          >
            <Ionicons 
              name={isEditing ? "close" : "pencil"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <View style={styles.userDetails}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nombre completo"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
            ) : (
              <Text style={styles.userName}>{userData?.name || 'Usuario'}</Text>
            )}
            <Text style={styles.userPhone}>{userData?.phone || 'N/A'}</Text>
            <Text style={styles.memberSince}>
              Miembro desde {formatDate(userStats?.memberSince || new Date())}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={theme.colors.blue[600]} />
            <Text style={styles.statNumber}>{userStats?.totalSessions || 0}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color={theme.colors.success} />
            <Text style={styles.statNumber}>L{(userStats?.totalSpent || 0).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total gastado</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="stopwatch" size={24} color={theme.colors.warning} />
            <Text style={styles.statNumber}>{formatDuration(userStats?.averageSessionTime || 0)}</Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="person" size={20} color={theme.colors.blue[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Ingresa tu nombre"
                  />
                ) : (
                  <Text style={styles.infoValue}>{userData?.name || 'N/A'}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color={theme.colors.blue[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedEmail}
                    onChangeText={setEditedEmail}
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.infoValue}>{userData?.email || 'No especificado'}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color={theme.colors.blue[600]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{userData?.phone || 'N/A'}</Text>
                <Text style={styles.infoNote}>No se puede cambiar</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="wallet" size={20} color={theme.colors.success} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Saldo actual</Text>
                <Text style={[styles.infoValue, styles.balanceValue]}>
                  {userData?.balance || 0} minutos
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color={theme.colors.blue[600]} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Notificaciones push</Text>
                  <Text style={styles.settingDescription}>
                    Recibe alertas de saldo bajo y actualizaciones
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.blue[200] }}
                thumbColor={notificationsEnabled ? theme.colors.blue[600] : theme.colors.text.muted}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="sync" size={20} color={theme.colors.blue[600]} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Recarga automática</Text>
                  <Text style={styles.settingDescription}>
                    Recarga 60 minutos cuando el saldo sea menor a 15
                  </Text>
                </View>
              </View>
              <Switch
                value={autoRechargeEnabled}
                onValueChange={setAutoRechargeEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.blue[200] }}
                thumbColor={autoRechargeEnabled ? theme.colors.blue[600] : theme.colors.text.muted}
              />
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          {isEditing ? (
            <View style={styles.editActions}>
              <Button
                title="Guardar Cambios"
                onPress={handleSaveProfile}
                size="lg"
                style={styles.saveButton}
              />
              <Button
                title="Cancelar"
                onPress={handleCancelEdit}
                variant="outline"
                size="lg"
                style={styles.cancelButton}
              />
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.uniformButton, styles.logoutButtonStyle]} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.uniformButtonText, styles.logoutButtonTextStyle]}>Cerrar Sesión</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        {!isEditing && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>Zona Peligrosa</Text>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error} />
              <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            ParKing v2.0.0 • Última actualización: {formatDate(new Date('2024-01-01'))}
          </Text>
        </View>
      </ScrollView>
    </PhoneContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  nameInput: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  memberSince: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  statNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  section: {
    margin: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  balanceValue: {
    color: theme.colors.success,
    fontWeight: theme.fontWeight.bold,
  },
  infoNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  infoInput: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
  },
  settingsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  editActions: {
    gap: theme.spacing.md,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  cancelButton: {
    borderColor: theme.colors.text.muted,
  },
  actionButtons: {
    gap: theme.spacing.md,
  },
  uniformButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  logoutButtonStyle: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  uniformButtonText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  logoutButtonTextStyle: {
    color: theme.colors.error,
  },
  dangerZone: {
    margin: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dangerZoneTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  deleteButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.fontWeight.medium,
  },
  appInfo: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  appInfoText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});