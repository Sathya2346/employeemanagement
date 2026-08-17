import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard({ navigation }) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (user?.overallStatus === 'PENDING') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserOnboarding' }],
      });
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Working': return '#28a745';
      case 'Break':
      case 'On Break': return '#ffc107';
      case 'Meeting':
      case 'In Meeting': return '#6f42c1';
      case 'Leave': return '#007bff';
      case 'Absent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const isPendingDetails = user?.pendingCompanyDetails || 
    (!user?.companyDetails?.designation && user?.overallStatus === 'FULLY_APPROVED');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeTitle}>Welcome, {user?.firstname || 'Employee'} {user?.lastname || ''}</Text>
        <Text style={styles.welcomeSubtitle}>Employee Management Dashboard</Text>
      </View>

      {/* Pending Company Details Notice Card */}
      {isPendingDetails && (
        <View style={styles.noticeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="warning" size={28} color="#d97706" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeHeading}>Profile Approved - Pending Admin Assignment</Text>
              <Text style={styles.noticeText}>
                Congratulations! Your onboarding documents have been fully approved. Please wait for the Administrator to assign your company details (Designation, Shift Timing, and Joining Date).
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Profile Summary Card (Matches userDashboard.html) */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          {!imageError && user?.base64Image ? (
            <Image 
              source={{ uri: `data:image/png;base64,${user.base64Image}` }} 
              style={styles.avatar}
              onError={() => setImageError(true)} 
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#1abc9c" />
            </View>
          )}

          {user?.overallStatus === 'FULLY_APPROVED' && (
            <View style={[styles.activityBadge, { backgroundColor: getStatusColor(user?.activityStatus) }]} />
          )}
        </View>

        <Text style={styles.employeeName}>{user?.firstname || 'Employee'} {user?.lastname || ''}</Text>
        <Text style={styles.employeeIdText}>Employee ID: {user?.id || 'N/A'}</Text>

        <View style={styles.divider} />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Designation</Text>
            <Text style={styles.infoValue}>{user?.companyDetails?.designation || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{user?.role === 'ROLE_USER' || user?.userType === 'ROLE_USER' ? 'Employee' : 'Administrator'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift Timing</Text>
            <Text style={styles.infoValue}>{user?.companyDetails?.shiftTiming || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#23d2aa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
  },
  noticeCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    borderLeftWidth: 6,
    borderLeftColor: '#ffc107',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noticeHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#1abc9c',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#1abc9c',
    backgroundColor: '#e6f7f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  employeeIdText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 16,
  },
  infoList: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
});
