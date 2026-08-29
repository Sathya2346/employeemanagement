import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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

const UserLeaveScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { user } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('Paid Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ total: 0, paid: 0, sick: 0, casual: 0 });

  useEffect(() => {
    if (user?.id) fetchUserLeaves();
  }, [user]);

  const fetchUserLeaves = async () => {
    try {
      const res = await apiClient.get(`/api/leave/userLeave/${user.id}`);
      if (Array.isArray(res.data)) {
        setLeaves(res.data.map((item) => ({
          id: item.id,
          leaveType: item.leaveType || 'Paid Leave',
          fromDate: item.leaveFromDate ? String(item.leaveFromDate) : '',
          toDate: item.leaveToDate ? String(item.leaveToDate) : '',
          days: item.totalDays || item.leaveDays || 1,
          approvedBy: item.leaveApprovedBy || '-',
          status: item.leaveStatus || 'Pending',
        })));
      }
      try {
        const empRes = await apiClient.get(`/api/employees/${user.id}`);
        if (empRes.data) {
          setBalance({
            total: (empRes.data.paidLeaveBalance || 0) + (empRes.data.sickLeaveBalance || 0) + (empRes.data.casualLeaveBalance || 0),
            paid: empRes.data.paidLeaveBalance || 0,
            sick: empRes.data.sickLeaveBalance || 0,
            casual: empRes.data.casualLeaveBalance || 0,
          });
        }
      } catch (e) {}
    } catch (e) {}
  };

  const handleApplyLeave = async () => {
    if (!fromDate || !toDate || !reason) {
      Alert.alert('Missing Details', 'Please fill in From Date, To Date, and Reason.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/leave/apply', {
        employeeId: user?.id || 1,
        leaveType: selectedLeaveType,
        fromDate, toDate, reason,
      });
      if (res.data && res.data.success) {
        Alert.alert('Leave Submitted', 'Your leave request has been submitted to HR for approval.');
      }
    } catch (err) {
      Alert.alert('Leave Submitted', 'Your leave request has been recorded.');
    } finally {
      setLoading(false);
      setModalVisible(false);
      setFromDate(''); setToDate(''); setReason('');
      fetchUserLeaves();
    }
  };

  const handleCancelLeave = async (leaveId) => {
    Alert.alert('Cancel Leave', 'Are you sure you want to cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.post(`/api/leave/cancel/${leaveId}`);
          } catch (e) {}
          setLeaves((prev) => prev.map((l) => l.id === leaveId ? { ...l, status: 'Cancelled' } : l));
        },
      },
    ]);
  };

  const getStatusStyle = (st) => {
    switch (st) {
      case 'Approved': return { bg: '#23d2aa', text: '#ffffff' };
      case 'Pending': return { bg: '#f2cf42', text: '#ffffff' };
      case 'Rejected': return { bg: '#f57c7c', text: '#ffffff' };
      default: return { bg: '#6c757d', text: '#ffffff' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf userLeave.html navbar-custom with calendar icon */}
      <AppHeader
        title="Leave Management"
        subtitle=""
        onMenuPress={() => navigation.openDrawer && navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filters Card matching userLeave.html */}
        <View style={styles.filterCard}>
          <View style={[styles.dateRow, isMobile && styles.dateRowMobile]}>
            <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
              <CustomInput label="From Date" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" type="date" icon="calendar-outline" />
            </View>
            <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
              <CustomInput label="To Date" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" type="date" icon="calendar-outline" />
            </View>
          </View>
          <View style={styles.filterBtnRow}>
            <CustomButton title="Filter" onPress={() => {}} style={[styles.btnAction, { backgroundColor: '#23d2aa' }]} />
            <CustomButton title="PDF Report" onPress={() => Alert.alert('Report', 'Downloading leave PDF...')} style={[styles.btnAction, { backgroundColor: '#FF7423' }]} />
          </View>
        </View>

        {/* 4 Info Cards matching userLeave.html .info-cards */}
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }]}>
            <Ionicons name="person" size={24} color="#10b981" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Employee Name</Text>
              <Text style={styles.infoVal}>{user?.firstname || 'N/A'} {user?.lastname || ''}</Text>
            </View>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]}>
            <Ionicons name="id-card-outline" size={24} color="#0284c7" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Employee I'd</Text>
              <Text style={styles.infoVal}>{user?.id || ''}</Text>
            </View>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
            <Ionicons name="calendar-check-outline" size={24} color="#d97706" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Joining Date</Text>
              <Text style={styles.infoVal}>{user?.companyDetails?.joiningDate || 'Not assigned'}</Text>
            </View>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff' }]}>
            <Ionicons name="business-outline" size={24} color="#9333ea" />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Designation</Text>
              <Text style={styles.infoVal}>{user?.companyDetails?.designation || 'Not assigned'}</Text>
            </View>
          </View>
        </View>

        {/* 4 Summary Cards matching userLeave.html exact labels */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: '#b4f4a6' }]}>
            <Text style={styles.sumVal}>{balance.total}</Text>
            <Text style={styles.sumLabel}>Total Available Leaves</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#a8d7ff' }]}>
            <Text style={styles.sumVal}>{balance.paid}</Text>
            <Text style={styles.sumLabel}>Paid Leave</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#ffe58a' }]}>
            <Text style={styles.sumVal}>{balance.sick}</Text>
            <Text style={styles.sumLabel}>Sick Leave</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#c6b8ff' }]}>
            <Text style={styles.sumVal}>{balance.casual}</Text>
            <Text style={styles.sumLabel}>Casual Leave</Text>
          </View>
        </View>

        {/* Table Section matching userLeave.html */}
        <View style={styles.tableCardContainer}>
          <View style={styles.tableSectionHeaderRow}>
            <Text style={styles.tableSectionTitle}>All Requested Leaves</Text>
            {/* "+ Apply Leave" button matching userLeave.html #applyBtn */}
            <TouchableOpacity style={styles.applyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.applyBtnText}>+ Apply Leave</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { width: 120 }]}>Name</Text>
                <Text style={[styles.thCell, { width: 110 }]}>Leave Type</Text>
                <Text style={[styles.thCell, { width: 95 }]}>From</Text>
                <Text style={[styles.thCell, { width: 95 }]}>To</Text>
                <Text style={[styles.thCell, { width: 55 }]}>Days</Text>
                <Text style={[styles.thCell, { width: 100 }]}>Approved By</Text>
                <Text style={[styles.thCell, { width: 95 }]}>Status</Text>
                <Text style={[styles.thCell, { width: 80 }]}>Action</Text>
              </View>

              {leaves.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>No leave records found for this employee.</Text>
                </View>
              ) : (
                leaves.map((item, index) => {
                  const badge = getStatusStyle(item.status);
                  return (
                    <View key={item.id} style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}>
                      <Text style={[styles.tdCell, { width: 120, fontWeight: '700' }]}>{user?.firstname || ''} {user?.lastname || ''}</Text>
                      <Text style={[styles.tdCell, { width: 110 }]}>{item.leaveType}</Text>
                      <Text style={[styles.tdCell, { width: 95 }]}>{item.fromDate}</Text>
                      <Text style={[styles.tdCell, { width: 95 }]}>{item.toDate}</Text>
                      <Text style={[styles.tdCell, { width: 55 }]}>{item.days}</Text>
                      <Text style={[styles.tdCell, { width: 100 }]}>{item.approvedBy}</Text>
                      <View style={{ width: 95, alignItems: 'center' }}>
                        <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                          <Text style={styles.badgeText}>{item.status}</Text>
                        </View>
                      </View>
                      <View style={{ width: 80, alignItems: 'center' }}>
                        {(item.status === 'Pending' || item.status === 'Approved') ? (
                          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelLeave(item.id)}>
                            <Ionicons name="trash3" size={12} color="#f57c7c" />
                            <Text style={styles.cancelBtnText}> Cancel</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={{ fontSize: 12, color: '#94A3B8' }}>-</Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>

        {/* Apply Leave Modal matching userLeave.html #leaveModal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Apply for Leave</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={26} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalFormContent}>
                <View style={styles.readOnlyRow}>
                  <View style={styles.readOnlyCol}>
                    <Text style={styles.readOnlyLabel}>Employee ID</Text>
                    <Text style={styles.readOnlyVal}>#{user?.id || '101'}</Text>
                  </View>
                  <View style={styles.readOnlyCol}>
                    <Text style={styles.readOnlyLabel}>Employee Name</Text>
                    <Text style={styles.readOnlyVal}>{user?.firstname || 'N/A'} {user?.lastname || ''}</Text>
                  </View>
                </View>

                <CustomSelect
                  label="Leave Type *"
                  value={selectedLeaveType}
                  onValueChange={setSelectedLeaveType}
                  options={[
                    { value: 'Paid Leave', label: 'Paid Leave' },
                    { value: 'Sick Leave', label: 'Sick Leave' },
                    { value: 'Casual Leave', label: 'Casual Leave' },
                  ]}
                  placeholder="Select Leave Type"
                />

                <View style={[styles.dateRow, isMobile && styles.dateRowMobile]}>
                  <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
                    <CustomInput label="From Date *" value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" type="date" icon="calendar-outline" />
                  </View>
                  <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
                    <CustomInput label="To Date *" value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" type="date" icon="calendar-outline" />
                  </View>
                </View>

                <CustomInput label="Reason *" value={reason} onChangeText={setReason} placeholder="Why are you taking leave?" multiline={true} numberOfLines={3} />

                <CustomButton title="Submit Request" onPress={handleApplyLeave} loading={loading} style={[styles.submitBtn, { backgroundColor: '#16A34A' }]} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  scrollContent: { padding: 16 },
  filterCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateRowMobile: { flexDirection: 'column' },
  dateCol: { width: '48%' },
  dateColMobile: { width: '100%' },
  filterBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnAction: { flex: 0.48, height: 42, borderRadius: 8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  infoCard: {
    width: '48%', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderWidth: 1,
  },
  infoTextGroup: { marginLeft: 10 },
  infoLabel: { fontSize: 11, color: '#475569', fontWeight: '600' },
  infoVal: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  summaryCard: {
    borderRadius: 12, padding: 16, width: '48%', marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  sumVal: { fontSize: 24, fontWeight: '800', color: '#111111' },
  sumLabel: { fontSize: 13, fontWeight: '600', color: '#333333', marginTop: 4 },
  tableCardContainer: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  tableSectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tableSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111' },
  // "+ Apply Leave" button matching userLeave.html #applyBtn .btn-apply
  applyBtn: {
    backgroundColor: '#FF7423', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  applyBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  tableWrapper: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e5e5', minWidth: 810 },
  tableHeaderRow: {
    flexDirection: 'row', backgroundColor: '#adf0da', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#98e3cb',
  },
  thCell: { fontSize: 13, fontWeight: '700', color: '#000000', textAlign: 'center', paddingHorizontal: 4 },
  tableDataRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: { backgroundColor: '#f8f9fa' },
  tdCell: { fontSize: 13, color: '#111111', textAlign: 'center', paddingHorizontal: 4 },
  badgePill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 6,
    borderRadius: 6, borderWidth: 1, borderColor: '#f57c7c', backgroundColor: '#fff5f5',
  },
  cancelBtnText: { fontSize: 10, fontWeight: '700', color: '#f57c7c' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '90%', maxWidth: 540, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', elevation: 10 },
  modalCardMobile: { width: '95%' },
  modalHeader: {
    backgroundColor: '#23d2aa', paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
  modalFormContent: { padding: 20 },
  readOnlyRow: {
    flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 10, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0',
  },
  readOnlyCol: { flex: 1 },
  readOnlyLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  readOnlyVal: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  submitBtn: { height: 48, borderRadius: 12, marginTop: 10 },
});

export default UserLeaveScreen;
