import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';

export default function PendingOnboarding({ navigation }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOnboarding();
  }, []);

  const fetchPendingOnboarding = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/onboarding/pending'); // Needs exact API from Web
      setPendingUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending onboarding', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ReviewOnboarding', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.firstname} {item.lastname}</Text>
        <Text style={styles.statusBadge}>Pending Review</Text>
      </View>
      <Text style={styles.infoText}>{item.email}</Text>
      <Text style={styles.infoText}>Role: {item.role}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Pending Onboarding</Text>
      <Text style={styles.headerSubtitle}>Review and approve new employee registrations</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={pendingUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending onboarding requests.</Text>}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusBadge: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6c757d',
    fontSize: 16,
  },
});
