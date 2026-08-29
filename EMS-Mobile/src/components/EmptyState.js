import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const EmptyState = ({ icon = 'folder-open-outline', message = 'No data found' }) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={48} color={COLORS.textMuted} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginVertical: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EmptyState;
