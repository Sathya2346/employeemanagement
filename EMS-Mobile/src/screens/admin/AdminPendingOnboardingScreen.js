import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { employeeApi } from '../../api/employeeApi';

const AdminPendingOnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [loading, setLoading] = useState(true);

  const [pendingList, setPendingList] = useState([]);

  useEffect(() => {
    fetchPendingOnboarding();
  }, []);

  const fetchPendingOnboarding = async () => {
    try {
      const res = await employeeApi.getAll();
      if (Array.isArray(res.data)) {
        const pending = res.data.filter(
          (e) => e.overallStatus === 'DETAILS_SUBMITTED' || e.overallStatus === 'CHANGES_REQUESTED'
        );
        setPendingList(pending);
      }
    } catch (e) {
      console.log('Error fetching pending onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'DETAILS_SUBMITTED') {
      return (
        <View style={[styles.badgePill, { backgroundColor: '#f6e05e' }]}>
          <Ionicons name="search-outline" size={12} color="#744210" />
          <Text style={[styles.badgeText, { color: '#744210' }]}> Ready for Review</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badgePill, { backgroundColor: '#feb2b2' }]}>
        <Ionicons name="refresh-outline" size={12} color="#742a2a" />
        <Text style={[styles.badgeText, { color: '#742a2a' }]}> Changes Pending</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf pendingOnboarding.html navbar */}
      <AppHeader
        title="Pending Onboarding Reviews"
        subtitle="Manage employee onboarding applications"
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Table Container Card matching pendingOnboarding.html */}
        <View style={styles.tableCardContainer}>
          {loading ? (
            <LoadingView message="Loading pending applications..." />
          ) : pendingList.length === 0 ? (
            /* Empty state matching pendingOnboarding.html "All caught up!" */
            <View style={styles.emptyStateContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
              <Text style={styles.emptyStateTitle}>All caught up!</Text>
              <Text style={styles.emptyStateText}>No pending onboarding applications at this time.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.tableWrapper}>
                {/* Header Row matching pendingOnboarding.html (.table thead bg #23d2aa) */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { width: 180, textAlign: 'left', paddingLeft: 16 }]}>Employee</Text>
                  <Text style={[styles.thCell, { width: 180, textAlign: 'left' }]}>Email</Text>
                  <Text style={[styles.thCell, { width: 140, textAlign: 'left' }]}>Username</Text>
                  <Text style={[styles.thCell, { width: 160, textAlign: 'center' }]}>Status</Text>
                  <Text style={[styles.thCell, { width: 150, textAlign: 'center' }]}>Action</Text>
                </View>

                {/* Data Rows */}
                {pendingList.map((emp, index) => (
                  <View key={emp.id} style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}>
                    {/* Column 1: Employee Avatar + Name + ID */}
                    <View style={[{ width: 180, flexDirection: 'row', alignItems: 'center', paddingLeft: 12 }]}>
                      <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={18} color="#23d2aa" />
                      </View>
                      <View>
                        <Text style={styles.empNameText}>{emp.firstname} {emp.lastname}</Text>
                        <Text style={styles.empIdText}>ID: {emp.id}</Text>
                      </View>
                    </View>

                    {/* Column 2: Email */}
                    <Text style={[styles.tdCell, { width: 180, textAlign: 'left' }]}>{emp.email}</Text>

                    {/* Column 3: Username */}
                    <Text style={[styles.tdCell, { width: 140, textAlign: 'left' }]}>{emp.username}</Text>

                    {/* Column 4: Status Badge */}
                    <View style={[{ width: 160, alignItems: 'center' }]}>
                      {renderStatusBadge(emp.overallStatus)}
                    </View>

                    {/* Column 5: Action Button */}
                    <View style={[{ width: 150, alignItems: 'center' }]}>
                      <TouchableOpacity
                        style={styles.reviewBtn}
                        onPress={() => navigation.navigate('AdminReviewOnboarding', { employee: emp })}
                      >
                        <Text style={styles.reviewBtnText}>Review Details </Text>
                        <Ionicons name="chevron-forward-outline" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
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
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  tableWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minWidth: 810,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#23d2aa',
    paddingVertical: 12,
  },
  thCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    paddingHorizontal: 4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6faf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  empNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  empIdText: {
    fontSize: 11,
    color: '#6c757d',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewBtn: {
    backgroundColor: '#23d2aa',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AdminPendingOnboardingScreen;
