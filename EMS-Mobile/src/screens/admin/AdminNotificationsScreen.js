import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { notificationApi } from '../../api/notificationApi';

const AdminNotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAdminNotifications();
      if (Array.isArray(res.data)) {
        const mapped = res.data.map((n) => ({
          id: n.id,
          title: n.title || 'Notification',
          message: n.message || '',
          type: n.type || 'GENERAL',
          readStatus: n.readStatus || false,
          timestamp: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
        }));
        setNotifications(mapped);
      }
    } catch (e) {
      console.log('Error fetching admin notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markRead(id);
    } catch (e) {}
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, readStatus: true } : n)
    );
  };

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf adminNotifications.html: greeting navbar with date */}
      <AppHeader
        showGreeting
        onMenuPress={() => navigation.openDrawer()}
      />

      {loading ? (
        <LoadingView message="Loading notifications..." />
      ) : (
      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.listContainer, notifications.length === 0 && { flex: 1, justifyContent: 'center' }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.readStatus && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={item.type === 'FORGERY_ALERT' ? 'warning-outline' : 'notifications-outline'}
                size={22}
                color={item.type === 'FORGERY_ALERT' ? COLORS.danger : COLORS.primaryDark}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.timestamp}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" message="No notifications yet. Notifications will appear here when employees submit onboarding, leave requests, or hourly reports." />}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    backgroundColor: '#F0FDF4',
  },
  iconBox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  message: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
});

export default AdminNotificationsScreen;
