import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
      (emp.department?.toLowerCase().includes(lower))
    );
    setFilteredEmployees(filtered);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Employee",
      "Are you sure you want to delete this employee?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/employees/delete/${id}`);
              fetchEmployees(); // Refresh list
            } catch (err) {
              Alert.alert("Error", "Failed to delete employee.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ViewEmployeeDetails', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.firstname} {item.lastname}</Text>
        <Text style={[
          styles.statusBadge, 
          item.overallStatus === 'FULLY_APPROVED' ? styles.statusActive : styles.statusPending
        ]}>
          {item.overallStatus === 'FULLY_APPROVED' ? 'Active' : 'Pending'}
        </Text>
      </View>
      <Text style={styles.infoText}>ID: {item.id} | Dept: {item.department || 'N/A'}</Text>
      <Text style={styles.infoText}>{item.email}</Text>
      <Text style={styles.infoText}>Role: {item.role}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('ViewEmployeeDetails', { id: item.id })}
        >
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => navigation.navigate('UpdateEmployee', { id: item.id })}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionTextWhite}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No employees found.</Text>}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  statusActive: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
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
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between'
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  editBtn: {
    backgroundColor: '#fff3cd',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057'
  },
  actionTextWhite: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  }
});
