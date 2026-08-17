import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AdminAttendance({ navigation }) {
  const [attendanceList, setAttendanceList] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/admin/api/attendance/today');
      setAttendanceList(res.data || []);
      setFilteredList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredList(attendanceList);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = attendanceList.filter(item => 
      (item.employeeName?.toLowerCase().includes(lower)) ||
      (item.status?.toLowerCase().includes(lower)) ||
      (item.shiftTiming?.toLowerCase().includes(lower))
    );
    setFilteredList(filtered);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Present':
      case 'Working': return { bg: '#d1fae5', text: '#065f46' };
      case 'Break':
      case 'On Break': return { bg: '#fef3c7', text: '#b45309' };
      case 'Meeting':
      case 'In Meeting': return { bg: '#f3e8ff', text: '#6b21a8' };
      case 'Leave': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Absent': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderItem = ({ item }) => {
    const badge = getStatusBadgeStyle(item.status);

    return (
      <View style={styles.recordCard}>
        <View style={styles.cardTop}>
          <View style={styles.empBlock}>
            <Text style={styles.empName}>{item.employeeName || item.employee?.firstname || 'Employee'}</Text>
            <Text style={styles.shiftText}>Shift: {item.shiftTiming || 'Standard (9-6)'}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>{item.status || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Check-In</Text>
            <Text style={styles.metricValue}>{item.checkInTime || 'N/A'}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Check-Out</Text>
            <Text style={styles.metricValue}>{item.checkOutTime || 'N/A'}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Hours</Text>
            <Text style={styles.metricValue}>{item.totalHours || '0.0 hrs'}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Meeting Time</Text>
            <Text style={styles.metricValue}>{item.meetingMinutes ? `${item.meetingMinutes} mins` : '0 mins'}</Text>
          </View>
        </View>

        {item.remarks ? (
          <Text style={styles.remarksText}>Remarks: {item.remarks}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner (Matches attendance.html line 47) */}
      <View style={styles.headerBanner}>
        <Ionicons name="list-circle" size={24} color="#23d2aa" style={{ marginRight: 8 }} />
        <Text style={styles.bannerTitle}>Attendance Overview</Text>
      </View>

      {/* Filter Control Box (Matches attendance.html line 51) */}
      <View style={styles.filterBox}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee by name..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item, idx) => (item.id ? item.id.toString() : idx.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23d2aa']} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No attendance records found for today.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  filterBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1e293b',
  },
  listContent: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  empBlock: {
    flex: 1,
  },
  empName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  shiftText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  metricItem: {
    width: '46%',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  remarksText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
