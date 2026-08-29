import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/theme';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' (#10b981), 'orange' (#FF7423), 'outline', 'danger', 'secondary'
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  let btnStyle = styles.primary;
  let txtStyle = styles.primaryText;

  if (variant === 'orange' || variant === 'download') {
    btnStyle = styles.orange;
    txtStyle = styles.orangeText;
  } else if (variant === 'outline') {
    btnStyle = styles.outline;
    txtStyle = styles.outlineText;
  } else if (variant === 'danger') {
    btnStyle = styles.danger;
    txtStyle = styles.dangerText;
  } else if (variant === 'secondary') {
    btnStyle = styles.secondary;
    txtStyle = styles.secondaryText;
  }

  const sizeStyle = size === 'small' ? styles.sizeSmall : size === 'large' ? styles.sizeLarge : styles.sizeMedium;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyle,
        btnStyle,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primaryDark : '#ffffff'} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={txtStyle.color} style={styles.icon} /> : null}
          <Text style={[styles.text, txtStyle, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 4,
  },
  sizeSmall: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: 6,
  },
  sizeMedium: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    minHeight: 46,
    borderRadius: 10,
  },
  sizeLarge: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    minHeight: 50,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: '#10b981', // Matching .btn-login & primary buttons
    ...SHADOWS.btn,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  orange: {
    backgroundColor: '#FF7423', // Matching .orangeBtn & .btn-download
    ...SHADOWS.orangeBtn,
  },
  orangeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  outlineText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 15,
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  dangerText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: '#64748B',
  },
  secondaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 7,
  },
});

export default CustomButton;
