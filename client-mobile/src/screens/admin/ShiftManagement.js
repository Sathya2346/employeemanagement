import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

export default function ShiftManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/employees/all');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees for shift management', err);
    } finally {
      setLoading(false);
    }
  };

  const updateShift = async (id, newShift) => {
    try {
      await api.post(`/admin/employees/${id}/shift`, { shiftTiming: newShift });
      Alert.alert('Success', 'Shift updated successfully!');
      fetchEmployees();
    } catch (err) {
      Alert.alert('Error', 'Failed to update shift');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.employeeName}>{item.firstname} {item.lastname}</Text>
        <Text style={styles.roleText}>{item.companyDetails?.designation || 'N/A'}</Text>
      </View>
      <Text style={styles.currentShift}>Current Shift: <Text style={styles.bold}>{item.companyDetails?.shiftTiming || 'Not Assigned'}</Text></Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.shiftBtn, styles.morningBtn]} onPress={() => updateShift(item.id, 'Morning (9AM - 6PM)')}>
          <Text style={styles.shiftBtnText}>Morning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shiftBtn, styles.eveningBtn]} onPress={() => updateShift(item.id, 'Evening (2PM - 11PM)')}>
          <Text style={styles.shiftBtnText}>Evening</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shiftBtn, styles.nightBtn]} onPress={() => updateShift(item.id, 'Night (10PM - 7AM)')}>
          <Text style={styles.shiftBtnText}>Night</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shift Management</Text>
      <Text style={styles.subtitle}>Assign or update employee work shifts</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  roleText: {
    fontSize: 14,
    color: '#6c757d',
  },
  currentShift: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#212529',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  morningBtn: { backgroundColor: '#fd7e14' },
  eveningBtn: { backgroundColor: '#6f42c1' },
  nightBtn: { backgroundColor: '#343a40' },
  shiftBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
