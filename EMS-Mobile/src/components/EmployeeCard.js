import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/theme';
import { getStatusColor } from './StatusBadge';

const EmployeeCard = ({ employee, onPress, onDelete, onEdit }) => {
  const designation = employee.companyDetails?.designation || 'N/A';
  const activityStatus = employee.activityStatus || 'Idle';
  const overallStatus = employee.overallStatus || 'PENDING';
  const isActive = overallStatus === 'FULLY_APPROVED' && employee.companyDetails?.status === 'Active';
  const isPending = overallStatus !== 'FULLY_APPROVED';

  const getActivityBadgeColor = () => {
    return getStatusColor(activityStatus);
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

  return (
    <View style={styles.card}>
      {/* Edit Icon top-right matching .edit-icn in profile.css */}
      {onEdit && (
        <TouchableOpacity style={styles.editIcon} onPress={onEdit} activeOpacity={0.7}>
          <Ionicons name="pencil" size={15} color="#666666" />
        </TouchableOpacity>
      )}

      {/* Avatar + Name + Designation row */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          {employee.profileImageSrc && employee.profileImageSrc !== '/images/default-avatar.png' ? (
            <Image source={{ uri: employee.profileImageSrc }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {employee.firstname ? employee.firstname[0].toUpperCase() : 'E'}
              </Text>
            </View>
          )}
          {overallStatus === 'FULLY_APPROVED' && (
            <View style={[styles.activityDot, { backgroundColor: getActivityBadgeColor() }]} />
          )}
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {employee.firstname} {employee.lastname}
          </Text>
          <Text style={styles.designation} numberOfLines={1}>
            {designation}
          </Text>
        </View>
      </View>

      {/* Status badge matching profile.css .status */}
      <View style={styles.statusRow}>
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
            {isPending ? 'Pending Onboarding' : employee.companyDetails?.status || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Card body section matching web .emp-cardBody */}
      <View style={styles.cardBody}>
        {/* Hired Date */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hired Date</Text>
          <Text style={styles.infoValue}>{formatDate(employee.companyDetails?.joiningDate)}</Text>
        </View>

        {/* Email */}
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={14} color="#64748B" />
          <Text style={styles.infoValueSm} numberOfLines={1}>
            {' '}{employee.email}
          </Text>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={14} color="#64748B" />
          <Text style={styles.infoValueSm}>
            {' '}{employee.phone || 'N/A'}
          </Text>
        </View>

        {/* Actions Row */}
        <View style={styles.bottomActions}>
          {onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={17} color="#DC2626" />
            </TouchableOpacity>
          )}

          {/* View More button matching .view-btn in profile.css */}
          <TouchableOpacity style={styles.viewMoreBtn} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7fdfb', // Matching .emp-card in profile.css
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    position: 'relative',
    ...SHADOWS.card,
  },
  editIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 2,
  },
  topRow: {
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
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#23d2aa',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  activityDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  designation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusRow: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5, // Matching profile.css .status border-radius: 5px
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    backgroundColor: '#ffffff', // Matching .emp-cardBody in profile.css
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
  },
  infoValueSm: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  viewMoreBtn: {
    backgroundColor: '#FF7423', // Matching .view-btn in profile.css
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 7,
    marginLeft: 8,
  },
  viewMoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
    marginRight: 'auto',
  },
});

export default EmployeeCard;
