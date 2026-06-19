import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function JobDetailsScreen({ route, navigation }) {
  const { job } = route.params || {};
  const { acceptJobInvite, declineJobInvite } = useBooking();

  if (!job) return null;

  const handleDecline = () => {
    declineJobInvite(job.id);
    navigation.goBack();
  };

  const handleAccept = () => {
    acceptJobInvite(job.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner Tag */}
        <View style={styles.headerInfo}>
          <Text style={styles.categoryBadge}>{job.service.toUpperCase()}</Text>
          <Text style={styles.priceTag}>PKR {job.price.total * 100}</Text>
        </View>

        <Text style={styles.jobTitle}>{job.subService}</Text>
        <Text style={styles.distanceText}>
          <Ionicons name="navigate-circle" size={16} color="#007AFF" /> {job.distance} away from your current location
        </Text>

        {/* Client details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client Information</Text>
          <View style={styles.row}>
            <Ionicons name="person" size={16} color="#8E8E93" style={styles.iconSpaced} />
            <Text style={styles.rowVal}>{job.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="call" size={16} color="#8E8E93" style={styles.iconSpaced} />
            <Text style={styles.rowVal}>{job.customerPhone}</Text>
          </View>
        </View>

        {/* Location cards details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Site Location</Text>
          <View style={styles.row}>
            <Ionicons name="location" size={16} color="#FF3B30" style={styles.iconSpaced} />
            <Text style={styles.rowVal}>{job.address}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time" size={16} color="#8E8E93" style={styles.iconSpaced} />
            <Text style={styles.rowVal}>{job.slot}</Text>
          </View>
        </View>

        {/* Customer Problem description notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue Description</Text>
          <Text style={styles.descriptionContent}>
            {job.description || 'The customer has not provided special instructions, please prepare standard utility diagnostic kits.'}
          </Text>
        </View>

        {/* Payout specifications breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estimated Payout Breakdown</Text>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Standard Base visit guarantee</Text>
            <Text style={styles.invoiceVal}>PKR {job.price.base * 100}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Task completing estimate</Text>
            <Text style={styles.invoiceVal}>PKR {job.price.work * 100}</Text>
          </View>
          <View style={[styles.invoiceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Gross Payout sum</Text>
            <Text style={styles.totalVal}>PKR {job.price.total * 100}</Text>
          </View>
        </View>

        {/* Buttons section */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={handleDecline}>
            <Text style={styles.declineText}>Decline Offer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={handleAccept}>
            <Text style={styles.acceptText}>Accept & Head Off</Text>
          </TouchableOpacity>
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
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'span-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#FFF2CC',
    color: '#D4AF37',
    fontWeight: '800',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  priceTag: {
    fontSize: 20,
    fontWeight: '900',
    color: '#34C759',
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingBottom: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  iconSpaced: {
    marginRight: 10,
    marginTop: 2,
  },
  rowVal: {
    fontSize: 13,
    color: '#3A3A3C',
    fontWeight: '500',
    flex: 1,
  },
  descriptionContent: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  invoiceLabel: {
    fontSize: 12,
    color: '#636366',
  },
  invoiceVal: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34C759',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#F2F2F7',
    marginRight: 12,
  },
  declineText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptBtn: {
    backgroundColor: '#FF3B30',
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
