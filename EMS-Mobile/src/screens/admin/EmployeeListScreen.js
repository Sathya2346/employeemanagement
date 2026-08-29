import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import { employeeApi } from '../../api/employeeApi';
import { SHADOWS } from '../../constants/theme';
import { getStatusColor } from '../../components/StatusBadge';

const EmployeeListScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterId, setFilterId] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll();
      if (res.data) {
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      }
    } catch (e) {
      console.log('Error fetching employees from API');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    const query = text.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.firstname?.toLowerCase().includes(query) ||
        emp.lastname?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.companyDetails?.designation?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const handleApplyFilter = () => {
    let filtered = [...employees];
    if (filterName.trim()) {
      const q = filterName.toLowerCase();
      filtered = filtered.filter(
        (e) => e.firstname?.toLowerCase().includes(q) || e.lastname?.toLowerCase().includes(q)
      );
    }
    if (filterId.trim()) {
      filtered = filtered.filter((e) => String(e.id).includes(filterId.trim()));
    }
    setFilteredEmployees(filtered);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    setFilterName('');
    setFilterId('');
    setFilteredEmployees(employees);
    setShowFilter(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <AppHeader
        title=""
        onMenuPress={() => navigation.openDrawer()}
        rightIcon="person-add-outline"
        onRightPress={() => navigation.navigate('AddEmployee')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Bar: Employee Count + Search + Filter Button */}
        <View style={[styles.topBar, isMobile && styles.topBarMobile]}>
          <Text style={styles.empCountText}>
            <Text style={styles.empCountNumber}>{filteredEmployees.length}</Text> Employee
          </Text>

          <View style={[styles.searchFilterRow, isMobile && styles.searchFilterRowMobile]}>
            {/* Search Box matching Thymeleaf .search-box */}
            <View style={styles.searchBox}>
              <TextInput
                value={search}
                onChangeText={handleSearch}
                placeholder="Search"
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
              />
              <TouchableOpacity style={styles.searchBarBtn} onPress={() => handleSearch(search)}>
                <Ionicons name="search" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Filter Button matching .filter-btn */}
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)} activeOpacity={0.85}>
              <Ionicons name="funnel" size={14} color="#ffffff" />
              <Text style={styles.filterBtnText}> Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <LoadingView message="Loading employees directory..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState icon="people-outline" message="Employee Not Found" />
        ) : (
          <View style={styles.cardList}>
            {filteredEmployees.map((emp) => {
              const isPending = emp.overallStatus !== 'FULLY_APPROVED';
              const isActive = emp.overallStatus === 'FULLY_APPROVED' && emp.companyDetails?.status === 'Active';
              const isFullyApproved = emp.overallStatus === 'FULLY_APPROVED';

              return (
                <View key={emp.id} style={styles.empCard}>
                  {/* Edit icon top-right matching .edit-icn */}
                  <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => navigation.navigate('UpdateEmployee', { employeeId: emp.id, employee: emp })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil-square" size={18} color="#666666" />
                  </TouchableOpacity>

                  {/* Avatar + Name + Designation */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.avatarWrap}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarInitial}>
                          {emp.firstname ? emp.firstname[0].toUpperCase() : 'E'}
                        </Text>
                      </View>
                      {/* Activity Status Badge dot matching .activity-badge */}
                      {isFullyApproved && (
                        <View
                          style={[
                            styles.activityBadge,
                            { backgroundColor: getStatusColor(emp.activityStatus) },
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.nameBlock}>
                      <Text style={styles.empName}>
                        {emp.firstname} {emp.lastname}
                      </Text>
                      <Text style={styles.empDesignation}>
                        {emp.companyDetails?.designation || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge matching profile.css .status */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isPending
                          ? '#ffbb00'
                          : isActive
                          ? '#23d2aa'
                          : '#8B8B8B',
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {isPending ? 'Pending Onboarding' : emp.companyDetails?.status || 'N/A'}
                    </Text>
                  </View>

                  {/* Card Body matching profile.css .emp-cardBody */}
                  <View style={styles.empCardBody}>
                    <View style={styles.cardInfoRow}>
                      <Text style={styles.cardInfoLabel}>Hired Date</Text>
                      <Text style={styles.cardInfoValue}>
                        {formatDate(emp.companyDetails?.joiningDate)}
                      </Text>
                    </View>

                    <View style={styles.cardInfoRow}>
                      <Ionicons name="mail-outline" size={14} color="#6c757d" />
                      <Text style={styles.cardInfoValueSm} numberOfLines={1}>
                        {' '}{emp.email}
                      </Text>
                    </View>

                    <View style={styles.cardInfoRow}>
                      <Ionicons name="call-outline" size={14} color="#6c757d" />
                      <Text style={styles.cardInfoValueSm}>
                        {' '}{emp.phone || 'N/A'}
                      </Text>
                    </View>

                    {/* View More button matching .view-btn */}
                    <View style={styles.viewMoreRow}>
                      <TouchableOpacity
                        style={styles.viewMoreBtn}
                        onPress={() =>
                          navigation.navigate('ViewEmployeeDetails', {
                            employeeId: emp.id,
                            employee: emp,
                          })
                        }
                        activeOpacity={0.85}
                      >
                        <Text style={styles.viewMoreText}>View More</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Filter Popup matching profile.html .filter-popup */}
      {showFilter && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterPopup}>
            <TouchableOpacity style={styles.closePopup} onPress={handleClearFilter}>
              <Ionicons name="close" size={24} color="#FF7423" />
            </TouchableOpacity>

            <Text style={styles.filterPopupTitle}>Filter Employees</Text>

            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>Employee Name</Text>
              <TextInput
                value={filterName}
                onChangeText={setFilterName}
                placeholder="Enter name"
                placeholderTextColor="#9ca3af"
                style={styles.filterInput}
              />
            </View>

            <View style={styles.filterField}>
              <Text style={styles.filterLabel}>Employee ID</Text>
              <TextInput
                value={filterId}
                onChangeText={setFilterId}
                placeholder="Enter ID"
                placeholderTextColor="#9ca3af"
                style={styles.filterInput}
              />
            </View>

            <TouchableOpacity style={styles.applyFilterBtn} onPress={handleApplyFilter} activeOpacity={0.85}>
              <Text style={styles.applyFilterText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  topBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  empCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  empCountNumber: {
    color: '#D44814',
    fontWeight: '700',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchFilterRowMobile: {
    flexDirection: 'row',
    width: '100%',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    overflow: 'hidden',
    height: 42,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111111',
  },
  searchBarBtn: {
    backgroundColor: '#FF7423',
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    backgroundColor: '#23d2aa',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 7,
  },
  filterBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  cardList: {
    marginTop: 8,
  },
  empCard: {
    backgroundColor: '#f7fdfb',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
    marginBottom: 14,
    ...SHADOWS.card,
  },
  editIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
    padding: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#23d2aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10b981',
  },
  activityBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 5,
  },
  nameBlock: {
    flex: 1,
  },
  empName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  empDesignation: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  empCardBody: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
    marginRight: 6,
  },
  cardInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  cardInfoValueSm: {
    fontSize: 13,
    color: '#6c757d',
    flex: 1,
  },
  viewMoreRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewMoreBtn: {
    backgroundColor: '#FF7423',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 7,
  },
  viewMoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2000,
  },
  filterPopup: {
    backgroundColor: '#f7fdfb',
    padding: 22,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
    position: 'relative',
    ...SHADOWS.card,
  },
  closePopup: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 1,
  },
  filterPopupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#23d2aa',
    marginBottom: 14,
  },
  filterField: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  filterInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#ffffff',
  },
  applyFilterBtn: {
    backgroundColor: '#23d2aa',
    height: 42,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  applyFilterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmployeeListScreen;
