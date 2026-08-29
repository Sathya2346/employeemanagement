import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { employeeApi } from '../../api/employeeApi';

const AdminReviewOnboardingScreen = ({ route, navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const { employee } = route.params || {};
  const [emp, setEmp] = useState(employee || {});

  useEffect(() => {
    if (!employee && employee?.id) {
      (async () => {
        try {
          const res = await employeeApi.getById(employee.id);
          if (res.data) setEmp(res.data);
        } catch (e) {}
      })();
    }
  }, []);

  const [decisions, setDecisions] = useState({
    phoneStatus: 'APPROVED',
    emergencyStatus: 'APPROVED',
    dobStatus: 'APPROVED',
    genderStatus: 'APPROVED',
    maritalStatus: 'APPROVED',
    languageStatus: 'APPROVED',
    bloodStatus: 'APPROVED',
    addressStatus: 'APPROVED',
    aadharStatus: 'APPROVED',
    panStatus: 'APPROVED',
    accountStatus: 'APPROVED',
    bankNameStatus: 'APPROVED',
    ifscStatus: 'APPROVED',
    branchStatus: 'APPROVED',
    photoStatus: 'APPROVED',
    degreeNameStatus: 'APPROVED',
    degreeInstStatus: 'APPROVED',
    mark10thStatus: 'APPROVED',
    mark12thStatus: 'APPROVED',
    sem1Status: 'APPROVED',
    sem2Status: 'APPROVED',
    sem3Status: 'APPROVED',
    sem4Status: 'APPROVED',
    sem5Status: 'APPROVED',
    sem6Status: 'APPROVED',
    sem7Status: 'APPROVED',
    sem8Status: 'APPROVED',
    tcStatus: 'APPROVED',
    provisionalStatus: 'APPROVED',
    completionStatus: 'APPROVED',
  });

  const [reasons, setReasons] = useState({});

  const toggleDecision = (field, status) => {
    setDecisions((prev) => ({ ...prev, [field]: status }));
  };

  const handleReasonChange = (field, text) => {
    setReasons((prev) => ({ ...prev, [field]: text }));
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit HR Decision',
      `Submit onboarding evaluation decision for ${emp.firstname}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Submit',
          onPress: () => {
            Alert.alert('Success', 'HR decision submitted and employee notified!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderDecisionArea = (fieldKey, docLinkName) => {
    const isApproved = decisions[fieldKey] === 'APPROVED';
    const isRejected = decisions[fieldKey] === 'REJECTED';

    return (
      <View style={styles.decisionAreaBox}>
        {docLinkName ? (
          <TouchableOpacity style={styles.docBadgeBtn} onPress={() => Alert.alert('Download', `Downloading ${docLinkName}...`)}>
            <Ionicons name="download-outline" size={13} color="#0369a1" />
            <Text style={styles.docBadgeText}> View {docLinkName}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.radioGroupRow}>
          <TouchableOpacity style={styles.radioOption} onPress={() => toggleDecision(fieldKey, 'APPROVED')}>
            <View style={[styles.radioCircle, isApproved && styles.radioCircleApproved]}>
              {isApproved && <View style={styles.radioDotApproved} />}
            </View>
            <Text style={[styles.radioLabelText, isApproved && styles.textApproved]}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.radioOption, { marginLeft: 16 }]} onPress={() => toggleDecision(fieldKey, 'REJECTED')}>
            <View style={[styles.radioCircle, isRejected && styles.radioCircleRejected]}>
              {isRejected && <View style={styles.radioDotRejected} />}
            </View>
            <Text style={[styles.radioLabelText, isRejected && styles.textRejected]}>Reject</Text>
          </TouchableOpacity>
        </View>

        {isRejected && (
          <CustomInput
            placeholder="Specify rejection reason..."
            value={reasons[fieldKey] || ''}
            onChangeText={(text) => handleReasonChange(fieldKey, text)}
            style={{ marginTop: 8 }}
          />
        )}
      </View>
    );
  };

  const renderFieldBlock = (label, value, fieldKey, docLinkName, colWidth = '48%') => (
    <View style={[styles.fieldColBlock, { width: isMobile ? '100%' : colWidth }]}>
      <Text style={styles.fieldLabelText}>{label}</Text>
      <Text style={styles.fieldValueText}>{value || 'N/A'}</Text>
      {renderDecisionArea(fieldKey, docLinkName)}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Onboarding Review"
        subtitle={`Reviewing Submission: ${emp.firstname} ${emp.lastname}`}
        showMenu={false}
        onMenuPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitleText}>
          Reviewing Submission: <Text style={{ color: '#23d2aa' }}>{emp.firstname} {emp.lastname}</Text>
        </Text>

        {/* 1. PERSONAL DETAILS CARD */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderBanner}>
            <Ionicons name="id-card-outline" size={18} color="#ffffff" />
            <Text style={styles.cardHeaderTitleText}> 1. Personal Details</Text>
          </View>

          <View style={styles.cardBodyPadding}>
            {/* Phone & Emergency */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              {renderFieldBlock('Phone Number', emp.phone || 'N/A', 'phoneStatus')}
              {renderFieldBlock('Emergency Number', emp.emergencyNumber || 'N/A', 'emergencyStatus')}
            </View>

            {/* DOB & Gender */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              {renderFieldBlock('Date of Birth', emp.dateOfBirth || 'N/A', 'dobStatus')}
              {renderFieldBlock('Gender', emp.gender || 'N/A', 'genderStatus')}
            </View>

            {/* Marital, Language, Blood */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              {renderFieldBlock('Marital Status', emp.maritalStatus || 'N/A', 'maritalStatus', null, '31%')}
              {renderFieldBlock('Language', emp.language || 'N/A', 'languageStatus', null, '31%')}
              {renderFieldBlock('Blood Group', emp.blood || 'N/A', 'bloodStatus', null, '31%')}
            </View>

            {/* Address */}
            <View style={{ marginTop: 10 }}>
              <Text style={styles.fieldLabelText}>Address & City</Text>
              <Text style={styles.fieldValueText}>{emp.address || 'N/A'}{emp.city ? ', ' + emp.city : ''}</Text>
              {renderDecisionArea('addressStatus')}
            </View>
          </View>
        </View>

        {/* 2. IDENTITY & BANKING DOCUMENTS CARD */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderBanner}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
            <Text style={styles.cardHeaderTitleText}> 2. Identity & Banking Documents</Text>
          </View>

          <View style={styles.cardBodyPadding}>
            {/* Aadhar & PAN */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              {renderFieldBlock('Aadhar Number & Document', emp.employeeDetails?.aadharNumber || emp.onboardingDetails?.aadharNumber || 'N/A', 'aadharStatus', 'Aadhar Card')}
              {renderFieldBlock('PAN Card', emp.employeeDetails?.panCardNumber || emp.bankDetails?.panCard || 'N/A', 'panStatus', 'PAN Card')}
            </View>

            {/* Bank Account Details */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              {renderFieldBlock('Bank Account', emp.bankDetails?.accountNumber || 'N/A', 'accountStatus', null, '23%')}
              {renderFieldBlock('Bank Name', emp.bankDetails?.bankName || 'N/A', 'bankNameStatus', null, '23%')}
              {renderFieldBlock('IFSC Code', emp.bankDetails?.ifscCode || 'N/A', 'ifscStatus', null, '23%')}
              {renderFieldBlock('Bank Branch', emp.bankDetails?.branch || 'N/A', 'branchStatus', null, '23%')}
            </View>
          </View>
        </View>

        {/* 3. PHOTO & EDUCATIONAL DOCUMENTS CARD */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderBanner}>
            <Ionicons name="school-outline" size={18} color="#ffffff" />
            <Text style={styles.cardHeaderTitleText}> 3. Photo & Educational Documents</Text>
          </View>

          <View style={styles.cardBodyPadding}>
            {/* Photo & Degree Info */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              <View style={[styles.fieldColBlock, { width: isMobile ? '100%' : '30%', alignItems: 'center' }]}>
                <Text style={styles.fieldLabelText}>Profile Photo</Text>
                <View style={styles.photoBox}>
                  <Ionicons name="person" size={48} color="#23d2aa" />
                </View>
                {renderDecisionArea('photoStatus')}
              </View>

              <View style={[styles.fieldColBlock, { width: isMobile ? '100%' : '66%' }]}>
                <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
                  {renderFieldBlock('Highest Degree', emp.employeeDetails?.highestDegree || emp.onboardingDetails?.degreeName || 'N/A', 'degreeNameStatus', null, '48%')}
                  {renderFieldBlock('University/Institution', emp.employeeDetails?.institution || emp.onboardingDetails?.degreeInstitution || 'N/A', 'degreeInstStatus', null, '48%')}
                </View>
              </View>
            </View>

            {/* Marksheets (10th & 12th) */}
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile, { marginTop: 14 }]}>
              {renderFieldBlock('10th Marksheet', emp.employeeDetails?.mark10th || 'Not uploaded', 'mark10thStatus', '10th Marksheet')}
              {renderFieldBlock('12th Marksheet', emp.employeeDetails?.mark12th || 'Not uploaded', 'mark12thStatus', '12th Marksheet')}
            </View>

            {/* Semester Marksheets (Semesters 1-8 Grid) */}
            <Text style={styles.subHeaderTitleText}>Semester Marksheets</Text>
            <View style={styles.semGridContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
                const key = `sem${semNum}Status`;
                return (
                  <View key={semNum} style={[styles.semCardItem, isMobile && styles.semCardItemMobile]}>
                    <Text style={styles.semCardTitle}>Semester {semNum}</Text>
                    <TouchableOpacity style={styles.docBadgeBtn} onPress={() => Alert.alert('Download', `Downloading Sem ${semNum} PDF...`)}>
                      <Ionicons name="document-text-outline" size={12} color="#0369a1" />
                      <Text style={styles.docBadgeText}> View Sem {semNum}</Text>
                    </TouchableOpacity>
                    {renderDecisionArea(key)}
                  </View>
                );
              })}
            </View>

            {/* Degree & Completion Certificates */}
            <Text style={styles.subHeaderTitleText}>Degree & Completion Certificates</Text>
            <View style={[styles.fieldRow, isMobile && styles.fieldRowMobile]}>
              {renderFieldBlock('Transfer Certificate', emp.employeeDetails?.tcCert || 'Not uploaded', 'tcStatus', 'TC Certificate', '31%')}
              {renderFieldBlock('Provisional Cert.', emp.employeeDetails?.provisionalCert || 'Not uploaded', 'provisionalStatus', 'Provisional Cert', '31%')}
              {renderFieldBlock('Course Completion', emp.employeeDetails?.courseCompletionCert || 'Not uploaded', 'completionStatus', 'Course Completion', '31%')}
            </View>
          </View>
        </View>

        {/* Final HR Action Button matching reviewOnboarding.html */}
        <CustomButton
          title="Submit Final HR Decision"
          onPress={handleSubmit}
          style={[styles.submitFinalBtn, { backgroundColor: '#23d2aa' }]}
        />
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
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderBanner: {
    backgroundColor: '#23d2aa',
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardBodyPadding: {
    padding: 18,
  },
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  fieldRowMobile: {
    flexDirection: 'column',
  },
  fieldColBlock: {
    marginBottom: 12,
  },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  fieldValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  decisionAreaBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  docBadgeBtn: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  docBadgeText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '600',
  },
  radioGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioCircleApproved: {
    borderColor: '#16a34a',
  },
  radioCircleRejected: {
    borderColor: '#dc2626',
  },
  radioDotApproved: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  radioDotRejected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  radioLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  textApproved: {
    color: '#16a34a',
  },
  textRejected: {
    color: '#dc2626',
  },
  photoBox: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e6faf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 6,
  },
  subHeaderTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 18,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  semGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  semCardItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  semCardItemMobile: {
    width: '100%',
  },
  semCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  submitFinalBtn: {
    marginTop: 10,
    marginBottom: 30,
    height: 48,
    borderRadius: 8,
  },
});

export default AdminReviewOnboardingScreen;
