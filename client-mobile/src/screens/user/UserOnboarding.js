import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserOnboarding({ navigation }) {
  const { user, checkAuthStatus } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.phone || !formData.address || !formData.bankName || !formData.accountNumber || !formData.ifscCode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('bankName', formData.bankName);
      data.append('accountNumber', formData.accountNumber);
      data.append('ifscCode', formData.ifscCode);

      await api.post('/onboarding/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Alert.alert('Success', 'Onboarding details submitted successfully. Please wait for Admin approval.');
      // Update local context to reflect the new status (PENDING_APPROVAL)
      if (checkAuthStatus) {
        await checkAuthStatus();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit onboarding details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Complete Your Onboarding</Text>
      <Text style={styles.subtitle}>Welcome {user?.firstname}! Please provide your details to complete registration.</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={formData.phone} 
          onChangeText={t => setFormData({...formData, phone: t})}
        />
        <Text style={styles.label}>Address *</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter your full address"
          multiline
          numberOfLines={3}
          value={formData.address} 
          onChangeText={t => setFormData({...formData, address: t})}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <Text style={styles.label}>Bank Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter bank name"
          value={formData.bankName} 
          onChangeText={t => setFormData({...formData, bankName: t})}
        />
        <Text style={styles.label}>Account Number *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter account number"
          keyboardType="number-pad"
          value={formData.accountNumber} 
          onChangeText={t => setFormData({...formData, accountNumber: t})}
        />
        <Text style={styles.label}>IFSC Code *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter IFSC code"
          autoCapitalize="characters"
          value={formData.ifscCode} 
          onChangeText={t => setFormData({...formData, ifscCode: t})}
        />
      </View>

      <TouchableOpacity 
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.btnText}>{submitting ? 'Submitting...' : 'Submit Details'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6c757d', marginBottom: 20 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#23d2aa', marginBottom: 12 },
  label: { fontSize: 14, color: '#495057', fontWeight: 'bold', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 12, backgroundColor: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#23d2aa', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 40, marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
