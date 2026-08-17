import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import User Screens
import UserDashboard from '../screens/user/UserDashboard';
import UserAttendance from '../screens/user/UserAttendance';
import UserLeave from '../screens/user/UserLeave';
import UserProfile from '../screens/user/UserProfile';
import UserNotification from '../screens/user/UserNotification';
import UserHourlyReport from '../screens/user/UserHourlyReport';
import UserOnboarding from '../screens/user/UserOnboarding';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ── 1. WhatsApp-Style Bottom Tab Bar Navigator ─────────────────────────────
function UserTabNavigator({ navigation }) {
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

// ── 2. Custom Drawer Content (Matching Thymeleaf Sidebar Exactly) ───────────
function CustomUserDrawerContent(props) {
  const { logout, user } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderTitle}>EMS</Text>
        <Text style={styles.drawerHeaderSubtitle}>{user?.firstname || user?.username || 'Employee Portal'}</Text>
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
export default function UserNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomUserDrawerContent {...props} />}
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
        name="UserTabs" 
        component={UserTabNavigator} 
        options={{ 
          drawerLabel: 'Overview Dashboard',
          drawerIcon: ({ color, size }) => <Ionicons name="house-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="UserAttendanceDrawer" 
        component={UserAttendance} 
        options={{ 
          drawerLabel: 'My Attendance',
          drawerIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="UserLeaveDrawer" 
        component={UserLeave} 
        options={{ 
          drawerLabel: 'Leave Requests',
          drawerIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="UserHourlyReportDrawer" 
        component={UserHourlyReport} 
        options={{ 
          drawerLabel: 'Hourly Activity Reports',
          drawerIcon: ({ color, size }) => <Ionicons name="list-circle-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="UserNotificationDrawer" 
        component={UserNotification} 
        options={{ 
          drawerLabel: 'Notifications & Alerts',
          drawerIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="UserProfileDrawer" 
        component={UserProfile} 
        options={{ 
          drawerLabel: 'My Profile & Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
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
