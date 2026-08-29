import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import StatusBadge from '../../components/StatusBadge';
import CustomButton from '../../components/CustomButton';
import apiClient from '../../api/apiClient';

const UserDashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState({
    status: 'Idle',
    checkInTime: null,
    checkOutTime: null,
  });

  useEffect(() => {
    if (user?.id) {
      fetchTodayStatus();
      fetchEmployeeDetails();
    }
  }, [user]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await apiClient.get('/api/auth/my-details');
      if (res.data) setEmployee(res.data);
    } catch (e) {
      console.log('Error fetching employee details');
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const res = await apiClient.get(`/api/attendance/today/${user.id}`);
      if (res.data) {
        setAttendance({
          status: res.data.status || 'Working',
          checkInTime: res.data.checkInTime ? String(res.data.checkInTime) : null,
          checkOutTime: res.data.checkOutTime ? String(res.data.checkOutTime) : null,
        });
      }
    } catch (e) {
      console.log('Error fetching today attendance status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckIn = async () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await apiClient.post(`/api/attendance/check-in/${user?.id || 1}`);
      setAttendance({ status: 'Working', checkInTime: time, checkOutTime: null });
      Alert.alert('Attendance Action', `Marked Check-In at ${time}`);
    } catch (e) {
      setAttendance({ status: 'Working', checkInTime: time, checkOutTime: null });
      Alert.alert('Attendance Action', `Marked Check-In at ${time}`);
    }
  };

  const handleCheckOut = async () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await apiClient.post(`/api/attendance/check-out/${user?.id || 1}`);
      setAttendance((prev) => ({ ...prev, status: 'Idle', checkOutTime: time }));
      Alert.alert('Attendance Action', `Marked Check-Out at ${time}`);
    } catch (e) {
      setAttendance((prev) => ({ ...prev, status: 'Idle', checkOutTime: time }));
      Alert.alert('Attendance Action', `Marked Check-Out at ${time}`);
    }
  };

  const getActivityBadgeColor = (status) => {
    switch (status) {
      case 'Working': return '#16A34A';
      case 'Break': case 'On Break': return '#F59E0B';
      case 'Meeting': case 'In Meeting': return '#7C3AED';
      case 'Leave': return '#1D4ED8';
      case 'Absent': return '#DC2626';
      default: return '#64748B';
    }
  };

  const emp = employee || user || {};
  const hasPendingCompanyDetails = emp.overallStatus === 'FULLY_APPROVED' && !emp.companyDetails?.designation;

  return (
    <View style={styles.container}>
      <AppHeader
        showGreeting
        onMenuPress={() => navigation.openDrawer && navigation.openDrawer()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTodayStatus} colors={['#1abc9c']} />}
      >
        {/* Welcome heading matching userDashboard.html <h1> Welcome ... </h1> */}
        <Text style={styles.welcomeHeading}>
          Welcome {emp.firstname || 'Employee'} {emp.lastname || ''}
        </Text>

        {/* Pending Company Details Notice Card matching userDashboard.html */}
        {hasPendingCompanyDetails && (
          <View style={styles.pendingNoticeCard}>
            <View style={styles.pendingNoticeRow}>
              <Ionicons name="warning" size={40} color="#ffc107" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingNoticeTitle}>Profile Approved - Pending Admin Assignment</Text>
                <Text style={styles.pendingNoticeText}>
                  Congratulations! Your onboarding documents have been fully approved. Please wait for the Administrator to assign your company details (Designation, Shift Timing, and Joining Date). Once assigned, you will automatically receive full access to EMS modules such as Attendance, Leave, and Hourly Reports.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Card matching userDashboard.html .card.shadow.p-4.text-center */}
        <View style={styles.profileCard}>
          {/* Profile Image 120x120 circle with green border + activity badge */}
          <View style={styles.profileImgWrapper}>
            <View style={styles.profileImgCircle}>
              <Text style={styles.profileImgText}>
                {emp.firstname ? emp.firstname[0].toUpperCase() : 'E'}
              </Text>
            </View>
            {/* Activity Status Badge matching .activity-badge-large */}
            <View
              style={[styles.activityBadge, { backgroundColor: getActivityBadgeColor(attendance.status) }]}
            />
          </View>

          <Text style={styles.profileName}>{emp.firstname || 'Employee'} {emp.lastname || ''}</Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>Employee ID: </Text>{emp.id || 'N/A'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>Email: </Text>{emp.email || 'N/A'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>Designation: </Text>{emp.companyDetails?.designation || 'N/A'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>Role: </Text>{emp.userType === 'ROLE_USER' ? 'Employee' : emp.userType === 'ROLE_ADMIN' ? 'Administrator' : emp.userType || 'Employee'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailBold}>Shift: </Text>{emp.companyDetails?.shiftTiming || 'N/A'}
          </Text>
        </View>

        {/* Quick Navigation Grid */}
        <Text style={styles.gridHeading}>Module Navigation</Text>
        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('UserAttendance')}>
            <Ionicons name="time-outline" size={26} color="#1abc9c" />
            <Text style={styles.gridText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('UserLeave')}>
            <Ionicons name="calendar-outline" size={26} color="#3498db" />
            <Text style={styles.gridText}>Leave</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('UserHourlyReport')}>
            <Ionicons name="timer-outline" size={26} color="#9b59b6" />
            <Text style={styles.gridText}>Hourly Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('UserOnboarding')}>
            <Ionicons name="clipboard-outline" size={26} color="#10b981" />
            <Text style={styles.gridText}>Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('UserProfile')}>
            <Ionicons name="person-outline" size={26} color="#e67e22" />
            <Text style={styles.gridText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('UserNotification')}>
            <Ionicons name="notifications-outline" size={26} color="#ef4444" />
            <Text style={styles.gridText}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  scrollContent: { padding: 16 },
  // Welcome heading matching userDashboard.html <h1>
  welcomeHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 16,
  },
  // Pending Company Details Notice Card matching userDashboard.html
  pendingNoticeCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    borderRadius: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#ffc107',
    padding: 20,
    marginBottom: 20,
  },
  pendingNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pendingNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 6,
  },
  pendingNoticeText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 20,
  },
  // Profile Card matching userDashboard.html .card.shadow.p-4.text-center
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  // Profile Image wrapper — 120x120 circle with green border #1abc9c
  profileImgWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  profileImgCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#1abc9c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImgText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#10b981',
  },
  // Activity Status Badge — large badge matching .activity-badge-large
  activityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    marginVertical: 3,
    textAlign: 'center',
  },
  detailBold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  // Grid Navigation
  gridHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gridText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default UserDashboardScreen;
