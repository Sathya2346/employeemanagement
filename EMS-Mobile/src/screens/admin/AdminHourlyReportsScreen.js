import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import { employeeApi } from '../../api/employeeApi';
import { hourlyReportApi } from '../../api/hourlyReportApi';

const AdminHourlyReportsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setSelectedEmployee(null);
    }, [])
  );

  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchReports(selectedEmployee.id);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll();
      if (Array.isArray(res.data)) {
        setEmployees(res.data.map(e => ({
          id: e.id,
          name: `${e.firstname || ''} ${e.lastname || ''}`.trim() || e.username,
          email: e.email || '',
        })));
      }
    } catch (e) {
      console.log('Error fetching employees for hourly reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (empId) => {
    setReports([]);
    try {
      const res = await hourlyReportApi.getEmployeeReports(empId);
      if (Array.isArray(res.data)) {
        setReports(res.data.map((r, idx) => ({
          id: r.id || idx + 1,
          timeSlot: r.timeSlot || '',
          taskDescription: r.taskDescription || '',
          status: r.status || 'Pending',
          submittedAt: r.submittedAt || r.createdAt || '',
        })));
      }
    } catch (e) {
      console.log('Error fetching hourly reports for employee');
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf adminHourlyReports.html header */}
      <AppHeader
        title={selectedEmployee ? `Hourly Reports - ${selectedEmployee.name}` : "Hourly Reports Overview"}
        subtitle={selectedEmployee ? `ID: ${selectedEmployee.id}` : ""}
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!selectedEmployee ? (
          /* View 1: Employee Cards View matching adminHourlyReportCards.html */
          <View style={styles.cardSection}>
            <Text style={styles.pageTitle}>Employee Hourly Reports</Text>
            <Text style={styles.pageSubtitle}>Manage employee hourly activity and submitted logs</Text>

            <View style={styles.searchCard}>
              <CustomInput
                label="Search Employee"
                value={employeeSearch}
                onChangeText={setEmployeeSearch}
                placeholder="Search by name or email..."
                icon="search-outline"
              />
            </View>

            <View style={[styles.empCardsGrid, isMobile && styles.empCardsGridMobile]}>
              {filteredEmployees.map(emp => (
                <View key={emp.id} style={[styles.empCard, isMobile && styles.empCardMobile]}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={28} color="#23d2aa" />
                  </View>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empEmail} numberOfLines={1}>{emp.email}</Text>
                  <CustomButton
                    title="View Hourly Report"
                    onPress={() => setSelectedEmployee(emp)}
                    style={styles.viewReportBtn}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* View 2: Detailed Hourly Report Table matching adminHourlyReports.html */
          <View style={styles.reportSection}>
            {/* Employee Info Header matching Thymeleaf h4#employeeInfo */}
            <View style={styles.empHeaderBanner}>
              <Text style={styles.bannerTitle}>
                Hourly Reports - <Text style={{ color: '#23d2aa' }}>{selectedEmployee.name}</Text>
                <Text style={{ fontSize: 13, color: '#6c757d' }}> (ID: {selectedEmployee.id})</Text>
              </Text>
            </View>

            {/* Filter Card matching adminHourlyReports.html */}
            <View style={styles.filterCard}>
              <View style={[styles.dateRow, isMobile && styles.dateRowMobile]}>
                <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
                  <CustomInput
                    label="From Date"
                    value={fromDate}
                    onChangeText={setFromDate}
                    placeholder="YYYY-MM-DD"
                    type="date"
                    icon="calendar-outline"
                  />
                </View>
                <View style={[styles.dateCol, isMobile && styles.dateColMobile]}>
                  <CustomInput
                    label="To Date"
                    value={toDate}
                    onChangeText={setToDate}
                    placeholder="YYYY-MM-DD"
                    type="date"
                    icon="calendar-outline"
                  />
                </View>
              </View>

              <View style={styles.filterBtnRow}>
                <CustomButton title="Filter" onPress={() => {}} style={[styles.btnAction, { backgroundColor: '#23d2aa' }]} />
                <CustomButton title="PDF Report" onPress={() => {}} style={[styles.btnAction, { backgroundColor: '#FF7423' }]} />
              </View>
            </View>

            {/* Responsive Data Table matching adminHourlyReports.html */}
            <View style={styles.tableCardContainer}>
              <Text style={styles.tableSectionTitle}>Report Entries Table</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.tableWrapper}>
                  {/* Table Header Row with #adf0da background */}
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.thCell, { width: 140 }]}>Time Slot</Text>
                    <Text style={[styles.thCell, { width: 240 }]}>Task Description</Text>
                    <Text style={[styles.thCell, { width: 110 }]}>Status</Text>
                    <Text style={[styles.thCell, { width: 140 }]}>Submitted At</Text>
                  </View>

                  {/* Table Data Rows */}
                  {reports.map((item, index) => (
                    <View key={item.id} style={[styles.tableDataRow, index % 2 === 1 && styles.tableRowAlt]}>
                      <Text style={[styles.tdCell, { width: 140, fontWeight: '600' }]}>{item.timeSlot}</Text>
                      <Text style={[styles.tdCell, { width: 240, textAlign: 'left' }]}>{item.taskDescription}</Text>
                      <View style={[{ width: 110, alignItems: 'center' }]}>
                        <View style={[styles.badgePill, { backgroundColor: item.status === 'Completed' ? '#23d2aa' : '#f2cf42' }]}>
                          <Text style={styles.badgeText}>{item.status}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tdCell, { width: 140, color: '#6c757d' }]}>{item.submittedAt}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
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
  cardSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 14,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  empCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  empCardsGridMobile: {
    flexDirection: 'column',
  },
  empCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    width: '48%',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  empCardMobile: {
    width: '100%',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6faf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  empName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  empEmail: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
  },
  viewReportBtn: {
    width: '100%',
    backgroundColor: '#FF7423',
    height: 38,
    borderRadius: 8,
  },
  reportSection: {
    marginBottom: 20,
  },
  empHeaderBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateRowMobile: {
    flexDirection: 'column',
  },
  dateCol: {
    width: '48%',
  },
  dateColMobile: {
    width: '100%',
  },
  filterBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  btnAction: {
    flex: 0.48,
    height: 42,
    borderRadius: 8,
  },
  tableCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tableSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  tableWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#adf0da',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#98e3cb',
  },
  thCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#f8f9fa',
  },
  tdCell: {
    fontSize: 13,
    color: '#111111',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  badgePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default AdminHourlyReportsScreen;
