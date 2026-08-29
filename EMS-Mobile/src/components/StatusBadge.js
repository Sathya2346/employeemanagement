import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const getStatusColor = (status) => {
  if (!status) return COLORS.statusIdle;
  const s = status.toLowerCase().trim();

  // Activity / Attendance
  if (s === 'working') return COLORS.statusWorking;
  if (s === 'present') return COLORS.statusPresent;
  if (s === 'break' || s === 'on break') return COLORS.statusBreak;
  if (s === 'meeting' || s === 'in meeting') return COLORS.statusMeeting;
  if (s === 'idle') return COLORS.statusIdle;
  if (s === 'leave' || s === 'on leave') return COLORS.statusLeave;
  if (s === 'absent') return COLORS.statusAbsent;
  if (s === 'partial') return COLORS.statusPartial;
  
  // Leave / Onboarding Status
  if (s === 'approved' || s === 'fully_approved') return COLORS.statusApproved;
  if (s === 'pending' || s === 'details_submitted' || s === 'changes_requested') return COLORS.statusPending;
  if (s === 'rejected') return COLORS.statusRejected;
  if (s === 'cancelled' || s === 'canceled') return COLORS.statusCancelled;

  return COLORS.statusIdle;
};

const formatStatusText = (status) => {
  if (!status) return 'N/A';
  if (status === 'FULLY_APPROVED') return 'Fully Approved';
  if (status === 'DETAILS_SUBMITTED') return 'Details Submitted';
  if (status === 'CHANGES_REQUESTED') return 'Changes Requested';
  return status.replace(/_/g, ' ');
};

export const ActivityDot = ({ status, size = 10, style }) => {
  const color = getStatusColor(status);
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const StatusBadge = ({ status, style, textStyle, showDot = false }) => {
  const bgColor = getStatusColor(status);
  const displayText = formatStatusText(status);

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      {showDot && <View style={[styles.inlineDot, { backgroundColor: '#ffffff' }]} />}
      <Text style={[styles.text, textStyle]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  inlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'capitalize',
  },
  dot: {
    marginRight: 6,
  },
});

export default StatusBadge;
