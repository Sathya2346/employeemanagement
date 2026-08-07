import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Dummy API endpoint for now
      // const res = await api.get('/admin/notifications');
      // setNotifications(res.data || []);
      
      // Mock data representing typical notifications in the system
      setNotifications([
        { id: 1, type: 'INFO', message: 'System maintenance scheduled for 12:00 AM tonight.', date: '2023-11-20 10:00 AM', read: false },
        { id: 2, type: 'ALERT', message: 'Employee John Doe has requested emergency leave.', date: '2023-11-20 09:15 AM', read: false },
        { id: 3, type: 'SUCCESS', message: 'Monthly payroll generation completed successfully.', date: '2023-11-19 06:00 PM', read: true },
        { id: 4, type: 'INFO', message: 'New employee Jane Smith completed onboarding.', date: '2023-11-18 02:30 PM', read: true },
      ]);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAll = () => {
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, !item.read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.typeBadge, getBadgeStyle(item.type)]}>
          {item.type}
        </Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <Text style={[styles.messageText, !item.read && styles.unreadText]}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  const getBadgeStyle = (type) => {
    switch(type) {
      case 'INFO': return { backgroundColor: '#cce5ff', color: '#004085' };
      case 'ALERT': return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'SUCCESS': return { backgroundColor: '#d4edda', color: '#155724' };
      default: return { backgroundColor: '#e2e3e5', color: '#383d41' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>System alerts and updates</Text>
        </View>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearBtn}>Clear All</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No new notifications.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  clearBtn: {
    color: '#007bff',
    fontWeight: '600',
    marginTop: 6,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    backgroundColor: '#f8f9fa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 12,
    color: '#adb5bd',
  },
  messageText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#212529',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6c757d',
    fontSize: 16,
  },
});
