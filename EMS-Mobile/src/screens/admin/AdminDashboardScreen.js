import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import { employeeApi } from '../../api/employeeApi';
import { notificationApi } from '../../api/notificationApi';

const AdminDashboardScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    maleCount: 0,
    femaleCount: 0,
    present: 0,
    absent: 0,
    pendingOnboarding: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Sun', present: 0, absent: 0 },
    { day: 'Mon', present: 0, absent: 0 },
    { day: 'Tue', present: 0, absent: 0 },
    { day: 'Wed', present: 0, absent: 0 },
    { day: 'Thu', present: 0, absent: 0 },
    { day: 'Fri', present: 0, absent: 0 },
    { day: 'Sat', present: 0, absent: 0 },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const empRes = await employeeApi.getAll();
      if (empRes.data) {
        const employees = empRes.data.filter((e) => e.overallStatus === 'FULLY_APPROVED');
        const males = employees.filter((e) => e.gender?.toLowerCase() === 'male').length;
        const females = employees.filter((e) => e.gender?.toLowerCase() === 'female').length;
        const pending = empRes.data.filter(
          (e) => e.overallStatus === 'DETAILS_SUBMITTED' || e.overallStatus === 'CHANGES_REQUESTED'
        ).length;

        let presentCount = 0;
        let absentCount = employees.length;
        for (const emp of employees) {
          try {
            const attRes = await apiClient.get(`/api/attendance/today/${emp.id}`);
            if (attRes.data && attRes.data.status && attRes.data.status !== 'Absent') {
              presentCount++;
            }
          } catch (e) {}
        }
        absentCount = employees.length - presentCount;

        setStats({
          totalEmployees: employees.length,
          maleCount: males,
          femaleCount: females,
          present: presentCount,
          absent: absentCount,
          pendingOnboarding: pending,
        });
      }

      const notifRes = await notificationApi.getUnreadCount('Admin', true);
      if (notifRes.data?.count !== undefined) {
        setUnreadCount(notifRes.data.count);
      }
    } catch (e) {
      // Fallback
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const maxVal = Math.max(14, ...weeklyData.map(d => d.present + d.absent));

  return (
    <View style={styles.container}>
      <AppHeader
        showGreeting
        onMenuPress={() => navigation.openDrawer()}
        onNotificationPress={() => navigation.navigate('AdminNotifications')}
        unreadCount={unreadCount}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23d2aa']} />}
      >
        {/* Stat Cards Grid matching dashboard.html */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.cardStats, isMobile && styles.cardStatsMobile]} onPress={() => navigation.navigate('EmployeeList')}>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardStats, isMobile && styles.cardStatsMobile]} onPress={() => navigation.navigate('AdminAttendance')}>
            <Text style={[styles.statValue, { color: '#7C3AED' }]}>{stats.present}</Text>
            <Text style={styles.statLabel}>Today Present</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardStats, isMobile && styles.cardStatsMobile]} onPress={() => navigation.navigate('AdminAttendance')}>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Today Absent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardStats, isMobile && styles.cardStatsMobile]} onPress={() => navigation.navigate('AdminPendingOnboarding')}>
            <Text style={[styles.statValue, { color: '#e74c3c' }]}>{stats.pendingOnboarding}</Text>
            <Text style={styles.statLabel}>Pending Onboarding</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Attendance Summary Bar Chart matching dashboard.js workingTimesChart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Attendance For Last Week</Text>

          <View style={styles.chartBodyRow}>
            <View style={styles.yAxisContainer}>
              <Text style={styles.yAxisText}>14</Text>
              <Text style={styles.yAxisText}>10</Text>
              <Text style={styles.yAxisText}>5</Text>
              <Text style={styles.yAxisText}>0</Text>
            </View>

            <View style={styles.barsContainer}>
              {weeklyData.map((item) => (
                <View key={item.day} style={styles.dayGroupCol}>
                  <View style={styles.barsPairRow}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.barFill, { height: (item.present / maxVal) * 110, backgroundColor: '#23d2aa' }]} />
                    </View>
                    <View style={styles.barWrapper}>
                      <View style={[styles.barFill, { height: (item.absent / maxVal) * 110, backgroundColor: '#ff6384' }]} />
                    </View>
                  </View>
                  <Text style={styles.dayLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#23d2aa' }]} />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#ff6384' }]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
          </View>
        </View>

        {/* Employee Structure Chart Box */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Employee Structure</Text>
          <View style={styles.structRow}>
            <View style={styles.structItem}>
              <View style={[styles.dot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.structText}>Male: <Text style={styles.structNum}>{stats.maleCount}</Text></Text>
            </View>
            <View style={styles.structItem}>
              <View style={[styles.dot, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.structText}>Female: <Text style={styles.structNum}>{stats.femaleCount}</Text></Text>
            </View>
          </View>
        </View>

        {/* Quick Navigation Panel */}
        <Text style={styles.sectionHeader}>Management Panel</Text>
        <View style={styles.navGrid}>
          <TouchableOpacity style={[styles.navItem, isMobile && styles.navItemMobile]} onPress={() => navigation.navigate('AddEmployee')}>
            <Ionicons name="person-add" size={22} color="#10b981" />
            <Text style={styles.navText}>Add Employee</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navItem, isMobile && styles.navItemMobile]} onPress={() => navigation.navigate('AdminLeave')}>
            <Ionicons name="calendar" size={22} color="#1D4ED8" />
            <Text style={styles.navText}>Leave Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navItem, isMobile && styles.navItemMobile]} onPress={() => navigation.navigate('AdminHourlyReports')}>
            <Ionicons name="list-circle" size={22} color="#7C3AED" />
            <Text style={styles.navText}>Hourly Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navItem, isMobile && styles.navItemMobile]} onPress={() => navigation.navigate('AdminSettings')}>
            <Ionicons name="settings" size={22} color="#FF7423" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardStats: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    width: '23%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardStatsMobile: {
    width: '48%',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
  },
  chartBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  yAxisContainer: {
    height: 120,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
  },
  dayGroupCol: {
    alignItems: 'center',
    flex: 1,
  },
  barsPairRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  barWrapper: {
    height: 110,
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barFill: {
    width: 8,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  structRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  structItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  structText: {
    fontSize: 14,
    color: '#111111',
  },
  structNum: {
    fontWeight: '700',
  },
  sectionHeader: {
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
  navItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
  },
  navItemMobile: {
    width: '100%',
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 8,
  },
});

export default AdminDashboardScreen;
