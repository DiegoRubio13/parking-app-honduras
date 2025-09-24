import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

interface PhoneContainerProps {
  children: React.ReactNode;
  style?: any;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});