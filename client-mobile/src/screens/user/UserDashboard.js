import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard({ navigation }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.overallStatus === 'PENDING') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserOnboarding' }],
      });
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Working': return '#28a745';
      case 'Break':
      case 'On Break': return '#ffc107';
      case 'Meeting':
      case 'In Meeting': return '#343a40';
      case 'Leave': return '#007bff';
      case 'Absent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome {user?.firstname} {user?.lastname}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.base64Image ? `data:image/png;base64,${user.base64Image}` : 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          {user?.overallStatus === 'FULLY_APPROVED' && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user?.activityStatus) }]} />
          )}
        </View>

        <Text style={styles.name}>{user?.firstname} {user?.lastname}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Employee ID:</Text>
          <Text style={styles.infoValue}>{user?.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Designation:</Text>
          <Text style={styles.infoValue}>{user?.companyDetails?.designation || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoValue}>{user?.role === 'USER' ? 'Employee' : user?.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Shift:</Text>
          <Text style={styles.infoValue}>{user?.companyDetails?.shiftTiming || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#23d2aa',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
  },
});
