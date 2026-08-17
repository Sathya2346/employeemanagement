import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import EmployeeList from '../screens/admin/EmployeeList';
import AddEmployee from '../screens/admin/AddEmployee';
import PendingOnboarding from '../screens/admin/PendingOnboarding';
import AdminLeave from '../screens/admin/AdminLeave';
import ShiftManagement from '../screens/admin/ShiftManagement';
import AdminHourlyReport from '../screens/admin/AdminHourlyReport';
import ViewEmployeeDetails from '../screens/admin/ViewEmployeeDetails';
import UpdateEmployee from '../screens/admin/UpdateEmployee';
import ReviewOnboarding from '../screens/admin/ReviewOnboarding';
import AdminAttendance from '../screens/admin/AdminAttendance';
import AdminSettings from '../screens/admin/AdminSettings';
import AdminNotifications from '../screens/admin/AdminNotifications';
import EmailTemplatesSettings from '../screens/admin/EmailTemplatesSettings';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ── 1. WhatsApp-Style Bottom Tab Bar Navigator ─────────────────────────────
function AdminTabNavigator({ navigation }) {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#23d2aa' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()} 
            style={{ marginLeft: 15, padding: 5 }}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={logout} 
            style={styles.logoutHeaderBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#23d2aa',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          height: 56,
          paddingBottom: 0,
          paddingTop: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'AdminDashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'EmployeeList') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AdminAttendance') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'AdminLeave') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'AdminNotifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'AdminSettings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName || 'apps'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Overview', tabBarLabel: 'Overview' }} />
      <Tab.Screen name="EmployeeList" component={EmployeeList} options={{ title: 'Employees', tabBarLabel: 'Employees' }} />
      <Tab.Screen name="AdminAttendance" component={AdminAttendance} options={{ title: 'Attendance', tabBarLabel: 'Attendance' }} />
      <Tab.Screen name="AdminLeave" component={AdminLeave} options={{ title: 'Leave Requests', tabBarLabel: 'Leaves' }} />
      <Tab.Screen name="AdminNotifications" component={AdminNotifications} options={{ title: 'Notifications', tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="AdminSettings" component={AdminSettings} options={{ title: 'Settings', tabBarLabel: 'Settings' }} />
      
      {/* Sub-screens */}
      <Tab.Screen name="AddEmployee" component={AddEmployee} options={{ title: 'Add Employee', tabBarButton: () => null }} />
      <Tab.Screen name="PendingOnboarding" component={PendingOnboarding} options={{ title: 'Pending Onboarding', tabBarButton: () => null }} />
      <Tab.Screen name="ShiftManagement" component={ShiftManagement} options={{ title: 'Shift Management', tabBarButton: () => null }} />
      <Tab.Screen name="AdminHourlyReport" component={AdminHourlyReport} options={{ title: 'Hourly Report', tabBarButton: () => null }} />
      <Tab.Screen name="ViewEmployeeDetails" component={ViewEmployeeDetails} options={{ title: 'Employee Details', tabBarButton: () => null }} />
      <Tab.Screen name="UpdateEmployee" component={UpdateEmployee} options={{ title: 'Edit Employee', tabBarButton: () => null }} />
      <Tab.Screen name="ReviewOnboarding" component={ReviewOnboarding} options={{ title: 'Review Onboarding', tabBarButton: () => null }} />
      <Tab.Screen name="EmailTemplatesSettings" component={EmailTemplatesSettings} options={{ title: 'Email Templates', tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}

// ── 2. Custom Drawer Content (Matching Thymeleaf Sidebar Exactly) ───────────
function CustomDrawerContent(props) {
  const { logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Sidebar Header (Matches Thymeleaf H4 EMS branding) */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderTitle}>EMS</Text>
        <Text style={styles.drawerHeaderSubtitle}>Admin Dashboard</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutDrawerBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutDrawerText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

// ── 3. Combined Hybrid Drawer + Tab Navigator ─────────────────────────────
export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#23d2aa',
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#212529',
        drawerItemStyle: { borderRadius: 8, marginVertical: 3 },
        drawerLabelStyle: { fontWeight: '600', fontSize: 14 },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={AdminTabNavigator} 
        options={{ 
          drawerLabel: 'Overview',
          drawerIcon: ({ color, size }) => <Ionicons name="house-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="AddEmployeeDrawer" 
        component={AddEmployee} 
        options={{ 
          drawerLabel: 'Add Employee',
          drawerIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="EmployeeListDrawer" 
        component={EmployeeList} 
        options={{ 
          drawerLabel: 'Employee List',
          drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="PendingOnboardingDrawer" 
        component={PendingOnboarding} 
        options={{ 
          drawerLabel: 'Pending Onboarding',
          drawerIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="AdminAttendanceDrawer" 
        component={AdminAttendance} 
        options={{ 
          drawerLabel: 'Attendance',
          drawerIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="AdminLeaveDrawer" 
        component={AdminLeave} 
        options={{ 
          drawerLabel: 'Leave',
          drawerIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="AdminHourlyReportDrawer" 
        component={AdminHourlyReport} 
        options={{ 
          drawerLabel: 'Hourly Reports',
          drawerIcon: ({ color, size }) => <Ionicons name="list-circle-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="AdminNotificationsDrawer" 
        component={AdminNotifications} 
        options={{ 
          drawerLabel: 'Notifications',
          drawerIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="AdminSettingsDrawer" 
        component={AdminSettings} 
        options={{ 
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
        }} 
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#23d2aa',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerHeaderTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  drawerHeaderSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  logoutHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  logoutDrawerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutDrawerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
