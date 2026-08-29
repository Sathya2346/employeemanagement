import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { notificationApi } from '../../api/notificationApi';

const NotificationDetailScreen = ({ route, navigation }) => {
  const { notification } = route.params || {};
  const item = notification || {};

  useEffect(() => {
    // Auto-mark as read when screen opens
    if (item.id && !item.readStatus) {
      markAsRead();
    }
  }, []);

  const markAsRead = async () => {
    try {
      await notificationApi.markRead(item.id);
    } catch (e) {
      // ignore
    }
  };

  const getTypeIcon = () => {
    if (item.type === 'FORGERY_ALERT') return { name: 'warning', color: '#DC2626' };
    if (item.type === 'LOGIN_SECURITY') return { name: 'shield-checkmark', color: '#7C3AED' };
    if (item.type === 'LEAVE') return { name: 'calendar', color: '#3B82F6' };
    return { name: 'notifications', color: '#10b981' };
  };

  const iconInfo = getTypeIcon();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notification"
        subtitle="Detail View"
        showMenu={false}
        onMenuPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.detailCard}>
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: iconInfo.color + '15' }]}>
            <Ionicons name={iconInfo.name + '-outline'} size={36} color={iconInfo.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title || 'Notification'}</Text>

          {/* Timestamp */}
          <Text style={styles.time}>{item.timestamp || ''}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Message */}
          <Text style={styles.message}>{item.message || 'No message content.'}</Text>

          {/* From */}
          {item.employeeName ? (
            <View style={styles.fromRow}>
              <Ionicons name="person-outline" size={14} color="#6c757d" />
              <Text style={styles.fromText}>From: {item.employeeName}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  scrollContent: { padding: 16 },
  detailCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 2,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20, fontWeight: '700', color: '#111111', textAlign: 'center',
  },
  time: {
    fontSize: 12, color: '#94A3B8', marginTop: 6,
  },
  divider: {
    width: '100%', height: 1, backgroundColor: '#E2E8F0', marginVertical: 18,
  },
  message: {
    fontSize: 15, color: '#334155', lineHeight: 22, textAlign: 'left', width: '100%',
  },
  fromRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16,
    alignSelf: 'flex-start',
  },
  fromText: {
    fontSize: 13, color: '#6c757d', marginLeft: 6,
  },
});

export default NotificationDetailScreen;
