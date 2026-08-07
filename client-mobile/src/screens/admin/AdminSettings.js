import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

export default function AdminSettings({ navigation }) {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    autoApproveLeaves: false,
    strictAttendance: true,
    theme: 'Light',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, this would be an API call to save admin preferences
      // await api.post('/admin/settings/update', settings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>System Settings</Text>
      <Text style={styles.subtitle}>Configure application preferences</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Preferences</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDesc}>Receive alerts for leave requests and onboarding</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={() => handleToggle('notificationsEnabled')}
            trackColor={{ false: '#dee2e6', true: '#23d2aa' }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDesc}>Switch between light and dark themes</Text>
          </View>
          <Switch
            value={settings.theme === 'Dark'}
            onValueChange={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'Dark' ? 'Light' : 'Dark' }))}
            trackColor={{ false: '#dee2e6', true: '#23d2aa' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email & Notifications</Text>
        
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => navigation.navigate('EmailTemplatesSettings')}
        >
          <View>
            <Text style={styles.settingLabel}>Email Templates</Text>
            <Text style={styles.settingDesc}>Customize dynamic subject & body templates for system emails</Text>
          </View>
          <Text style={{ fontSize: 18, color: '#6c757d' }}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policy Configurations</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Auto-Approve Leaves</Text>
            <Text style={styles.settingDesc}>Automatically approve leave requests < 2 days</Text>
          </View>
          <Switch
            value={settings.autoApproveLeaves}
            onValueChange={() => handleToggle('autoApproveLeaves')}
            trackColor={{ false: '#dee2e6', true: '#23d2aa' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Strict Attendance</Text>
            <Text style={styles.settingDesc}>Require exact shift hours for full attendance</Text>
          </View>
          <Switch
            value={settings.strictAttendance}
            onValueChange={() => handleToggle('strictAttendance')}
            trackColor={{ false: '#dee2e6', true: '#23d2aa' }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
    maxWidth: 250,
  },
  saveBtn: {
    backgroundColor: '#23d2aa',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
