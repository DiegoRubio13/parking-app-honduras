import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  Button
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { theme } from '../constants/theme';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
  showQuickFilters?: boolean;
}

type QuickFilterOption = 'today' | 'yesterday' | 'last7days' | 'thisWeek' | 'thisMonth' | 'custom';

export const DateFilter: React.FC<DateFilterProps> = ({
  onDateRangeChange,
  initialRange,
  showQuickFilters = true
}) => {
  const [selectedFilter, setSelectedFilter] = useState<QuickFilterOption>('today');
  const [customRange, setCustomRange] = useState<DateRange>(
    initialRange || {
      startDate: new Date(),
      endDate: new Date()
    }
  );
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const quickFilters: { label: string; value: QuickFilterOption }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Custom', value: 'custom' }
  ];

  const getDateRange = (filter: QuickFilterOption): DateRange => {
    const today = new Date();

    switch (filter) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { startDate: yesterday, endDate: yesterday };
      case 'last7days':
        return { startDate: subDays(today, 7), endDate: today };
      case 'thisWeek':
        return { startDate: startOfWeek(today), endDate: endOfWeek(today) };
      case 'thisMonth':
        return { startDate: startOfMonth(today), endDate: endOfMonth(today) };
      case 'custom':
        return customRange;
      default:
        return { startDate: today, endDate: today };
    }
  };

  const handleFilterSelect = (filter: QuickFilterOption) => {
    setSelectedFilter(filter);

    if (filter === 'custom') {
      setShowCustomPicker(true);
    } else {
      const range = getDateRange(filter);
      onDateRangeChange(range);
    }
  };

  const handleCustomRangeApply = () => {
    onDateRangeChange(customRange);
    setShowCustomPicker(false);
  };

  const formatDateRange = (): string => {
    const range = selectedFilter === 'custom' ? customRange : getDateRange(selectedFilter);

    if (format(range.startDate, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd')) {
      return format(range.startDate, 'MMM dd, yyyy');
    }

    return `${format(range.startDate, 'MMM dd')} - ${format(range.endDate, 'MMM dd, yyyy')}`;
  };

  return (
    <View style={styles.container}>
      {showQuickFilters && (
        <View style={styles.quickFiltersContainer}>
          {quickFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                selectedFilter === filter.value && styles.filterButtonActive
              ]}
              onPress={() => handleFilterSelect(filter.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.value && styles.filterButtonTextActive
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.selectedRangeContainer}>
        <Text style={styles.selectedRangeLabel}>Selected Range:</Text>
        <Text style={styles.selectedRangeText}>{formatDateRange()}</Text>
      </View>

      <Modal
        visible={showCustomPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCustomPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Seleccionar rango de fechas</Text>

                <View style={styles.datePickerRow}>
                  <Text style={styles.datePickerLabel}>Desde:</Text>
                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      value={customRange.startDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setCustomRange({ ...customRange, startDate: selectedDate });
                        }
                      }}
                      maximumDate={customRange.endDate}
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.androidDateButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text>{customRange.startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.datePickerRow}>
                  <Text style={styles.datePickerLabel}>Hasta:</Text>
                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      value={customRange.endDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setCustomRange({ ...customRange, endDate: selectedDate });
                        }
                      }}
                      minimumDate={customRange.startDate}
                      maximumDate={new Date()}
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.androidDateButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text>{customRange.endDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Button title="Aplicar" onPress={handleCustomRangeApply} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={customRange.startDate}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setCustomRange({ ...customRange, startDate: selectedDate });
            }
          }}
        />
      )}

      {Platform.OS === 'android' && showEndDatePicker && (
        <DateTimePicker
          value={customRange.endDate}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setCustomRange({ ...customRange, endDate: selectedDate });
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary
  },
  filterButtonTextActive: {
    color: '#ffffff'
  },
  selectedRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.blue[50],
    borderRadius: theme.borderRadius.sm
  },
  selectedRangeLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm
  },
  selectedRangeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center'
  },
  dateInputContainer: {
    marginBottom: theme.spacing.md
  },
  dateLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background
  },
  dateInputText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  modalButtonCancel: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalButtonApply: {
    backgroundColor: theme.colors.primary
  },
  modalButtonTextCancel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary
  },
  modalButtonTextApply: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#ffffff'
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  datePickerLabel: {
    fontSize: theme.fontSize.md,
    marginRight: theme.spacing.md,
  },
  androidDateButton: {
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  }
});

export default DateFilter;