import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

const SLOTS = [
  { label: 'As soon as possible (Urgent)', value: 'As soon as possible' },
  { label: 'Today (3:00 PM - 5:00 PM)', value: 'Today 3-5 PM' },
  { label: 'Today (6:00 PM - 8:00 PM)', value: 'Today 6-8 PM' },
  { label: 'Tomorrow morning (10:00 AM - 12:00 PM)', value: 'Tomorrow 10-12 AM' },
];

const ADDRESS_PRESETS = [
  'DHA Phase 5, Block T, House 42, Lahore',
  'Gulberg III, Sector B-2, Apt 12, Lahore',
  'Bahria Town, Sector D, Villa 15, Lahore',
];

export default function BookingScreen({ route, navigation }) {
  const { categoryKey, preselectedIssue } = route.params || {};
  const { createBooking } = useBooking();

  const [issueTitle, setIssueTitle] = useState(preselectedIssue || '');
  const [address, setAddress] = useState(ADDRESS_PRESETS[0]);
  const [selectedSlot, setSelectedSlot] = useState(SLOTS[0].value);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (preselectedIssue) {
      setIssueTitle(preselectedIssue);
    }
  }, [preselectedIssue]);

  const handleSubmit = () => {
    if (!issueTitle.trim()) {
      alert('Please specify the issue or trouble you are facing.');
      return;
    }
    
    // Call the context to initiate order
    createBooking(categoryKey, issueTitle, address, selectedSlot, description);
    
    // Automatically switch tabs inside the tab navigator, targeting the "Activity" (TrackerScreen) tab
    navigation.navigate('CustomerRoot', { screen: 'Activity' });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          
          {/* Header Description */}
          <Text style={styles.sectionLabel}>Describe the Trouble</Text>
          <Text style={styles.sectionDesc}>What requires attention? Be specific to help our partner prepare tools.</Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Short circuit in living room, AC not cooling..."
            placeholderTextColor="#8E8E93"
            value={issueTitle}
            onChangeText={setIssueTitle}
          />

          {/* Time Slot Selection */}
          <Text style={styles.sectionLabel}>Date & Time Schedule</Text>
          <Text style={styles.sectionDesc}>When would you like our professional to arrive?</Text>
          
          <View style={styles.slotsCard}>
            {SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.value;
              return (
                <TouchableOpacity
                  key={slot.value}
                  style={[styles.slotItem, isSelected && styles.slotItemActive]}
                  onPress={() => setSelectedSlot(slot.value)}
                >
                  <Ionicons 
                    name={isSelected ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={isSelected ? "#FF3B30" : "#8E8E93"} 
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Location details */}
          <Text style={styles.sectionLabel}>Service Location Address</Text>
          <Text style={styles.sectionDesc}>Select address or type custom coordinates.</Text>
          
          <View style={styles.addressPresetsCard}>
            {ADDRESS_PRESETS.map((preset, idx) => {
              const isSelected = address === preset;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.addressPresetRow, isSelected && styles.addressPresetRowActive]}
                  onPress={() => setAddress(preset)}
                >
                  <Ionicons 
                    name="location" 
                    size={18} 
                    color={isSelected ? "#FF3B30" : "#8E8E93"} 
                    style={{ marginRight: 10, marginTop: 2 }}
                  />
                  <Text style={[styles.addressText, isSelected && styles.addressTextActive]}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Additional Notes text box */}
          <Text style={styles.sectionLabel}>Optional Instructions</Text>
          <Text style={styles.sectionDesc}>e.g., "Enter from back door", "Gate code is 0910", etc.</Text>
          
          <TextInput
            style={[styles.textInput, styles.multiInput]}
            placeholder="Add special instructions or further details if desired..."
            placeholderTextColor="#8E8E93"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={3}
          />

          {/* Notice of base rate */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#FF3B30" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              A base diagnostic visiting fee of PKR 1,500 applies. Final task fees are determined relative to scope.
            </Text>
          </View>

          {/* Action Trigger */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Request Haazir Specialist</Text>
            <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 10,
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  multiInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  slotsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  slotItemActive: {
    backgroundColor: '#FAF9F9',
  },
  slotText: {
    fontSize: 13,
    color: '#636366',
  },
  slotTextActive: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  addressPresetsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  addressPresetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  addressPresetRowActive: {
    backgroundColor: '#FAF9F9',
  },
  addressText: {
    fontSize: 13,
    color: '#636366',
    flex: 1,
  },
  addressTextActive: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    borderRadius: 10,
    padding: 12,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 11,
    color: '#FF3B30',
    lineHeight: 15,
    flex: 1,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
