import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import CustomSelect from '../../components/CustomSelect';
import { onboardingApi } from '../../api/onboardingApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserOnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const { user } = useContext(AuthContext);

  const [overallStatus, setOverallStatus] = useState(user?.overallStatus || 'DETAILS_SUBMITTED');

  const [fieldStatuses, setFieldStatuses] = useState({
    phoneStatus: 'PENDING',
    emergencyStatus: 'PENDING',
    dobStatus: 'PENDING',
    genderStatus: 'PENDING',
    maritalFieldStatus: 'PENDING',
    languageStatus: 'PENDING',
    bloodStatus: 'PENDING',
    addressStatus: 'PENDING',
    cityStatus: 'PENDING',
    aadharStatus: 'PENDING',
    panStatus: 'PENDING',
    accountStatus: 'PENDING',
    bankNameStatus: 'PENDING',
    ifscStatus: 'PENDING',
    branchStatus: 'PENDING',
    photoStatus: 'PENDING',
    mark10thStatus: 'PENDING',
    mark12thStatus: 'PENDING',
    degreeNameStatus: 'PENDING',
    degreeInstStatus: 'PENDING',
    transferCertStatus: 'PENDING',
    provisionalCertStatus: 'PENDING',
    courseCompletionStatus: 'PENDING',
    sem1Status: 'PENDING', sem2Status: 'PENDING', sem3Status: 'PENDING', sem4Status: 'PENDING',
    sem5Status: 'PENDING', sem6Status: 'PENDING', sem7Status: 'PENDING', sem8Status: 'PENDING',
  });

  const [formData, setFormData] = useState({
    personalPhone: '9876543210',
    personalEmergencyNumber: '9123456789',
    personalDateOfBirth: '1998-07-20',
    personalGender: 'Male',
    personalMaritalStatus: 'Single',
    personalLanguage: 'English, Tamil',
    personalBloodGroup: 'O+',
    personalAddress: '123 Main Street',
    personalCity: 'Chennai',
    aadharNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    accountNumber: '501009876543',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    personalBranch: 'Anna Nagar',
    degreeName: 'B.E. Computer Science',
    degreeInstitution: 'Anna University',
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    aadhar: 'Aadhar_Card.pdf',
    pan: 'PAN_Card.pdf',
    photo: 'Profile_Photo.jpg',
    mark10th: '10th_Marksheet.pdf',
    mark12th: '12th_Marksheet.pdf',
    sem1: 'Sem1.pdf', sem2: 'Sem2.pdf', sem3: 'Sem3.pdf', sem4: 'Sem4.pdf',
    sem5: 'Sem5.pdf', sem6: 'Sem6.pdf', sem7: 'Sem7.pdf', sem8: 'Sem8.pdf',
    tc: 'Transfer_Cert.pdf',
    provisional: 'Provisional_Cert.pdf',
    completion: 'Course_Completion.pdf',
  });

  const [feedback, setFeedback] = useState(null);
  const isEditable = overallStatus === 'CHANGES_REQUESTED' || overallStatus === 'PENDING';

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docKey, docName) => {
    if (!isEditable) return;
    setUploadedFiles((prev) => ({ ...prev, [docKey]: `${docKey}_updated.pdf` }));
    setFeedback({ type: 'success', message: `${docName} updated successfully.` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append('employeeId', String(user?.id || ''));
      Object.entries(formData).forEach(([key, val]) => fd.append(key, val || ''));
      await onboardingApi.submit(fd);
      setOverallStatus('DETAILS_SUBMITTED');
      const updatedUser = { ...user, overallStatus: 'DETAILS_SUBMITTED' };
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setFeedback({ type: 'success', message: 'Your onboarding changes have been sent to HR for review.' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  // ── Field rendering helpers matching Thymeleaf .field-container ──

  const getFieldStyle = (statusKey) => {
    const status = fieldStatuses[statusKey] || 'PENDING';
    if (status === 'APPROVED') return styles.fieldApproved;
    if (status === 'REJECTED') return styles.fieldRejected;
    return styles.fieldPending;
  };

  const renderField = (label, fieldKey, statusKey, options = {}) => {
    const status = fieldStatuses[statusKey] || 'PENDING';
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';
    const rejectionReason = fieldStatuses[`${statusKey.replace('Status', 'RejectionReason')}`];

    return (
      <View style={[styles.fieldContainer, getFieldStyle(statusKey), options.style]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.textInput, isApproved && styles.textInputDisabled]}
          value={formData[fieldKey] || ''}
          onChangeText={(val) => handleInputChange(fieldKey, val)}
          editable={isEditable && !isApproved}
          placeholder={options.placeholder || ''}
          placeholderTextColor="#9ca3af"
          keyboardType={options.keyboardType || 'default'}
          multiline={options.multiline}
        />
        {options.hint && !isApproved && !isRejected && (
          <Text style={styles.hintPending}><Ionicons name="information-circle" size={12} color="#94a3b8" /> {options.hint}</Text>
        )}
        {isApproved && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
            <Text style={styles.verifiedText}> Verified</Text>
          </View>
        )}
        {isRejected && (
          <View style={styles.rejectedRow}>
            <Ionicons name="close-circle" size={14} color="#e74c3c" />
            <Text style={styles.rejectedText}> {rejectionReason || 'Invalid. Please re-upload.'}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderSelectField = (label, fieldKey, statusKey, options = []) => {
    const status = fieldStatuses[statusKey] || 'PENDING';
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';

    return (
      <View style={[styles.fieldContainer, getFieldStyle(statusKey)]}>
        <CustomSelect
          label={label}
          value={formData[fieldKey]}
          onValueChange={(val) => handleInputChange(fieldKey, val)}
          options={options.map(o => ({ value: o, label: o }))}
          placeholder="Select..."
          disabled={!isEditable || isApproved}
          statusStyle={isApproved ? 'approved' : isRejected ? 'rejected' : null}
          statusText={isRejected ? 'Invalid selection' : null}
        />
      </View>
    );
  };

  const renderFileUpload = (label, docKey, statusKey = null) => {
    const statusKeyUsed = statusKey || `${docKey}Status`;
    const status = fieldStatuses[statusKeyUsed] || 'PENDING';
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';
    const fileName = uploadedFiles[docKey];

    // On web, render a native <input type="file"> matching Thymeleaf exactly
    if (Platform.OS === 'web') {
      const isPhoto = docKey === 'photo';
      const accept = isPhoto ? 'image/*' : 'application/pdf';

      return (
        <View style={[styles.fieldContainer, getFieldStyle(statusKeyUsed), { alignItems: 'center' }]}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <input
            type="file"
            accept={accept}
            disabled={!isEditable}
            onChange={() => handleFileUpload(docKey, label)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: 8,
              border: '1px solid #dee2e6',
              fontSize: '14px',
              fontFamily: 'Segoe UI, sans-serif',
              color: '#2c3e50',
              backgroundColor: !isEditable ? '#f8fafc' : '#fff',
              boxSizing: 'border-box',
            }}
          />
          {isApproved && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
              <Text style={styles.verifiedText}> Verified</Text>
            </View>
          )}
          {isRejected && (
            <View style={styles.rejectedRow}>
              <Ionicons name="close-circle" size={14} color="#e74c3c" />
              <Text style={styles.rejectedText}> Rejected</Text>
            </View>
          )}
        </View>
      );
    }

    // Native fallback with TouchableOpacity
    return (
      <View style={[styles.fieldContainer, getFieldStyle(statusKeyUsed), { alignItems: 'center' }]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fileInputWrapper}>
          <Ionicons name={fileName ? 'document-text' : 'cloud-upload-outline'} size={20} color="#3a7bd5" />
          <TouchableOpacity
            onPress={() => handleFileUpload(docKey, label)}
            disabled={!isEditable}
          >
            <Text style={styles.fileInputText}>
              {fileName || 'Choose file'}
            </Text>
          </TouchableOpacity>
        </View>
        {isApproved && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={14} color="#2ecc71" />
            <Text style={styles.verifiedText}> Verified</Text>
          </View>
        )}
        {isRejected && (
          <View style={styles.rejectedRow}>
            <Ionicons name="close-circle" size={14} color="#e74c3c" />
              <Text style={styles.rejectedText}> Rejected</Text>
          </View>
        )}
      </View>
    );
  };

  const renderSemUpload = (num) => {
    const statusKey = `sem${num}Status`;
    const status = fieldStatuses[statusKey] || 'PENDING';
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';

    if (Platform.OS === 'web') {
      return (
        <View key={num} style={[styles.semItem, getFieldStyle(statusKey)]}>
          <Text style={styles.semLabel}>Sem {num}</Text>
          <input
            type="file"
            accept="application/pdf"
            disabled={!isEditable}
            onChange={() => handleFileUpload(`sem${num}`, `Sem ${num}`)}
            style={{ width: '100%', padding: '4px', fontSize: '12px', fontFamily: 'Segoe UI, sans-serif', boxSizing: 'border-box' }}
          />
          {isRejected && <Text style={styles.semRejected}>X REJECTED</Text>}
        </View>
      );
    }

    return (
      <View key={num} style={[styles.semItem, getFieldStyle(statusKey)]}>
        <Text style={styles.semLabel}>Sem {num}</Text>
        <TouchableOpacity
          style={styles.fileInputSmall}
          onPress={() => handleFileUpload(`sem${num}`, `Sem ${num}`)}
          disabled={!isEditable}
        >
          <Ionicons name="document-outline" size={14} color="#3a7bd5" />
          <Text style={styles.semFileText} numberOfLines={1}>
            {uploadedFiles[`sem${num}`] || 'Upload'}
          </Text>
        </TouchableOpacity>
        {isRejected && <Text style={styles.semRejected}>X REJECTED</Text>}
      </View>
    );
  };

  // ── Section header matching Thymeleaf .section-header ──

  const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#23d2aa" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Feedback banner */}
        {feedback && (
          <View style={[styles.feedbackBanner, feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
            <Ionicons
              name={feedback.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
              size={18}
              color={feedback.type === 'error' ? '#DC2626' : '#16A34A'}
            />
            <Text style={[styles.feedbackText, { color: feedback.type === 'error' ? '#DC2626' : '#16A34A', marginLeft: 8, flex: 1, fontSize: 13 }]}>
              {feedback.message}
            </Text>
            <TouchableOpacity onPress={() => setFeedback(null)}>
              <Ionicons name="close" size={16} color={feedback.type === 'error' ? '#DC2626' : '#16A34A'} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Main onboarding card matching .onboarding-card ── */}
        <View style={styles.onboardingCard}>
          {/* Card header matching .card-header with d-none d-md-block on badge */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>Onboarding Journey</Text>
              <Text style={styles.cardHeaderSub}>Complete your profile to join our elite team.</Text>
            </View>
            {width >= 768 && (
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>ID: {user?.id || '101'}</Text>
              </View>
            )}
          </View>

          {/* Card body matching .card-body */}
          <View style={styles.cardBody}>
            {/* Status alerts */}
            {overallStatus === 'FULLY_APPROVED' && (
              <View style={[styles.alertCard, styles.alertSuccess]}>
                <Ionicons name="checkmark-circle" size={36} color="#2ecc71" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.alertTitle, { color: '#15803d' }]}>Verification Complete!</Text>
                  <Text style={styles.alertDesc}>Welcome aboard! Your documents have been successfully verified.</Text>
                  <TouchableOpacity style={styles.alertBtnSuccess} onPress={() => navigation.navigate('UserDashboard')}>
                    <Text style={styles.alertBtnSuccessText}>Go to Dashboard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {overallStatus === 'DETAILS_SUBMITTED' && (
              <View style={[styles.alertCard, styles.alertInfo]}>
                <Ionicons name="time" size={32} color="#0284c7" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.alertTitle, { color: '#0369a1' }]}>Under Review</Text>
                  <Text style={styles.alertDesc}>Our HR team is currently verifying your details. This usually takes 24-48 hours.</Text>
                </View>
              </View>
            )}

            {overallStatus === 'CHANGES_REQUESTED' && (
              <View style={[styles.alertCard, styles.alertWarning]}>
                <Ionicons name="alert-circle" size={32} color="#d97706" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.alertTitle, { color: '#b45309' }]}>Attention Required</Text>
                  <Text style={styles.alertDesc}>Some information needs your attention. Please check the highlighted sections below.</Text>
                </View>
              </View>
            )}

            {/* ═══ 1. PERSONAL INFORMATION ═══ */}
            <SectionHeader icon="id-card-outline" title="1. Personal Profile" />

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol3}>{renderField('Primary Phone', 'personalPhone', 'phoneStatus', { placeholder: '10-digit number', keyboardType: 'phone-pad', hint: '10 digits required' })}</View>
              <View style={styles.fieldCol3}>{renderField('Emergency Contact', 'personalEmergencyNumber', 'emergencyStatus', { placeholder: 'Alternative Number', keyboardType: 'phone-pad', hint: 'Different from primary' })}</View>
              <View style={styles.fieldCol3}>{renderField('Date of Birth', 'personalDateOfBirth', 'dobStatus', { placeholder: 'YYYY-MM-DD', hint: 'Min 18 years old' })}</View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol4}>{renderSelectField('Gender', 'personalGender', 'genderStatus', ['Male', 'Female', 'Other'])}</View>
              <View style={styles.fieldCol4}>{renderSelectField('Marital Status', 'personalMaritalStatus', 'maritalFieldStatus', ['Single', 'Married'])}</View>
              <View style={styles.fieldCol4}>{renderField('Languages', 'personalLanguage', 'languageStatus', { placeholder: 'e.g. English, Hindi' })}</View>
              <View style={styles.fieldCol4}>{renderField('Blood Group', 'personalBloodGroup', 'bloodStatus', { placeholder: 'e.g. O+' })}</View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol8}>{renderField('Full Address (As per Aadhar)', 'personalAddress', 'addressStatus', { placeholder: 'Street, Building, Area' })}</View>
              <View style={styles.fieldCol4}>{renderField('City', 'personalCity', 'cityStatus')}</View>
            </View>

            {/* ═══ 2. IDENTITY DOCUMENTS ═══ */}
            <SectionHeader icon="shield-checkmark-outline" title="2. Official Documents" />

            <View style={styles.fieldRow}>
              <View style={styles.fieldColHalf}>
                <View style={[styles.fieldContainer, getFieldStyle('aadharStatus')]}>
                  <Text style={styles.fieldLabel}>Aadhar Number & Card Copy <Text style={{ color: '#94a3b8', fontWeight: '400' }}>(PDF only)</Text></Text>
                  <TextInput
                    style={[styles.textInput, { width: '100%' }]}
                    value={formData.aadharNumber}
                    onChangeText={(v) => handleInputChange('aadharNumber', v)}
                    editable={isEditable && fieldStatuses.aadharStatus !== 'APPROVED'}
                    placeholder="12-digit UID"
                    keyboardType="numeric"
                  />
                  {Platform.OS === 'web' ? (
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={!isEditable || fieldStatuses.aadharStatus === 'APPROVED'}
                      onChange={() => handleFileUpload('aadhar', 'Aadhar Card')}
                      style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #dee2e6', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', boxSizing: 'border-box', marginTop: 8 }}
                    />
                  ) : (
                    <TouchableOpacity style={styles.fileBtn} onPress={() => handleFileUpload('aadhar', 'Aadhar Card')}>
                      <Ionicons name="document-attach-outline" size={16} color="#3a7bd5" />
                      <Text style={styles.fileBtnText}>{uploadedFiles.aadhar || 'Upload'}</Text>
                    </TouchableOpacity>
                  )}
                  {fieldStatuses.aadharStatus !== 'APPROVED' && fieldStatuses.aadharStatus !== 'REJECTED' && (
                    <Text style={styles.hintPending}><Ionicons name="information-circle" size={12} color="#94a3b8" /> Numbers only</Text>
                  )}
                  {fieldStatuses.aadharStatus === 'APPROVED' && <View style={styles.verifiedRow}><Ionicons name="checkmark-circle" size={14} color="#2ecc71" /><Text style={styles.verifiedText}> Verified</Text></View>}
                  {fieldStatuses.aadharStatus === 'REJECTED' && (
                    <View style={styles.rejectedRow}><Ionicons name="close-circle" size={14} color="#e74c3c" /><Text style={styles.rejectedText}> {fieldStatuses.aadharRejectionReason || 'Incorrect number/document'}</Text></View>
                  )}
                </View>
              </View>

              <View style={styles.fieldColHalf}>
                <View style={[styles.fieldContainer, getFieldStyle('panStatus')]}>
                  <Text style={styles.fieldLabel}>PAN Number & Card Copy <Text style={{ color: '#94a3b8', fontWeight: '400' }}>(PDF only)</Text></Text>
                  <TextInput
                    style={[styles.textInput, { width: '100%' }]}
                    value={formData.panNumber}
                    onChangeText={(v) => handleInputChange('panNumber', v.toUpperCase())}
                    editable={isEditable && fieldStatuses.panStatus !== 'APPROVED'}
                    placeholder="ABCDE1234F"
                    autoCapitalize="characters"
                  />
                  {Platform.OS === 'web' ? (
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={!isEditable || fieldStatuses.panStatus === 'APPROVED'}
                      onChange={() => handleFileUpload('pan', 'PAN Card')}
                      style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #dee2e6', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif', boxSizing: 'border-box', marginTop: 8 }}
                    />
                  ) : (
                    <TouchableOpacity style={styles.fileBtn} onPress={() => handleFileUpload('pan', 'PAN Card')}>
                      <Ionicons name="document-attach-outline" size={16} color="#3a7bd5" />
                      <Text style={styles.fileBtnText}>{uploadedFiles.pan || 'Upload'}</Text>
                    </TouchableOpacity>
                  )}
                  {fieldStatuses.panStatus !== 'APPROVED' && fieldStatuses.panStatus !== 'REJECTED' && (
                    <Text style={styles.hintPending}><Ionicons name="information-circle" size={12} color="#94a3b8" /> Standard format</Text>
                  )}
                  {fieldStatuses.panStatus === 'APPROVED' && <View style={styles.verifiedRow}><Ionicons name="checkmark-circle" size={14} color="#2ecc71" /><Text style={styles.verifiedText}> Verified</Text></View>}
                  {fieldStatuses.panStatus === 'REJECTED' && <View style={styles.rejectedRow}><Ionicons name="close-circle" size={14} color="#e74c3c" /><Text style={styles.rejectedText}> Invalid PAN data</Text></View>}
                </View>
              </View>
            </View>

            {/* ═══ 3. BANKING DETAILS ═══ */}
            <SectionHeader icon="cash-outline" title="3. Financial Details" />

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol3}>{renderField('Account Number', 'accountNumber', 'accountStatus', { placeholder: 'Bank Account No.', keyboardType: 'numeric', hint: '9-18 digits' })}</View>
              <View style={styles.fieldCol3}>{renderField('Bank Name', 'bankName', 'bankNameStatus', { placeholder: 'Full Bank Name' })}</View>
              <View style={styles.fieldCol3}>{renderField('IFSC Code', 'ifscCode', 'ifscStatus', { placeholder: 'SBIN0001234', hint: '11 characters' })}</View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol4}>{renderField('Branch Name', 'personalBranch', 'branchStatus', { placeholder: 'Branch Location' })}</View>
            </View>

            {/* ═══ 4. EDUCATION & PHOTOS ═══ */}
            <SectionHeader icon="school-outline" title="4. Education & Documents" />

            <View style={styles.fieldRow}>
              <View style={styles.fieldCol3}>{renderFileUpload('Profile Photo', 'photo', 'photoStatus')}</View>
              <View style={styles.fieldCol3}>{renderFileUpload('10th Marksheet (PDF)', 'mark10th', 'mark10thStatus')}</View>
              <View style={styles.fieldCol3}>{renderFileUpload('12th Marksheet (PDF)', 'mark12th', 'mark12thStatus')}</View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldColHalf}>{renderField('Highest Qualification', 'degreeName', 'degreeNameStatus', { placeholder: 'e.g. B.Tech Computer Science' })}</View>
              <View style={styles.fieldColHalf}>{renderField('University/College', 'degreeInstitution', 'degreeInstStatus')}</View>
            </View>

            {/* Semester Marksheets */}
            <Text style={styles.subTitle}>Semester Marksheets (Sem 1 - 8)</Text>
            <View style={styles.semGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(renderSemUpload)}
            </View>

            {/* Certificates */}
            <Text style={[styles.subTitle, { marginTop: 16 }]}>Certificates</Text>
            <View style={styles.fieldRow}>
              <View style={styles.fieldCol3}>{renderFileUpload('Transfer Cert. (PDF)', 'tc', 'transferCertStatus')}</View>
              <View style={styles.fieldCol3}>{renderFileUpload('Provisional Cert. (PDF)', 'provisional', 'provisionalCertStatus')}</View>
              <View style={styles.fieldCol3}>{renderFileUpload('Course Completion (PDF)', 'completion', 'courseCompletionStatus')}</View>
            </View>

            {/* Submit button */}
            {isEditable && (
              <View style={styles.submitSection}>
                <CustomButton
                  title="Submit Onboarding Details"
                  onPress={handleSubmit}
                  style={styles.submitBtn}
                />
                <Text style={styles.submitHint}><Ionicons name="information-circle" size={12} color="#94a3b8" /> Double check all information before submission.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ═══ Styles matching Thymeleaf onboardingForm.html ═══

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f8' },
  scrollContent: { padding: 16, paddingBottom: 60 },

  // Feedback
  feedbackBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1 },
  feedbackError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  feedbackSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },

  // Onboarding card matching .onboarding-card
  onboardingCard: { borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.05, shadowRadius: 30, elevation: 6 },

  // Card header matching .card-header — mobile padding: 1.5rem = 24px
  cardHeader: { backgroundColor: '#23d2aa', padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  cardHeaderSub: { fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  idBadge: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  idBadgeText: { fontSize: 13, fontWeight: '700', color: '#23d2aa' },

  // Card body matching .card-body — mobile: p-4 = 16px
  cardBody: { padding: 16 },

  // Alerts matching .alert
  alertCard: { flexDirection: 'row', padding: 16, borderRadius: 14, marginBottom: 16, alignItems: 'flex-start' },
  alertSuccess: { backgroundColor: '#f0fff4', borderWidth: 1, borderColor: '#bbf7d0' },
  alertInfo: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd' },
  alertWarning: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a' },
  alertTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  alertDesc: { fontSize: 13, color: '#475569', lineHeight: 20 },
  alertBtnSuccess: { backgroundColor: '#2ecc71', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 10 },
  alertBtnSuccessText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Section headers matching .section-header — margin-top:2.5rem(40px) margin-bottom:1.5rem(24px) font-size:1.15rem(18px)
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#23d2aa', paddingLeft: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#34495e', marginLeft: 12 },

  // Field rows — full width on mobile (col-md-* collapses <768px)
  fieldRow: { marginBottom: 8 },
  fieldCol3: { width: '100%', marginBottom: 16 },
  fieldCol4: { width: '100%', marginBottom: 16 },
  fieldCol8: { width: '100%', marginBottom: 16 },
  fieldColHalf: { width: '100%', marginBottom: 16 },

  // Field containers matching .field-container — padding:1rem(16px) margin-bottom:1.25rem(20px)
  fieldContainer: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20, backgroundColor: '#fff' },
  fieldPending: { borderColor: '#e2e8f0' },
  fieldApproved: { backgroundColor: '#f0fff4', borderColor: '#c6f6d5', opacity: 0.85 },
  fieldRejected: { backgroundColor: '#fff5f5', borderColor: '#fed7d7' },

  // .form-label — font-size:0.875rem(14px) font-weight:600 margin-bottom:0.5rem(8px)
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },

  // .form-control — border-radius:8px padding:0.65rem 1rem(10px 16px) font-size:14px
  textInput: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, color: '#2c3e50', backgroundColor: '#fff', width: '100%' },
  textInputDisabled: { backgroundColor: '#f8fafc', color: '#94a3b8' },

  // .validation-suggestion — font-size:0.75rem(12px)
  hintPending: { fontSize: 12, color: '#94a3b8', marginTop: 6 },

  // .approved-check — font-size:small(13px) font-weight:600
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  verifiedText: { fontSize: 13, fontWeight: '600', color: '#2ecc71' },

  // .rejection-text — font-size:0.85rem(14px) margin-top:0.75rem(12px) font-weight:600
  rejectedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(231,76,60,0.05)', padding: 8, borderRadius: 8, marginTop: 12 },
  rejectedText: { fontSize: 14, fontWeight: '600', color: '#e74c3c' },

  // Select field
  selectOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  selectPill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#dee2e6', backgroundColor: '#f8f9fa', marginRight: 8, marginBottom: 4 },
  selectPillActive: { borderColor: '#23d2aa', backgroundColor: '#e6faf5' },
  selectPillText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  selectPillTextActive: { color: '#23d2aa', fontWeight: '700' },

  // .file-input-wrapper — border:2px dashed padding:1rem(16px) border-radius:12px
  fileInputWrapper: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#f8fafc', alignItems: 'center' },
  fileInputText: { fontSize: 13, fontWeight: '600', color: '#3a7bd5', marginTop: 6 },

  inputGroupRow: { flexDirection: 'column', gap: 8 },
  fileBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, width: '100%' },
  fileBtnText: { fontSize: 12, color: '#3a7bd5', marginLeft: 6 },

  // Semester marksheets — h6.text-secondary font-size:0.875rem(14px)
  subTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginTop: 20, marginBottom: 12 },
  semGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  semItem: { width: '50%', padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  semLabel: { fontSize: 13, fontWeight: '700', color: '#2c3e50', marginBottom: 6 },
  fileInputSmall: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  semFileText: { fontSize: 11, color: '#3a7bd5', marginLeft: 4 },
  semRejected: { fontSize: 11, color: '#e74c3c', fontWeight: '700', marginTop: 4 },

  // .btn-primary-custom — border-radius:14px padding:1rem(16px) 3rem(48px) font-weight:700
  submitSection: { marginTop: 32, alignItems: 'center', marginBottom: 40 },
  submitBtn: { backgroundColor: '#23d2aa', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, width: '100%' },
  submitHint: { fontSize: 13, color: '#94a3b8', marginTop: 12 },
});

export default UserOnboardingScreen;
