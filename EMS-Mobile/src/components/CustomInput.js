import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon,
  error,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  type,
  style,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const responsiveFontSize = style?.inputFontSize || 14;
  const responsivePadV = style?.inputPadV || 10;
  const responsivePadH = style?.inputPadH || 14;
  const containerStyle = style?.inputFontSize ? undefined : style;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      
      <View
        style={[
          styles.inputGroup,
          multiline && styles.multilineInputGroup,
          isFocused && styles.focusedInputGroup,
          error && styles.errorInputGroup,
          !editable && styles.disabledInputGroup,
        ]}
      >
        {icon ? (
          <View style={[styles.iconContainer, multiline && { marginTop: 6 }]}>
            <Ionicons name={icon} size={19} color={isFocused ? '#10b981' : '#10b981'} />
          </View>
        ) : null}

        {type === 'date' && Platform.OS === 'web' ? (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChangeText && onChangeText(e.target.value)}
            placeholder={placeholder}
            disabled={!editable}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: `${responsiveFontSize}px`,
              fontFamily: 'Segoe UI, sans-serif',
              color: '#111111',
              backgroundColor: 'transparent',
              height: '100%',
              paddingLeft: '12px',
              paddingRight: '12px',
              cursor: 'pointer',
            }}
          />
        ) : (
          <TextInput
            style={[
              styles.input,
              {
                fontSize: responsiveFontSize,
                paddingVertical: responsivePadV,
                paddingHorizontal: responsivePadH,
              },
              multiline && {
                minHeight: 70,
                textAlignVertical: 'top',
                paddingVertical: responsivePadV,
              },
            ]}
            value={value !== undefined && value !== null ? String(value) : ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            secureTextEntry={secureTextEntry ? !showPassword : false}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            textContentType={textContentType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        )}

        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.eyeIconBtn}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.6}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={isFocused ? '#10b981' : '#6c757d'}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: 46,
    overflow: 'hidden',
  },
  multilineInputGroup: {
    height: 'auto',
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  focusedInputGroup: {
    borderColor: '#10b981',
    borderWidth: 1.5,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorInputGroup: {
    borderColor: '#DC2626',
  },
  disabledInputGroup: {
    backgroundColor: '#F1F5F9',
    borderColor: '#cbd5e1',
  },
  iconContainer: {
    width: 42,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
    paddingHorizontal: 12,
    height: 44,
  },
  eyeIconBtn: {
    width: 42,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});

export default CustomInput;
