import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Create top-level navigation container reference to trigger deep nav-actions on banner taps
const navigationRef = createNavigationContainerRef();

// Import our custom state hook
import { useBooking } from '../context/BookingContext';

// Import mock screens (referencing where we place actual screens)
import HomeScreen from '../screens/customer/HomeScreen';
import TrackerScreen from '../screens/customer/TrackerScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import WorkerDashboard from '../screens/worker/WorkerDashboard';
import JobDetailsScreen from '../screens/worker/JobDetailsScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Create Navigation Instances
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// CUSTOMER TABS FLOW
// Hosts Home screen and a Tracker / Status tab
const CustomerTabNavigator = () => {
  const { activeBooking } = useBooking();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Services') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF3B30', // Haazir brand orange-red
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Services" 
        component={HomeScreen} 
        options={{
          headerTitle: 'Haazir Service Desk',
          headerStyle: styles.header,
          headerTintColor: '#1C1C1E',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={TrackerScreen} 
        options={{
          headerTitle: activeBooking ? 'Service Status' : 'Booking History',
          headerStyle: styles.header,
          headerTintColor: '#1C1C1E',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      {/* Fallback stub screen for Profile */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileDummyScreen}
        options={{
          headerTitle: 'My Account',
          headerStyle: styles.header,
          headerTintColor: '#1C1C1E',
        }}
      />
    </Tab.Navigator>
  );
};

// Profile screen showing the actual logged-in user
const ProfileDummyScreen = () => {
  const { currentUser, switchRole, logoutUser } = useBooking();
  if (!currentUser) return null;

  return (
    <View style={styles.centerContainer}>
      <Ionicons name="person-circle" size={90} color="#FF3B30" style={{ marginBottom: 10 }} />
      <Text style={styles.titleText}>{currentUser.name}</Text>
      <Text style={styles.subtitleText}>{currentUser.email}</Text>
      <Text style={[styles.subtitleText, { marginTop: -14 }]}>{currentUser.phone}</Text>

      <TouchableOpacity 
        style={styles.switchButton} 
        onPress={() => switchRole(currentUser.role === 'customer' ? 'worker' : 'customer')}
      >
        <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.switchButtonText}>
          Switch to {currentUser.role === 'customer' ? 'Worker View' : 'Customer View'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.switchButton, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF3B30', marginTop: 14 }]} 
        onPress={logoutUser}
      >
        <Ionicons name="log-out" size={18} color="#FF3B30" style={{ marginRight: 8 }} />
        <Text style={[styles.switchButtonText, { color: '#FF3B30' }]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// SIMULATED REAL-TIME IN-APP PUSH NOTIFICATION BANNER COMPONENT
const NotificationBanner = () => {
  const { currentUser, userRole, activeBooking, chatMessages, jobInvites } = useBooking();
  const [notification, setNotification] = useState(null);
  
  const animatedY = useRef(new Animated.Value(-120)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Track previous states to trigger notifications on change
  const prevStatusRef = useRef(activeBooking?.status);
  const prevBookingIdRef = useRef(activeBooking?.id);
  const prevMessagesLengthRef = useRef(chatMessages?.length || 0);
  const prevInvitesLengthRef = useRef(jobInvites?.length || 0);

  // Initialize previous states so they don't fire on cold start
  useEffect(() => {
    prevStatusRef.current = activeBooking?.status;
    prevBookingIdRef.current = activeBooking?.id;
    prevMessagesLengthRef.current = chatMessages?.length || 0;
    prevInvitesLengthRef.current = jobInvites?.length || 0;
  }, []);

  const triggerNotification = (bulletin) => {
    setNotification(bulletin);
    
    // Slide down and Fade in
    Animated.parallel([
      Animated.spring(animatedY, {
        toValue: 20, // 20px off top safe area
        useNativeDriver: true,
        bounciness: 8,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      dismissNotification();
    }, 4500);

    return () => clearTimeout(timer);
  };

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(animatedY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setNotification(null);
    });
  };

  useEffect(() => {
    if (!currentUser) return;

    // 1. CHAT MESSAGES INCOMING PUSH TRACKER
    if (chatMessages && chatMessages.length > prevMessagesLengthRef.current) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage) {
        const isMine = lastMessage.sender === userRole;
        if (!isMine) {
          const senderName = userRole === 'customer' 
            ? (activeBooking?.provider?.name || 'Ahmed Kamal') 
            : (activeBooking?.customerName || 'Ayesha Khan');
          
          triggerNotification({
            title: `${senderName} says:`,
            body: lastMessage.text,
            icon: 'chatbubble-ellipses',
            iconColor: '#34C759', // Green for real-time messaging
            target: 'ChatScreen'
          });
        }
      }
    }
    if (chatMessages) {
      prevMessagesLengthRef.current = chatMessages.length;
    }

    // 2. BOOKING STATUS CHANGES PUSH TRACKER
    if (activeBooking) {
      if (prevBookingIdRef.current !== activeBooking.id) {
        if (userRole === 'customer' && activeBooking.status === 'pending') {
          triggerNotification({
            title: 'Booking Requested! ⚡',
            body: `Searching for a nearby ${activeBooking.service} Specialist...`,
            icon: 'cloud-upload',
            iconColor: '#007AFF',
            target: 'Activity'
          });
        }
      } else if (prevStatusRef.current !== activeBooking.status) {
        if (activeBooking.status === 'assigned') {
          triggerNotification({
            title: 'Specialist Confirmed! 🥇',
            body: `${activeBooking.provider?.name || 'Ahmed Kamal'} accepted your booking request.`,
            icon: 'checkmark-circle',
            iconColor: '#34C759',
            target: 'Activity'
          });
        } else if (activeBooking.status === 'in_progress') {
          triggerNotification({
            title: 'Service in Progress 🛠️',
            body: `Technician has arrived on site and started repairing!`,
            icon: 'construct',
            iconColor: '#5856D6',
            target: 'Activity'
          });
        } else if (activeBooking.status === 'completed') {
          triggerNotification({
            title: 'Hourly Job Completed! 🧾',
            body: `Booking completed. Tap to view payment bill invoice.`,
            icon: 'receipt',
            iconColor: '#FF3B30',
            target: 'Activity'
          });
        }
      }
      prevStatusRef.current = activeBooking.status;
      prevBookingIdRef.current = activeBooking.id;
    } else {
      if (prevBookingIdRef.current) {
        if (prevStatusRef.current === 'pending') {
          triggerNotification({
            title: 'Booking Cancelled ❌',
            body: 'Your service request has been withdrawn.',
            icon: 'close-circle',
            iconColor: '#FF3B30',
            target: 'Activity'
          });
        }
        prevStatusRef.current = null;
        prevBookingIdRef.current = null;
      }
    }

    // 3. JOB INVITATIONS RECEIVED (FOR WORKER)
    if (userRole === 'worker' && jobInvites) {
      if (jobInvites.length > prevInvitesLengthRef.current) {
        const lastInvite = jobInvites[jobInvites.length - 1];
        if (lastInvite) {
          triggerNotification({
            title: 'New Service Job Request! 🛠️',
            body: `Customer needs a ${lastInvite.service}: "${lastInvite.subService}"`,
            icon: 'flash-sharp',
            iconColor: '#FFCC00',
            target: 'WorkerRoot'
          });
        }
      }
      prevInvitesLengthRef.current = jobInvites.length;
    }

  }, [activeBooking, chatMessages, jobInvites, userRole, currentUser]);

  if (!notification) return null;

  const handlePress = () => {
    if (notification.target && navigationRef.isReady()) {
      navigationRef.navigate(notification.target);
    }
    dismissNotification();
  };

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          transform: [{ translateY: animatedY }],
          opacity: animatedOpacity,
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.bannerTouch} 
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <View style={[styles.bannerIconBadge, { backgroundColor: notification.iconColor + '15' }]}>
          <Ionicons name={notification.icon || 'notifications'} size={20} color={notification.iconColor || '#FF3B30'} />
        </View>
        <View style={styles.bannerTextContent}>
          <Text style={styles.bannerMiniHeader}>HAAZIR PUSH</Text>
          <Text style={styles.bannerTitle} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.bannerBody} numberOfLines={2}>{notification.body}</Text>
        </View>
        <TouchableOpacity style={styles.bannerCloseBtn} onPress={dismissNotification}>
          <Ionicons name="close" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ROOT STACK NAVIGATOR
// Evaluates which role is currently configured and handles deep page stacks (like Booking modal, Job details)
export default function AppNavigator() {
  const { currentUser, userRole, isRestoringSession } = useBooking();

  // Show a minimal branded splash while AsyncStorage loads the saved session.
  // Without this, the Auth screen flashes for a split second before the user
  // is redirected to their home screen — bad UX on every app restart.
  if (isRestoringSession) {
    return (
      <View style={styles.splashContainer}>
        <Ionicons name="construct" size={52} color="#FF3B30" />
        <Text style={styles.splashTitle}>Haazir</Text>
        <Text style={styles.splashSubtitle}>On-Demand Services</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          // AUTHENTICATION FLOW
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
        ) : userRole === 'customer' ? (
          // CUSTOMER STACK
          <>
            <Stack.Screen name="CustomerRoot" component={CustomerTabNavigator} />
            <Stack.Screen 
              name="BookingScreen" 
              component={BookingScreen} 
              options={{ 
                headerShown: true, 
                title: 'Schedule Service',
                headerStyle: styles.header,
                headerTintColor: '#1C1C1E',
                headerTitleStyle: styles.headerTitle,
              }}
            />
            <Stack.Screen 
              name="ChatScreen" 
              component={ChatScreen} 
              options={{ 
                headerShown: true, 
                title: 'Chat with Specialist',
                headerStyle: styles.header,
                headerTintColor: '#1C1C1E',
                headerTitleStyle: styles.headerTitle,
              }}
            />
          </>
        ) : (
          // WORKER / SERVICE PROVIDER STACK
          <>
            <Stack.Screen name="WorkerRoot" component={WorkerDashboard} />
            <Stack.Screen 
              name="JobDetailsScreen" 
              component={JobDetailsScreen} 
              options={{ 
                headerShown: true, 
                title: 'Job Invitation Detail',
                headerStyle: styles.header,
                headerTintColor: '#1C1C1E',
                headerTitleStyle: styles.headerTitle,
              }}
            />
            <Stack.Screen 
              name="ChatScreen" 
              component={ChatScreen} 
              options={{ 
                headerShown: true, 
                title: 'Chat with Customer',
                headerStyle: styles.header,
                headerTintColor: '#1C1C1E',
                headerTitleStyle: styles.headerTitle,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    
    {/* Real-time Simulated In-App Push Notification Banners */}
    <NotificationBanner />
  </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    elevation: 0, // removes shadow on Android
    shadowOpacity: 0, // removes shadow on iOS
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  bannerContainer: {
    position: 'absolute',
    top: 15, // Absolute layout above screen stacks
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  bannerTouch: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bannerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bannerTextContent: {
    flex: 1,
    paddingRight: 8,
  },
  bannerMiniHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 1,
  },
  bannerBody: {
    fontSize: 11,
    color: '#3A3A3C',
    marginTop: 1,
    lineHeight: 14,
  },
  bannerCloseBtn: {
    padding: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
    padding: 24,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  switchButton: {
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
