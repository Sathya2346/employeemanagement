import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyLeaves();
    setRefreshing(false);
  };

  const handleApply = async () => {
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/leave/apply/${user?.id}`, formData);
      Alert.alert('Success', 'Leave request submitted successfully!');
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      Alert.alert('Error', 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const upper = (status || 'PENDING').toUpperCase();
    if (upper === 'APPROVED') return { bg: '#d1fae5', text: '#065f46', label: 'Approved' };
    if (upper === 'REJECTED') return { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' };
    return { bg: '#fef3c7', text: '#b45309', label: 'Pending' };
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23d2aa']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Apply Leave Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-outline" size={20} color="#23d2aa" style={{ marginRight: 8 }} />
          <Text style={styles.cardTitle}>Apply for Leave</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leave Type <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sick Leave / Casual Leave"
            placeholderTextColor="#94a3b8"
            value={formData.leaveType}
            onChangeText={(text) => setFormData({...formData, leaveType: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date <Text style={styles.star}>*</Text> (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={formData.startDate}
            onChangeText={(text) => setFormData({...formData, startDate: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date <Text style={styles.star}>*</Text> (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={formData.endDate}
            onChangeText={(text) => setFormData({...formData, endDate: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reason for Leave <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="State your reason..."
            placeholderTextColor="#94a3b8"
            value={formData.reason}
            onChangeText={(text) => setFormData({...formData, reason: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.disabledBtn]} 
          onPress={handleApply}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>Submit Leave Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Leave History Header */}
      <View style={styles.historyHeader}>
        <Ionicons name="time-outline" size={20} color="#212529" style={{ marginRight: 6 }} />
        <Text style={styles.historyTitle}>My Leave History</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 20 }} />
      ) : leaves.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No leave history found.</Text>
        </View>
      ) : (
        leaves.map((item, index) => {
          const badge = getStatusBadge(item.status);
          return (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyTopRow}>
                <Text style={styles.leaveTypeTitle}>{item.leaveType || 'Leave Request'}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <Ionicons name="calendar" size={14} color="#64748b" style={{ marginRight: 4 }} />
                <Text style={styles.dateRangeText}>{item.startDate} → {item.endDate}</Text>
              </View>

              <Text style={styles.reasonDetailText}>Reason: {item.reason || 'N/A'}</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 6,
  },
  star: {
    color: '#dc3545',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#212529',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#23d2aa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledBtn: {
    backgroundColor: '#8ce6d1',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderLeftWidth: 4,
    borderLeftColor: '#23d2aa',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateRangeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  reasonDetailText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
});
