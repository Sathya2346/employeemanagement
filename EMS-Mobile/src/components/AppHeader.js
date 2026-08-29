import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const AppHeader = ({
  title,
  subtitle,
  showGreeting = false,
  onMenuPress,
  onNotificationPress,
  unreadCount = 0,
  onRightPress,
  rightIcon,
  showMenu = true,
  showBack = false,
}) => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else if (showBack) {
      navigation.goBack();
    } else {
      try {
        navigation.dispatch(DrawerActions.openDrawer());
      } catch (e) {
        if (navigation.openDrawer) {
          navigation.openDrawer();
        }
      }
    }
  };

  // Generate greeting based on time of day (matching dashboard.js)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[styles.header, SHADOWS.navbar]}>
      <View style={styles.leftGroup}>
        {showBack ? (
          <TouchableOpacity style={styles.menuToggleBtn} onPress={handleMenuPress} activeOpacity={0.7}>
            <Ionicons name="arrow-back-outline" size={22} color="#333333" />
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity style={styles.menuToggleBtn} onPress={handleMenuPress} activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={22} color="#333333" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          {showGreeting ? (
            <>
              <Text style={styles.greetingTitle}>
                {getGreeting()}{user?.firstname ? `, ${user.firstname}` : ''}
              </Text>
              <Text style={styles.dateText}>It’s {todayDate}</Text>
            </>
          ) : (
            <>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {onNotificationPress ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#333333" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}

        {rightIcon && onRightPress ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={22} color="#333333" />
          </TouchableOpacity>
        ) : null}

        {/* Navbar Avatar matching img2.png / profile avatar */}
        <View style={styles.avatarCircle}>
          {user?.profileImageSrc && user.profileImageSrc !== '/images/default-avatar.png' ? (
            <Image source={{ uri: user.profileImageSrc }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitial}>
              {user?.firstname ? user.firstname[0].toUpperCase() : 'U'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  menuToggleBtn: {
    padding: 7,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    fontFamily: 'System',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 7,
    marginLeft: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#dc3545', // Bootstrap danger red
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    ...SHADOWS.badge,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: '#23d2aa',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AppHeader;
