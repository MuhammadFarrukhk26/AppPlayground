import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

// Progress milestones mapping out the stage array
const TRACKING_STEPS = [
  { key: 'pending', title: 'Searching Technician', desc: 'Sourcing the nearest active certified partner' },
  { key: 'assigned', title: 'Technician Assigned', desc: 'Technician is heading to your designated address' },
  { key: 'in_progress', title: 'Work In Progress', desc: 'Technician has arrived and is resolving the issue' },
  { key: 'completed', title: 'Service Completed', desc: 'Job is successfully closed. Please verify' },
];

export default function TrackerScreen({ navigation }) {
  const { 
    activeBooking, 
    cancelBooking, 
    submitCustomerRating, 
    bookingHistory 
  } = useBooking();

  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Helper to determine the color/state of each timeline indicator step
  const getStepStatus = (stepKey, currentStatus) => {
    const statusOrder = ['pending', 'assigned', 'in_progress', 'completed'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'upcoming';
  };

  const handleRatingSubmit = () => {
    submitCustomerRating(rating, feedbackText);
    setRating(5);
    setFeedbackText('');
  };

  // EMPTY STATE / BOOKING HISTORY MODE
  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView contentContainerStyle={styles.emptyContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyHeader}>
            <Ionicons name="receipt-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No Active Bookings</Text>
            <Text style={styles.emptySubtitle}>You don't have any ongoing services right now. Need something repaired?</Text>
            
            <TouchableOpacity 
              style={styles.findButton}
              onPress={() => navigation.navigate('Services')}
            >
              <Text style={styles.findButtonText}>Book Service Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          {bookingHistory.length > 0 && (
            <View style={styles.historyWrapper}>
              <Text style={styles.historySectionLabel}>Previous Sessions</Text>
              {bookingHistory.map((historyItem) => (
                <View key={historyItem.id} style={styles.historyItemCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTitleBadge}>
                      <Text style={styles.historyIdText}>{historyItem.id}</Text>
                      <Text style={styles.historyServiceText}>{historyItem.service}</Text>
                    </View>
                    <View style={styles.historyCompletedBadge}>
                      <Text style={styles.historyCompletedText}>COMPLETED</Text>
                    </View>
                  </View>
                  <Text style={styles.historySubText}>{historyItem.subService}</Text>
                  <Text style={styles.historyAddressText} numberOfLines={1}>{historyItem.address}</Text>
                  
                  <View style={styles.historyFooter}>
                    <Text style={styles.historyPriceText}>PKR {historyItem.price.total * 100}</Text>
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons 
                          key={s} 
                          name={s <= historyItem.rating ? "star" : "star-outline"} 
                          size={14} 
                          color="#FFCC00" 
                        />
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ACTIVE BOOKING FLOW
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* Ticket Header card */}
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.ticketLabel}>Order Reference</Text>
            <Text style={styles.ticketId}>{activeBooking.id}</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badgeText, { color: activeBooking.status === 'completed' ? '#34C759' : '#007AFF' }]}>
              {activeBooking.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {activeBooking.status !== 'completed' ? (
          <>
            {/* INTERACTIVE MOCK MAP ROUTING VISUALIZER */}
            <View style={styles.mapCard}>
              <Text style={styles.mapHeaderTitle}>Live Route Tracking</Text>
              <View style={styles.mapCanvas}>
                {/* Streets backplane representation */}
                <View style={styles.mapGridLineH} />
                <View style={styles.mapGridLineV} />
                
                {/* Sector tags */}
                <Text style={styles.mapSectorLabel}>LAHORE DHA SEC T</Text>
                
                {/* Destination Point (Home) */}
                <View style={styles.destinationMarker}>
                  <View style={styles.pulseIndicator} />
                  <Ionicons name="home" size={20} color="#FF3B30" />
                  <Text style={styles.markerText}>Customer (Home)</Text>
                </View>

                {/* Technician route progress coordinate layout values based on status context */}
                {activeBooking.status === 'pending' ? (
                  <View style={styles.radarGroup}>
                    <View style={styles.glowingRadarCircle} />
                    <Ionicons name="sync-outline" size={28} color="#007AFF" />
                    <Text style={styles.radarSubText}>Broadcasting live ticket...</Text>
                  </View>
                ) : activeBooking.status === 'assigned' ? (
                  <View style={[styles.workerMarkerAnimated, { bottom: '25%', left: '20%' }]}>
                    <Ionicons name="bicycle-sharp" size={24} color="#007AFF" />
                    <Text style={styles.workerMarkerText}>{activeBooking.provider?.name || 'Ahmed Kamal'} (En Route)</Text>
                  </View>
                ) : activeBooking.status === 'in_progress' ? (
                  <View style={[styles.workerMarkerAnimated, { top: '15%', right: '23%' }]}>
                    <Ionicons name="construct-sharp" size={22} color="#34C759" />
                    <Text style={[styles.workerMarkerText, { color: '#34C759', borderColor: '#34C759' }]}>Specialist On-Site</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* TIMELINE TRACKER COMPONENT */}
            <View style={styles.trackingCard}>
              <Text style={styles.trackingCardHeader}>Tracking Status</Text>
              
              <View style={styles.timelineWrapper}>
                {TRACKING_STEPS.map((step, idx) => {
                  const stepState = getStepStatus(step.key, activeBooking.status);
                  return (
                    <View key={step.key} style={styles.timelineStepRow}>
                      
                      {/* Left: Circle Indicator and Vertical connector line */}
                      <View style={styles.indicatorContainer}>
                        <View 
                          style={[
                            styles.timelineDot,
                            stepState === 'completed' && styles.dotCompleted,
                            stepState === 'active' && styles.dotActive,
                            stepState === 'upcoming' && styles.dotUpcoming,
                          ]}
                        >
                          {stepState === 'completed' ? (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          ) : (
                            <View style={stepState === 'active' ? styles.innerDotActive : null} />
                          )}
                        </View>
                        {idx < TRACKING_STEPS.length - 1 && (
                          <View 
                            style={[
                              styles.connectorLine,
                              stepState === 'completed' && styles.lineCompleted
                            ]} 
                          />
                        )}
                      </View>

                      {/* Right: Text labels description */}
                      <View style={styles.stepTextWrapper}>
                        <Text style={[
                          styles.stepTitle,
                          stepState === 'active' && styles.stepTitleActive,
                          stepState === 'upcoming' && styles.stepTitleUpcoming,
                        ]}>
                          {step.title}
                        </Text>
                        <Text style={styles.stepDesc}>{step.desc}</Text>
                        
                        {/* If step is active and searching, show active spinning spinner */}
                        {step.key === 'pending' && stepState === 'active' && (
                          <View style={styles.searchLoaderRow}>
                            <ActivityIndicator size="small" color="#FF3B30" />
                            <Text style={styles.loaderLabel}>Waiting for acceptance...</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ASSIGNED PROVIDER CONTACT CRATE */}
            {activeBooking.provider && (
              <View style={styles.providerCard}>
                <Image source={{ uri: activeBooking.provider.avatar }} style={styles.providerAvatar} />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{activeBooking.provider.name}</Text>
                  <Text style={styles.providerSpecialty}>{activeBooking.provider.specialty}</Text>
                  <View style={styles.providerStats}>
                    <Ionicons name="star" size={14} color="#FFCC00" />
                    <Text style={styles.ratingLabel}>{activeBooking.provider.rating} ({activeBooking.provider.trips} trips)</Text>
                  </View>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.contactCircleBtn}
                    onPress={() => alert(`Calling specialist: ${activeBooking.provider.phone}`)}
                  >
                    <Ionicons name="call" size={18} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.contactCircleBtn, { marginLeft: 8 }]}
                    onPress={() => navigation.navigate('ChatScreen')}
                  >
                    <Ionicons name="chatbubble" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Cancel booking if it's still searching */}
            {activeBooking.status === 'pending' && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelBooking}
              >
                <Text style={styles.cancelText}>Cancel Service Request</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* COMPLETION / RATINGS / INVOICE VIEW */
          <View style={styles.completionContainer}>
            <View style={styles.completionGreetings}>
              <Ionicons name="checkmark-circle" size={56} color="#34C759" />
              <Text style={styles.congratulationsTitle}>Work Completed Successfully</Text>
              <Text style={styles.congratulationsSub}>Ahmed Kamal resolved your issue. Here is your digital receipt.</Text>
            </View>

            {/* INVOICE BREAKDOWN PANEL */}
            <View style={styles.invoiceCard}>
              <Text style={styles.invoiceSectionTitle}>Billing Breakdown</Text>
              
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Base visiting fee</Text>
                <Text style={styles.invoiceVal}>PKR {activeBooking.price.base * 100}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Task labor fee</Text>
                <Text style={styles.invoiceVal}>PKR {activeBooking.price.work * 100}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Platform service tax (5%)</Text>
                <Text style={styles.invoiceVal}>PKR {activeBooking.price.tax * 100}</Text>
              </View>
              <View style={[styles.invoiceRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total Amount (Cash)</Text>
                <Text style={styles.grandTotalVal}>PKR {activeBooking.price.total * 100}</Text>
              </View>
            </View>

            {/* STAR RATING INPUT BOX */}
            <View style={styles.ratingCard}>
              <Text style={styles.ratingCardHeader}>Rate your Experience</Text>
              <Text style={styles.ratingCardSub}>Your rating helps us keep high-quality providers on our network.</Text>
              
              <View style={styles.starsSelectorRow}>
                {[1, 2, 3, 4, 5].map((starIdx) => (
                  <TouchableOpacity
                    key={starIdx}
                    onPress={() => setRating(starIdx)}
                    style={styles.starTouch}
                  >
                    <Ionicons 
                      name={starIdx <= rating ? "star" : "star-outline"} 
                      size={36} 
                      color="#FFCC00" 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.feedbackInput}
                placeholder="Give positive feedback or call-out points..."
                placeholderTextColor="#AEAEB2"
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline={true}
                numberOfLines={3}
              />

              <TouchableOpacity 
                style={styles.submitInvoiceBtn}
                onPress={handleRatingSubmit}
              >
                <Text style={styles.submitInvoiceBtnText}>Submit & Complete Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  ticketLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E6F2FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  trackingCardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  timelineWrapper: {
    paddingLeft: 4,
  },
  timelineStepRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorContainer: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dotCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  dotActive: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFFFFF',
  },
  innerDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  dotUpcoming: {
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: '#34C759',
  },
  stepTextWrapper: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  stepTitleActive: {
    color: '#FF3B30',
  },
  stepTitleUpcoming: {
    color: '#AEAEB2',
  },
  stepDesc: {
    fontSize: 11,
    color: '#636366',
    marginTop: 2,
  },
  searchLoaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loaderLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  providerSpecialty: {
    fontSize: 11,
    color: '#8E8E93',
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingLabel: {
    fontSize: 11,
    color: '#636366',
    marginLeft: 4,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 18,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  findButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  historyWrapper: {
    width: '100%',
  },
  historySectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  historyItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 14,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  historyTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
    marginRight: 6,
    backgroundColor: '#FFF1F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyServiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  historyCompletedBadge: {
    backgroundColor: '#EAF9EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyCompletedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
  },
  historySubText: {
    fontSize: 12,
    color: '#3A3A3C',
    fontWeight: '500',
  },
  historyAddressText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 10,
    marginTop: 10,
  },
  historyPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  completionContainer: {
    alignItems: 'center',
  },
  completionGreetings: {
    alignItems: 'center',
    marginBottom: 20,
  },
  congratulationsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 12,
    textAlign: 'center',
  },
  congratulationsSub: {
    fontSize: 12,
    color: '#636366',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  invoiceSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 10,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  grandTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF3B30',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  ratingCardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  ratingCardSub: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  starsSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starTouch: {
    paddingHorizontal: 6,
  },
  feedbackInput: {
    width: '100%',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1C1E',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitInvoiceBtn: {
    backgroundColor: '#FF3B30',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitInvoiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  mapHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  mapCanvas: {
    height: 160,
    backgroundColor: '#EAF4FE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0E5FC',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridLineH: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  mapGridLineV: {
    position: 'absolute',
    left: '65%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  mapSectorLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '800',
    opacity: 0.5,
  },
  destinationMarker: {
    position: 'absolute',
    top: '15%',
    right: '25%',
    alignItems: 'center',
    zIndex: 10,
  },
  pulseIndicator: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    opacity: 0.15,
    top: -6,
  },
  markerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF3B30',
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  radarGroup: {
    alignItems: 'center',
  },
  glowingRadarCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    opacity: 0.3,
    top: -16,
  },
  radarSubText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
  workerMarkerAnimated: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  workerMarkerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D0E5FC',
  },
});
