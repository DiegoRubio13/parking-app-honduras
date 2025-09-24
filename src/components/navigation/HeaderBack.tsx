import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface HeaderBackProps {
  onPress: () => void;
  color?: string;
  style?: any;
}

export const HeaderBack: React.FC<HeaderBackProps> = ({
  onPress,
  color = theme.colors.text.primary,
  style
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.container, style]}
    accessibilityLabel="Volver"
    accessibilityRole="button"
  >
    <Ionicons name="arrow-back" size={24} color={color} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  }
});