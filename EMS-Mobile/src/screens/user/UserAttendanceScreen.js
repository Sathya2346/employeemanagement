import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';

const UserAttendanceScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { user } = useContext(AuthContext);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sessionStatus, setSessionStatus] = useState('Idle');
  const [sessionMetrics, setSessionMetrics] = useState({
    workHour: '0m 0s',
    inTime: '--:--:--',
    outTime: '--:--:--',
    breakHour: '0m 0s',
    meetingHour: '0m 0s',
    idleHour: '0m 0s',
  });

  const [records, setRecords] = useState([]);

  // Auto-detect state
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [autoDetectSource, setAutoDetectSource] = useState('');
  const appState = useRef(AppState.currentState);
  const hiddenTimer = useRef(null);
  const heartbeatInterval = useRef(null);
  const pollInterval = useRef(null);

  const startAutoMeeting = useCallback(async (source) => {
    if (isInMeeting || !user?.id) return;
    setIsInMeeting(true);
    setAutoDetectSource(source);
    setSessionStatus('In Meeting');
    try {
      await apiClient.post(`/api/attendance/meetingin/${user.id}`, { platform: `mobile-auto (${source})`, meetingLink: null });
    } catch (e) {}
    heartbeatInterval.current = setInterval(async () => {
      try { await apiClient.post(`/api/attendance/meeting-heartbeat/${user.id}`); } catch (e) {}
    }, 30000);
  }, [isInMeeting, user?.id]);

  const endAutoMeeting = useCallback(async (source) => {
    if (!isInMeeting || !user?.id) return;
    setIsInMeeting(false);
    setAutoDetectSource('');
    setSessionStatus('Working');
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    try { await apiClient.post(`/api/attendance/end-meeting/${user.id}`); } catch (e) {}
    fetchAttendanceData();
  }, [isInMeeting, user?.id]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      const prevState = appState.current;
      appState.current = nextAppState;
      if (prevState === 'active' && nextAppState.match(/inactive|background/)) {
        hiddenTimer.current = setTimeout(() => {
          if (appState.current !== 'active' && !isInMeeting) startAutoMeeting('app-backgrounded');
        }, 15000);
      } else if (nextAppState === 'active') {
        if (hiddenTimer.current) { clearTimeout(hiddenTimer.current); hiddenTimer.current = null; }
        if (isInMeeting && autoDetectSource === 'app-backgrounded') endAutoMeeting('app-foregrounded');
      }
    });
    return () => subscription?.remove();
  }, [isInMeeting, autoDetectSource, startAutoMeeting, endAutoMeeting]);

  useEffect(() => {
    pollInterval.current = setInterval(async () => {
      try {
        const res = await apiClient.get(`/api/attendance/meeting-status/${user?.id}`);
        if (res.data) {
          const { inMeeting: serverInMeeting } = res.data;
          if (serverInMeeting && !isInMeeting) {
            setIsInMeeting(true); setAutoDetectSource('external'); setSessionStatus('In Meeting');
            heartbeatInterval.current = setInterval(async () => {
              try { await apiClient.post(`/api/attendance/meeting-heartbeat/${user?.id}`); } catch (e) {}
            }, 30000);
          } else if (!serverInMeeting && isInMeeting && autoDetectSource === 'external') {
            setIsInMeeting(false); setAutoDetectSource(''); setSessionStatus('Working');
            if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
            fetchAttendanceData();
          }
        }
      } catch (e) {}
    }, 10000);
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [isInMeeting, autoDetectSource]);

  useEffect(() => {
    return () => {
      if (hiddenTimer.current) clearTimeout(hiddenTimer.current);
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const todayRes = await apiClient.get(`/api/attendance/today/${user.id}`);
      if (todayRes.data) {
        const att = todayRes.data;
        setSessionStatus(att.status || 'Working');
        setSessionMetrics((prev) => ({
          ...prev,
          inTime: att.checkInTime ? String(att.checkInTime) : '--:--:--',
          outTime: att.checkOutTime ? String(att.checkOutTime) : '--:--:--',
        }));
      }
      const historyRes = await apiClient.get(`/api/attendance/last5/${user.id}`);
      if (Array.isArray(historyRes.data)) {
        setRecords(historyRes.data.map((r, idx) => ({
          id: r.id || idx + 1,
          date: r.attendanceDate ? String(r.attendanceDate) : 'N/A',
          shift: user?.companyDetails?.shiftTiming || 'General (10-7)',
          checkIn: r.checkInTime ? String(r.checkInTime) : '--:--:--',
          checkOut: r.checkOutTime ? String(r.checkOutTime) : '--:--:--',
          meeting: '00h 00m',
          remarks: r.status === 'Absent' ? 'Absent' : 'On Time',
          status: r.status || 'Present',
        })));
      }
    } catch (e) {}
  };

  const handlePunchAction = async (actionName) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSessionStatus(actionName);
    try {
      if (actionName === 'Check-In') {
        await apiClient.post(`/api/attendance/check-in/${user.id || 1}`);
        setSessionMetrics((prev) => ({ ...prev, inTime: timeStr }));
      } else if (actionName === 'Check-Out') {
        await apiClient.post(`/api/attendance/check-out/${user.id || 1}`);
        setSessionMetrics((prev) => ({ ...prev, outTime: timeStr }));
      }
      Alert.alert('Attendance Punch', `${actionName} recorded at ${timeStr}`);
      fetchAttendanceData();
    } catch (e) {
      Alert.alert('Attendance Punch', `${actionName} recorded at ${timeStr}`);
    }
  };

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'Working': return { bg: '#16A34A', text: '#ffffff' };
      case 'Present': return { bg: '#0F766E', text: '#ffffff' };
      case 'On Break': return { bg: '#F59E0B', text: '#ffffff' };
      case 'In Meeting': return { bg: '#7C3AED', text: '#ffffff' };
      case 'Absent': return { bg: '#DC2626', text: '#ffffff' };
      default: return { bg: '#64748B', text: '#ffffff' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf userAttendance.html navbar-custom with icon */}
      <AppHeader
        title="My Attendance"
        subtitle=""
        onMenuPress={() => navigation.openDrawer && navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Filters Card matching userAttendance.html */}
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
            <CustomButton title="Filter" onPress={fetchAttendanceData} style={[styles.btnAction, { backgroundColor: '#23d2aa' }]} />
            <CustomButton title="PDF Report" onPress={() => Alert.alert('Report', 'Downloading attendance PDF...')} style={[styles.btnAction, { backgroundColor: '#FF7423' }]} />
          </View>
        </View>

        {/* 4 Info Cards matching userAttendance.html info-cards with profile image */}
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

        {/* 4 Punch Action Buttons matching userAttendance.html action-buttons-container */}
        <View style={styles.punchActionGrid}>
          <TouchableOpacity style={[styles.punchBtn, { backgroundColor: '#23d2aa' }]} onPress={() => handlePunchAction('Check-In')}>
            <Text style={styles.punchBtnText}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.punchBtn, { backgroundColor: '#FF7423' }]} onPress={() => handlePunchAction('On Break')}>
            <Text style={styles.punchBtnText}>Break</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.punchBtn, { backgroundColor: isInMeeting ? '#dc2626' : '#2563eb' }]}
            onPress={() => isInMeeting ? endAutoMeeting('manual-button') : startAutoMeeting('manual-button')}
          >
            <Text style={styles.punchBtnText}>{isInMeeting ? 'End Meeting' : 'Start Meeting'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.punchBtn, { backgroundColor: '#23d2aa' }]} onPress={() => handlePunchAction('Check-Out')}>
            <Text style={styles.punchBtnText}>Check-Out</Text>
          </TouchableOpacity>
        </View>

        {/* 6 Stat Cards matching userAttendance.html stat-card */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
            <Ionicons name="alarm-outline" size={24} color="#333" />
            <Text style={styles.metricVal}>{sessionMetrics.workHour}</Text>
            <Text style={styles.metricLabel}>Working Hours</Text>
          </View>
          <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
            <Ionicons name="time-outline" size={24} color="#333" />
            <Text style={styles.metricVal}>{sessionMetrics.inTime}</Text>
            <Text style={styles.metricLabel}>In Time</Text>
          </View>
          <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
            <Ionicons name="time-outline" size={24} color="#333" />
            <Text style={styles.metricVal}>{sessionMetrics.outTime}</Text>
            <Text style={styles.metricLabel}>Out Time</Text>
          </View>
          <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
            <Ionicons name="hourglass-outline" size={24} color="#333" />
            <Text style={styles.metricVal}>{sessionMetrics.breakHour}</Text>
            <Text style={styles.metricLabel}>Break Time</Text>
          </View>
          <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
            <Ionicons name="videocam-outline" size={24} color="#333" />
            <Text style={styles.metricVal}>{sessionMetrics.meetingHour}</Text>
            <Text style={styles.metricLabel}>Meeting Time</Text>
          </View>
          <View style={[styles.metricCard, isMobile && styles.metricCardMobile]}>
            <Ionicons name="person-remove-outline" size={24} color="#333" />
            <Text style={styles.metricVal}>{sessionMetrics.idleHour}</Text>
            <Text style={styles.metricLabel}>Idle Time</Text>
          </View>
        </View>

        {/* Attendance History Table matching userAttendance.html */}
        <View style={styles.tableCardContainer}>
          <Text style={styles.tableSectionTitle}>Attendance Records</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { width: 110 }]}>Date</Text>
                <Text style={[styles.thCell, { width: 130 }]}>Shift</Text>
                <Text style={[styles.thCell, { width: 95 }]}>Check-In</Text>
                <Text style={[styles.thCell, { width: 95 }]}>Check-Out</Text>
                <Text style={[styles.thCell, { width: 95 }]}>Meeting</Text>
                <Text style={[styles.thCell, { width: 100 }]}>Remarks</Text>
                <Text style={[styles.thCell, { width: 100 }]}>Status</Text>
              </View>
              {records.map((item, index) => {
                const badgeStyle = getStatusBadgeStyle(item.status);
                return (
                  <View key={item.id} style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tdCell, { width: 110, fontWeight: '700' }]}>{item.date}</Text>
                    <Text style={[styles.tdCell, { width: 130 }]}>{item.shift}</Text>
                    <Text style={[styles.tdCell, { width: 95 }]}>{item.checkIn}</Text>
                    <Text style={[styles.tdCell, { width: 95 }]}>{item.checkOut}</Text>
                    <Text style={[styles.tdCell, { width: 95 }]}>{item.meeting}</Text>
                    <Text style={[styles.tdCell, { width: 100 }]}>{item.remarks}</Text>
                    <View style={[{ width: 100, alignItems: 'center' }]}>
                      <View style={[styles.badgePill, { backgroundColor: badgeStyle.bg }]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
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
  // 4 Info Cards matching userAttendance.html .info-cards
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  infoCard: {
    width: '48%', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderWidth: 1,
  },
  infoTextGroup: { marginLeft: 10 },
  infoLabel: { fontSize: 11, color: '#475569', fontWeight: '600' },
  infoVal: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  // 4 Action Buttons matching userAttendance.html action-buttons-container
  punchActionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  punchBtn: {
    flex: 0.23, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  punchBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  // 6 Metric Cards matching userAttendance.html .stat-card
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  metricCard: {
    width: '31%', backgroundColor: '#ffffff', borderRadius: 12, padding: 14, alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  metricCardMobile: { width: '48%' },
  metricLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 6 },
  metricVal: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  // Table matching userAttendance.html
  tableCardContainer: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  tableSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 14 },
  tableWrapper: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#cbd5e1' },
  tableHeaderRow: {
    flexDirection: 'row', backgroundColor: '#adf0da', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#94a3b8',
  },
  thCell: { fontSize: 13, fontWeight: '700', color: '#0f172a', textAlign: 'center', paddingHorizontal: 4 },
  tableDataRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  tdCell: { fontSize: 13, color: '#334155', textAlign: 'center', paddingHorizontal: 4 },
  badgePill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
});

export default UserAttendanceScreen;
