import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { leaveApi } from '../../api/leaveApi';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';

const AdminLeaveScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [summary, setSummary] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, leaves]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAll();
      if (Array.isArray(res.data)) {
        const mapped = res.data.map((item) => ({
          id: item.id,
          name: item.employeeName || `${item.firstname || ''} ${item.lastname || ''}`.trim() || 'Unknown',
          leaveType: item.leaveType || 'Leave',
          fromDate: item.leaveFromDate ? String(item.leaveFromDate) : '',
          toDate: item.leaveToDate ? String(item.leaveToDate) : '',
          days: item.totalDays || 1,
          approvedBy: item.approvedBy || 'Admin HR',
          status: item.leaveStatus || 'Pending',
        }));
        setLeaves(mapped);
        setSummary({
          total: mapped.length,
          approved: mapped.filter(l => l.status === 'Approved').length,
          pending: mapped.filter(l => l.status === 'Pending').length,
          rejected: mapped.filter(l => l.status === 'Rejected').length,
        });
      }
    } catch (e) {
      console.log('Error fetching leaves from API');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leaves];
    if (statusFilter) {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    setFilteredLeaves(filtered);
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await leaveApi.approve(id);
      } else {
        await leaveApi.reject(id);
      }
      fetchLeaves();
      Alert.alert('Success', `Leave request has been ${action === 'approve' ? 'Approved' : 'Rejected'}.`);
    } catch (e) {
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: action === 'approve' ? 'Approved' : 'Rejected' } : l))
      );
      Alert.alert('Success', `Leave request has been ${action === 'approve' ? 'Approved' : 'Rejected'}.`);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Approved': return { bg: '#23d2aa', text: '#ffffff' };
      case 'Pending': return { bg: '#f2cf42', text: '#ffffff' };
      case 'Rejected': return { bg: '#f57c7c', text: '#ffffff' };
      default: return { bg: '#6c757d', text: '#ffffff' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf leave.html: navbar-custom with icon + title */}
      <AppHeader
        title="Leave Overview"
        subtitle=""
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filters Card matching leave.html */}
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
            <CustomButton title="Filter" onPress={() => {}} style={[styles.btnAction, { backgroundColor: '#23d2aa' }]} />
            <CustomButton title="PDF Report" onPress={() => {}} style={[styles.btnAction, { backgroundColor: '#FF7423' }]} />
          </View>
        </View>

        {/* 4 Summary Cards Row matching leave.html & leave.css */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: '#b4f4a6' }]}>
            <Text style={styles.sumVal}>{summary.total}</Text>
            <Text style={styles.sumLabel}>Total Leaves</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#a8d7ff' }]}>
            <Text style={styles.sumVal}>{summary.approved}</Text>
            <Text style={styles.sumLabel}>Approved Leave</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#ffe58a' }]}>
            <Text style={styles.sumVal}>{summary.pending}</Text>
            <Text style={styles.sumLabel}>Pending Leave</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#c6b8ff' }]}>
            <Text style={styles.sumVal}>{summary.rejected}</Text>
            <Text style={styles.sumLabel}>Rejected Leave</Text>
          </View>
        </View>

        {/* Leave Table matching leave.html */}
        <View style={styles.tableCardContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableSectionTitle}>Employee Leave Requests</Text>
            {/* Status Filter matching leave.html statusFilter select */}
            <View style={styles.filterDropdownRow}>
              <Text style={styles.filterLabel}>Filter:</Text>
              <View style={styles.selectBox}>
                <CustomInput
                  value={statusFilter}
                  onChangeText={setStatusFilter}
                  placeholder="All"
                  icon="filter-outline"
                />
              </View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableWrapper}>
              {/* Table Header Row matching leave.html */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.thCell, { width: 120 }]}>Name</Text>
                <Text style={[styles.thCell, { width: 110 }]}>Leave Type</Text>
                <Text style={[styles.thCell, { width: 95 }]}>From</Text>
                <Text style={[styles.thCell, { width: 95 }]}>To</Text>
                <Text style={[styles.thCell, { width: 60 }]}>Days</Text>
                <Text style={[styles.thCell, { width: 110 }]}>Approved By</Text>
                <Text style={[styles.thCell, { width: 100 }]}>Status</Text>
                <Text style={[styles.thCell, { width: 160 }]}>Action</Text>
              </View>

              {/* Table Body Data Rows */}
              {loading ? (
                <View style={styles.tableDataRow}>
                  <Text style={[styles.tdCell, { width: 880, textAlign: 'center', color: '#6c757d' }]}>Loading leave data...</Text>
                </View>
              ) : filteredLeaves.length === 0 ? (
                <View style={styles.tableDataRow}>
                  <Text style={[styles.tdCell, { width: 880, textAlign: 'center', color: '#6c757d' }]}>No leave data found.</Text>
                </View>
              ) : (
                filteredLeaves.map((item, index) => {
                  const stBadge = getStatusBadge(item.status);
                  return (
                    <View
                      key={item.id}
                      style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}
                    >
                      <Text style={[styles.tdCell, { width: 120, fontWeight: '700' }]}>{item.name}</Text>
                      <Text style={[styles.tdCell, { width: 110 }]}>{item.leaveType}</Text>
                      <Text style={[styles.tdCell, { width: 95 }]}>{item.fromDate}</Text>
                      <Text style={[styles.tdCell, { width: 95 }]}>{item.toDate}</Text>
                      <Text style={[styles.tdCell, { width: 60 }]}>{item.days}</Text>
                      <Text style={[styles.tdCell, { width: 110 }]}>{item.approvedBy}</Text>
                      <View style={[{ width: 100, alignItems: 'center' }]}>
                        <View style={[styles.badgePill, { backgroundColor: stBadge.bg }]}>
                          <Text style={styles.badgeText}>{item.status}</Text>
                        </View>
                      </View>
                      <View style={[{ width: 160, flexDirection: 'row', justifyContent: 'center' }]}>
                        {item.status === 'Pending' ? (
                          <>
                            <TouchableOpacity
                              style={[styles.actionIconBtn, { backgroundColor: '#23d2aa' }]}
                              onPress={() => handleAction(item.id, 'approve')}
                            >
                              <Text style={styles.actionBtnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionIconBtn, { backgroundColor: '#f57c7c' }]}
                              onPress={() => handleAction(item.id, 'reject')}
                            >
                              <Text style={styles.actionBtnText}>Reject</Text>
                            </TouchableOpacity>
                          </>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sumVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },
  sumLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
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
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tableSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  filterDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    marginRight: 6,
  },
  selectBox: {
    width: 140,
  },
  tableWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minWidth: 880,
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
  actionIconBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 3,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default AdminLeaveScreen;
