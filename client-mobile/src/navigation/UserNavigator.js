import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';

// Import User Screens
import UserDashboard from '../screens/user/UserDashboard';
import UserAttendance from '../screens/user/UserAttendance';
import UserLeave from '../screens/user/UserLeave';
import UserProfile from '../screens/user/UserProfile';
import UserNotification from '../screens/user/UserNotification';
import UserHourlyReport from '../screens/user/UserHourlyReport';
import UserOnboarding from '../screens/user/UserOnboarding';

const Drawer = createDrawerNavigator();

export default function UserNavigator() {
  const { logout } = useAuth();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#23d2aa' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#23d2aa',
      }}
    >
      <Drawer.Screen 
        name="UserDashboard" 
        component={UserDashboard} 
        options={{ title: 'Overview' }}
      />

      <Drawer.Screen 
        name="UserAttendance" 
        component={UserAttendance} 
        options={{ title: 'Attendance' }}
      />

      <Drawer.Screen 
        name="UserLeave" 
        component={UserLeave} 
        options={{ title: 'Leave Management' }}
      />
      
      <Drawer.Screen 
        name="UserProfile" 
        component={UserProfile} 
        options={{ title: 'Profile' }}
      />

      <Drawer.Screen 
        name="UserHourlyReport" 
        component={UserHourlyReport} 
        options={{ title: 'Hourly Report' }}
      />

      <Drawer.Screen 
        name="UserNotification" 
        component={UserNotification} 
        options={{ title: 'Notifications' }}
      />
      
      <Drawer.Screen 
        name="UserOnboarding" 
        component={UserOnboarding} 
        options={{ 
          title: 'Onboarding',
          drawerItemStyle: { display: 'none' },
          headerLeft: () => null // Prevent opening drawer
        }}
      />

      <Drawer.Screen 
        name="Logout" 
        component={EmptyScreen}
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
