import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomButton from '../../components/CustomButton';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import { employeeApi } from '../../api/employeeApi';

/**
 * Pixel-perfect match for:
 *   src/main/resources/templates/admin/viewEmployeeDetails.html
 *   src/main/resources/static/css/admin/employeeDetails.css
 *
 * Layout: Two-column (col-lg-8 form + col-lg-4 profile card)
 * Form: Read-only .form-control fields in 3-col grid
 * Profile: Green header, centered avatar, personal info, bank info
 */

const ViewEmployeeDetailsScreen = ({ route, navigation }) => {
  const { employee, employeeId } = route.params || {};
  const [emp, setEmp] = useState(employee || null);
  const [loading, setLoading] = useState(!employee);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!employee && employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const res = await employeeApi.getById(employeeId);
      if (res.data) setEmp(res.data);
    } catch (e) {
      console.log('Error fetching employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingView message="Loading employee details..." />;
  if (!emp) return <EmptyState message="Employee not found." />;

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this employee?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeApi.delete(emp.id);
              Alert.alert('Deleted', 'Employee has been deleted successfully.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete employee.');
            }
          },
        },
      ]
    );
  };

  const cd = emp.companyDetails || {};
  const bd = emp.bankDetails || {};

  const isDesktop = width >= 992;
  const isMobile = width < 768;

  /* ── Render a read-only form field matching .form-control[readonly] ── */
  const renderField = (label, value) => (
    <View style={[styles.fieldCell, isMobile && styles.fieldCellMobile, width < 400 && styles.fieldCellNarrow]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.readonlyInput}>
        <Text style={styles.fieldValue}>{value || ''}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title=""
        showMenu={false}
        onMenuPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Page title matching <h3 class="fw-bold">Employee Details</h3> ── */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Employee Details</Text>
        </View>

        {/* ── Two-column row matching .row ── */}
        <View style={[styles.twoColRow, !isDesktop && styles.twoColRowStacked]}>
          {/* ── LEFT: Form Card — col-12 col-lg-8 ── */}
          <View style={[styles.formCard, !isDesktop && styles.formCardFull]}>
            <View style={[styles.cardBody, isMobile && styles.cardBodyMobile]}>
              {/* ── Basic Details ── */}
              <Text style={styles.sectionTitle}>Basic Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('First Name', emp.firstname)}
                {renderField('Last Name', emp.lastname)}
                {renderField('Gender', emp.gender)}
                {renderField('Date of Birth', emp.dateOfBirth)}
                {renderField('Email', emp.email)}
                {renderField('Phone', emp.phone)}
                {renderField('Address', emp.address)}
                {renderField('City', emp.city)}
                {renderField('Blood Group', emp.blood)}
                {renderField('Emergency Number', emp.emergencyNumber)}
                {renderField('Languages Known', emp.language)}
                {renderField('Marital Status', emp.maritalStatus)}
              </View>

              {/* ── Company Details ── */}
              <Text style={styles.sectionTitle}>Company Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('Employee Email', cd.employeeEmail)}
                {renderField('Designation', cd.designation)}
                {renderField('Shift Timing', cd.shiftTiming)}
                {renderField('Joining Date', cd.joiningDate)}
                {renderField('Leaving Date', cd.leavingDate)}
                {renderField('Status', cd.status)}
              </View>

              {/* ── Bank Details ── */}
              <Text style={styles.sectionTitle}>Bank Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('Account Holder Name', bd.accHolderName)}
                {renderField('Branch Name', bd.branchName)}
                {renderField('Bank Name', bd.bankName)}
                {renderField('Account Number', bd.accNumber)}
                {renderField('IFSC Code', bd.ifscCode)}
                {renderField('PAN Card Number', bd.panCard)}
              </View>

              {/* ── User Details ── */}
              <Text style={styles.sectionTitle}>User Details</Text>
              <View style={styles.fieldGrid}>
                {renderField(
                  'Role',
                  emp.userType === 'ROLE_USER'
                    ? 'Employee'
                    : emp.userType === 'ROLE_ADMIN'
                    ? 'Administrator'
                    : emp.userType
                )}
                {renderField('Username', emp.username)}
              </View>

              {/* ── Action Buttons matching viewEmployeeDetails.html ── */}
              <View style={[styles.actionBtnRow, isMobile && styles.actionBtnRowMobile]}>
                <CustomButton
                  title="+ Add New"
                  onPress={() => navigation.navigate('AddEmployee')}
                  style={[styles.btnAddNew, isMobile && styles.actionBtnFullWidth]}
                  textStyle={styles.btnTextWhite}
                />
                <CustomButton
                  title="Update"
                  onPress={() =>
                    navigation.navigate('UpdateEmployee', {
                      employeeId: emp.id,
                      employee: emp,
                    })
                  }
                  style={[styles.btnUpdate, isMobile && styles.actionBtnFullWidth]}
                  textStyle={styles.btnTextWhite}
                />
                <CustomButton
                  title="Delete"
                  onPress={handleDelete}
                  style={[styles.btnDelete, isMobile && styles.actionBtnFullWidth]}
                  textStyle={styles.btnTextWhite}
                />
              </View>
            </View>
          </View>

          {/* ── RIGHT: Profile Card — col col-lg-4 ── */}
          <View style={[styles.profileCard, !isDesktop && styles.profileCardFull]}>
            {/* Green header matching .profile-header */}
            <View style={styles.profileHeader} />

            {/* Profile image matching .profile-img (90x90 circle centered) */}
            <View style={styles.profileImgWrap}>
              <View style={styles.profileImg}>
                <Text style={styles.profileImgText}>
                  {emp.firstname ? emp.firstname[0].toUpperCase() : 'E'}
                </Text>
              </View>
            </View>

            {/* Profile body matching .profile-body */}
            <View style={[styles.profileBody, isMobile && styles.profileBodyMobile]}>
              <Text style={styles.profileName}>{emp.firstname} {emp.lastname}</Text>
              <Text style={styles.profileDesignation}>{cd.designation || 'Not assigned'}</Text>

              {/* Personal Information matching .section-title + .info-box */}
              <Text style={styles.infoSectionTitle}>Personal Information</Text>
              <View style={styles.infoBox}>
                <View style={styles.infoItem}>
                  <Ionicons name="mail" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{emp.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="call" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{emp.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{emp.city || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{emp.dateOfBirth || 'N/A'}</Text>
                </View>
              </View>

              {/* Bank Information matching .bank-title + .bank-info */}
              <Text style={styles.bankSectionTitle}>Bank Information</Text>
              <View style={styles.bankInfoBox}>
                <Text style={styles.bankItem}>
                  <Text style={styles.bankLabel}>Bank Name:</Text> {bd.bankName || 'N/A'}
                </Text>
                <Text style={styles.bankItem}>
                  <Text style={styles.bankLabel}>Account Number:</Text> {bd.accNumber || 'N/A'}
                </Text>
                <Text style={styles.bankItem}>
                  <Text style={styles.bankLabel}>IFSC Code:</Text> {bd.ifscCode || 'N/A'}
                </Text>
                <Text style={styles.bankItem}>
                  <Text style={styles.bankLabel}>Pan Card Number:</Text> {bd.panCard || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  scrollContent: { padding: 16 },

  /* ── Page title ── */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },

  /* ── Two-column row matching .row ── */
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  twoColRowStacked: {
    flexDirection: 'column',
  },

  /* ── Form Card — col-12 col-lg-8 ── */
  formCard: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  formCardFull: {
    width: '100%',
    flex: undefined,
  },
  cardBody: {
    padding: 20,
  },
  cardBodyMobile: {
    padding: 14,
  },

  /* ── Section headers matching <h5> ── */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  /* ── Field grid matching .row.g-3 ── */
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fieldCell: {
    width: '31%',
    marginBottom: 12,
  },
  fieldCellMobile: {
    width: '48%',
  },
  fieldCellNarrow: {
    width: '100%',
    marginBottom: 12,
  },
  /* .form-label */
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  /* input.form-control[readonly] */
  readonlyInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#f8f9fa',
  },
  fieldValue: {
    fontSize: 13,
    color: '#212529',
  },

  /* ── Action Buttons matching viewEmployeeDetails.html ── */
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionBtnRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  actionBtnFullWidth: {
    flex: undefined,
    width: '100%',
  },
  /* .btn-success */
  btnAddNew: {
    backgroundColor: '#23d2aa',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  /* .btn-primary */
  btnUpdate: {
    backgroundColor: '#0d6efd',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  /* .btn-danger */
  btnDelete: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  btnTextWhite: {
    color: '#ffffff',
    fontWeight: '600',
  },

  /* ── Profile Card — col col-lg-4 ── */
  profileCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    maxWidth: 400,
  },
  profileCardFull: {
    width: '100%',
    flex: undefined,
    maxWidth: undefined,
  },

  /* .profile-header — green header 90px */
  profileHeader: {
    backgroundColor: '#23d2aa',
    height: 90,
  },

  /* .profile-img — 90x90 circle centered, overlapping header */
  profileImgWrap: {
    alignItems: 'center',
    marginTop: -36,
  },
  profileImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d1fae5',
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImgText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10b981',
  },

  /* .profile-body */
  profileBody: {
    paddingTop: 16,
    paddingBottom: 25,
    paddingHorizontal: 25,
    textAlign: 'center',
  },
  profileBodyMobile: {
    paddingHorizontal: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 2,
  },
  profileDesignation: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* .section-title / .bank-title — orange color #ff5733 */
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff5733',
    textAlign: 'left',
    marginTop: 10,
    marginBottom: 8,
  },
  bankSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff5733',
    textAlign: 'left',
    marginTop: 14,
    marginBottom: 8,
  },

  /* .info-box */
  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
  },

  /* .bank-info */
  bankInfoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  bankItem: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  bankLabel: {
    fontWeight: '700',
    color: '#111111',
  },
});

export default ViewEmployeeDetailsScreen;
