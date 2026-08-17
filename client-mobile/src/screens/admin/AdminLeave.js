import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AdminLeave({ navigation }) {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/admin/leave/all');
      const data = res.data || [];
      setLeaves(data);

      let appCount = 0;
      let pendCount = 0;
      let rejCount = 0;

      data.forEach(l => {
        if (l.status === 'Approved') appCount++;
        else if (l.status === 'Pending') pendCount++;
        else if (l.status === 'Rejected') rejCount++;
      });

      setStats({
        total: data.length,
        approved: appCount,
        pending: pendCount,
        rejected: rejCount,
      });

      applyFilter(data, statusFilter);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (data, filter) => {
    if (filter === 'ALL') {
      setFilteredLeaves(data);
    } else {
      setFilteredLeaves(data.filter(l => l.status === filter));
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    applyFilter(leaves, filter);
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve/${id}`);
      Alert.alert("Success", "Leave request approved.");
      fetchLeaves();
    } catch (err) {
      Alert.alert("Error", "Failed to approve leave request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/reject/${id}`);
      Alert.alert("Success", "Leave request rejected.");
      fetchLeaves();
    } catch (err) {
      Alert.alert("Error", "Failed to reject leave request.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#d1fae5', text: '#065f46' };
      case 'Pending': return { bg: '#fef3c7', text: '#b45309' };
      case 'Rejected': return { bg: '#fee2e2', text: '#991b1b' };
      case 'Cancelled': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderItem = ({ item }) => {
    const badge = getStatusBadge(item.status);
    const isPending = item.status === 'Pending';

    return (
      <View style={styles.leaveCard}>
        <View style={styles.cardHeader}>
          <View style={styles.empInfo}>
            <Text style={styles.empName}>{item.employeeName || item.employee?.firstname || 'Employee'}</Text>
            <Text style={styles.leaveType}>{item.leaveType} ({item.days || 1} Days)</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.dateBox}>
          <Ionicons name="calendar-outline" size={15} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>{item.startDate} → {item.endDate}</Text>
        </View>

        <Text style={styles.reasonText}>Reason: {item.reason || 'N/A'}</Text>

        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.approveBtn}
              onPress={() => handleApprove(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rejectBtn}
              onPress={() => handleReject(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner (Matches leave.html line 47) */}
      <View style={styles.headerBanner}>
        <Ionicons name="calendar" size={24} color="#23d2aa" style={{ marginRight: 8 }} />
        <Text style={styles.bannerTitle}>Leave Overview</Text>
      </View>

      {/* 4 Summary Cards Grid (Matches leave.html lines 76-100) */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderTopColor: '#23d2aa' }]}>
          <Text style={styles.summaryNumber}>{stats.total}</Text>
          <Text style={styles.summaryLabel}>Total Leaves</Text>
        </View>

        <View style={[styles.summaryCard, { borderTopColor: '#16a34a' }]}>
          <Text style={[styles.summaryNumber, { color: '#16a34a' }]}>{stats.approved}</Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>

        <View style={[styles.summaryCard, { borderTopColor: '#f59e0b' }]}>
          <Text style={[styles.summaryNumber, { color: '#d97706' }]}>{stats.pending}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>

        <View style={[styles.summaryCard, { borderTopColor: '#dc2626' }]}>
          <Text style={[styles.summaryNumber, { color: '#dc2626' }]}>{stats.rejected}</Text>
          <Text style={styles.summaryLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabRow}>
        {['ALL', 'Pending', 'Approved', 'Rejected'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, statusFilter === f && styles.filterTabActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterTabText, statusFilter === f && styles.filterTabTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredLeaves}
          keyExtractor={(item, idx) => (item.id ? item.id.toString() : idx.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23d2aa']} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No leave requests found.</Text>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 4,
  },
  summaryCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 2,
  },
  filterTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterTabActive: {
    backgroundColor: '#23d2aa',
    borderColor: '#23d2aa',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  leaveCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  leaveType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#23d2aa',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 9,
    borderRadius: 8,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
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
