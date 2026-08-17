import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function PendingOnboarding({ navigation }) {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/api/admin/onboarding/pending');
      setPendingList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending onboarding applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPending();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const isReady = item.overallStatus === 'DETAILS_SUBMITTED';

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color="#0284c7" />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.empName}>{item.firstname} {item.lastname}</Text>
            <Text style={styles.empId}>ID: {item.id} | Username: {item.username}</Text>
          </View>
        </View>

        <Text style={styles.emailText} numberOfLines={1}>
          <Ionicons name="mail-outline" size={14} color="#64748b" /> {item.email}
        </Text>

        <View style={styles.cardFooter}>
          {/* Status Badge (Matches pendingOnboarding.html lines 87-92) */}
          <View style={[styles.badge, isReady ? styles.badgeReady : styles.badgeChanges]}>
            <Ionicons 
              name={isReady ? "search" : "refresh-circle"} 
              size={13} 
              color={isReady ? "#0284c7" : "#b45309"} 
              style={{ marginRight: 4 }} 
            />
            <Text style={[styles.badgeText, isReady ? styles.badgeTextReady : styles.badgeTextChanges]}>
              {isReady ? 'Ready for Review' : 'Changes Pending'}
            </Text>
          </View>

          {/* Action Button: Review Details */}
          <TouchableOpacity 
            style={styles.reviewBtn}
            onPress={() => navigation.navigate('ReviewOnboarding', { id: item.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewBtnText}>Review Details</Text>
            <Ionicons name="chevron-forward" size={15} color="#ffffff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner (Matches pendingOnboarding.html line 53) */}
      <View style={styles.headerBanner}>
        <Ionicons name="clipboard" size={24} color="#16a34a" style={{ marginRight: 8 }} />
        <Text style={styles.bannerTitle}>Pending Onboarding Reviews</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pendingList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23d2aa']} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={54} color="#16a34a" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>No pending onboarding applications at this time.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  listContent: {
    padding: 16,
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameBlock: {
    flex: 1,
  },
  empName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  empId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  emailText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeReady: {
    backgroundColor: '#e0f2fe',
  },
  badgeChanges: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextReady: {
    color: '#0284c7',
  },
  badgeTextChanges: {
    color: '#b45309',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd', // Matches btn-primary in pendingOnboarding.html line 95
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
});
