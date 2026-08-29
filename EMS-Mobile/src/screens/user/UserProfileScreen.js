import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import apiClient from '../../api/apiClient';

const UserProfileScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const isDesktop = width >= 992;
  const { user } = useContext(AuthContext);
  const [empData, setEmpData] = useState(user || {});

  useEffect(() => {
    if (user?.id) fetchLiveProfile();
  }, [user]);

  const fetchLiveProfile = async () => {
    try {
      const res = await apiClient.get(`/api/employees/${user.id}`);
      if (res.data) setEmpData(res.data);
    } catch (e) {}
  };

  const cd = empData.companyDetails || {};
  const bd = empData.bankDetails || {};

  const renderField = (label, value) => (
    <View style={[styles.fieldCell, isMobile && styles.fieldCellMobile]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.readonlyInput}>
        <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf userProfile.html - empty navbar */}
      <AppHeader
        title=""
        onMenuPress={() => navigation.openDrawer && navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page title matching <h3 class="fw-bold">Profile</h3> */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>

        {/* Two-column row matching .row */}
        <View style={[styles.twoColRow, !isDesktop && styles.twoColRowStacked]}>
          {/* LEFT: Form Card — col col-lg-8 */}
          <View style={[styles.formCard, !isDesktop && styles.formCardFull]}>
            <View style={styles.cardBody}>
              {/* Basic Details */}
              <Text style={styles.sectionTitle}>Basic Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('First Name', empData.firstname)}
                {renderField('Last Name', empData.lastname)}
                {renderField('Gender', empData.gender)}
                {renderField('Date of Birth', empData.dateOfBirth)}
                {renderField('Email', empData.email)}
                {renderField('Phone', empData.phone)}
                {renderField('Address', empData.address)}
                {renderField('City', empData.city)}
                {renderField('Blood Group', empData.blood)}
                {renderField('Emergency Number', empData.emergencyNumber)}
                {renderField('Languages Known', empData.language)}
                {renderField('Marital Status', empData.maritalStatus)}
              </View>

              {/* Company Details */}
              <Text style={styles.sectionTitle}>Company Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('Employee Email', cd.employeeEmail)}
                {renderField('Designation', cd.designation)}
                {renderField('Shift Timing', cd.shiftTiming)}
                {renderField('Joining Date', cd.joiningDate)}
                {renderField('Leaving Date', cd.leavingDate)}
                {renderField('Status', cd.status)}
              </View>

              {/* Bank Details */}
              <Text style={styles.sectionTitle}>Bank Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('Account Holder Name', bd.accHolderName)}
                {renderField('Branch Name', bd.branchName)}
                {renderField('Bank Name', bd.bankName)}
                {renderField('Account Number', bd.accNumber)}
                {renderField('IFSC Code', bd.ifscCode)}
                {renderField('PAN Card Number', bd.panCard)}
              </View>

              {/* User Details */}
              <Text style={styles.sectionTitle}>User Details</Text>
              <View style={styles.fieldGrid}>
                {renderField('Role', empData.userType === 'ROLE_USER' ? 'Employee' : empData.userType === 'ROLE_ADMIN' ? 'Administrator' : empData.userType)}
                {renderField('Username', empData.username)}
              </View>
            </View>
          </View>

          {/* RIGHT: Profile Card — col col-lg-4 */}
          <View style={[styles.profileCard, !isDesktop && styles.profileCardFull]}>
            {/* Green header matching .profile-header */}
            <View style={styles.profileHeader} />

            {/* Profile image matching .profile-img (90x90 circle centered) */}
            <View style={styles.profileImgWrap}>
              <View style={styles.profileImg}>
                <Text style={styles.profileImgText}>
                  {empData.firstname ? empData.firstname[0].toUpperCase() : 'E'}
                </Text>
              </View>
            </View>

            {/* Profile body matching .profile-body */}
            <View style={styles.profileBody}>
              <Text style={styles.profileName}>{empData.firstname} {empData.lastname}</Text>
              <Text style={styles.profileDesignation}>{cd.designation || 'N/A'}</Text>

              {/* Personal Information matching .section-title + .info-box */}
              <Text style={styles.infoSectionTitle}>Personal Information</Text>
              <View style={styles.infoBox}>
                <View style={styles.infoItem}>
                  <Ionicons name="mail" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{empData.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="call" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{empData.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{empData.city || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={16} color="#23d2aa" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{empData.dateOfBirth || 'N/A'}</Text>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111111' },

  // Two-column row matching .row
  twoColRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  twoColRowStacked: { flexDirection: 'column' },

  // Form Card — col col-lg-8
  formCard: {
    flex: 2, backgroundColor: '#ffffff', borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2, marginBottom: 16,
  },
  formCardFull: { width: '100%', flex: undefined },
  cardBody: { padding: 20 },

  // Section headers matching <h5>
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: '#111111',
    marginTop: 16, marginBottom: 12, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },

  // Field grid matching .row.g-3
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  fieldCell: { width: '31%', marginBottom: 12 },
  fieldCellMobile: { width: '48%' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#495057', marginBottom: 4 },
  readonlyInput: {
    borderWidth: 1, borderColor: '#ced4da', borderRadius: 5, padding: 8, backgroundColor: '#f8f9fa',
  },
  fieldValue: { fontSize: 13, color: '#212529' },

  // Profile Card — col col-lg-4
  profileCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3,
    overflow: 'hidden', position: 'relative', marginBottom: 16, maxWidth: 400,
  },
  profileCardFull: { width: '100%', flex: undefined, maxWidth: undefined },

  // .profile-header — green header 90px
  profileHeader: { backgroundColor: '#23d2aa', height: 90 },

  // .profile-img — 90x90 circle centered, overlapping header
  profileImgWrap: { alignItems: 'center', marginTop: -36 },
  profileImg: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#d1fae5',
    borderWidth: 4, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
  },
  profileImgText: { fontSize: 36, fontWeight: '700', color: '#10b981' },

  // .profile-body
  profileBody: { padding: 70, paddingTop: 16, paddingBottom: 25, paddingHorizontal: 25 },
  profileName: { fontSize: 18, fontWeight: '600', color: '#111111', textAlign: 'center', marginBottom: 2 },
  profileDesignation: { fontSize: 14, color: '#888888', textAlign: 'center', marginBottom: 20 },

  // .section-title / .bank-title
  infoSectionTitle: { fontSize: 15, fontWeight: '600', color: '#ff5733', marginTop: 10, marginBottom: 8 },
  bankSectionTitle: { fontSize: 15, fontWeight: '600', color: '#ff5733', marginTop: 14, marginBottom: 8 },

  // .info-box
  infoBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#eeeeee' },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoIcon: { marginRight: 10 },
  infoText: { fontSize: 14, color: '#333333' },

  // .bank-info
  bankInfoBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#eeeeee' },
  bankItem: { fontSize: 14, color: '#333333', marginBottom: 4 },
  bankLabel: { fontWeight: '700', color: '#111111' },
});

export default UserProfileScreen;
