import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';

const AdminProfileScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf profile.html navbar */}
      <AppHeader
        title=""
        onMenuPress={() => navigation.openDrawer && navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.name}>{user?.firstname || 'N/A'} {user?.lastname || ''}</Text>
          <Text style={styles.email}>{user?.email || 'N/A'}</Text>
          <Text style={styles.roleTag}>System Administrator</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <Text style={styles.label}>Username: <Text style={styles.val}>{user?.username || 'N/A'}</Text></Text>
          <Text style={styles.label}>Role: <Text style={styles.val}>ROLE_ADMIN</Text></Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f8',
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10b981',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  email: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  roleTag: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 4,
  },
  val: {
    fontWeight: '600',
    color: '#111111',
  },
});

export default AdminProfileScreen;
