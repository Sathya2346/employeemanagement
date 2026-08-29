import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const LoadingView = ({ message = 'Loading...' }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={COLORS.primaryDark} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default LoadingView;
