import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const AppHeader = ({ title, subtitle, showGreeting = false, onMenuPress, onNotificationPress, unreadCount = 0, onRightPress, rightIcon, showMenu = true, showBack = false }) => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const handleMenuPress = () => {
    if (onMenuPress) onMenuPress();
    else if (showBack) navigation.goBack();
    else navigation.dispatch(DrawerActions.openDrawer());
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View style={[styles.header, SHADOWS.navbar]}>
      <View style={styles.leftGroup}>
        {(showBack || showMenu) && (
          <TouchableOpacity style={styles.menuToggleBtn} onPress={handleMenuPress} activeOpacity={0.7}>
            <Ionicons name={showBack ? 'arrow-back-outline' : 'menu-outline'} size={22} color="#333333" />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {showGreeting ? <><Text style={styles.greetingTitle}>{getGreeting()}{user?.firstname ? `, ${user.firstname}` : ''}</Text><Text style={styles.dateText}>It’s {todayDate}</Text></> : <><Text style={styles.title} numberOfLines={1}>{title}</Text>{subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}</>}
        </View>
      </View>
      <View style={styles.actions}>
        {onNotificationPress && <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress} activeOpacity={0.7}><Ionicons name="notifications-outline" size={22} color="#333333" />{unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}</TouchableOpacity>}
        {rightIcon && onRightPress && <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.7}><Ionicons name={rightIcon} size={22} color="#333333" /></TouchableOpacity>}
        <View style={styles.avatarCircle}>
          {user?.profileImageSrc && user.profileImageSrc !== '/images/default-avatar.png' ? <Image source={{ uri: user.profileImageSrc }} style={styles.avatarImg} /> : <Text style={styles.avatarInitial}>{user?.firstname ? user.firstname[0].toUpperCase() : 'U'}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  leftGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  menuToggleBtn: { padding: 8, marginRight: 9, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  titleContainer: { justifyContent: 'center', flex: 1 },
  greetingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  dateText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 7, marginLeft: 6, position: 'relative' },
  badge: { position: 'absolute', top: 2, right: 2, backgroundColor: COLORS.badgeDanger, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, ...SHADOWS.badge },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginLeft: 10, borderWidth: 1.5, borderColor: COLORS.primary, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitial: { color: COLORS.primaryDark, fontSize: 15, fontWeight: '700' },
});

export default AppHeader;
