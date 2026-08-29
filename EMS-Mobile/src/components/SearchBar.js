import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const SearchBar = ({ value, onChangeText, placeholder = 'Search employees...', onClear }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
    paddingHorizontal: 12,
    height: 44,
    marginVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  clearBtn: {
    padding: 4,
  },
});

export default SearchBar;
