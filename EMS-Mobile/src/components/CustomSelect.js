import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const CustomSelect = ({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  style,
  statusStyle,
  statusText,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Web rendering
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <select
          value={value || ''}
          onChange={(e) => onValueChange && onValueChange(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            height: '46px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: error ? '1px solid #DC2626' : '1px solid #10b981',
            fontSize: '14px',
            fontFamily: 'Segoe UI, sans-serif',
            color: '#111111',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            appearance: 'auto',
            outline: 'none',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        {statusStyle === 'approved' && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <Text style={styles.verifiedText}> Verified</Text>
          </View>
        )}
        {statusStyle === 'rejected' && (
          <View style={styles.rejectedRow}>
            <Ionicons name="close-circle" size={14} color="#DC2626" />
            <Text style={styles.rejectedText}> {statusText || 'Invalid selection'}</Text>
          </View>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  // Native rendering with Bottom Modal Picker
  const selectedOption = options.find((o) => (typeof o === 'object' ? o.value : o) === value);
  const displayLabel = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      
      <TouchableOpacity
        style={[
          styles.selectTrigger,
          disabled && styles.disabledTrigger,
          error && styles.errorTrigger,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectValueText, !value && styles.placeholderText]}>
          {displayLabel}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#333333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(typeof item === 'object' ? item.value : item)}
              renderItem={({ item }) => {
                const itemVal = typeof item === 'object' ? item.value : item;
                const itemLbl = typeof item === 'object' ? item.label : item;
                const isSelected = value === itemVal;

                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                    onPress={() => {
                      onValueChange && onValueChange(itemVal);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {itemLbl}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color="#10b981" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {statusStyle === 'approved' && (
        <View style={styles.verifiedRow}>
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
          <Text style={styles.verifiedText}> Verified</Text>
        </View>
      )}
      {statusStyle === 'rejected' && (
        <View style={styles.rejectedRow}>
          <Ionicons name="close-circle" size={14} color="#DC2626" />
          <Text style={styles.rejectedText}> {statusText || 'Invalid selection'}</Text>
        </View>
      )}
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
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  disabledTrigger: {
    backgroundColor: '#F1F5F9',
    borderColor: '#cbd5e1',
  },
  errorTrigger: {
    borderColor: '#DC2626',
  },
  selectValueText: {
    fontSize: 14,
    color: '#111111',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedOptionItem: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedOptionText: {
    color: '#065F46',
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  rejectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 5,
    borderRadius: 6,
    marginTop: 4,
  },
  rejectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});

export default CustomSelect;
