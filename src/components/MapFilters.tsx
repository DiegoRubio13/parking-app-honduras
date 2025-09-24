import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { LocationFilters } from '../services/parkingLocationService';

interface MapFiltersProps {
  filters: LocationFilters;
  onFiltersChange: (filters: LocationFilters) => void;
  hasUserLocation?: boolean;
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  filters,
  onFiltersChange,
  hasUserLocation = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState<LocationFilters>(filters);

  const sortOptions = [
    { value: 'distance', label: 'Distancia', icon: 'location-outline', disabled: !hasUserLocation },
    { value: 'price', label: 'Precio', icon: 'cash-outline', disabled: false },
    { value: 'availability', label: 'Disponibilidad', icon: 'car-outline', disabled: false },
    { value: 'name', label: 'Nombre', icon: 'text-outline', disabled: false },
  ];

  const distanceOptions = [
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: undefined, label: 'Sin límite' },
  ];

  const priceOptions = [
    { value: 20, label: 'Hasta L 20/h' },
    { value: 30, label: 'Hasta L 30/h' },
    { value: 40, label: 'Hasta L 40/h' },
    { value: undefined, label: 'Sin límite' },
  ];

  const spotsOptions = [
    { value: 5, label: 'Mínimo 5 espacios' },
    { value: 10, label: 'Mínimo 10 espacios' },
    { value: 20, label: 'Mínimo 20 espacios' },
    { value: undefined, label: 'Sin límite' },
  ];

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setModalVisible(false);
  };

  const handleResetFilters = () => {
    const resetFilters: LocationFilters = {
      searchText: '',
      sortBy: hasUserLocation ? 'distance' : 'name',
      userLocation: filters.userLocation,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setModalVisible(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.maxDistance !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.minAvailableSpots !== undefined) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ubicación..."
            placeholderTextColor={theme.colors.text.secondary}
            value={localFilters.searchText || ''}
            onChangeText={(text) => {
              const newFilters = { ...localFilters, searchText: text };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          />
          {localFilters.searchText && (
            <TouchableOpacity
              onPress={() => {
                const newFilters = { ...localFilters, searchText: '' };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, activeCount > 0 && styles.filterButtonActive]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeCount > 0 ? 'white' : theme.colors.primary}
          />
          {activeCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Ordenar por</Text>
                <View style={styles.optionsGrid}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        localFilters.sortBy === option.value && styles.optionButtonActive,
                        option.disabled && styles.optionButtonDisabled,
                      ]}
                      onPress={() =>
                        !option.disabled &&
                        setLocalFilters({ ...localFilters, sortBy: option.value as any })
                      }
                      disabled={option.disabled}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={
                          option.disabled
                            ? theme.colors.text.disabled
                            : localFilters.sortBy === option.value
                            ? 'white'
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.optionButtonText,
                          localFilters.sortBy === option.value && styles.optionButtonTextActive,
                          option.disabled && styles.optionButtonTextDisabled,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {option.disabled && (
                        <Text style={styles.disabledHint}>Activa GPS</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Max Distance */}
              {hasUserLocation && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Distancia máxima</Text>
                  <View style={styles.optionsRow}>
                    {distanceOptions.map((option) => (
                      <TouchableOpacity
                        key={option.label}
                        style={[
                          styles.chipButton,
                          localFilters.maxDistance === option.value && styles.chipButtonActive,
                        ]}
                        onPress={() =>
                          setLocalFilters({ ...localFilters, maxDistance: option.value })
                        }
                      >
                        <Text
                          style={[
                            styles.chipButtonText,
                            localFilters.maxDistance === option.value &&
                              styles.chipButtonTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Max Price */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Precio por hora</Text>
                <View style={styles.optionsRow}>
                  {priceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.chipButton,
                        localFilters.maxPrice === option.value && styles.chipButtonActive,
                      ]}
                      onPress={() =>
                        setLocalFilters({ ...localFilters, maxPrice: option.value })
                      }
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          localFilters.maxPrice === option.value &&
                            styles.chipButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Min Available Spots */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Espacios disponibles</Text>
                <View style={styles.optionsRow}>
                  {spotsOptions.map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.chipButton,
                        localFilters.minAvailableSpots === option.value &&
                          styles.chipButtonActive,
                      ]}
                      onPress={() =>
                        setLocalFilters({ ...localFilters, minAvailableSpots: option.value })
                      }
                    >
                      <Text
                        style={[
                          styles.chipButtonText,
                          localFilters.minAvailableSpots === option.value &&
                            styles.chipButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
    ...theme.shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blue[200],
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  filterSection: {
    marginBottom: theme.spacing.xl,
  },
  filterSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
  },
  optionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionButtonText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  optionButtonTextActive: {
    color: 'white',
  },
  optionButtonTextDisabled: {
    color: theme.colors.text.disabled,
  },
  disabledHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chipButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
  },
  chipButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  chipButtonTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.blue[200],
  },
  resetButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.blue[200],
  },
  resetButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: 'white',
  },
});