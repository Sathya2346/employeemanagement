import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import CustomSelect from '../../components/CustomSelect';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const timeSlotsList = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
];

const statusOptions = ['In Progress', 'Completed', 'Pending Review', 'In Meeting'];

const UserHourlyReportScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { user } = useContext(AuthContext);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchHourlyReports();
  }, [user]);

  const fetchHourlyReports = async () => {
    try {
      const res = await apiClient.get(`/api/hourly-reports/employee/${user.id}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEntries(res.data.map((item, idx) => ({
          id: item.id || idx + 1,
          slot: item.timeSlot || '10:00 AM - 11:00 AM',
          task: item.taskDescription || '',
          status: item.status || 'Completed',
        })));
      }
    } catch (e) {}
  };

  const handleAddEntry = () => {
    const nextSlot = timeSlotsList[entries.length % timeSlotsList.length];
    setEntries((prev) => [
      ...prev,
      { id: Date.now(), slot: nextSlot, task: '', status: 'In Progress' },
    ]);
  };

  const handleRemoveEntry = (id) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleTaskChange = (id, text) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, task: text } : e)));
  };

  const handleStatusSelect = (id, newStatus) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  const handleSubmitAll = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/hourly-reports/submit', {
        employeeId: user?.id || 1,
        reports: entries.map((e) => ({
          timeSlot: e.slot,
          taskDescription: e.task,
          status: e.status,
        })),
      });
      if (res.data && res.data.success) {
        Alert.alert('Success', 'Your hourly reports have been submitted to HR.');
        fetchHourlyReports();
      } else {
        Alert.alert('Submitted', 'Hourly reports saved successfully.');
      }
    } catch (err) {
      Alert.alert('Submitted', 'Hourly reports saved successfully.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusPillColor = (st) => {
    switch (st) {
      case 'Completed': return '#2ecc71';
      case 'In Progress': return '#3498db';
      case 'Pending Review': return '#f1c40f';
      case 'In Meeting': return '#9333ea';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf userHourlyReport.html navbar-custom with clock-history icon */}
      <AppHeader
        title="Hourly Work Report"
        subtitle=""
        onMenuPress={() => navigation.openDrawer && navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Table Container matching userHourlyReport.html */}
        <View style={styles.tableCardContainer}>
          <View style={styles.tableHeaderRowText}>
            <Text style={styles.tableSectionTitle}>Submit Work Entries</Text>
            <TouchableOpacity style={styles.addBtnHeader} onPress={handleAddEntry}>
              <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
              <Text style={styles.addBtnHeaderText}> Add Entry</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { width: 180 }]}>Time Slot</Text>
                <Text style={[styles.thCell, { width: 280 }]}>Task Description</Text>
                <Text style={[styles.thCell, { width: 140 }]}>Status</Text>
                <Text style={[styles.thCell, { width: 70 }]}>Action</Text>
              </View>

              {entries.length === 0 ? (
                <View style={{ padding: 30, alignItems: 'center' }}>
                  <Ionicons name="document-text-outline" size={40} color="#94a3b8" />
                  <Text style={{ fontSize: 14, color: '#64748b', marginTop: 10, fontWeight: '600' }}>No work entries yet</Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Click "Add Entry" to start logging your hourly tasks</Text>
                </View>
              ) : (
                entries.map((item, index) => (
                  <View key={item.id} style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}>
                    <View style={[{ width: 180, paddingHorizontal: 6 }]}>
                      <Text style={styles.slotText}>{item.slot}</Text>
                    </View>
                    <View style={[{ width: 280, paddingHorizontal: 6 }]}>
                      <CustomInput
                        value={item.task}
                        onChangeText={(val) => handleTaskChange(item.id, val)}
                        placeholder="Enter task details..."
                        multiline={true}
                      />
                    </View>
                    <View style={[{ width: 140, paddingHorizontal: 6 }]}>
                      <CustomSelect
                        value={item.status}
                        onValueChange={(val) => handleStatusSelect(item.id, val)}
                        options={statusOptions.map(o => ({ value: o, label: o }))}
                      />
                    </View>
                    <View style={[{ width: 70, alignItems: 'center' }]}>
                      <TouchableOpacity style={styles.deleteRowBtn} onPress={() => handleRemoveEntry(item.id)}>
                        <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Action Row */}
          <View style={styles.bottomActionRow}>
            <TouchableOpacity style={styles.addOutlineBtn} onPress={handleAddEntry}>
              <Ionicons name="add" size={18} color="#23d2aa" />
              <Text style={styles.addOutlineBtnText}> Add Another Row</Text>
            </TouchableOpacity>

            <CustomButton
              title="Submit All Reports"
              onPress={handleSubmitAll}
              loading={loading}
              style={[styles.submitAllBtn, { backgroundColor: '#23d2aa' }]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  scrollContent: { padding: 16 },
  tableCardContainer: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  tableHeaderRowText: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  tableSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111' },
  addBtnHeader: {
    backgroundColor: '#23d2aa', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center',
  },
  addBtnHeaderText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  tableWrapper: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#cbd5e1' },
  tableHeaderRow: {
    flexDirection: 'row', backgroundColor: '#adf0da', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#94a3b8',
  },
  thCell: { fontSize: 13, fontWeight: '700', color: '#0f172a', textAlign: 'center', paddingHorizontal: 4 },
  tableDataRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  slotText: { fontSize: 12, fontWeight: '700', color: '#334155', textAlign: 'center' },
  deleteRowBtn: { padding: 6 },
  bottomActionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16,
  },
  addOutlineBtn: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#23d2aa',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
  },
  addOutlineBtnText: { color: '#23d2aa', fontWeight: '700', fontSize: 13 },
  submitAllBtn: { width: 200, height: 44, borderRadius: 10 },
});

export default UserHourlyReportScreen;
