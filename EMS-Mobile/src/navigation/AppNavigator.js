import React, { useContext, useWindowDimensions } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

function AdminDrawerNavigator() {
  const { width } = useWindowDimensions();
  const drawerWidth = width <= 767 ? width * 0.8 : width <= 992 ? width * 0.7 : 260;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEnabled: true,
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: COLORS.primary,
        },
      }}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Drawer.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Drawer.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Drawer.Screen name="AdminPendingOnboarding" component={AdminPendingOnboardingScreen} />
      <Drawer.Screen name="AdminAttendance" component={AdminAttendanceScreen} />
      <Drawer.Screen name="AdminLeave" component={AdminLeaveScreen} />
      <Drawer.Screen name="AdminHourlyReports" component={AdminHourlyReportsScreen} />
      <Drawer.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Drawer.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Drawer.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Drawer.Screen
        name="AdminReviewOnboarding"
        component={AdminReviewOnboardingScreen}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer.Navigator>
  );
}

function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AdminStack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      <AdminStack.Screen name="ViewEmployeeDetails" component={ViewEmployeeDetailsScreen} />
      <AdminStack.Screen name="UpdateEmployee" component={UpdateEmployeeScreen} />
    </AdminStack.Navigator>
  );
}

function UserDrawerNavigator() {
  const { width } = useWindowDimensions();
  const drawerWidth = width <= 767 ? width * 0.8 : width <= 992 ? width * 0.7 : 260;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEnabled: true,
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: COLORS.primary,
        },
      }}
    >
      <Drawer.Screen name="UserDashboard" component={UserDashboardScreen} />
      <Drawer.Screen name="UserProfile" component={UserProfileScreen} />
      <Drawer.Screen name="UserAttendance" component={UserAttendanceScreen} />
      <Drawer.Screen name="UserLeave" component={UserLeaveScreen} />
      <Drawer.Screen name="UserHourlyReport" component={UserHourlyReportScreen} />
      <Drawer.Screen name="UserOnboarding" component={UserOnboardingScreen} />
      <Drawer.Screen name="UserNotification" component={UserNotificationScreen} />
      <Drawer.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer.Navigator>
  );
}

function UserStackNavigator() {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <UserStack.Screen name="UserDrawer" component={UserDrawerNavigator} />
    </UserStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingView message="Initializing EMS Mobile..." />;
  }

  const userNeedsOnboarding =
    role === 'USER' &&
    user &&
    user.overallStatus &&
    user.overallStatus !== 'FULLY_APPROVED';

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
