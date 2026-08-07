import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

export default function ViewEmployeeDetails({ route, navigation }) {
  const { id } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{employee.firstname} {employee.lastname}</Text>
        <Text style={styles.headerSubtitle}>{employee.role}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{employee.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <Text style={styles.value}>{employee.department || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Designation:</Text>
          <Text style={styles.value}>{employee.companyDetails?.designation || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{employee.overallStatus}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{employee.personalDetails?.phone || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{employee.personalDetails?.address || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Bank Name:</Text>
          <Text style={styles.value}>{employee.bankDetails?.bankName || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Account No:</Text>
          <Text style={styles.value}>{employee.bankDetails?.accountNumber || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IFSC:</Text>
          <Text style={styles.value}>{employee.bankDetails?.ifscCode || 'N/A'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>Back to Employee List</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#212529' },
  headerSubtitle: { fontSize: 16, color: '#6c757d' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#23d2aa', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#495057', fontWeight: 'bold', flex: 1 },
  value: { fontSize: 14, color: '#212529', flex: 2 },
  backBtn: { backgroundColor: '#6c757d', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
