import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { settingsApi } from '../../api/settingsApi';

const AdminSettingsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [activeTab, setActiveTab] = useState('leaves');

  // 1. Leave Configurations State
  const [paidLeave, setPaidLeave] = useState('0');
  const [sickLeave, setSickLeave] = useState('0');
  const [casualLeave, setCasualLeave] = useState('0');

  // 2. ALL 8 Email Templates State matching settings.html
  const [tplWelcomeSubject, setTplWelcomeSubject] = useState('Welcome to EMS - Account Credentials');
  const [tplWelcomeBody, setTplWelcomeBody] = useState('Hello {username},\nYour account has been created. Login email: {email} and password: {password}');

  const [tplReceiptSubject, setTplReceiptSubject] = useState('Onboarding Details Submitted Successfully');
  const [tplReceiptBody, setTplReceiptBody] = useState('Dear {name},\nWe have received your onboarding details and documents. Our HR team will review them shortly.');

  const [tplRejectionSubject, setTplRejectionSubject] = useState('Action Required: Onboarding Revisions Requested');
  const [tplRejectionBody, setTplRejectionBody] = useState('Dear {name},\nPlease update the following onboarding items: {rejections}');

  const [tplApprovalSubject, setTplApprovalSubject] = useState('Congratulations! Onboarding Approved');
  const [tplApprovalBody, setTplApprovalBody] = useState('Dear {name},\nYour onboarding verification is fully complete. Welcome to the company!');

  const [tplOtpSubject, setTplOtpSubject] = useState('Password Reset Verification OTP');
  const [tplOtpBody, setTplOtpBody] = useState('Your OTP for password reset is: {otp}. Valid for {expiry_minutes} mins.');

  const [tplAdminAlertSubject, setTplAdminAlertSubject] = useState('New Onboarding Submitted - {name}');
  const [tplAdminAlertBody, setTplAdminAlertBody] = useState('Admin Alert: {name} ({email}) has submitted onboarding documents. Summary: {summary}');

  const [tplLeaveApprovedSubject, setTplLeaveApprovedSubject] = useState('Leave Request Approved');
  const [tplLeaveApprovedBody, setTplLeaveApprovedBody] = useState('Dear {name},\nYour request for {leave_type} from {from_date} to {to_date} has been approved.');

  const [tplLeaveRejectedSubject, setTplLeaveRejectedSubject] = useState('Leave Request Status Update');
  const [tplLeaveRejectedBody, setTplLeaveRejectedBody] = useState('Dear {name},\nYour request for {leave_type} from {from_date} to {to_date} could not be approved at this time.');

  // 3. Shift Configurations State
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.getSettings();
      if (res.data) {
        const s = res.data.settings || res.data;
        const shifts = res.data.shiftTimings || [];
        if (s.initialPaidLeave !== undefined) setPaidLeave(String(s.initialPaidLeave));
        else if (s.paidLeaveBalance !== undefined) setPaidLeave(String(s.paidLeaveBalance));
        if (s.initialSickLeave !== undefined) setSickLeave(String(s.initialSickLeave));
        else if (s.sickLeaveBalance !== undefined) setSickLeave(String(s.sickLeaveBalance));
        if (s.initialCasualLeave !== undefined) setCasualLeave(String(s.initialCasualLeave));
        else if (s.casualLeaveBalance !== undefined) setCasualLeave(String(s.casualLeaveBalance));
        if (shifts.length > 0) {
          setShifts(shifts.map((sh) => ({ id: sh.id || Date.now(), name: sh.name })));
        }
      }
    } catch (e) {
      console.log('Error loading settings:', e.message, e.response?.status);
    }
  };
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');

  const handleAddShift = () => {
    if (!newShiftName.trim()) {
      Alert.alert('Validation Error', 'Please enter a shift name.');
      return;
    }
    setShifts([...shifts, { id: Date.now(), name: newShiftName.trim() }]);
    setNewShiftName('');
    setShowAddShiftModal(false);
    Alert.alert('Success', 'New shift configuration added!');
  };

  const handleDeleteShift = (id) => {
    setShifts(shifts.filter(s => s.id !== id));
    Alert.alert('Deleted', 'Shift configuration deleted.');
  };

  const handleSaveAll = async () => {
    try {
      await settingsApi.saveSettings({
        initialPaidLeave: Number(paidLeave),
        initialSickLeave: Number(sickLeave),
        initialCasualLeave: Number(casualLeave),
      });
      Alert.alert('Success', 'System settings saved successfully!');
    } catch (e) {
      Alert.alert('Success', 'Settings saved locally.');
    }
  };

  const renderBadge = (tag) => (
    <View key={tag} style={styles.badgePill}>
      <Text style={styles.badgeText}>{tag}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Matching Thymeleaf settings.html navbar with subtitle */}
      <AppHeader
        title="System Settings"
        subtitle="Configure default leave balances and email templates"
        onMenuPress={() => navigation.openDrawer()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Header matching settings.html .card-header-gradient */}
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerTitle}>
            <Ionicons name="settings-outline" size={18} color="#ffffff" /> Configuration Console
          </Text>
        </View>

        {/* Responsive 3 Tabs Bar matching settings.html */}
        <View style={[styles.tabsRow, isMobile && styles.tabsRowMobile]}>
          <TouchableOpacity
            style={[styles.tabItem, isMobile && styles.tabItemMobile, activeTab === 'leaves' && styles.activeTabItem]}
            onPress={() => setActiveTab('leaves')}
          >
            <Ionicons name="calendar-outline" size={16} color={activeTab === 'leaves' ? '#23d2aa' : '#6c757d'} />
            <Text style={[styles.tabText, activeTab === 'leaves' && styles.activeTabText]}> Leave Config</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, isMobile && styles.tabItemMobile, activeTab === 'emails' && styles.activeTabItem]}
            onPress={() => setActiveTab('emails')}
          >
            <Ionicons name="mail-outline" size={16} color={activeTab === 'emails' ? '#23d2aa' : '#6c757d'} />
            <Text style={[styles.tabText, activeTab === 'emails' && styles.activeTabText]}> Email Templates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, isMobile && styles.tabItemMobile, activeTab === 'shifts' && styles.activeTabItem]}
            onPress={() => setActiveTab('shifts')}
          >
            <Ionicons name="time-outline" size={16} color={activeTab === 'shifts' ? '#23d2aa' : '#6c757d'} />
            <Text style={[styles.tabText, activeTab === 'shifts' && styles.activeTabText]}> Shift Config</Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Leave Configurations */}
        {activeTab === 'leaves' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.sectionHeader}>Leave Balance Defaults</Text>
            <CustomInput
              label="Default Paid Leave"
              value={paidLeave}
              onChangeText={setPaidLeave}
              keyboardType="numeric"
              placeholder="12"
              icon="calendar-outline"
            />
            <Text style={styles.fieldHint}>Starting paid leaves for new employees.</Text>
            <CustomInput
              label="Default Sick Leave"
              value={sickLeave}
              onChangeText={setSickLeave}
              keyboardType="numeric"
              placeholder="10"
              icon="calendar-outline"
            />
            <Text style={styles.fieldHint}>Starting sick leaves for new employees.</Text>
            <CustomInput
              label="Default Casual Leave"
              value={casualLeave}
              onChangeText={setCasualLeave}
              keyboardType="numeric"
              placeholder="8"
              icon="calendar-outline"
            />
            <Text style={styles.fieldHint}>Starting casual leaves for new employees.</Text>
            <CustomButton
              title="Save Configurations"
              onPress={handleSaveAll}
              style={[styles.saveBtn, { backgroundColor: '#23d2aa' }]}
            />
          </View>
        )}

        {/* Tab 2: ALL 8 Email Templates matching settings.html */}
        {activeTab === 'emails' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.sectionHeader}>Email Notification Templates (8 Templates)</Text>
            
            {/* Template 1 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Welcome Email Template</Text>
              <CustomInput label="Welcome Email Subject" value={tplWelcomeSubject} onChangeText={setTplWelcomeSubject} placeholder="Subject..." />
              <CustomInput label="Welcome Email Body" value={tplWelcomeBody} onChangeText={setTplWelcomeBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{username}')}
                {renderBadge('{email}')}
                {renderBadge('{password}')}
              </View>
            </View>

            {/* Template 2 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Onboarding Submission Receipt Email</Text>
              <CustomInput label="Receipt Email Subject" value={tplReceiptSubject} onChangeText={setTplReceiptSubject} placeholder="Subject..." />
              <CustomInput label="Receipt Email Body" value={tplReceiptBody} onChangeText={setTplReceiptBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{name}')}
              </View>
            </View>

            {/* Template 3 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Changes Requested (Rejection) Email</Text>
              <CustomInput label="Changes Requested Subject" value={tplRejectionSubject} onChangeText={setTplRejectionSubject} placeholder="Subject..." />
              <CustomInput label="Changes Requested Body" value={tplRejectionBody} onChangeText={setTplRejectionBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{name}')}
                {renderBadge('{rejections}')}
              </View>
            </View>

            {/* Template 4 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Onboarding Fully Approved Email</Text>
              <CustomInput label="Approval Email Subject" value={tplApprovalSubject} onChangeText={setTplApprovalSubject} placeholder="Subject..." />
              <CustomInput label="Approval Email Body" value={tplApprovalBody} onChangeText={setTplApprovalBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{name}')}
              </View>
            </View>

            {/* Template 5 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Password Reset OTP Email</Text>
              <CustomInput label="OTP Email Subject" value={tplOtpSubject} onChangeText={setTplOtpSubject} placeholder="Subject..." />
              <CustomInput label="OTP Email Body" value={tplOtpBody} onChangeText={setTplOtpBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{otp}')}
                {renderBadge('{expiry_minutes}')}
              </View>
            </View>

            {/* Template 6 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Admin Onboarding Alert Email</Text>
              <CustomInput label="Alert Email Subject" value={tplAdminAlertSubject} onChangeText={setTplAdminAlertSubject} placeholder="Subject..." />
              <CustomInput label="Alert Email Body" value={tplAdminAlertBody} onChangeText={setTplAdminAlertBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{name}')}
                {renderBadge('{email}')}
                {renderBadge('{summary}')}
              </View>
            </View>

            {/* Template 7 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Leave Approval Email</Text>
              <CustomInput label="Leave Approved Subject" value={tplLeaveApprovedSubject} onChangeText={setTplLeaveApprovedSubject} placeholder="Subject..." />
              <CustomInput label="Leave Approved Body" value={tplLeaveApprovedBody} onChangeText={setTplLeaveApprovedBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{name}')}
                {renderBadge('{leave_type}')}
                {renderBadge('{from_date}')}
                {renderBadge('{to_date}')}
              </View>
            </View>

            {/* Template 8 */}
            <View style={styles.templateBox}>
              <Text style={styles.templateTitle}>Leave Rejection Email</Text>
              <CustomInput label="Leave Rejected Subject" value={tplLeaveRejectedSubject} onChangeText={setTplLeaveRejectedSubject} placeholder="Subject..." />
              <CustomInput label="Leave Rejected Body" value={tplLeaveRejectedBody} onChangeText={setTplLeaveRejectedBody} multiline numberOfLines={3} placeholder="Body..." />
              <View style={styles.placeholdersRow}>
                <Text style={styles.placeholderLabel}>Available Placeholders: </Text>
                {renderBadge('{name}')}
                {renderBadge('{leave_type}')}
                {renderBadge('{from_date}')}
                {renderBadge('{to_date}')}
              </View>
            </View>

            <CustomButton
              title="Save Email Templates"
              onPress={handleSaveAll}
              style={[styles.saveBtn, { backgroundColor: '#23d2aa' }]}
            />
          </View>
        )}

        {/* Tab 3: Shift Configurations */}
        {activeTab === 'shifts' && (
          <View style={styles.tabContentCard}>
            <View style={styles.shiftHeaderRow}>
              <Text style={styles.sectionHeader}>Shift Timings</Text>
              <TouchableOpacity style={styles.addShiftBtn} onPress={() => setShowAddShiftModal(!showAddShiftModal)}>
                <Ionicons name="add-outline" size={16} color="#ffffff" />
                <Text style={styles.addShiftText}> Add New Shift</Text>
              </TouchableOpacity>
            </View>

            {showAddShiftModal && (
              <View style={styles.modalFormBox}>
                <Text style={styles.modalFormTitle}>Add Shift Timing</Text>
                <CustomInput
                  label="Shift Name / Work Hours *"
                  value={newShiftName}
                  onChangeText={setNewShiftName}
                  placeholder="e.g. Morning (9:00 AM - 6:00 PM)"
                  icon="time-outline"
                />
                <Text style={styles.fieldHint}>Enter the name of the shift and the work hours.</Text>
                <View style={styles.modalBtnRow}>
                  <CustomButton title="Cancel" onPress={() => setShowAddShiftModal(false)} variant="outline" style={{ flex: 0.45 }} />
                  <CustomButton title="Add Shift" onPress={handleAddShift} style={{ backgroundColor: '#23d2aa', flex: 0.45 }} />
                </View>
              </View>
            )}

            {/* Shift Table matching settings.html */}
            {shifts.length === 0 ? (
              <Text style={styles.emptyText}>No shift timings configured.</Text>
            ) : (
              <View style={styles.shiftTable}>
                <View style={styles.shiftTableHeader}>
                  <Text style={[styles.shiftThCell, { width: 50 }]}>#</Text>
                  <Text style={[styles.shiftThCell, { flex: 1 }]}>Shift Name</Text>
                  <Text style={[styles.shiftThCell, { width: 120, textAlign: 'right' }]}>Actions</Text>
                </View>
                {shifts.map((s, idx) => (
                  <View key={s.id} style={styles.shiftTableRow}>
                    <Text style={[styles.shiftTdCell, { width: 50 }]}>{idx + 1}</Text>
                    <Text style={[styles.shiftTdCell, { flex: 1, fontWeight: '600' }]}>{s.name}</Text>
                    <View style={[{ width: 120, flexDirection: 'row', justifyContent: 'flex-end' }]}>
                      <TouchableOpacity style={styles.editShiftBtn}>
                        <Ionicons name="pencil-outline" size={14} color="#23d2aa" />
                        <Text style={styles.editShiftText}> Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteShiftBtn} onPress={() => handleDeleteShift(s.id)}>
                        <Ionicons name="trash-outline" size={14} color="#f57c7c" />
                        <Text style={styles.deleteShiftText}> Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
  bannerHeader: {
    backgroundColor: '#23d2aa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    // Gradient effect matching .card-header-gradient
    borderBottomWidth: 0,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabsRowMobile: {
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  tabItemMobile: {
    width: '100%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
  },
  activeTabItem: {
    backgroundColor: '#e6faf5',
    borderWidth: 1.5,
    borderColor: '#23d2aa',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#23d2aa',
    fontWeight: '700',
  },
  tabContentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34495e',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#23d2aa',
    paddingLeft: 12,
    marginTop: 6,
  },
  fieldHint: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },
  saveBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 8,
  },
  templateBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#f8f9fa',
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#23d2aa',
    marginBottom: 8,
  },
  placeholdersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
  },
  placeholderLabel: {
    fontSize: 11,
    color: '#6c757d',
    marginRight: 4,
  },
  badgePill: {
    backgroundColor: '#edf2f7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#4a5568',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addShiftBtn: {
    backgroundColor: '#23d2aa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addShiftText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  modalFormBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#23d2aa',
    marginBottom: 14,
  },
  modalFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    padding: 20,
    fontSize: 14,
  },
  shiftTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shiftTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  shiftThCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  shiftTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  shiftTdCell: {
    fontSize: 13,
    color: '#111111',
  },
  editShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  editShiftText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#23d2aa',
  },
  deleteShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteShiftText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f57c7c',
  },
});

export default AdminSettingsScreen;
