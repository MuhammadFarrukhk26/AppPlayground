import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCREEN_WIDTH, scale, scaleFont } from '../utils/responsive';

/**
 * ServiceCard is a highly polished reusable grid layout button.
 * Sizing scales between small phones (iPhone SE, 375pt) and large phones (Pro Max, 430pt).
 */
export default function ServiceCard({ title, icon, description, color, secondaryColor, isSelected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: secondaryColor || '#F2F2F7' },
        isSelected && styles.selectedBorder
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color || '#FF3B30' }]}>
        <Ionicons name={icon || 'construct'} size={scale(22)} color="#FFFFFF" />
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );
}

const CARD_GAP = scale(16);

const styles = StyleSheet.create({
  card: {
    width: (SCREEN_WIDTH - CARD_GAP * 3) / 2,
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(14),
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedBorder: {
    borderColor: '#000000',
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  title: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  description: {
    fontSize: scaleFont(11),
    color: '#636366',
    lineHeight: scale(14),
  },
});
