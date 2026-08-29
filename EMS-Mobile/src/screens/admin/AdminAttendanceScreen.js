import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import apiClient from '../../api/apiClient';
import { employeeApi } from '../../api/employeeApi';

const AdminAttendanceScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const empRes = await employeeApi.getAll();
      const employees = empRes.data || [];
      const allRecords = [];
      for (const emp of employees) {
        try {
          const attRes = await apiClient.get(`/api/attendance/today/${emp.id}`);
          if (attRes.data) {
            const a = attRes.data;
            allRecords.push({
              id: a.id || emp.id,
              date: a.attendanceDate ? String(a.attendanceDate) : new Date().toISOString().slice(0, 10),
              employee: `${emp.firstname || ''} ${emp.lastname || ''}`.trim() || emp.username,
              shift: 'General (10-7)',
              checkIn: a.checkInTime ? String(a.checkInTime) : '--:--:--',
              breakTime: a.breakTime ? String(a.breakTime) : '00:00:00',
              meetingTime: a.meetingTime ? String(a.meetingTime) : '00:00:00',
              idleTime: '00:00:00',
              checkOut: a.checkOutTime ? String(a.checkOutTime) : '--:--:--',
              totalHours: a.totalWorkingHours ? String(a.totalWorkingHours) : '00h 00m',
              remarks: a.status === 'Absent' ? 'No Check In' : 'On Time',
              status: a.status || 'Absent',
            });
          }
        } catch (err) {
          allRecords.push({
            id: emp.id,
            date: new Date().toISOString().slice(0, 10),
            employee: `${emp.firstname || ''} ${emp.lastname || ''}`.trim() || emp.username,
            shift: 'General (10-7)',
            checkIn: '--:--:--',
            breakTime: '00:00:00',
            meetingTime: '00:00:00',
            idleTime: '00:00:00',
            checkOut: '--:--:--',
            totalHours: '00h 00m',
            remarks: 'No Check In',
            status: 'Absent',
          });
        }
      }
      setRecords(allRecords);
    } catch (e) {
      console.log('Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (st) => {
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
      {/* Matching Thymeleaf attendance.html: navbar-custom with icon + title */}
      <AppHeader
        title="Attendance Overview"
        subtitle=""
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Responsive Filters Card matching attendance.html */}
        <View style={styles.filterCard}>
          <CustomInput
            label="Search Employee By Name"
            value={employeeSearch}
            onChangeText={setEmployeeSearch}
            placeholder="Type employee name..."
            icon="search-outline"
          />

          <View style={[styles.dateRow, isMobile && styles.dateRowMobile]}>
            <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
              <CustomInput
                label="From Date"
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                type="date"
                icon="calendar-outline"
              />
            </View>
            <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
              <CustomInput
                label="To Date"
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                type="date"
                icon="calendar-outline"
              />
            </View>
          </View>

          <View style={styles.filterBtnRow}>
            <CustomButton
              title="Filter"
              onPress={() => {}}
              style={[styles.btnAction, { backgroundColor: '#23d2aa' }]}
            />
            <CustomButton
              title="PDF Report"
              onPress={() => {}}
              style={[styles.btnAction, { backgroundColor: '#FF7423' }]}
            />
          </View>
        </View>

        {loading ? (
          <LoadingView message="Loading attendance records..." />
        ) : records.length === 0 ? (
          <EmptyState message="No attendance records found." />
        ) : (
        <View style={styles.tableCardContainer}>
          <Text style={styles.tableSectionTitle}>Attendance Records</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableWrapper}>
              {/* Table Header Row with #adf0da background matching attendance.css th */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { width: 100 }]}>Date</Text>
                <Text style={[styles.thCell, { width: 130 }]}>Employee</Text>
                <Text style={[styles.thCell, { width: 120 }]}>Shift</Text>
                <Text style={[styles.thCell, { width: 90 }]}>Check-In</Text>
                <Text style={[styles.thCell, { width: 90 }]}>Break</Text>
                <Text style={[styles.thCell, { width: 90 }]}>Meeting</Text>
                <Text style={[styles.thCell, { width: 90 }]}>Idle Time</Text>
                <Text style={[styles.thCell, { width: 90 }]}>Check-Out</Text>
                <Text style={[styles.thCell, { width: 100 }]}>Total Hours</Text>
                <Text style={[styles.thCell, { width: 100 }]}>Remarks</Text>
                <Text style={[styles.thCell, { width: 110 }]}>Status</Text>
              </View>

              {/* Table Body Data Rows */}
              {records.map((item, index) => {
                const stStyle = getStatusStyle(item.status);
                return (
                  <View
                    key={item.id}
                    style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}
                  >
                    <Text style={[styles.tdCell, { width: 100 }]}>{item.date}</Text>
                    <Text style={[styles.tdCell, { width: 130, fontWeight: '700' }]}>{item.employee}</Text>
                    <Text style={[styles.tdCell, { width: 120 }]}>{item.shift}</Text>
                    <Text style={[styles.tdCell, { width: 90 }]}>{item.checkIn}</Text>
                    <Text style={[styles.tdCell, { width: 90 }]}>{item.breakTime}</Text>
                    <Text style={[styles.tdCell, { width: 90 }]}>{item.meetingTime}</Text>
                    <Text style={[styles.tdCell, { width: 90 }]}>{item.idleTime}</Text>
                    <Text style={[styles.tdCell, { width: 90 }]}>{item.checkOut}</Text>
                    <Text style={[styles.tdCell, { width: 100, color: '#10b981', fontWeight: '700' }]}>{item.totalHours}</Text>
                    <Text style={[styles.tdCell, { width: 100 }]}>{item.remarks}</Text>
                    <View style={[{ width: 110, alignItems: 'center' }]}>
                      <View style={[styles.badgePill, { backgroundColor: stStyle.bg }]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
        )}
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
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateRowMobile: {
    flexDirection: 'column',
  },
  dateCol: {
    width: '48%',
  },
  dateColMobile: {
    width: '100%',
  },
  filterBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btnAction: {
    flex: 0.48,
    height: 42,
    borderRadius: 8,
  },
  tableCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tableSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  tableWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minWidth: 1050,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#adf0da',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#98e3cb',
  },
  thCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#f8f9fa',
  },
  tdCell: {
    fontSize: 13,
    color: '#111111',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  badgePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default AdminAttendanceScreen;
