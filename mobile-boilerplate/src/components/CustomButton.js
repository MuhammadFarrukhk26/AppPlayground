import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * CustomButton provides a reusable full-width CTA (Call to Action).
 */
export default function CustomButton({ title, icon, onPress, loading, disabled, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  const buttonStyle = [
    styles.btn,
    isPrimary ? styles.btnPrimary : styles.btnSecondary,
    disabled && styles.btnDisabled
  ];
  const textStyle = [
    styles.text,
    isPrimary ? styles.textPrimary : styles.textSecondary,
    disabled && styles.textDisabled
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? '#FFFFFF' : '#FF3B30'} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={isPrimary ? '#FFFFFF' : '#FF3B30'}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnPrimary: {
    backgroundColor: '#FF3B30',
  },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  btnDisabled: {
    backgroundColor: '#E5E5EA',
    borderColor: '#E5E5EA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#FF3B30',
  },
  textDisabled: {
    color: '#AEAEB2',
  },
});
