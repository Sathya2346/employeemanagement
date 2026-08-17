import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

export default function ReviewOnboarding({ route, navigation }) {
  const { id } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch employee details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (status) => {
    Alert.alert(
      `${status === 'APPROVED' ? 'Approve' : 'Reject'} Onboarding`,
      `Are you sure you want to ${status.toLowerCase()} this onboarding request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => submitStatus(status) 
        }
      ]
    );
  };

  const submitStatus = async (status) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('employeeId', id);
      formData.append('action', status);
      await api.post('/onboarding/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Success', `Onboarding request ${status.toLowerCase()} successfully.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to process onboarding request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#23d2aa" />
      </View>
    );
  }

  if (!employee) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Review Onboarding</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{employee.firstname} {employee.lastname}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{employee.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submitted Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{employee.personalDetails?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{employee.personalDetails?.address || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bank Name:</Text>
          <Text style={styles.value}>{employee.bankDetails?.bankName || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Account Number:</Text>
          <Text style={styles.value}>{employee.bankDetails?.accountNumber || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.approveBtn}
          onPress={() => handleAction('APPROVED')}
          disabled={submitting}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.rejectBtn}
          onPress={() => handleAction('REJECTED')}
          disabled={submitting}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#212529', textAlign: 'center' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#23d2aa', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#495057', fontWeight: 'bold', flex: 1 },
  value: { fontSize: 14, color: '#212529', flex: 2 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 40 },
  approveBtn: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 8 },
  rejectBtn: { backgroundColor: '#dc3545', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center', marginLeft: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
