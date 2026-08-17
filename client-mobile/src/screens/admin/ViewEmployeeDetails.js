import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ViewEmployeeDetails({ route, navigation }) {
  const { id } = route.params || {};
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Banner Card */}
      <View style={styles.profileBanner}>
        <View style={styles.avatarWrapper}>
          {employee.base64Image ? (
            <Image 
              source={{ uri: `data:image/png;base64,${employee.base64Image}` }} 
              style={styles.avatarImage} 
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#23d2aa" />
            </View>
          )}
        </View>

        <Text style={styles.nameText}>{employee.firstname} {employee.lastname}</Text>
        <Text style={styles.designationText}>{employee.companyDetails?.designation || 'N/A'}</Text>
        <Text style={styles.idText}>Employee ID: {employee.id}</Text>

        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => navigation.navigate('UpdateEmployee', { id: employee.id })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.editBtnText}>Edit Employee Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Details Section (Matches viewEmployeeDetails.html line 70) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={20} color="#23d2aa" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Basic Details</Text>
        </View>
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>First Name:</Text>
            <Text style={styles.value}>{employee.firstname || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Last Name:</Text>
            <Text style={styles.value}>{employee.lastname || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{employee.gender || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{employee.dateOfBirth || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{employee.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{employee.phone || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{employee.address || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>City:</Text>
            <Text style={styles.value}>{employee.city || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Blood Group:</Text>
            <Text style={styles.value}>{employee.blood || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Emergency Number:</Text>
            <Text style={styles.value}>{employee.emergencyNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Languages Known:</Text>
            <Text style={styles.value}>{employee.language || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Marital Status:</Text>
            <Text style={styles.value}>{employee.maritalStatus || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Company Details Section (Matches line 124) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="briefcase-outline" size={20} color="#23d2aa" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Company Details</Text>
        </View>
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Company Email:</Text>
            <Text style={styles.value}>{employee.companyDetails?.employeeEmail || employee.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Designation:</Text>
            <Text style={styles.value}>{employee.companyDetails?.designation || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Shift Timing:</Text>
            <Text style={styles.value}>{employee.companyDetails?.shiftTiming || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Joining Date:</Text>
            <Text style={styles.value}>{employee.companyDetails?.joiningDate || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{employee.companyDetails?.department || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Employment Status:</Text>
            <Text style={styles.value}>{employee.companyDetails?.status || employee.overallStatus || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Bank Details Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card-outline" size={20} color="#23d2aa" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Bank Details</Text>
        </View>
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.value}>{employee.bankDetails?.bankName || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.value}>{employee.bankDetails?.accountNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.value}>{employee.bankDetails?.ifscCode || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Branch:</Text>
            <Text style={styles.value}>{employee.bankDetails?.branch || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backBtnText}>Back to Employee List</Text>
      </TouchableOpacity>
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
  profileBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#23d2aa',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e6f7f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#23d2aa',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  designationText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  idText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 14,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7423', // Matches orangeBtn / view-btn
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  detailsGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212529',
    flex: 1.2,
    textAlign: 'right',
  },
  backBtn: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
