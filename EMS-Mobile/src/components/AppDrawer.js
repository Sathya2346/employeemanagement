import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const AppDrawer = ({ navigation, state, currentRoute }) => {
  const { user, role, logout } = useContext(AuthContext);
  const isAdmin = role === 'ADMIN';

  // Extract deep current route name from navigation state
  const activeRouteName = (() => {
    if (currentRoute) return currentRoute;
    if (!state) return isAdmin ? 'AdminDashboard' : 'UserDashboard';
    let route = state.routes[state.index];
    while (route.state) {
      route = route.state.routes[route.state.index];
    }
    return route.name;
  })();

  const adminNavItems = [
    { label: 'Overview', route: 'AdminDashboard', icon: 'home-outline' },
    { label: 'Add Employee', route: 'AddEmployee', icon: 'person-add-outline' },
    { label: 'Employee List', route: 'EmployeeList', icon: 'people-outline' },
    { label: 'Pending Onboarding', route: 'AdminPendingOnboarding', icon: 'clipboard-outline' },
    { label: 'Attendance', route: 'AdminAttendance', icon: 'time-outline' },
    { label: 'Leave', route: 'AdminLeave', icon: 'calendar-outline' },
    { label: 'Hourly Reports', route: 'AdminHourlyReports', icon: 'list-circle-outline' },
    { label: 'Notifications', route: 'AdminNotifications', icon: 'notifications-outline' },
    { label: 'Settings', route: 'AdminSettings', icon: 'settings-outline' },
  ];

  const userNavItems = [
    { label: 'Overview', route: 'UserDashboard', icon: 'home-outline' },
    { label: 'Profile', route: 'UserProfile', icon: 'person-outline' },
    { label: 'Attendance', route: 'UserAttendance', icon: 'time-outline' },
    { label: 'Leave', route: 'UserLeave', icon: 'calendar-outline' },
    { label: 'Hourly Report', route: 'UserHourlyReport', icon: 'list-circle-outline' },
    { label: 'Onboarding Status', route: 'UserOnboarding', icon: 'clipboard-outline' },
    { label: 'Notification', route: 'UserNotification', icon: 'notifications-outline' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleNavigate = (item) => {
    if (isAdmin) {
      navigation.navigate('AdminMainTabs', { screen: item.route });
    } else {
      navigation.navigate('UserMainTabs', { screen: item.route });
    }
  };

  const isRouteActive = (itemRoute) => {
    if (activeRouteName === itemRoute) return true;
    if (activeRouteName === `${itemRoute}Tab`) return true;
    if (itemRoute === `${activeRouteName}Tab`) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Brand Header matching dashboard.html */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>EMS</Text>
        <Text style={styles.userSubtitle} numberOfLines={1}>
          {user?.firstname || (isAdmin ? 'Admin' : 'Employee')} {user?.lastname || ''}
        </Text>
      </View>

      {/* Nav Link List */}
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const isActive = isRouteActive(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navLink, isActive && styles.activeNavLink]}
              onPress={() => handleNavigate(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={19}
                color="#ffffff"
                style={styles.icon}
              />
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logout Button matching Thymeleaf sidebar */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color="#ffffff" style={styles.icon} />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23d2aa',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  userSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  scrollList: {
    flex: 1,
    paddingTop: 4,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 2,
  },
  activeNavLink: {
    // Matches `class="nav-link active bg-secondary rounded"` in all Thymeleaf templates.
    // Bootstrap .bg-secondary = #6c757d (gray pill), which overrides the CSS hover tint.
    backgroundColor: '#6c757d',
  },
  icon: {
    marginRight: 12,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  activeNavLabel: {
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    marginTop: 8,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AppDrawer;
