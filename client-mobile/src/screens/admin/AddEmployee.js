import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AddEmployee({ navigation }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('ROLE_USER');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstname || !lastname || !email || !username) {
      setErrorMsg('Please fill in all required fields marked with *.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstname,
        lastname,
        email,
        username,
        userType
      };

      const response = await api.post('/admin/save', payload);
      setSuccessMsg('Employee account created successfully! Credentials email sent.');
      Alert.alert("Success", "Employee account created successfully!", [
        { text: "OK", onPress: () => navigation.navigate('EmployeeListDrawer') }
      ]);
    } catch (err) {
      console.error('Failed to save employee:', err);
      setErrorMsg(err.response?.data?.message || 'Email or Username already exists!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Info Block (Matches addEmployee.html lines 50-54) */}
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <Ionicons name="person-add" size={24} color="#23d2aa" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Create Employee Account</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Enter the employee's basic info and login credentials. The employee will receive their username and password via email and complete their profile through the onboarding portal.
        </Text>
      </View>

      {/* Error & Success Alerts */}
      {errorMsg ? (
        <View style={styles.errorAlert}>
          <Ionicons name="alert-circle" size={18} color="#842029" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successAlert}>
          <Ionicons name="checkmark-circle" size={18} color="#0f5132" style={{ marginRight: 8 }} />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* Form Card (Matches addEmployee.html lines 63-123) */}
      <View style={styles.formCard}>
        {/* First Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ravi"
            placeholderTextColor="#94a3b8"
            value={firstname}
            onChangeText={setFirstname}
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kumar"
            placeholderTextColor="#94a3b8"
            value={lastname}
            onChangeText={setLastname}
          />
        </View>

        {/* Email Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="employee@company.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.helpText}>Login credentials will be sent to this email.</Text>
        </View>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ravi.kumar"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <Text style={styles.helpText}>The employee's personal email will be set as default password.</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Role <Text style={styles.requiredStar}>*</Text></Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity 
              style={[styles.roleOption, userType === 'ROLE_USER' && styles.roleOptionActive]}
              onPress={() => setUserType('ROLE_USER')}
            >
              <Ionicons 
                name={userType === 'ROLE_USER' ? "radio-button-on" : "radio-button-off"} 
                size={18} 
                color={userType === 'ROLE_USER' ? "#23d2aa" : "#64748b"} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.roleText, userType === 'ROLE_USER' && styles.roleTextActive]}>
                Employee (User)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleOption, userType === 'ROLE_ADMIN' && styles.roleOptionActive]}
              onPress={() => setUserType('ROLE_ADMIN')}
            >
              <Ionicons 
                name={userType === 'ROLE_ADMIN' ? "radio-button-on" : "radio-button-off"} 
                size={18} 
                color={userType === 'ROLE_ADMIN' ? "#23d2aa" : "#64748b"} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.roleText, userType === 'ROLE_ADMIN' && styles.roleTextActive]}>
                Administrator
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Create Account & Send Email</Text>
              </>
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

      {/* Info Card (Matches addEmployee.html line 125) */}
      <View style={styles.infoAlertCard}>
        <Ionicons name="information-circle" size={22} color="#0284c7" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoAlertTitle}>What happens next?</Text>
          <Text style={styles.infoAlertText}>
            The employee will receive an email with their login credentials. When they log in, they will be directed to the onboarding portal to fill in personal details, bank info, and photo.
          </Text>
        </View>
      </View>
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
  headerBlock: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
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
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1e7dd',
    borderWidth: 1,
    borderColor: '#badbcc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#0f5132',
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
    marginBottom: 16,
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
  requiredStar: {
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
  helpText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  roleSelectorRow: {
    flexDirection: 'column',
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  roleOptionActive: {
    borderColor: '#23d2aa',
    backgroundColor: 'rgba(35, 210, 170, 0.08)',
  },
  roleText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#23d2aa',
    fontWeight: 'bold',
  },
  btnRow: {
    marginTop: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#198754', // Matches btn-success in addEmployee.html
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  disabledBtn: {
    backgroundColor: '#86efac',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoAlertCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 10,
    padding: 14,
  },
  infoAlertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 2,
  },
  infoAlertText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
});
