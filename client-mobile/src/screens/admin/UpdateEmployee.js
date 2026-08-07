import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import api from '../../services/api';

export default function UpdateEmployee({ route, navigation }) {
  const { id } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/employees/update/${id}`, employee);
      Alert.alert('Success', 'Employee details updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update employee details.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !employee) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#23d2aa" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Update Employee Details</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <Text style={styles.label}>First Name</Text>
        <TextInput 
          style={styles.input} 
          value={employee.firstname} 
          onChangeText={t => setEmployee({...employee, firstname: t})}
        />
        <Text style={styles.label}>Last Name</Text>
        <TextInput 
          style={styles.input} 
          value={employee.lastname} 
          onChangeText={t => setEmployee({...employee, lastname: t})}
        />
        <Text style={styles.label}>Role</Text>
        <TextInput 
          style={styles.input} 
          value={employee.role} 
          editable={false}
        />
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.updateBtn}
          onPress={handleUpdate}
          disabled={updating}
        >
          <Text style={styles.btnText}>{updating ? 'Updating...' : 'Update'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>Cancel</Text>
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
  label: { fontSize: 14, color: '#495057', fontWeight: 'bold', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 12 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  updateBtn: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 8 },
  cancelBtn: { backgroundColor: '#6c757d', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center', marginLeft: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
