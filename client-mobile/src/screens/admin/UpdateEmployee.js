import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function UpdateEmployee({ route, navigation }) {
  const { id } = route.params || {};

  const [employeeEmail, setEmployeeEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [shiftTiming, setShiftTiming] = useState('9:00 AM - 6:00 PM');
  const [joiningDate, setJoiningDate] = useState('');
  const [leavingDate, setLeavingDate] = useState('');
  const [status, setStatus] = useState('Active');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const emp = res.data;
      if (emp) {
        setEmployeeEmail(emp.companyDetails?.employeeEmail || emp.email || '');
        setDesignation(emp.companyDetails?.designation || '');
        setShiftTiming(emp.companyDetails?.shiftTiming || '9:00 AM - 6:00 PM');
        setJoiningDate(emp.companyDetails?.joiningDate || '');
        setLeavingDate(emp.companyDetails?.leavingDate || '');
        setStatus(emp.companyDetails?.status || 'Active');
      }
    } catch (err) {
      console.error('Failed to load employee details:', err);
      Alert.alert('Error', 'Failed to fetch employee details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setErrorMsg('');
    if (!employeeEmail || !designation || !shiftTiming || !joiningDate) {
      setErrorMsg('Please fill in all required fields marked with *.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        companyDetails: {
          employeeEmail,
          designation,
          shiftTiming,
          joiningDate,
          leavingDate,
          status
        }
      };

      await api.post(`/admin/updateEmployee/${id}`, payload);
      Alert.alert("Success", "Employee details updated successfully!", [
        { text: "OK", onPress: () => navigation.navigate('EmployeeListDrawer') }
      ]);
    } catch (err) {
      console.error('Failed to update employee:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#23d2aa" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header (Matches updateEmployee.html lines 58-61) */}
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>Update Company Details</Text>
        <Text style={styles.headerSubtitle}>Assign designation, shift timing, and joining date to activate employee access.</Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorAlert}>
          <Ionicons name="alert-circle" size={18} color="#842029" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        {/* Company Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Employee Email <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={employeeEmail}
            onChangeText={setEmployeeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Designation */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Designation <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Software Engineer"
            placeholderTextColor="#94a3b8"
            value={designation}
            onChangeText={setDesignation}
          />
        </View>

        {/* Shift Timing */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Shift Timing <Text style={styles.star}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9:00 AM - 6:00 PM"
            placeholderTextColor="#94a3b8"
            value={shiftTiming}
            onChangeText={setShiftTiming}
          />
        </View>

        {/* Joining Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Joining Date <Text style={styles.star}>*</Text> (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={joiningDate}
            onChangeText={setJoiningDate}
          />
        </View>

        {/* Leaving Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Leaving Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={leavingDate}
            onChangeText={setLeavingDate}
          />
        </View>

        {/* Employment Status */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status <Text style={styles.star}>*</Text></Text>
          <View style={styles.statusRow}>
            <TouchableOpacity 
              style={[styles.statusOption, status === 'Active' && styles.statusActive]}
              onPress={() => setStatus('Active')}
            >
              <Text style={[styles.statusText, status === 'Active' && styles.statusTextActive]}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statusOption, status === 'Inactive' && styles.statusInactive]}
              onPress={() => setStatus('Inactive')}
            >
              <Text style={[styles.statusText, status === 'Inactive' && styles.statusTextInactive]}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={[styles.saveBtn, saving && styles.disabledBtn]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Update Details</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  headerBlock: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c2c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#842029',
    fontSize: 13,
    flex: 1,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
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
    height: 46,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#212529',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  statusActive: {
    borderColor: '#28a745',
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    borderColor: '#dc3545',
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  statusTextActive: {
    color: '#065f46',
  },
  statusTextInactive: {
    color: '#991b1b',
  },
  btnRow: {
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#0d6efd', // Matches btn-primary in updateEmployee.html
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledBtn: {
    backgroundColor: '#93c5fd',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
