import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { createReservation, getUserReservations, cancelReservation } from '../../services/reservationService';
import { getAllParkingSpots } from '../../services/parkingService';
import type { ParkingSpot } from '../../services/parkingService';
import type { Reservation } from '../../services/reservationService';

export default function ReservationScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'upcoming' | 'history'>('new');
  const [availableSpots, setAvailableSpots] = useState<ParkingSpot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');

  useEffect(() => {
    loadAvailableSpots();
    loadUserReservations();
  }, []);

  const loadAvailableSpots = async () => {
    try {
      const spots = await getAllParkingSpots();
      const available = spots.filter(spot => spot.status === 'available' && !spot.isOccupied);
      setAvailableSpots(available);
    } catch (error) {
      console.error('Error loading spots:', error);
    }
  };

  const loadUserReservations = async () => {
    try {
      if (user?.uid) {
        const userReservations = await getUserReservations(user.uid);
        setReservations(userReservations);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedSpot || !startTime || !endTime || !user) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        userId: user.uid,
        userName: user.displayName || 'Unknown',
        userPhone: user.phoneNumber || '',
        spotId: selectedSpot.id,
        spotNumber: selectedSpot.number,
        location: selectedSpot.location,
        vehicleId: vehicleId || undefined,
        startTime: `${selectedDate.toISOString().split('T')[0]}T${startTime}:00`,
        endTime: `${selectedDate.toISOString().split('T')[0]}T${endTime}:00`,
        status: 'confirmed' as const,
        estimatedCost: calculateEstimatedCost(startTime, endTime),
      };

      await createReservation(reservationData);
      Alert.alert('Success', 'Reservation created successfully!');
      setSelectedSpot(null);
      setStartTime('');
      setEndTime('');
      setVehicleId('');
      loadUserReservations();
      setActiveTab('upcoming');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelReservation(reservationId);
              Alert.alert('Success', 'Reservation cancelled');
              loadUserReservations();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const calculateEstimatedCost = (start: string, end: string): number => {
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = diffMs / (1000 * 60);
    return Math.ceil(diffMins * 1); // $1 per minute
  };

  const renderNewReservation = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Select Parking Spot</Text>
      <View style={styles.spotsGrid}>
        {availableSpots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={[
              styles.spotCard,
              selectedSpot?.id === spot.id && styles.spotCardSelected,
            ]}
            onPress={() => setSelectedSpot(spot)}
          >
            <Text style={styles.spotNumber}>{spot.number}</Text>
            <Text style={styles.spotType}>{spot.type}</Text>
            <Text style={styles.spotLocation}>{spot.location}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSpot && (
        <>
          <Text style={styles.sectionTitle}>Reservation Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateInput}>
              <Text>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="14:00"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>End Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="16:00"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vehicle ID (Optional)</Text>
            <TextInput
              style={styles.input}
              value={vehicleId}
              onChangeText={setVehicleId}
              placeholder="Enter vehicle ID"
              placeholderTextColor="#999"
            />
          </View>

          {startTime && endTime && (
            <View style={styles.costContainer}>
              <Text style={styles.costLabel}>Estimated Cost:</Text>
              <Text style={styles.costValue}>
                ${calculateEstimatedCost(startTime, endTime).toFixed(2)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.reserveButton, loading && styles.reserveButtonDisabled]}
            onPress={handleCreateReservation}
            disabled={loading}
          >
            <Text style={styles.reserveButtonText}>
              {loading ? 'Creating...' : 'Confirm Reservation'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderReservationsList = (filter: 'upcoming' | 'history') => {
    const filteredReservations = reservations.filter((res) => {
      const now = new Date();
      const startTime = new Date(res.startTime);
      if (filter === 'upcoming') {
        return res.status !== 'cancelled' && res.status !== 'completed' && startTime > now;
      }
      return res.status === 'cancelled' || res.status === 'completed' || startTime <= now;
    });

    return (
      <ScrollView style={styles.content}>
        {filteredReservations.length === 0 ? (
          <Text style={styles.emptyText}>No {filter} reservations</Text>
        ) : (
          filteredReservations.map((reservation) => (
            <View key={reservation.id} style={styles.reservationCard}>
              <View style={styles.reservationHeader}>
                <Text style={styles.reservationSpot}>Spot {reservation.spotNumber}</Text>
                <Text style={[
                  styles.reservationStatus,
                  { color: getStatusColor(reservation.status) }
                ]}>
                  {reservation.status}
                </Text>
              </View>
              <Text style={styles.reservationLocation}>{reservation.location}</Text>
              <Text style={styles.reservationTime}>
                {new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleString()}
              </Text>
              <Text style={styles.reservationCost}>
                Estimated Cost: ${reservation.estimatedCost.toFixed(2)}
              </Text>
              {reservation.status === 'confirmed' && filter === 'upcoming' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelReservation(reservation.id)}
                >
                  <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'active': return '#2196F3';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#000';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parking Reservations</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
            New
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'new' && renderNewReservation()}
      {activeTab === 'upcoming' && renderReservationsList('upcoming')}
      {activeTab === 'history' && renderReservationsList('history')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1E88E5',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#1E88E5',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  tabTextActive: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  spotCard: {
    width: '30%',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  spotCardSelected: {
    borderColor: '#1E88E5',
    backgroundColor: '#E3F2FD',
  },
  spotNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  spotType: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  spotLocation: {
    fontSize: 10,
    color: '#999',
    marginTop: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
  },
  costLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  costValue: {
    fontSize: 18,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  reserveButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reserveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  reserveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reservationCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reservationSpot: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reservationStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reservationLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reservationTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reservationCost: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
});