import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import CustomSelect from '../../components/CustomSelect';
import apiClient from '../../api/apiClient';

const UpdateEmployeeScreen = ({ route, navigation }) => {
  const { employee } = route.params || {};
  const emp = employee || {};

  const [employeeEmail, setEmployeeEmail] = useState(emp.companyDetails?.employeeEmail || emp.email || '');
  const [designation, setDesignation] = useState(emp.companyDetails?.designation || '');
  const [shiftTiming, setShiftTiming] = useState(emp.companyDetails?.shiftTiming || '');
  const [joiningDate, setJoiningDate] = useState(emp.companyDetails?.joiningDate || '2024-01-15');
  const [leavingDate, setLeavingDate] = useState(emp.companyDetails?.leavingDate || '');
  const [status, setStatus] = useState(emp.companyDetails?.status || 'Active');
  const [loading, setLoading] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);


  useEffect(() => {
    fetchShiftOptions();
  }, []);

  const fetchShiftOptions = async () => {
    try {
      const res = await apiClient.get('/api/admin/settings');
      const settingsData = res.data?.settings;
      // Settings endpoint returns { settings: {...}, shiftTimings: [...] }
      const shifts = res.data?.shiftTimings || [];
      if (Array.isArray(shifts) && shifts.length > 0) {
        setShiftOptions(shifts.map(s => s.name || s));
      } else {
        setShiftOptions([
          'Morning (9:00 AM - 6:00 PM)',
          'General (10:00 AM - 7:00 PM)',
          'Evening (2:00 PM - 11:00 PM)',
          'Night (10:00 PM - 6:00 AM)',
          'Rotational',
        ]);
      }
    } catch (e) {
      setShiftOptions([
        'Morning (9:00 AM - 6:00 PM)',
        'General (10:00 AM - 7:00 PM)',
        'Evening (2:00 PM - 11:00 PM)',
        'Night (10:00 PM - 6:00 AM)',
        'Rotational',
      ]);
    }
  };

  const handleUpdate = async () => {
    if (!employeeEmail.trim() || !designation.trim() || !joiningDate.trim()) {
      Alert.alert('Validation Error', 'Employee Email, Designation, and Joining Date are required.');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(joiningDate)) {
      Alert.alert('Validation Error', 'Joining Date must be in YYYY-MM-DD format.');
      return;
    }
    if (leavingDate && !dateRegex.test(leavingDate)) {
      Alert.alert('Validation Error', 'Leaving Date must be in YYYY-MM-DD format.');
      return;
    }

    setLoading(true);
    try {
      // Use REST API endpoint with PUT method (not web form POST)
      const response = await apiClient.put(`/api/employees/${emp.id}`, {
        companyDetails: {
          employeeEmail: employeeEmail.trim(),
          designation: designation.trim(),
          shiftTiming: shiftTiming || '',
          joiningDate: joiningDate,
          leavingDate: leavingDate || null,
          status: status || 'Active',
        },
      });

      if (response.data) {
        Alert.alert('Success', 'Employee company details updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Update returned an unexpected response.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update employee details.';
      Alert.alert('Update Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Update Employee"
        subtitle={`${emp.firstname || ''} ${emp.lastname || ''}`}
        showMenu={false}
        onMenuPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Company Details</Text>

          <CustomInput
            label="Employee Email *"
            value={employeeEmail}
            onChangeText={setEmployeeEmail}
            placeholder="employee@company.com"
            icon="mail-outline"
            keyboardType="email-address"
          />

          <CustomInput
            label="Designation *"
            value={designation}
            onChangeText={setDesignation}
            placeholder="e.g. Senior Software Engineer"
            icon="briefcase-outline"
          />

          {/* Shift Timing Dropdown */}
          <CustomSelect
            label="Shift Timing *"
            value={shiftTiming}
            onValueChange={setShiftTiming}
            options={shiftOptions.map((o) => ({ value: o, label: o }))}
            placeholder="Select Shift"
          />

          <CustomInput
            label="Joining Date *"
            value={joiningDate}
            onChangeText={setJoiningDate}
            placeholder="YYYY-MM-DD"
            type="date"
            icon="calendar-outline"
          />

          <CustomInput
            label="Leaving Date"
            value={leavingDate}
            onChangeText={setLeavingDate}
            placeholder="YYYY-MM-DD (Optional)"
            type="date"
            icon="calendar-outline"
          />

          {/* Status Dropdown */}
          <CustomSelect
            label="Status *"
            value={status}
            onValueChange={setStatus}
            options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
            placeholder="Select Status"
          />

          <View style={styles.btnRow}>
            <CustomButton
              title="Update"
              onPress={handleUpdate}
              loading={loading}
              style={[styles.actionBtn, { backgroundColor: '#16A34A' }]}
            />
            <CustomButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.actionBtn}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34495e',
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#23d2aa',
    paddingLeft: 12,
    marginTop: 4,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtn: {
    flex: 0.48,
  },
  fieldGroup: {
    marginVertical: 6,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    height: 44,
  },
  selectText: {
    fontSize: 14,
    color: '#111111',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionActive: {
    backgroundColor: '#F0FDF4',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#334155',
  },
});

export default UpdateEmployeeScreen;
