import React, { useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import LoadingView from '../components/LoadingView';
import AppDrawer from '../components/AppDrawer';

import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import EmployeeListScreen from '../screens/admin/EmployeeListScreen';
import AddEmployeeScreen from '../screens/admin/AddEmployeeScreen';
import ViewEmployeeDetailsScreen from '../screens/admin/ViewEmployeeDetailsScreen';
import UpdateEmployeeScreen from '../screens/admin/UpdateEmployeeScreen';
import AdminAttendanceScreen from '../screens/admin/AdminAttendanceScreen';
import AdminLeaveScreen from '../screens/admin/AdminLeaveScreen';
import AdminHourlyReportsScreen from '../screens/admin/AdminHourlyReportsScreen';
import AdminPendingOnboardingScreen from '../screens/admin/AdminPendingOnboardingScreen';
import AdminReviewOnboardingScreen from '../screens/admin/AdminReviewOnboardingScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import UserAttendanceScreen from '../screens/user/UserAttendanceScreen';
import UserLeaveScreen from '../screens/user/UserLeaveScreen';
import UserHourlyReportScreen from '../screens/user/UserHourlyReportScreen';
import UserOnboardingScreen from '../screens/user/UserOnboardingScreen';
import UserNotificationScreen from '../screens/user/UserNotificationScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import NotificationDetailScreen from '../screens/user/NotificationDetailScreen';

const RootStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const AdminTabs = createBottomTabNavigator();
const UserTabs = createBottomTabNavigator();

const tabOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.muted,
  tabBarStyle: {
    height: 62,
    paddingTop: 5,
    paddingBottom: 7,
    backgroundColor: COLORS.card,
    borderTopColor: COLORS.border,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarIcon: ({ color, size, focused }) => {
    const icons = {
      AdminDashboard: focused ? 'home' : 'home-outline',
      EmployeeList: focused ? 'people' : 'people-outline',
      AdminAttendance: focused ? 'time' : 'time-outline',
      AdminLeave: focused ? 'calendar' : 'calendar-outline',
      AdminNotifications: focused ? 'notifications' : 'notifications-outline',
      UserDashboard: focused ? 'home' : 'home-outline',
      UserProfile: focused ? 'person' : 'person-outline',
      UserAttendance: focused ? 'time' : 'time-outline',
      UserLeave: focused ? 'calendar' : 'calendar-outline',
      UserNotification: focused ? 'notifications' : 'notifications-outline',
    };
    return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size} color={color} />;
  },
});

function AdminTabsNavigator() {
  return (
    <AdminTabs.Navigator screenOptions={tabOptions}>
      <AdminTabs.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Overview' }} />
      <AdminTabs.Screen name="EmployeeList" component={EmployeeListScreen} options={{ title: 'Employees' }} />
      <AdminTabs.Screen name="AdminAttendance" component={AdminAttendanceScreen} options={{ title: 'Attendance' }} />
      <AdminTabs.Screen name="AdminLeave" component={AdminLeaveScreen} options={{ title: 'Leave' }} />
      <AdminTabs.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ title: 'Alerts' }} />
    </AdminTabs.Navigator>
  );
}

function UserTabsNavigator() {
  return (
    <UserTabs.Navigator screenOptions={tabOptions}>
      <UserTabs.Screen name="UserDashboard" component={UserDashboardScreen} options={{ title: 'Overview' }} />
      <UserTabs.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
      <UserTabs.Screen name="UserAttendance" component={UserAttendanceScreen} options={{ title: 'Attendance' }} />
      <UserTabs.Screen name="UserLeave" component={UserLeaveScreen} options={{ title: 'Leave' }} />
      <UserTabs.Screen name="UserNotification" component={UserNotificationScreen} options={{ title: 'Alerts' }} />
    </UserTabs.Navigator>
  );
}

function AdminDrawerNavigator() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(Math.max(width * 0.8, 260), 320);
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.45)',
        swipeEnabled: true,
        drawerStyle: { width: drawerWidth, backgroundColor: COLORS.primary },
      }}
    >
      <Drawer.Screen name="MainTabs" component={AdminTabsNavigator} />
      <Drawer.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Drawer.Screen name="AdminPendingOnboarding" component={AdminPendingOnboardingScreen} />
      <Drawer.Screen name="AdminHourlyReports" component={AdminHourlyReportsScreen} />
      <Drawer.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Drawer.Screen name="AdminProfile" component={AdminProfileScreen} />
    </Drawer.Navigator>
  );
}

function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AdminStack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      <AdminStack.Screen name="ViewEmployeeDetails" component={ViewEmployeeDetailsScreen} />
      <AdminStack.Screen name="UpdateEmployee" component={UpdateEmployeeScreen} />
      <AdminStack.Screen name="AdminReviewOnboarding" component={AdminReviewOnboardingScreen} />
    </AdminStack.Navigator>
  );
}

function UserDrawerNavigator() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(Math.max(width * 0.8, 260), 320);
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.45)',
        swipeEnabled: true,
        drawerStyle: { width: drawerWidth, backgroundColor: COLORS.primary },
      }}
    >
      <Drawer.Screen name="MainTabs" component={UserTabsNavigator} />
      <Drawer.Screen name="UserHourlyReport" component={UserHourlyReportScreen} />
      <Drawer.Screen name="UserOnboarding" component={UserOnboardingScreen} />
    </Drawer.Navigator>
  );
}

function UserStackNavigator() {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <UserStack.Screen name="UserDrawer" component={UserDrawerNavigator} />
      <UserStack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    </UserStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, role, loading } = useContext(AuthContext);
  if (loading) return <LoadingView message="Initializing EMS Mobile..." />;

  const userNeedsOnboarding = role === 'USER' && user && user.overallStatus && user.overallStatus !== 'FULLY_APPROVED';

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <RootStack.Group>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <RootStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </RootStack.Group>
      ) : role === 'ADMIN' ? (
        <RootStack.Screen name="AdminMain" component={AdminStackNavigator} />
      ) : userNeedsOnboarding ? (
        <RootStack.Screen name="UserOnboarding" component={UserOnboardingScreen} />
      ) : (
        <RootStack.Screen name="UserMain" component={UserStackNavigator} />
      )}
    </RootStack.Navigator>
  );
}
