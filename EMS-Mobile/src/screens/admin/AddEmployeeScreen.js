import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import CustomSelect from '../../components/CustomSelect';
import { employeeApi } from '../../api/employeeApi';

const AddEmployeeScreen = ({ navigation }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('ROLE_USER');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'error'|'success'|'info', message: '' }

  const handleSave = async () => {
    setFeedback(null);

    if (!firstname.trim() || !lastname.trim() || !email.trim() || !username.trim()) {
      setFeedback({ type: 'error', message: 'First Name, Last Name, Email, and Username are all required.' });
      return;
    }

    setLoading(true);
    try {
      const res = await employeeApi.save({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        username: username.trim(),
        userType,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message || 'Employee account created successfully!' });
        // Clear form after success
        setFirstname('');
        setLastname('');
        setEmail('');
        setUsername('');
        setUserType('ROLE_USER');
      } else {
        setFeedback({ type: 'error', message: res.data?.message || 'Failed to create employee.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create employee. Please check your connection.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const dismissFeedback = () => setFeedback(null);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Add Employee"
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.pageTitle}>Create Employee Account</Text>
          <Text style={styles.pageSubTitle}>
            Enter the employee's basic info and login credentials. The employee will receive their username and password via email and complete the rest of their profile through the onboarding portal.
          </Text>
        </View>

        {/* Inline Feedback Banner */}
        {feedback && (
          <View style={[
            styles.feedbackBanner,
            feedback.type === 'error' && styles.feedbackError,
            feedback.type === 'success' && styles.feedbackSuccess,
          ]}>
            <Ionicons
              name={feedback.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
              size={20}
              color={feedback.type === 'error' ? '#DC2626' : '#16A34A'}
              style={{ marginRight: 8 }}
            />
            <Text style={[
              styles.feedbackText,
              feedback.type === 'error' && styles.feedbackTextError,
              feedback.type === 'success' && styles.feedbackTextSuccess,
            ]}>
              {feedback.message}
            </Text>
            <TouchableOpacity onPress={dismissFeedback} style={styles.feedbackClose}>
              <Ionicons name="close" size={16} color={feedback.type === 'error' ? '#DC2626' : '#16A34A'} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <CustomInput
            label="First Name *"
            value={firstname}
            onChangeText={setFirstname}
            placeholder="e.g. Ravi"
            icon="person-outline"
          />

          <CustomInput
            label="Last Name *"
            value={lastname}
            onChangeText={setLastname}
            placeholder="e.g. Kumar"
            icon="person-outline"
          />

          <CustomInput
            label="Email Address *"
            value={email}
            onChangeText={setEmail}
            placeholder="employee@company.com"
            icon="mail-outline"
            keyboardType="email-address"
          />
          <Text style={styles.fieldNote}>Login credentials will be sent to this email.</Text>

          <CustomInput
            label="Username *"
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. ravi.kumar"
            icon="at-outline"
          />
          <Text style={styles.fieldNote}>Default password will be emailed to the employee.</Text>

          <CustomSelect
            label="Role *"
            value={userType}
            onValueChange={setUserType}
            options={[
              { value: 'ROLE_USER', label: 'Employee (User)' },
              { value: 'ROLE_ADMIN', label: 'Administrator' },
            ]}
            placeholder="Select Role"
          />

          <CustomButton
            title="Create Account & Send Email"
            onPress={handleSave}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.infoAlert}>
          <Ionicons name="information-circle-outline" size={22} color="#0284C7" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoAlertTitle}>What happens next?</Text>
            <Text style={styles.infoAlertText}>
              The employee will receive an email with their login credentials. When they log in, they will be directed to the onboarding portal to fill in their personal details.
            </Text>
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
  headerTitleContainer: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  pageSubTitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
    lineHeight: 18,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  feedbackTextError: {
    color: '#DC2626',
  },
  feedbackTextSuccess: {
    color: '#16A34A',
  },
  feedbackClose: {
    padding: 4,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  fieldNote: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: -4,
    marginBottom: 10,
    marginLeft: 4,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    alignItems: 'center',
  },
  roleOptionActive: {
    borderColor: '#23d2aa',
    backgroundColor: '#e6faf5',
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  roleOptionTextActive: {
    color: '#23d2aa',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 14,
    backgroundColor: '#16A34A',
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  infoAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
  },
  infoAlertText: {
    fontSize: 12,
    color: '#0369A1',
    marginTop: 2,
    lineHeight: 17,
  },
});

export default AddEmployeeScreen;
