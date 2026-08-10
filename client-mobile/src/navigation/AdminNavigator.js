import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity, Text } from 'react-native';

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

export default function AdminNavigator() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#23d2aa' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity 
            onPress={logout} 
            style={{ marginRight: 15, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#23d2aa',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
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
      
      {/* Sub-screens (accessible via navigation without tab clutter) */}
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
