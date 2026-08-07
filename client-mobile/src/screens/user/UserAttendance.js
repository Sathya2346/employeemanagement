import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/today/${user?.id}`);
      setAttendance(res.data || null);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint, successMessage) => {
    setActionLoading(true);
    try {
      await api.post(`/attendance/${endpoint}/${user?.id}`);
      Alert.alert('Success', successMessage);
      fetchTodayAttendance();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || `Failed to ${endpoint}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.checkInBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('checkin', 'Checked in successfully')}
              disabled={actionLoading || (attendance && attendance.checkInTime)}
            >
              <Text style={styles.actionBtnText}>Check-In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.breakBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('breakin', 'Started break')}
              disabled={actionLoading || !attendance || attendance.checkOutTime}
            >
              <Text style={styles.actionBtnText}>Break</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.meetingBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('meetingin', 'Started meeting')}
              disabled={actionLoading || !attendance || attendance.checkOutTime}
            >
              <Text style={styles.actionBtnText}>Meeting</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.checkOutBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('checkout', 'Checked out successfully')}
              disabled={actionLoading || !attendance || attendance.checkOutTime}
            >
              <Text style={styles.actionBtnText}>Check-Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                 {attendance?.checkInTime ? new Date(`1970-01-01T${attendance.checkInTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
              <Text style={styles.statLabel}>In Time</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {attendance?.checkOutTime ? new Date(`1970-01-01T${attendance.checkOutTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
              <Text style={styles.statLabel}>Out Time</Text>
            </View>
            
            {/* Break and meeting calculations would require dynamic timers or backend calculations as per Thymeleaf logic */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0m 0s</Text>
              <Text style={styles.statLabel}>Break Time</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>0m 0s</Text>
              <Text style={styles.statLabel}>Meeting Time</Text>
            </View>
          </View>
        </>
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  checkInBtn: { backgroundColor: '#28a745' },
  breakBtn: { backgroundColor: '#ffc107' },
  meetingBtn: { backgroundColor: '#17a2b8' },
  checkOutBtn: { backgroundColor: '#dc3545' },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
});
