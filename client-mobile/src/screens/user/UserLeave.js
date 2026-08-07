import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leave/history/${user?.id}`);
      setLeaves(res.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/leave/apply/${user?.id}`, formData);
      Alert.alert('Success', 'Leave request submitted!');
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Apply for Leave</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Leave Type (e.g., Sick, Casual)"
          value={formData.leaveType}
          onChangeText={(text) => setFormData({...formData, leaveType: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Start Date (YYYY-MM-DD)"
          value={formData.startDate}
          onChangeText={(text) => setFormData({...formData, startDate: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="End Date (YYYY-MM-DD)"
          value={formData.endDate}
          onChangeText={(text) => setFormData({...formData, endDate: text})}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Reason for Leave"
          value={formData.reason}
          onChangeText={(text) => setFormData({...formData, reason: text})}
          multiline
        />

        <TouchableOpacity 
          style={[styles.button, submitting && styles.disabledBtn]} 
          onPress={handleApply}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Request</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Leave History</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" />
      ) : leaves.length === 0 ? (
        <Text style={styles.emptyText}>No leave history found.</Text>
      ) : (
        leaves.map((item, index) => (
          <View key={index} style={styles.historyCard}>
            <View style={styles.header}>
              <Text style={styles.leaveType}>{item.leaveType}</Text>
              <Text style={[styles.statusBadge, item.status === 'APPROVED' ? styles.statusApproved : item.status === 'REJECTED' ? styles.statusRejected : styles.statusPending]}>
                {item.status || 'PENDING'}
              </Text>
            </View>
            <Text style={styles.infoText}>{item.startDate} to {item.endDate}</Text>
            <Text style={styles.infoText}>Reason: {item.reason}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#23d2aa',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leaveType: {
    fontSize: 16,
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
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 10,
  }
});
