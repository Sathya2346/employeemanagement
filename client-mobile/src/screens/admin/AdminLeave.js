import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';

export default function AdminLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/leave/all');
      setLeaves(res.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, action) => {
    try {
      await api.post(`/admin/leave/${id}/${action}`);
      Alert.alert('Success', `Leave ${action}d successfully`);
      fetchLeaves();
    } catch (err) {
      Alert.alert('Error', `Failed to ${action} leave`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.employeeName}</Text>
        <Text style={[styles.statusBadge, item.status === 'APPROVED' ? styles.statusApproved : item.status === 'REJECTED' ? styles.statusRejected : styles.statusPending]}>
          {item.status || 'PENDING'}
        </Text>
      </View>
      <Text style={styles.infoText}>Type: {item.leaveType}</Text>
      <Text style={styles.infoText}>From: {item.startDate} To: {item.endDate}</Text>
      <Text style={styles.infoText}>Reason: {item.reason}</Text>

      {item.status !== 'APPROVED' && item.status !== 'REJECTED' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleLeaveAction(item.id, 'approve')}>
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleLeaveAction(item.id, 'reject')}>
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Management</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No leave requests found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  statusApproved: { backgroundColor: '#d4edda', color: '#155724' },
  statusRejected: { backgroundColor: '#f8d7da', color: '#721c24' },
  statusPending: { backgroundColor: '#fff3cd', color: '#856404' },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  approveBtn: { backgroundColor: '#28a745' },
  rejectBtn: { backgroundColor: '#dc3545' },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
