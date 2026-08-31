import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import LoadingView from '../components/LoadingView';
import AppDrawer from '../components/AppDrawer';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Admin Screens
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

// User Screens
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
const Tab = createBottomTabNavigator();

const tabScreenOptions = ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.textSecondary,
  tabBarStyle: {
    height: 64,
    paddingBottom: 7,
    paddingTop: 7,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarIcon: ({ focused, color }) => {
    const icons = {
      AdminDashboard: focused ? 'home' : 'home-outline',
      AddEmployee: focused ? 'person-add' : 'person-add-outline',
      AdminAttendance: focused ? 'time' : 'time-outline',
      AdminLeave: focused ? 'calendar' : 'calendar-outline',
      AdminSettings: focused ? 'settings' : 'settings-outline',
      UserDashboard: focused ? 'home' : 'home-outline',
      UserAttendance: focused ? 'time' : 'time-outline',
      UserLeave: focused ? 'calendar' : 'calendar-outline',
      UserHourlyReport: focused ? 'list-circle' : 'list-circle-outline',
      UserProfile: focused ? 'person' : 'person-outline',
    };
    return <Ionicons name={icons[route.name] || 'apps-outline'} size={22} color={color} />;
  },
});

function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ tabBarLabel: 'Add Employee' }} />
      <Tab.Screen name="AdminAttendance" component={AdminAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="AdminLeave" component={AdminLeaveScreen} options={{ tabBarLabel: 'Leave' }} />
      <Tab.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      <Tab.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="EmployeeList" component={EmployeeListScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminPendingOnboarding" component={AdminPendingOnboardingScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminHourlyReports" component={AdminHourlyReportsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminReviewOnboarding" component={AdminReviewOnboardingScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{ headerShown: false, drawerStyle: { width: 250, backgroundColor: COLORS.primary } }}
    >
      <Drawer.Screen name="AdminMainTabs" component={AdminTabNavigator} />
    </Drawer.Navigator>
  );
}

function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      <AdminStack.Screen name="ViewEmployeeDetails" component={ViewEmployeeDetailsScreen} />
      <AdminStack.Screen name="UpdateEmployee" component={UpdateEmployeeScreen} />
    </AdminStack.Navigator>
  );
}

function UserTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="UserDashboard" component={UserDashboardScreen} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="UserAttendance" component={UserAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="UserLeave" component={UserLeaveScreen} options={{ tabBarLabel: 'Leave' }} />
      <Tab.Screen name="UserHourlyReport" component={UserHourlyReportScreen} options={{ tabBarLabel: 'Hourly Report' }} />
      <Tab.Screen name="UserProfile" component={UserProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="UserNotification" component={UserNotificationScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="UserOnboarding" component={UserOnboardingScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

function UserDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{ headerShown: false, drawerStyle: { width: 250, backgroundColor: COLORS.primary } }}
    >
      <Drawer.Screen name="UserMainTabs" component={UserTabNavigator} />
    </Drawer.Navigator>
  );
}

function UserStackNavigator() {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      <UserStack.Screen name="UserDrawer" component={UserDrawerNavigator} />
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
