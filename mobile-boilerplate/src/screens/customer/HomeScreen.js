import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

// Standard screen dimension fetchers
const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48) / 2;

// Categories supported with visual icons & descriptions
const CATEGORIES = [
  {
    key: 'electrician',
    title: 'Electrician',
    description: 'Fan repair, short circuits, UPS',
    icon: 'flash',
    color: '#FFCC00',
    secondaryColor: '#FFFCEB',
  },
  {
    key: 'plumber',
    title: 'Plumber',
    description: 'Leaking pipes, washroom, pumps',
    icon: 'water',
    color: '#007AFF',
    secondaryColor: '#E6F2FF',
  },
  {
    key: 'cctv',
    title: 'CCTV & Security',
    description: 'Camera installation, setup, DVR',
    icon: 'videocam',
    color: '#34C759',
    secondaryColor: '#EAF9EE',
  },
  {
    key: 'appliance',
    title: 'Appliance Repair',
    description: 'AC gas, washing machine, fridge',
    icon: 'construct',
    color: '#AF52DE',
    secondaryColor: '#F7EEFC',
  },
];

// Common issue tags for quick selection
const QUICK_ISSUES = {
  electrician: ['Ceiling Fan Repair', 'UPS Installation', 'Room Wiring Diagnostic', 'New Bracket Light Fix'],
  plumber: ['Water Pump Repair', 'Faucet Leaking', 'Drain Blockage Clear', 'Geyser Installation'],
  cctv: ['Camera Connection Lost', 'DVR Hard Disk Error', 'New CCTV System Setup', 'Outdoor Security Light'],
  appliance: ['AC Gas Refilling', 'Oven Heating Issue', 'Washing Machine Spin Fix', 'Refrigerator Defrost'],
};

export default function HomeScreen({ navigation }) {
  const { activeBooking, createBooking } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('electrician');

  // Triggered when clicking a category grid item
  const handleSelectCategory = (catKey) => {
    setSelectedCategory(catKey);
  };

  // Navigates customer directly to the multi-step booking screen
  const handleQuickIssueSelect = (issue) => {
    navigation.navigate('BookingScreen', {
      categoryKey: selectedCategory,
      preselectedIssue: issue,
    });
  };

  const handleCustomBooking = () => {
    navigation.navigate('BookingScreen', {
      categoryKey: selectedCategory,
      preselectedIssue: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Urgent Search Floating bar if a booking is currently pending */}
        {activeBooking && (
          <TouchableOpacity 
            style={styles.activeBanner} 
            onPress={() => navigation.navigate('Activity')}
          >
            <View style={styles.activeBannerLeft}>
              <View style={styles.pulseContainer}>
                <View style={[styles.pulseCircle, styles.pulseActive]} />
              </View>
              <Text style={styles.activeBannerText}>
                Active booking {activeBooking.id} is [{activeBooking.status.toUpperCase()}]
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Hero Welcome banner */}
        <View style={styles.heroSection}>
          <Text style={styles.greetingText}>Assalam-o-Alaikum,</Text>
          <Text style={styles.taglineText}>What professional help do you need today?</Text>
        </View>

        {/* Section header: Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <Text style={styles.sectionSubtitle}>Choose a domain to view common issues</Text>
        </View>

        {/* Categories 2x2 Grid */}
        <View style={styles.gridContainer}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.gridItem,
                  { backgroundColor: cat.secondaryColor },
                  isSelected && { borderWidth: 2, borderColor: '#000000' }
                ]}
                onPress={() => handleSelectCategory(cat.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrapper, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.gridItemTitle}>{cat.title}</Text>
                <Text style={styles.gridItemDesc} numberOfLines={2}>{cat.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Issue selection zone */}
        <View style={styles.subSectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Common {CATEGORIES.find((c) => c.key === selectedCategory)?.title} Issues
            </Text>
            <Text style={styles.sectionSubtitle}>Tap on any common issue to schedule custom assistance instantly</Text>
          </View>

          <View style={styles.issuesContainer}>
            {QUICK_ISSUES[selectedCategory].map((issue, index) => (
              <TouchableOpacity
                key={index}
                style={styles.issueRow}
                onPress={() => handleQuickIssueSelect(issue)}
                activeOpacity={0.6}
              >
                <View style={styles.issueRowLeft}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FF3B30" style={{ marginRight: 10 }} />
                  <Text style={styles.issueText}>{issue}</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={16} color="#AEAEB2" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Book alternative / Custom Button */}
          <TouchableOpacity 
            style={styles.customRequestButton} 
            onPress={handleCustomBooking}
          >
            <Text style={styles.customRequestButtonText}>
              Describe a different {CATEGORIES.find((c) => c.key === selectedCategory)?.title} issue
            </Text>
            <Ionicons name="create-outline" size={18} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Safety trust badge */}
        <View style={styles.trustCard}>
          <Ionicons name="shield-checkmark" size={32} color="#34C759" />
          <View style={styles.trustTextContainer}>
            <Text style={styles.trustTitle}>Haazir Safety Protection</Text>
            <Text style={styles.trustDesc}>All visits are insured and performed by certified, biometric-verified professionals.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  activeBanner: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pulseContainer: {
    marginRight: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseActive: {
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  taglineText: {
    fontSize: 15,
    color: '#636366',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  gridItemDesc: {
    fontSize: 11,
    color: '#636366',
    lineHeight: 14,
  },
  subSectionContainer: {
    marginBottom: 24,
  },
  issuesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  issueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  issueRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  issueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  customRequestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  customRequestButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 16,
  },
  trustTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  trustDesc: {
    fontSize: 11,
    color: '#636366',
    lineHeight: 14,
    marginTop: 2,
  },
});
