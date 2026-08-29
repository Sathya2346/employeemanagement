import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { AuthContext } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';

const UserNotificationScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getUserNotifications(user.id);
      if (Array.isArray(res.data)) {
        setNotifications(res.data.map((n) => ({
          id: n.id,
          title: n.title || 'Notification',
          message: n.message || '',
          type: n.type || 'GENERAL',
          leaveStatus: n.leaveStatus || '',
          readStatus: n.readStatus || false,
          timestamp: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
        })));
      }
    } catch (e) {
      console.log('Error fetching user notifications');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (item) => {
    navigation.navigate('NotificationDetail', { notification: item });
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, readStatus: true } : n));
  };

  const getNotificationIcon = (item) => {
    if (item.leaveStatus === 'Approved') return { name: 'checkmark-circle', color: '#16A34A' };
    if (item.leaveStatus === 'Rejected') return { name: 'close-circle', color: '#DC2626' };
    if (item.type === 'FORGERY_ALERT') return { name: 'warning-outline', color: '#DC2626' };
    if (item.type === 'LOGIN_SECURITY') return { name: 'shield-checkmark-outline', color: '#7C3AED' };
    if (item.type === 'LEAVE') return { name: 'calendar-outline', color: '#3B82F6' };
    return { name: 'notifications-outline', color: '#10b981' };
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        subtitle=""
        onMenuPress={() => navigation.openDrawer()}
      />

      {loading ? (
        <LoadingView message="Loading notifications..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[styles.listContainer, notifications.length === 0 && { flex: 1, justifyContent: 'center' }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No notifications available.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const iconInfo = getNotificationIcon(item);
            return (
              <TouchableOpacity
                style={[styles.card, item.readStatus ? styles.readCard : styles.unreadCard]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
                </View>
                <View style={styles.content}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.type} Notification
                  </Text>
                  <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
                  <Text style={styles.time}>{item.timestamp}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  listContainer: { padding: 16 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#94a3b8', marginTop: 12 },
  // Notification card matching userNotification.html .card.notification-card
  card: {
    flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 10,
    padding: 15, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
    transition: 'all 0.3s ease',
  },
  // Unread matching .notification-card.unread — border-left: 4px solid #23d2aa
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#23d2aa',
    backgroundColor: '#f0fbf8',
  },
  // Read matching .notification-card with default border
  readCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
  },
  iconBox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#111111' },
  message: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  time: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
});

export default UserNotificationScreen;
