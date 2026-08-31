import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const AppDrawer = ({ navigation, state }) => {
  const { role, logout } = useContext(AuthContext);
  const isAdmin = role === 'ADMIN';

  const adminNavItems = [
    { label: 'Overview', route: 'AdminDashboard', tab: true, icon: 'home-outline' },
    { label: 'Add Employee', route: 'AddEmployee', icon: 'person-add-outline' },
    { label: 'Employee List', route: 'EmployeeList', tab: true, icon: 'people-outline' },
    { label: 'Pending Onboarding', route: 'AdminPendingOnboarding', icon: 'clipboard-outline' },
    { label: 'Attendance', route: 'AdminAttendance', tab: true, icon: 'time-outline' },
    { label: 'Leave', route: 'AdminLeave', tab: true, icon: 'calendar-outline' },
    { label: 'Hourly Reports', route: 'AdminHourlyReports', icon: 'list-outline' },
    { label: 'Notifications', route: 'AdminNotifications', tab: true, icon: 'notifications-outline' },
    { label: 'Settings', route: 'AdminSettings', icon: 'settings-outline' },
    { label: 'Profile', route: 'AdminProfile', icon: 'person-outline' },
  ];

  const userNavItems = [
    { label: 'Overview', route: 'UserDashboard', tab: true, icon: 'home-outline' },
    { label: 'Profile', route: 'UserProfile', tab: true, icon: 'person-outline' },
    { label: 'Attendance', route: 'UserAttendance', tab: true, icon: 'time-outline' },
    { label: 'Leave', route: 'UserLeave', tab: true, icon: 'calendar-outline' },
    { label: 'Hourly Report', route: 'UserHourlyReport', icon: 'list-outline' },
    { label: 'Onboarding Status', route: 'UserOnboarding', icon: 'clipboard-outline' },
    { label: 'Notification', route: 'UserNotification', tab: true, icon: 'notifications-outline' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;
  const drawerRoute = state?.routes?.[state.index];
  const nestedRoute = drawerRoute?.state?.routes?.[drawerRoute.state.index]?.name;
  const activeRouteName = nestedRoute || drawerRoute?.name || (isAdmin ? 'AdminDashboard' : 'UserDashboard');

  const handleNavigate = (item) => {
    if (item.tab) {
      navigation.navigate('MainTabs', { screen: item.route });
    } else {
      navigation.navigate(item.route);
    }
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandHeader}>
        <Text style={styles.brand}>EMS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const isActive = activeRouteName === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navLink, isActive && styles.activeNavLink]}
              onPress={() => handleNavigate(item)}
              activeOpacity={0.75}
            >
              <Ionicons name={item.icon} size={19} color={COLORS.white} style={styles.icon} />
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.75}>
        <Ionicons name="log-out-outline" size={19} color={COLORS.white} style={styles.icon} />
        <Text style={styles.navLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, padding: 15 },
  brandHeader: { paddingBottom: 15 },
  brand: { color: COLORS.white, fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { paddingTop: 0, paddingBottom: 12 },
  navLink: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginVertical: 2 },
  activeNavLink: { backgroundColor: COLORS.active },
  icon: { width: 20, marginRight: 10 },
  navLabel: { flex: 1, color: COLORS.white, fontSize: 16, fontWeight: '400' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginTop: 4 },
});

export default AppDrawer;
