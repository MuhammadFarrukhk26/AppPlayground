import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function WorkerDashboard({ navigation }) {
  const {
    isWorkerOnline,
    toggleWorkerOnline,
    jobInvites,
    activeBooking,
    acceptJobInvite,
    declineJobInvite,
    advanceJobStatus,
    switchRole,
  } = useBooking();

  const handleJobPress = (job) => {
    navigation.navigate('JobDetailsScreen', { job });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile and Role toggle section */}
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80' }} 
              style={styles.providerAvatar} 
            />
            <View style={styles.providerMeta}>
              <Text style={styles.welcomeText}>Welcome Back,</Text>
              <Text style={styles.providerName}>Ahmed Kamal</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.roleToggleBtn} 
            onPress={() => switchRole('customer')}
          >
            <Ionicons name="people" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.roleToggleText}>Customer View</Text>
          </TouchableOpacity>
        </View>

        {/* Availability Toggle Switch Card */}
        <View style={styles.configCard}>
          <View style={styles.configLabelCol}>
            <Text style={styles.configHeader}>Online Availability</Text>
            <Text style={styles.configSubtitle}>
              {isWorkerOnline ? 'You are active and visible to nearby jobs' : 'Turn on to start receiving local job alerts'}
            </Text>
          </View>
          <Switch
            value={isWorkerOnline}
            onValueChange={toggleWorkerOnline}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* Earnings Stats Panel */}
        <View style={styles.earningsDashboard}>
          <Text style={styles.earningsTitle}>Performance Today</Text>
          <View style={styles.earningsGrid}>
            <View style={styles.earningStatItem}>
              <Text style={styles.earningLabel}>Total Earnings</Text>
              <Text style={styles.earningValue}>PKR 4,800</Text>
            </View>
            <View style={[styles.earningStatItem, { borderLeftWidth: 1, borderLeftColor: '#F2F2F7' }]}>
              <Text style={earningLabel => styles.earningLabel}>Completion</Text>
              <Text style={styles.earningValue}>100%</Text>
            </View>
            <View style={[styles.earningStatItem, { borderLeftWidth: 1, borderLeftColor: '#F2F2F7' }]}>
              <Text style={styles.earningLabel}>Profile Rating</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFCC00" />
                <Text style={[styles.earningValue, { marginLeft: 4 }]}>4.88</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION FOR ACTIVE / ONGOING TASK IN MOTION */}
        {activeBooking && activeBooking.status !== 'pending' && activeBooking.status !== 'completed' && (
          <View style={styles.activeJobContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ongoing Job Assignment</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>IN PROGRESS</Text>
              </View>
            </View>

            <View style={styles.activeJobCard}>
              <View style={styles.activeJobHeader}>
                <View>
                  <Text style={styles.jobRefId}>{activeBooking.id}</Text>
                  <Text style={styles.jobHeadingText}>{activeBooking.service} - {activeBooking.subService}</Text>
                </View>
                <Text style={styles.jobEstimatedPrice}>PKR {activeBooking.price.total * 100}</Text>
              </View>
              
              <View style={styles.addressSection}>
                <Ionicons name="location-sharp" size={16} color="#FF3B30" style={{ marginRight: 6 }} />
                <Text style={styles.addressLocationText}>{activeBooking.address}</Text>
              </View>

              {/* Polish Client Contact Panel */}
              <View style={styles.clientContactRow}>
                <Ionicons name="person-circle-sharp" size={38} color="#FF3B30" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientSubLabel}>Contact Client</Text>
                  <Text style={styles.clientNameLabel}>{activeBooking.customerName || 'Ayesha Khan'}</Text>
                </View>
                <View style={styles.clientActionsGroup}>
                  <TouchableOpacity 
                    style={styles.clientActionBtn}
                    onPress={() => alert(`Dialing customer: ${activeBooking.customerPhone || '+92 321 9876543'}`)}
                  >
                    <Ionicons name="call" size={15} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.clientActionBtn, { backgroundColor: '#FFF1F0', marginLeft: 8 }]}
                    onPress={() => navigation.navigate('ChatScreen')}
                  >
                    <Ionicons name="chatbubble" size={15} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.instructionContainer}>
                <Text style={styles.instructionLabel}>Notes from customer:</Text>
                <Text style={styles.instructionContent}>{activeBooking.description || 'No special instructions given.'}</Text>
              </View>

              {/* Status control buttons to progress statuses */}
              <View style={styles.statusActionControls}>
                <Text style={styles.currentStatusStepLabel}>
                  Current Status: <Text style={styles.boldStatus}>{activeBooking.status.toUpperCase().replace('_', ' ')}</Text>
                </Text>
                
                <TouchableOpacity 
                  style={styles.advanceStatusBtn}
                  onPress={advanceJobStatus}
                >
                  <Ionicons name="play-forward" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.advanceStatusBtnText}>
                    {activeBooking.status === 'assigned' ? 'Mark as ARRIVED' : 'Mark as JOB COMPLETED'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SECTION FOR INCOMING JOB INVITATIONS / OFFERS */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Nearby Job Invites ({jobInvites.length})</Text>
          
          {!isWorkerOnline ? (
            <View style={styles.offlinePlaceholder}>
              <Ionicons name="notifications-off" size={48} color="#C7C7CC" />
              <Text style={styles.placeholderLabel}>Offline Mode</Text>
              <Text style={styles.placeholderText}>Toggle your online switch above to start polling live plumbing and electrical service requests.</Text>
            </View>
          ) : jobInvites.length === 0 ? (
            <View style={styles.offlinePlaceholder}>
              <Ionicons name="radar-outline" size={48} color="#007AFF" />
              <Text style={styles.placeholderLabel}>Scanning for Requests...</Text>
              <Text style={styles.placeholderText}>Waiting for nearby customers. Keep the app open to receive immediate labor requests.</Text>
            </View>
          ) : (
            jobInvites.map((invite) => (
              <View key={invite.id} style={styles.alertCard}>
                <View style={styles.alertCardHeader}>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{invite.service}</Text>
                  </View>
                  <Text style={styles.alertPriceText}>PKR {invite.price.total * 100}</Text>
                </View>

                {/* Body details */}
                <Text style={styles.alertTitle}>{invite.subService}</Text>
                <Text style={styles.alertLocation} numberOfLines={1}>
                  <Ionicons name="location" size={12} color="#8E8E93" /> {invite.address}
                </Text>
                <Text style={styles.alertDistance}>
                  <Ionicons name="navigate" size={12} color="#007AFF" /> {invite.distance} • Urgent Repair Required
                </Text>

                {/* Job invitation controls */}
                <View style={styles.alertBtnGroup}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.declineBtn]}
                    onPress={() => declineJobInvite(invite.id)}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => acceptJobInvite(invite.id)}
                  >
                    <Text style={styles.acceptBtnText}>Accept Job</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  providerMeta: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  roleToggleBtn: {
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  roleToggleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  configCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  configLabelCol: {
    flex: 1,
    marginRight: 10,
  },
  configHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  configSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 14,
    marginTop: 2,
  },
  earningsDashboard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  earningsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  earningValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeJobContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  liveBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF3B30',
  },
  activeJobCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFCC00',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingBottom: 10,
    marginBottom: 10,
  },
  jobRefId: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF3B30',
    backgroundColor: '#FFF1F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  jobHeadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  jobEstimatedPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF3B30',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLocationText: {
    fontSize: 12,
    color: '#3A3A3C',
    fontWeight: '500',
    flex: 1,
  },
  instructionContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  instructionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  instructionContent: {
    fontSize: 11,
    color: '#636366',
    marginTop: 2,
    lineHeight: 14,
  },
  statusActionControls: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  currentStatusStepLabel: {
    fontSize: 12,
    color: '#636366',
    textAlign: 'center',
  },
  boldStatus: {
    fontWeight: '700',
    color: '#007AFF',
  },
  advanceStatusBtn: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  advanceStatusBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  alertsContainer: {
    marginTop: 8,
  },
  offlinePlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  placeholderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 12,
  },
  placeholderText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertBadge: {
    backgroundColor: '#E6F2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
  },
  alertPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34C759',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  alertLocation: {
    fontSize: 11,
    color: '#636366',
    marginBottom: 4,
  },
  alertDistance: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 14,
  },
  alertBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#F2F2F7',
    marginRight: 10,
  },
  declineBtnText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptBtn: {
    backgroundColor: '#FF3B30',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  clientContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  clientSubLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  clientNameLabel: {
    fontSize: 13,
    fontWeight: '750',
    color: '#1C1C1E',
  },
  clientActionsGroup: {
    flexDirection: 'row',
  },
  clientActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
