import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';

export default function EmailTemplatesSettings() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/email-templates');
      const list = res.data || [];
      setTemplates(list);
      if (list.length > 0) {
        selectTemplate(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch email templates', err);
      Alert.alert('Error', 'Failed to fetch email templates from server.');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (item) => {
    setSelectedTemplate(item);
    setSubject(item.subject || '');
    setBody(item.body || '');
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await api.put(`/admin/email-templates/${selectedTemplate.id}`, {
        ...selectedTemplate,
        subject: subject,
        body: body,
      });
      Alert.alert('Success', 'Email template saved successfully!');
      // Update local state
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? { ...t, subject, body } : t));
    } catch (err) {
      console.error('Failed to update email template', err);
      Alert.alert('Error', 'Failed to update email template.');
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Email Template Settings</Text>
      <Text style={styles.subtitle}>Customize automated system email subjects and content body.</Text>

      {/* Template Selector Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {templates.map(item => (
          <TouchableOpacity
            key={item.id.toString()}
            style={[styles.tab, selectedTemplate?.id === item.id && styles.activeTab]}
            onPress={() => selectTemplate(item)}
          >
            <Text style={[styles.tabText, selectedTemplate?.id === item.id && styles.activeTabText]}>
              {item.templateName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedTemplate && (
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{selectedTemplate.templateName}</Text>
          <Text style={styles.descriptionText}>{selectedTemplate.description}</Text>

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Email Subject"
          />

          <Text style={styles.label}>Email Body</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={body}
            onChangeText={setBody}
            placeholder="Email Body Content"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.saveBtn, saving && styles.disabledBtn]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Template'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#212529', paddingHorizontal: 16, paddingTop: 16 },
  subtitle: { fontSize: 14, color: '#6c757d', paddingHorizontal: 16, paddingBottom: 16 },
  tabsContainer: { paddingHorizontal: 12, marginBottom: 16, flexDirection: 'row' },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
  },
  activeTab: { backgroundColor: '#23d2aa' },
  tabText: { color: '#495057', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
  descriptionText: { fontSize: 13, color: '#6c757d', marginBottom: 16, fontStyle: 'italic' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#343a40', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212529',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 180,
  },
  saveBtn: {
    backgroundColor: '#23d2aa',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
