import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AdminDashboard({ navigation }) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    attenPresent: 0,
    attenAbsent: 0,
    pendingOnboardingCount: 0,
    maleCount: 0,
    femaleCount: 0
  });
  const [weeklyAttendance, setWeeklyAttendance] = useState({
    days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    present: [0, 0, 0, 0, 0, 0, 0],
    absent: [0, 0, 0, 0, 0, 0, 0]
  });
  const [greeting, setGreeting] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 1. Calculate dynamic greeting and date string (Matches dashboard.js exactly)
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    let greetText = "Good Morning!!!";

    if (hours >= 5 && hours < 12) {
      greetText = "Good Morning!!!";
    } else if (hours >= 12 && hours < 17) {
      greetText = "Good Afternoon!!!";
    } else if (hours >= 17 && hours < 21) {
      greetText = "Good Evening!!!";
    } else {
      greetText = "Good Night!!!";
    }
    setGreeting(greetText);

    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    setCurrentDateStr(now.toLocaleDateString('en-GB', options));
  }, []);

  // 2. Fetch dashboard data & weekly summary from backend
  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await api.get('/admin/api/dashboard');
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }

    try {
      // Fetch weekly summary chart data
      const summaryRes = await api.get('/admin/api/attendanceSummary');
      if (summaryRes.data && summaryRes.data.days) {
        setWeeklyAttendance(summaryRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance summary:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Helper max value calculation for chart scaling
  const maxEmps = Math.max(stats.totalEmployees, 1);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23d2aa']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== Navbar Header (Matches Navbar in dashboard.html) ===== */}
      <View style={styles.navbarCard}>
        <View style={styles.navbarLeft}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.dateSubtext}>It’s <Text style={styles.dateHighlight}>{currentDateStr}</Text></Text>
        </View>
        <View style={styles.avatarWrapper}>
          <Ionicons name="person-circle" size={44} color="#23d2aa" />
        </View>
      </View>

      {/* ===== 4 Stat Cards Grid (Matches dashboard.html lines 58-85) ===== */}
      <View style={styles.cardGrid}>
        {/* Total Employees (text-success #198754) */}
        <View style={styles.cardStatItem}>
          <Text style={[styles.statNumber, { color: '#198754' }]}>{stats.totalEmployees}</Text>
          <Text style={styles.statLabel}>Total Employees</Text>
        </View>

        {/* Today Present (text-purple #6f42c1) */}
        <View style={styles.cardStatItem}>
          <Text style={[styles.statNumber, { color: '#6f42c1' }]}>{stats.attenPresent}</Text>
          <Text style={styles.statLabel}>Today Present</Text>
        </View>

        {/* Today Absent (text-primary #0d6efd) */}
        <View style={styles.cardStatItem}>
          <Text style={[styles.statNumber, { color: '#0d6efd' }]}>{stats.attenAbsent}</Text>
          <Text style={styles.statLabel}>Today Absent</Text>
        </View>

        {/* Pending Onboarding (#e74c3c) */}
        <TouchableOpacity 
          style={styles.cardStatItem} 
          onPress={() => navigation.navigate('PendingOnboarding')}
          activeOpacity={0.7}
        >
          <Text style={[styles.statNumber, { color: '#e74c3c' }]}>{stats.pendingOnboardingCount}</Text>
          <View style={styles.pendingLabelRow}>
            <Ionicons name="clipboard-outline" size={13} color="#e74c3c" style={{ marginRight: 3 }} />
            <Text style={[styles.statLabel, { color: '#e74c3c' }]}>Pending Onboarding</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ===== Attendance For Last Week Chart Container (Matches line 90) ===== */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Ionicons name="bar-chart-outline" size={18} color="#23d2aa" style={{ marginRight: 6 }} />
          <Text style={styles.chartTitle}>Attendance For Last Week</Text>
        </View>

        <View style={styles.barChartWrapper}>
          {weeklyAttendance.days.map((day, index) => {
            const presCount = weeklyAttendance.present[index] || 0;
            const absCount = weeklyAttendance.absent[index] || 0;
            
            // Bar heights proportional to max employees
            const presHeightPercent = Math.min((presCount / maxEmps) * 100, 100);
            const absHeightPercent = Math.min((absCount / maxEmps) * 100, 100);

            return (
              <View key={day + index} style={styles.barColumn}>
                <View style={styles.barPairContainer}>
                  {/* Present Bar (Green #23d2aa) */}
                  <View style={styles.singleBarSlot}>
                    <View style={[styles.barFill, { height: `${presHeightPercent}%`, backgroundColor: '#23d2aa' }]} />
                  </View>
                  {/* Absent Bar (Red #dc3545) */}
                  <View style={styles.singleBarSlot}>
                    <View style={[styles.barFill, { height: `${absHeightPercent}%`, backgroundColor: '#dc3545' }]} />
                  </View>
                </View>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>

        {/* Chart Legend */}
        <View style={styles.chartLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#23d2aa' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
        </View>
      </View>

      {/* ===== Employee Structure Container (Matches line 96) ===== */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Ionicons name="pie-chart-outline" size={18} color="#23d2aa" style={{ marginRight: 6 }} />
          <Text style={styles.chartTitle}>Employee Structure</Text>
        </View>

        <View style={styles.structureBody}>
          <View style={styles.structureRow}>
            <View style={styles.genderItem}>
              <View style={[styles.genderIconBg, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="male" size={22} color="#e74c3c" />
              </View>
              <Text style={styles.genderCount}>{stats.maleCount}</Text>
              <Text style={styles.genderLabel}>Male</Text>
            </View>

            <View style={styles.genderDivider} />

            <View style={styles.genderItem}>
              <View style={[styles.genderIconBg, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="female" size={22} color="#2ecc71" />
              </View>
              <Text style={styles.genderCount}>{stats.femaleCount}</Text>
              <Text style={styles.genderLabel}>Female</Text>
            </View>
          </View>

          {/* Visual Ratio Bar */}
          <View style={styles.ratioBarTrack}>
            <View 
              style={[
                styles.ratioBarFillMale, 
                { flex: stats.maleCount + stats.femaleCount > 0 ? stats.maleCount : 1 }
              ]} 
            />
            <View 
              style={[
                styles.ratioBarFillFemale, 
                { flex: stats.maleCount + stats.femaleCount > 0 ? stats.femaleCount : 1 }
              ]} 
            />
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8', // Exact body background from dashboard.css
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  navbarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  navbarLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  dateSubtext: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  dateHighlight: {
    color: '#495057',
    fontWeight: '600',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#23d2aa',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardStatItem: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  pendingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  barChartWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barPairContainer: {
    flexDirection: 'row',
    height: 100,
    alignItems: 'flex-end',
    gap: 3,
  },
  singleBarSlot: {
    width: 8,
    height: '100%',
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 8,
  },
  chartLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  structureBody: {
    paddingVertical: 10,
  },
  structureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  genderItem: {
    alignItems: 'center',
    flex: 1,
  },
  genderIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  genderCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  genderLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  genderDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e9ecef',
  },
  ratioBarTrack: {
    height: 10,
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
  },
  ratioBarFillMale: {
    backgroundColor: '#e74c3c',
  },
  ratioBarFillFemale: {
    backgroundColor: '#2ecc71',
  },
});
