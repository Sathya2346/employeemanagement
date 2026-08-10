import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity, Text } from 'react-native';

// Import User Screens
import UserDashboard from '../screens/user/UserDashboard';
import UserAttendance from '../screens/user/UserAttendance';
import UserLeave from '../screens/user/UserLeave';
import UserProfile from '../screens/user/UserProfile';
import UserNotification from '../screens/user/UserNotification';
import UserHourlyReport from '../screens/user/UserHourlyReport';
import UserOnboarding from '../screens/user/UserOnboarding';

const Tab = createBottomTabNavigator();

export default function UserNavigator() {
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

          if (route.name === 'UserDashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'UserAttendance') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'UserLeave') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'UserHourlyReport') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'UserNotification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'UserProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName || 'apps'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="UserDashboard" 
        component={UserDashboard} 
        options={{ title: 'Overview', tabBarLabel: 'Overview' }}
      />

      <Tab.Screen 
        name="UserAttendance" 
        component={UserAttendance} 
        options={{ title: 'Attendance', tabBarLabel: 'Attendance' }}
      />

      <Tab.Screen 
        name="UserLeave" 
        component={UserLeave} 
        options={{ title: 'Leave Management', tabBarLabel: 'Leaves' }}
      />

      <Tab.Screen 
        name="UserHourlyReport" 
        component={UserHourlyReport} 
        options={{ title: 'Hourly Report', tabBarLabel: 'Report' }}
      />

      <Tab.Screen 
        name="UserNotification" 
        component={UserNotification} 
        options={{ title: 'Notifications', tabBarLabel: 'Alerts' }}
      />

      <Tab.Screen 
        name="UserProfile" 
        component={UserProfile} 
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />

      <Tab.Screen 
        name="UserOnboarding" 
        component={UserOnboarding} 
        options={{ 
          title: 'Onboarding',
          tabBarButton: () => null,
          headerRight: () => null
        }}
      />
    </Tab.Navigator>
  );
}
