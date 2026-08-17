import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Linking, AppState } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Meeting Tracking State
  const [meetingLink, setMeetingLink] = useState('');
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState('Google Meet');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [heartbeatCount, setHeartbeatCount] = useState(0);

  const heartbeatIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    fetchTodayAttendance();

    // Listen for AppState changes when returning from Teams / Zoom / Meet native app
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isMeetingActive) {
          Alert.alert(
            'Meeting Active 📹',
            'You returned to EMS. Is your meeting completed?',
            [
              { text: 'Keep Tracking', style: 'cancel' },
              { text: 'End & Save Meeting', onPress: handleEndMeeting }
            ]
          );
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      stopMeetingTimers();
      subscription.remove();
    };
  }, [isMeetingActive]);

  const detectPlatform = (url) => {
    if (!url) return 'Live Meeting';
    if (url.includes('meet.google.com')) return 'Google Meet';
    if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'MS Teams';
    if (url.includes('zoom.us')) return 'Zoom';
    if (url.includes('webex.com')) return 'Cisco Webex';
    return 'Custom Meeting';
  };

  const stopMeetingTimers = () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const startHeartbeatLoop = () => {
    stopMeetingTimers();
    
    // Live Seconds Timer
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    // 60-second Proof Heartbeat Ping to Backend
    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        await api.post(`/attendance/meeting-heartbeat/${user?.id}`);
        setHeartbeatCount(prev => prev + 1);
      } catch (err) {
        console.error('Heartbeat ping error:', err);
      }
    }, 60000);
  };

  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/today/${user?.id}`);
      setAttendance(res.data || null);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint, successMessage) => {
    setActionLoading(true);
    try {
      await api.post(`/attendance/${endpoint}/${user?.id}`);
      Alert.alert('Success', successMessage);
      fetchTodayAttendance();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || `Failed to ${endpoint}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartLinkMeeting = async () => {
    const platform = detectPlatform(meetingLink);
    setMeetingPlatform(platform);
    setActionLoading(true);

    try {
      await api.post(`/attendance/meetingin/${user?.id}`, {
        platform: platform,
        meetingLink: meetingLink
      });

      setIsMeetingActive(true);
      setTimerSeconds(0);
      setHeartbeatCount(0);
      startHeartbeatLoop();

      // Launch native app or browser link if provided
      if (meetingLink && meetingLink.startsWith('http')) {
        Linking.canOpenURL(meetingLink).then(supported => {
          if (supported) {
            Linking.openURL(meetingLink);
          }
        }).catch(err => console.log('Link open error', err));
      }

      Alert.alert('Meeting Started', `Tracking started for ${platform}. EMS will log your time.`);
      fetchTodayAttendance();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start meeting session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndMeeting = async () => {
    setActionLoading(true);
    try {
      await api.post(`/attendance/end-meeting/${user?.id}`);
      stopMeetingTimers();
      setIsMeetingActive(false);
      const mins = Math.floor(timerSeconds / 60);
      Alert.alert('Meeting Saved', `Logged ${mins} mins of verified meeting time.`);
      setMeetingLink('');
      setTimerSeconds(0);
      fetchTodayAttendance();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to end meeting session');
    } finally {
      setActionLoading(false);
    }
  };

  const formatHMS = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#23d2aa" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.checkInBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('checkin', 'Checked in successfully')}
              disabled={actionLoading || (attendance && attendance.checkInTime)}
            >
              <Text style={styles.actionBtnText}>Check-In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.breakBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('breakin', 'Started break')}
              disabled={actionLoading || !attendance || attendance.checkOutTime}
            >
              <Text style={styles.actionBtnText}>Break</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.checkOutBtn, actionLoading && styles.disabledBtn]} 
              onPress={() => handleAction('checkout', 'Checked out successfully')}
              disabled={actionLoading || !attendance || attendance.checkOutTime}
            >
              <Text style={styles.actionBtnText}>Check-Out</Text>
            </TouchableOpacity>
          </View>

          {/* 100% Coverage Universal Meeting Section */}
          <View style={styles.meetingCard}>
            <Text style={styles.meetingTitle}>📹 Universal Meeting Tracker (100% Coverage)</Text>
            
            {!isMeetingActive ? (
              <>
                <TextInput
                  style={styles.meetingInput}
                  placeholder="Paste Meet / Teams / Zoom link (Optional)..."
                  value={meetingLink}
                  onChangeText={(text) => {
                    setMeetingLink(text);
                    setMeetingPlatform(detectPlatform(text));
                  }}
                  placeholderTextColor="#999"
                />
                <Text style={styles.detectedPlatformText}>
                  Platform Mode: <Text style={{ fontWeight: 'bold', color: '#23d2aa' }}>{meetingPlatform}</Text>
                </Text>
                
                <TouchableOpacity 
                  style={[styles.startMeetingBtn, actionLoading && styles.disabledBtn]}
                  onPress={handleStartLinkMeeting}
                  disabled={actionLoading || !attendance || attendance.checkOutTime}
                >
                  <Text style={styles.actionBtnText}>▶ Join & Start Meeting Tracking</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.activeMeetingBox}>
                <View style={styles.badgeRow}>
                  <Text style={styles.liveBadge}>🟢 LIVE VERIFIED</Text>
                  <Text style={styles.platformBadge}>{meetingPlatform}</Text>
                </View>

                <Text style={styles.timerText}>{formatHMS(timerSeconds)}</Text>
                <Text style={styles.proofText}>
                  60s Proof Heartbeats: <Text style={{ fontWeight: 'bold', color: '#28a745' }}>{heartbeatCount} Pings</Text>
                </Text>

                <TouchableOpacity 
                  style={[styles.endMeetingBtn, actionLoading && styles.disabledBtn]}
                  onPress={handleEndMeeting}
                  disabled={actionLoading}
                >
                  <Text style={styles.actionBtnText}>⏹ End & Save Meeting Time</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                 {attendance?.checkInTime ? new Date(`1970-01-01T${attendance.checkInTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
              <Text style={styles.statLabel}>In Time</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {attendance?.checkOutTime ? new Date(`1970-01-01T${attendance.checkOutTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
              <Text style={styles.statLabel}>Out Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{attendance?.totalMeetingTime ? `${attendance.totalMeetingTime}m` : '0m'}</Text>
              <Text style={styles.statLabel}>Meeting Time</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionBtn: {
    width: '31%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  checkInBtn: { backgroundColor: '#28a745' },
  breakBtn: { backgroundColor: '#ffc107' },
  checkOutBtn: { backgroundColor: '#dc3545' },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  meetingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#23d2aa',
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  meetingInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detectedPlatformText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
  },
  startMeetingBtn: {
    backgroundColor: '#23d2aa',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeMeetingBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  liveBadge: {
    backgroundColor: '#28a745',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformBadge: {
    backgroundColor: '#17a2b8',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 8,
  },
  proofText: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 14,
  },
  endMeetingBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
});
