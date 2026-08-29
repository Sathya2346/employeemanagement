import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const ErrorView = ({ message = 'Unable to connect to EMS server.', onRetry }) => (
  <View style={styles.container}>
    <Ionicons name="alert-circle-outline" size={40} color={COLORS.danger} />
    <Text style={styles.title}>Connection Error</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry ? (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 8,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default ErrorView;
