import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeEmployees: 0,
    totalLeaveRequests: 0,
    activeShifts: 0,
  });

  useEffect(() => {
    // Fetch stats on load
    api.get('/admin/api/dashboard') // Ensure this matches your backend API
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.cardContainer}>
        <View style={[styles.card, { borderLeftColor: '#007bff' }]}>
          <Text style={styles.cardTitle}>Total Employees</Text>
          <Text style={styles.cardValue}>{stats.activeEmployees}</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#ffc107' }]}>
          <Text style={styles.cardTitle}>Pending Leaves</Text>
          <Text style={styles.cardValue}>{stats.totalLeaveRequests}</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#28a745' }]}>
          <Text style={styles.cardTitle}>Active Shifts</Text>
          <Text style={styles.cardValue}>{stats.activeShifts}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 5,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginTop: 8,
  },
});
