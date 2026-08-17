import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function EmployeeList({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees/all');
      setEmployees(res.data || []);
      setFilteredEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredEmployees(employees);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = employees.filter(emp => 
      (emp.firstname?.toLowerCase().includes(lower)) ||
      (emp.lastname?.toLowerCase().includes(lower)) ||
      (emp.email?.toLowerCase().includes(lower)) ||
      (emp.companyDetails?.designation?.toLowerCase().includes(lower))
    );
    setFilteredEmployees(filtered);
  };

  const getStatusBadgeStyle = (emp) => {
    if (emp.overallStatus !== 'FULLY_APPROVED') {
      return { bg: '#fff3cd', text: '#856404', label: 'Pending Onboarding' };
    }
    if (emp.companyDetails?.status === 'Active') {
      return { bg: '#d1fae5', text: '#065f46', label: 'Active' };
    }
    return { bg: '#f1f5f9', text: '#475569', label: emp.companyDetails?.status || 'Inactive' };
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'Working': return '#16A34A';
      case 'Break':
      case 'On Break': return '#F59E0B';
      case 'Meeting':
      case 'In Meeting': return '#7C3AED';
      case 'Leave': return '#1D4ED8';
      case 'Absent': return '#DC2626';
      default: return '#64748B';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item }) => {
    const badge = getStatusBadgeStyle(item);

    return (
      <View style={styles.empCard}>
        {/* Pencil Edit Icon at top right (Matches bi-pencil-square in profile.html) */}
        <TouchableOpacity 
          style={styles.editIconBtn}
          onPress={() => navigation.navigate('UpdateEmployee', { id: item.id })}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#6c757d" />
        </TouchableOpacity>

        {/* Top Profile Header */}
        <View style={styles.cardTopHeader}>
          <View style={styles.avatarContainer}>
            {item.base64Image ? (
              <Image 
                source={{ uri: `data:image/png;base64,${item.base64Image}` }} 
                style={styles.avatarImage} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color="#23d2aa" />
              </View>
            )}

            {/* Activity Status Badge Dot */}
            {item.overallStatus === 'FULLY_APPROVED' && (
              <View style={[styles.activityDot, { backgroundColor: getActivityColor(item.activityStatus) }]} />
            )}
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.employeeName}>{item.firstname} {item.lastname}</Text>
            <Text style={styles.designationText}>{item.companyDetails?.designation || 'N/A'}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>

        {/* Gray Info Box (emp-cardBody from profile.html) */}
        <View style={styles.empCardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hired Date</Text>
            <Text style={styles.infoValue}>{formatDate(item.companyDetails?.joiningDate)}</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={15} color="#6c757d" style={{ marginRight: 6 }} />
            <Text style={styles.contactText} numberOfLines={1}>{item.email || 'N/A'}</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={15} color="#6c757d" style={{ marginRight: 6 }} />
            <Text style={styles.contactText}>{item.phone || 'N/A'}</Text>
          </View>

          {/* View More Orange Button (#FF7423 from login.css / profile.html) */}
          <TouchableOpacity 
            style={styles.viewBtn}
            onPress={() => navigation.navigate('ViewEmployeeDetails', { id: item.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.viewBtnText}>View More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search & Counter Top Header (Matches profile.html line 58-67) */}
      <View style={styles.topControlPanel}>
        <Text style={styles.countTitle}>
          <Text style={styles.countHighlight}>{filteredEmployees.length}</Text> Employees
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search employee..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={handleSearch}
            />
            <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 10 }} />
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No Employees Found</Text>
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
  topControlPanel: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  countTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  countHighlight: {
    color: '#23d2aa',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1e293b',
  },
  listContent: {
    padding: 16,
  },
  empCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  editIconBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    zIndex: 10,
  },
  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#23d2aa',
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e6f7f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#23d2aa',
  },
  activityDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
  },
  designationText: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  empCardBody: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    fontSize: 13,
    color: '#495057',
    flex: 1,
  },
  viewBtn: {
    backgroundColor: '#FF7423', // Matches btn-download / view-btn in profile.html & login.css
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#FF7423',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
