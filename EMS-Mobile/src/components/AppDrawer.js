import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const AppDrawer = ({ navigation, state }) => {
  const { user, role, logout } = useContext(AuthContext);
  const isAdmin = role === 'ADMIN';

  const activeRouteName = state?.routes?.[state.index]?.name || (isAdmin ? 'AdminDashboard' : 'UserDashboard');

  const adminNavItems = [
    { label: 'Overview', route: 'AdminDashboard', icon: 'home-outline' },
    { label: 'Add Employee', route: 'AddEmployee', icon: 'person-add-outline' },
    { label: 'Employee List', route: 'EmployeeList', icon: 'person-outline' },
    { label: 'Pending Onboarding', route: 'AdminPendingOnboarding', icon: 'clipboard-check-outline' },
    { label: 'Attendance', route: 'AdminAttendance', icon: 'time-outline' },
    { label: 'Leave', route: 'AdminLeave', icon: 'calendar-outline' },
    { label: 'Hourly Reports', route: 'AdminHourlyReports', icon: 'list-outline' },
    { label: 'Notifications', route: 'AdminNotifications', icon: 'notifications-outline' },
    { label: 'Settings', route: 'AdminSettings', icon: 'settings-outline' },
  ];

  const userNavItems = [
    { label: 'Overview', route: 'UserDashboard', icon: 'home-outline' },
    { label: 'Profile', route: 'UserProfile', icon: 'person-outline' },
    { label: 'Attendance', route: 'UserAttendance', icon: 'time-outline' },
    { label: 'Leave', route: 'UserLeave', icon: 'calendar-outline' },
    { label: 'Hourly Report', route: 'UserHourlyReport', icon: 'list-outline' },
    { label: 'Onboarding Status', route: 'UserOnboarding', icon: 'clipboard-outline' },
    { label: 'Notification', route: 'UserNotification', icon: 'notifications-outline' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleNavigate = (item) => {
    navigation.navigate(item.route);
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>EMS</Text>
        <Text style={styles.userSubtitle} numberOfLines={1}>
          {user?.firstname || (isAdmin ? 'Admin' : 'Employee')} {user?.lastname || ''}
        </Text>
      </View>

      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const isActive = activeRouteName === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navLink, isActive && styles.activeNavLink]}
              onPress={() => handleNavigate(item)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={19} color={COLORS.white} style={styles.icon} />
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.white} style={styles.icon} />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 15 },
  header: { alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.25)', marginBottom: 10 },
  brandTitle: { fontSize: 24, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  userSubtitle: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  scrollList: { flex: 1, paddingTop: 4 },
  navLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginVertical: 2 },
  activeNavLink: { backgroundColor: COLORS.primaryHover, transform: [{ translateX: 5 }] },
  icon: { marginRight: 10 },
  navLabel: { fontSize: 16, fontWeight: '500', color: COLORS.white },
  activeNavLabel: { fontWeight: '500', color: COLORS.white },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)', marginTop: 8 },
  logoutLabel: { fontSize: 16, fontWeight: '500', color: COLORS.white },
});

export default AppDrawer;
