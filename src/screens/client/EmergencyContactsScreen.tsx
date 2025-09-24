import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PhoneContainer } from '../../components/layout/PhoneContainer';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

interface EmergencyContactsScreenProps {
  navigation: any;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const relationshipOptions = [
  'Familiar',
  'Amigo',
  'Compañero de trabajo',
  'Vecino',
  'Otro',
];

export const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({ navigation }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'María Pérez',
      phone: '+504 9999-8888',
      relationship: 'Familiar',
    },
  ]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: 'Familiar',
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddContact = () => {
    if (!newContact.name.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del contacto');
      return;
    }
    if (!newContact.phone.trim()) {
      Alert.alert('Error', 'Ingresa el teléfono del contacto');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship,
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', relationship: 'Familiar' });
    setIsAddingContact(false);
    Alert.alert('Éxito', 'Contacto de emergencia agregado');
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Eliminar Contacto',
      '¿Estás seguro que deseas eliminar este contacto de emergencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setContacts(contacts.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  const handleCallContact = async (phone: string) => {
    const phoneUrl = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'No se puede realizar la llamada');
      }
    } catch (error) {
      console.error('Error calling contact:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar llamar');
    }
  };

  const ContactCard = ({ contact }: { contact: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactIcon}>
          <Ionicons name="person" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelationship}>{contact.relationship}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleCallContact(contact.phone)}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.callButtonText}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteContact(contact.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Dropdown = ({
    value,
    options,
    onSelect
  }: {
    value: string;
    options: string[];
    onSelect: (value: string) => void;
  }) => (
    <TouchableOpacity
      style={styles.dropdown}
      onPress={() => {
        Alert.alert(
          'Seleccionar Relación',
          '',
          options.map(option => ({
            text: option,
            onPress: () => onSelect(option),
          }))
        );
      }}
    >
      <Text style={styles.dropdownText}>{value}</Text>
      <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <PhoneContainer>
      <LinearGradient
        colors={['#dc2626', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contactos de Emergencia</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddingContact(!isAddingContact)}
            >
              <Ionicons name={isAddingContact ? "close" : "add"} size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            {contacts.length} {contacts.length === 1 ? 'contacto' : 'contactos'} configurado{contacts.length === 1 ? '' : 's'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>¿Por qué agregar contactos?</Text>
          </View>
          <Text style={styles.infoText}>
            En caso de emergencia, estos contactos serán notificados automáticamente con tu ubicación y el tipo de emergencia.
          </Text>
        </View>

        {/* Add Contact Form */}
        {isAddingContact && (
          <View style={styles.addContactCard}>
            <Text style={styles.sectionTitle}>Nuevo Contacto de Emergencia</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.name}
                onChangeText={(value) => setNewContact(prev => ({ ...prev, name: value }))}
                placeholder="Nombre completo"
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono *</Text>
              <TextInput
                style={styles.textInput}
                value={newContact.phone}
                onChangeText={(value) => setNewContact(prev => ({ ...prev, phone: value }))}
                placeholder="+504 9999-9999"
                placeholderTextColor={theme.colors.text.muted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relación *</Text>
              <Dropdown
                value={newContact.relationship}
                options={relationshipOptions}
                onSelect={(value) => setNewContact(prev => ({ ...prev, relationship: value }))}
              />
            </View>

            <View style={styles.formActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setIsAddingContact(false);
                  setNewContact({ name: '', phone: '', relationship: 'Familiar' });
                }}
                variant="secondary"
                size="md"
                style={styles.cancelButton}
              />
              <Button
                title="Guardar"
                onPress={handleAddContact}
                variant="primary"
                size="md"
                style={styles.saveButton}
              />
            </View>
          </View>
        )}

        {/* Contacts List */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Contactos Guardados</Text>

          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={theme.colors.text.muted} />
              <Text style={styles.emptyText}>No hay contactos de emergencia</Text>
              <Text style={styles.emptySubtext}>
                Agrega contactos para que sean notificados en caso de emergencia
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))
          )}
        </View>

        {/* Emergency Numbers */}
        <View style={styles.emergencyNumbersCard}>
          <Text style={styles.sectionTitle}>Números de Emergencia</Text>

          <TouchableOpacity
            style={styles.emergencyNumberRow}
            onPress={() => handleCallContact('911')}
            activeOpacity={0.7}
          >
            <View style={styles.emergencyNumberInfo}>
              <Ionicons name="call" size={24} color="#dc2626" />
              <View style={styles.emergencyNumberText}>
                <Text style={styles.emergencyNumberTitle}>911</Text>
                <Text style={styles.emergencyNumberSubtitle}>Emergencia General</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyNumberRow}
            onPress={() => handleCallContact('199')}
            activeOpacity={0.7}
          >
            <View style={styles.emergencyNumberInfo}>
              <Ionicons name="medical" size={24} color="#059669" />
              <View style={styles.emergencyNumberText}>
                <Text style={styles.emergencyNumberTitle}>199</Text>
                <Text style={styles.emergencyNumberSubtitle}>Bomberos</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyNumberRow}
            onPress={() => handleCallContact('198')}
            activeOpacity={0.7}
          >
            <View style={styles.emergencyNumberInfo}>
              <Ionicons name="shield" size={24} color="#3b82f6" />
              <View style={styles.emergencyNumberText}>
                <Text style={styles.emergencyNumberTitle}>198</Text>
                <Text style={styles.emergencyNumberSubtitle}>Policía Nacional</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
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
    marginBottom: theme.spacing.sm,
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
  addButton: {
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
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: '#1e40af',
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: '#1e40af',
    lineHeight: 20,
  },
  addContactCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  dropdown: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  dropdownText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  contactsSection: {
    marginBottom: theme.spacing.lg,
  },
  contactCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  contactRelationship: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  contactPhone: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium as any,
  },
  contactActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  callButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  callButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emergencyNumbersCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  emergencyNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[200],
  },
  emergencyNumberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emergencyNumberText: {
    flexDirection: 'column',
  },
  emergencyNumberTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  emergencyNumberSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default EmergencyContactsScreen;