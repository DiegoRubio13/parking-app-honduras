import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform
} from 'react-native';
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {format(customRange.startDate, 'MMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {format(customRange.endDate, 'MMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCustomPicker(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonApply]}
                onPress={handleCustomRangeApply}
              >
                <Text style={styles.modalButtonTextApply}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  }
});

export default DateFilter;