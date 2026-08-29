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

// ────────────────────────────────────────────────────
// Admin Tab Navigator (only 5 visible tabs + hidden non-detail screens)
// ────────────────────────────────────────────────────
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#23d2aa',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddEmployee') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'AdminAttendance') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'AdminLeave') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'AdminSettings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName || 'apps-outline'} size={22} color={color} />;
        },
      })}
    >
      {/* 5 visible tabs */}
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="AddEmployee" component={AddEmployeeScreen} options={{ tabBarLabel: 'Add Employee' }} />
      <Tab.Screen name="AdminAttendance" component={AdminAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="AdminLeave" component={AdminLeaveScreen} options={{ tabBarLabel: 'Leave' }} />
      <Tab.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      {/* Hidden secondary screens — NOT detail screens */}
      <Tab.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="EmployeeList" component={EmployeeListScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminPendingOnboarding" component={AdminPendingOnboardingScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminHourlyReports" component={AdminHourlyReportsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminReviewOnboarding" component={AdminReviewOnboardingScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

// ────────────────────────────────────────────────────
// Admin Drawer (wraps tabs)
// ────────────────────────────────────────────────────
function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 250,
          backgroundColor: '#23d2aa',
        },
      }}
    >
      <Drawer.Screen name="AdminMainTabs" component={AdminTabNavigator} />
    </Drawer.Navigator>
  );
}

// ────────────────────────────────────────────────────
// Admin Stack — wraps Drawer + detail screens (ViewEmployeeDetails, UpdateEmployee)
// This makes ViewEmployeeDetails ↔ UpdateEmployee navigation work as proper stack push/pop
// ────────────────────────────────────────────────────
function AdminStackNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDrawer" component={AdminDrawerNavigator} />
      <AdminStack.Screen name="ViewEmployeeDetails" component={ViewEmployeeDetailsScreen} />
      <AdminStack.Screen name="UpdateEmployee" component={UpdateEmployeeScreen} />
    </AdminStack.Navigator>
  );
}

// ────────────────────────────────────────────────────
// User Tab Navigator
// ────────────────────────────────────────────────────
function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#23d2aa',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'UserDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'UserAttendance') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'UserLeave') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'UserHourlyReport') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === 'UserProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName || 'apps-outline'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="UserDashboard" component={UserDashboardScreen} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="UserAttendance" component={UserAttendanceScreen} options={{ tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="UserLeave" component={UserLeaveScreen} options={{ tabBarLabel: 'Leave' }} />
      <Tab.Screen name="UserHourlyReport" component={UserHourlyReportScreen} options={{ tabBarLabel: 'Hourly Report' }} />
      <Tab.Screen name="UserProfile" component={UserProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      {/* Secondary Screens */}
      <Tab.Screen name="UserNotification" component={UserNotificationScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="UserOnboarding" component={UserOnboardingScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

// ────────────────────────────────────────────────────
// User Drawer
// ────────────────────────────────────────────────────
function UserDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 250,
          backgroundColor: '#23d2aa',
        },
      }}
    >
      <Drawer.Screen name="UserMainTabs" component={UserTabNavigator} />
    </Drawer.Navigator>
  );
}

// ────────────────────────────────────────────────────
// User Stack (wraps drawer — allows stack screens later if needed)
// ────────────────────────────────────────────────────
function UserStackNavigator() {
  return (
    <UserStack.Navigator screenOptions={{ headerShown: false }}>
      <UserStack.Screen name="UserDrawer" component={UserDrawerNavigator} />
    </UserStack.Navigator>
  );
}

// ────────────────────────────────────────────────────
// Root Navigator
// ────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingView message="Initializing EMS Mobile..." />;
  }

  // Check if USER needs to complete onboarding before accessing dashboard
  const userNeedsOnboarding = role === 'USER' && user &&
    user.overallStatus && user.overallStatus !== 'FULLY_APPROVED';

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
        <RootStack.Group>
          <RootStack.Screen name="AdminMain" component={AdminStackNavigator} />
        </RootStack.Group>
      ) : userNeedsOnboarding ? (
        <RootStack.Group>
          <RootStack.Screen name="UserOnboarding" component={UserOnboardingScreen} />
        </RootStack.Group>
      ) : (
        <RootStack.Group>
          <RootStack.Screen name="UserMain" component={UserStackNavigator} />
        </RootStack.Group>
      )}
    </RootStack.Navigator>
  );
}
