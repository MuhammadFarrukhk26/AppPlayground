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
import { SCREEN_WIDTH, scale, scaleFont } from '../../utils/responsive';

export default function WorkerDashboard({ navigation }) {
  const {
    currentUser,
    isWorkerOnline,
    toggleWorkerOnline,
    jobInvites,
    activeBooking,
    acceptJobInvite,
    declineJobInvite,
    advanceJobStatus,
    switchRole,
  } = useBooking();

  // Safely extract price regardless of whether it's a flat number or an object
  const formatPrice = (price) => {
    if (!price) return '0';
    if (typeof price === 'number') return price.toLocaleString();
    if (typeof price === 'object' && price.total != null) return price.total.toLocaleString();
    return String(price);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Profile Header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80' }}
                style={styles.providerAvatar}
              />
              {/* Online indicator dot on avatar */}
              <View style={[styles.onlineDot, { backgroundColor: isWorkerOnline ? '#34C759' : '#C7C7CC' }]} />
            </View>
            <View style={styles.providerMeta}>
              <Text style={styles.welcomeText}>Welcome Back,</Text>
              <Text style={styles.providerName} numberOfLines={1}>
                {currentUser?.name || 'Technician'}
              </Text>
              <Text style={styles.specialtyText}>{currentUser?.specialty || 'General Services'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.roleToggleBtn}
            onPress={() => switchRole('customer')}
          >
            <Ionicons name="people" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.roleToggleText}>Customer</Text>
          </TouchableOpacity>
        </View>

        {/* ── Online / Offline Toggle ── */}
        <View style={[styles.configCard, isWorkerOnline && styles.configCardOnline]}>
          <View style={styles.configLeft}>
            <View style={[styles.statusDot, { backgroundColor: isWorkerOnline ? '#34C759' : '#C7C7CC' }]} />
            <View style={styles.configLabelCol}>
              <Text style={styles.configHeader}>
                {isWorkerOnline ? 'You are Online' : 'You are Offline'}
              </Text>
              <Text style={styles.configSubtitle}>
                {isWorkerOnline
                  ? 'Receiving nearby job alerts'
                  : 'Toggle to start receiving job requests'}
              </Text>
            </View>
          </View>
          <Switch
            value={isWorkerOnline}
            onValueChange={toggleWorkerOnline}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5EA"
          />
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>PKR 4,800</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statCardLast}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={scale(13)} color="#FFCC00" />
              <Text style={[styles.statValue, { marginLeft: 3 }]}>4.88</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* ── Active Job Card ── */}
        {activeBooking &&
          activeBooking.status !== 'pending' &&
          activeBooking.status !== 'completed' && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Active Job</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>
                    {activeBooking.status.toUpperCase().replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.activeJobCard}>
                {/* Job title + price */}
                <View style={styles.activeJobHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.jobRefId} numberOfLines={1}>{activeBooking.id}</Text>
                    <Text style={styles.jobHeadingText} numberOfLines={2}>
                      {activeBooking.service} — {activeBooking.subService}
                    </Text>
                  </View>
                  <Text style={styles.jobEstimatedPrice}>
                    PKR {formatPrice(activeBooking.price)}
                  </Text>
                </View>

                {/* Address */}
                <View style={styles.addressSection}>
                  <Ionicons name="location-sharp" size={scale(14)} color="#FF3B30" style={{ marginRight: 6 }} />
                  <Text style={styles.addressLocationText} numberOfLines={2}>{activeBooking.address}</Text>
                </View>

                {/* Client contact row */}
                <View style={styles.clientContactRow}>
                  <Ionicons name="person-circle-sharp" size={scale(36)} color="#FF3B30" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientSubLabel}>Client</Text>
                    <Text style={styles.clientNameLabel} numberOfLines={1}>
                      {activeBooking.customerName || 'Customer'}
                    </Text>
                  </View>
                  <View style={styles.clientActionsGroup}>
                    <TouchableOpacity
                      style={styles.clientActionBtn}
                      onPress={() => alert(`Calling: ${activeBooking.customerPhone || 'N/A'}`)}
                    >
                      <Ionicons name="call" size={scale(14)} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.clientActionBtn, { backgroundColor: '#FFF1F0', marginLeft: 8 }]}
                      onPress={() => navigation.navigate('ChatScreen')}
                    >
                      <Ionicons name="chatbubble" size={scale(14)} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Notes */}
                {!!activeBooking.description && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Customer Notes</Text>
                    <Text style={styles.notesContent}>{activeBooking.description}</Text>
                  </View>
                )}

                {/* Advance status */}
                <TouchableOpacity style={styles.advanceStatusBtn} onPress={advanceJobStatus}>
                  <Ionicons name="play-forward" size={scale(15)} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.advanceStatusBtnText}>
                    {activeBooking.status === 'assigned' ? 'Mark Arrived' : 'Mark Completed'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* ── Job Invites ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nearby Jobs {jobInvites.length > 0 ? `(${jobInvites.length})` : ''}
          </Text>

          {!isWorkerOnline ? (
            <View style={styles.emptyCard}>
              <Ionicons name="notifications-off-outline" size={scale(40)} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>You're Offline</Text>
              <Text style={styles.emptyText}>
                Toggle the switch above to start receiving job requests.
              </Text>
            </View>
          ) : jobInvites.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="radar-outline" size={scale(40)} color="#007AFF" />
              <Text style={styles.emptyTitle}>Scanning for Jobs...</Text>
              <Text style={styles.emptyText}>
                Keep the app open. Job requests will appear here instantly.
              </Text>
            </View>
          ) : (
            jobInvites.map((invite) => (
              <View key={invite.id} style={styles.inviteCard}>
                {/* Header: category badge + price */}
                <View style={styles.inviteHeader}>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{invite.service}</Text>
                  </View>
                  <Text style={styles.invitePrice}>PKR {formatPrice(invite.price)}</Text>
                </View>

                <Text style={styles.inviteTitle} numberOfLines={2}>{invite.subService}</Text>

                <View style={styles.inviteMetaRow}>
                  <Ionicons name="location" size={scale(12)} color="#8E8E93" />
                  <Text style={styles.inviteMetaText} numberOfLines={1}>{invite.address}</Text>
                </View>
                <View style={styles.inviteMetaRow}>
                  <Ionicons name="navigate" size={scale(12)} color="#007AFF" />
                  <Text style={[styles.inviteMetaText, { color: '#007AFF' }]}>
                    {invite.distance}
                  </Text>
                </View>

                <View style={styles.inviteBtnRow}>
                  <TouchableOpacity
                    style={[styles.inviteBtn, styles.declineBtn]}
                    onPress={() => declineJobInvite(invite.id)}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inviteBtn, styles.acceptBtn]}
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
  safeContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { padding: scale(16), paddingBottom: scale(48) },

  /* Profile header */
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  // flex:1 + minWidth:0 allows text to truncate instead of pushing button off screen
  profileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, marginRight: scale(8) },
  avatarWrapper: { position: 'relative', marginRight: scale(12), flexShrink: 0 },
  providerAvatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  // minWidth:0 here is critical — without it, long names expand beyond the row
  providerMeta: { flex: 1, minWidth: 0 },
  welcomeText: { fontSize: scaleFont(11), color: '#8E8E93' },
  providerName: { fontSize: scaleFont(16), fontWeight: '700', color: '#1C1C1E' },
  specialtyText: { fontSize: scaleFont(11), color: '#FF3B30', fontWeight: '600', marginTop: 1 },
  roleToggleBtn: {
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: scale(7),
    borderRadius: scale(14),
    flexShrink: 0, // never shrink — always visible even on narrow screens
  },
  roleToggleText: { color: '#FFFFFF', fontSize: scaleFont(11), fontWeight: '600' },

  /* Online toggle card */
  configCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: scale(14),
  },
  configCardOnline: { borderColor: '#34C759', backgroundColor: '#F0FFF4' },
  configLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, marginRight: scale(10) },
  statusDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    marginRight: scale(10),
    flexShrink: 0,
  },
  configLabelCol: { flex: 1, minWidth: 0 },
  configHeader: { fontSize: scaleFont(14), fontWeight: '700', color: '#1C1C1E' },
  configSubtitle: { fontSize: scaleFont(11), color: '#8E8E93', marginTop: 2 },

  /* Stats row — use marginRight instead of gap for RN 0.73 compat */
  statsRow: {
    flexDirection: 'row',
    marginBottom: scale(20),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    padding: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: scale(10),
  },
  statCardLast: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    padding: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statValue: { fontSize: scaleFont(14), fontWeight: '800', color: '#1C1C1E' },
  statLabel: { fontSize: scaleFont(9), color: '#8E8E93', marginTop: 3, textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },

  /* Section wrapper */
  section: { marginBottom: scale(20) },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  sectionTitle: { fontSize: scaleFont(16), fontWeight: '700', color: '#1C1C1E' },
  liveBadge: {
    backgroundColor: '#FFF1F0',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(6),
  },
  liveBadgeText: { fontSize: scaleFont(9), fontWeight: '800', color: '#FF3B30' },

  /* Active job card */
  activeJobCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    borderRadius: scale(16),
    padding: scale(14),
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
    marginBottom: scale(10),
    paddingBottom: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  jobRefId: {
    fontSize: scaleFont(9),
    fontWeight: '700',
    color: '#FF3B30',
    backgroundColor: '#FFF1F0',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(6),
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  jobHeadingText: { fontSize: scaleFont(14), fontWeight: '700', color: '#1C1C1E' },
  jobEstimatedPrice: { fontSize: scaleFont(15), fontWeight: '800', color: '#FF3B30' },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scale(10),
  },
  addressLocationText: { fontSize: scaleFont(12), color: '#3A3A3C', flex: 1 },
  clientContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: scale(12),
    padding: scale(10),
    marginBottom: scale(10),
  },
  clientSubLabel: { fontSize: scaleFont(9), color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
  clientNameLabel: { fontSize: scaleFont(13), fontWeight: '700', color: '#1C1C1E' },
  clientActionsGroup: { flexDirection: 'row' },
  clientActionBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: scale(10),
    padding: scale(10),
    marginBottom: scale(12),
  },
  notesLabel: { fontSize: scaleFont(10), fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  notesContent: { fontSize: scaleFont(11), color: '#636366', lineHeight: scale(15) },
  advanceStatusBtn: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(13),
    borderRadius: scale(12),
    marginTop: scale(4),
  },
  advanceStatusBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: scaleFont(13) },

  /* Empty state card */
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: scale(24),
    alignItems: 'center',
    marginTop: scale(10),
  },
  emptyTitle: { fontSize: scaleFont(15), fontWeight: '700', color: '#1C1C1E', marginTop: scale(10) },
  emptyText: { fontSize: scaleFont(12), color: '#8E8E93', textAlign: 'center', lineHeight: scale(16), marginTop: 5 },

  /* Invite cards */
  inviteCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: scale(16),
    padding: scale(14),
    marginTop: scale(12),
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  alertBadge: {
    backgroundColor: '#E6F2FF',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(6),
  },
  alertBadgeText: { fontSize: scaleFont(10), fontWeight: '700', color: '#007AFF' },
  invitePrice: { fontSize: scaleFont(15), fontWeight: '800', color: '#34C759' },
  inviteTitle: { fontSize: scaleFont(14), fontWeight: '700', color: '#1C1C1E', marginBottom: scale(6) },
  inviteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(3),
  },
  inviteMetaText: { fontSize: scaleFont(11), color: '#636366', flex: 1, marginLeft: scale(5) },
  inviteBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(12),
  },
  inviteBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: { backgroundColor: '#F2F2F7', marginRight: scale(10) },
  declineBtnText: { color: '#8E8E93', fontWeight: '600', fontSize: scaleFont(13) },
  acceptBtn: { backgroundColor: '#FF3B30' },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: scaleFont(13) },
});
