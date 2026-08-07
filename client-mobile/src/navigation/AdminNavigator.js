import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

const Drawer = createDrawerNavigator();

export default function AdminNavigator() {
  const { logout } = useAuth();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#23d2aa' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#23d2aa',
      }}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Overview' }} />
      <Drawer.Screen name="EmployeeList" component={EmployeeList} options={{ title: 'Employee List' }} />
      <Drawer.Screen name="AddEmployee" component={AddEmployee} options={{ title: 'Add Employee' }} />
      <Drawer.Screen name="PendingOnboarding" component={PendingOnboarding} options={{ title: 'Pending Onboarding' }} />
      <Drawer.Screen name="AdminAttendance" component={AdminAttendance} options={{ title: 'Attendance' }} />
      <Drawer.Screen name="AdminLeave" component={AdminLeave} options={{ title: 'Leave Requests' }} />
      <Drawer.Screen name="ShiftManagement" component={ShiftManagement} options={{ title: 'Shift Management' }} />
      <Drawer.Screen name="AdminHourlyReport" component={AdminHourlyReport} options={{ title: 'Hourly Report' }} />
      <Drawer.Screen name="AdminNotifications" component={AdminNotifications} options={{ title: 'Notifications' }} />
      <Drawer.Screen name="AdminSettings" component={AdminSettings} options={{ title: 'Settings' }} />
      
      <Drawer.Screen 
        name="ViewEmployeeDetails" 
        component={ViewEmployeeDetails} 
        options={{ 
          title: 'Employee Details',
          drawerItemStyle: { display: 'none' } 
        }} 
      />

      <Drawer.Screen 
        name="UpdateEmployee" 
        component={UpdateEmployee} 
        options={{ 
          title: 'Edit Employee',
          drawerItemStyle: { display: 'none' } 
        }} 
      />

      <Drawer.Screen 
        name="ReviewOnboarding" 
        component={ReviewOnboarding} 
        options={{ 
          title: 'Review Onboarding',
          drawerItemStyle: { display: 'none' } 
        }} 
      />

      <Drawer.Screen 
        name="EmailTemplatesSettings" 
        component={EmailTemplatesSettings} 
        options={{ 
          title: 'Email Templates',
          drawerItemStyle: { display: 'none' } 
        }} 
      />

      <Drawer.Screen 
        name="Logout" 
        component={EmptyScreen} // Hack to add a button in Drawer
        options={{
          drawerLabel: 'Logout',
          drawerItemStyle: { marginTop: 'auto' },
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            logout();
          },
        }}
      />
    </Drawer.Navigator>
  );
}

const EmptyScreen = () => null;
