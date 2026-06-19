import { CodeFile } from '../types';

export const CODE_FILES: CodeFile[] = [
  {
    name: 'BookingContext.js',
    path: 'src/context/BookingContext.js',
    language: 'javascript',
    explanation: 'Uses the React Context API to manage active booking statuses, job invites, and user roles. This synchronizes state changes (e.g., Worker accepts a job or updates progress) instantly between both perspectives.',
    content: `import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context for managing booking and session state globally
export const BookingContext = createContext();

// Mock initial configurations
const SERVICES = {
  electrician: { title: 'Electrician', basePrice: 15, rating: 4.8 },
  plumber: { title: 'Plumber', basePrice: 18, rating: 4.7 },
  cctv: { title: 'CCTV Specialist', basePrice: 25, rating: 4.9 },
  appliance: { title: 'Appliance Repair', basePrice: 20, rating: 4.6 },
};

const MOCK_WORKER = {
  id: 'WKR-401',
  name: 'Ahmed Kamal',
  avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80',
  phone: '+92 300 1234567',
  rating: 4.88,
  trips: 342,
  specialty: 'Electrician & HVAC Specialist',
};

export const BookingProvider = ({ children }) => {
  // App Roles: 'customer' or 'worker'
  const [userRole, setUserRole] = useState('customer');

  // Worker availability state
  const [isWorkerOnline, setIsWorkerOnline] = useState(false);

  // Active customer booking: null, or { service, subService, address, slot, description, status, price, provider }
  // Status stages: 'pending' -> 'assigned' -> 'in_progress' -> 'completed'
  const [activeBooking, setActiveBooking] = useState(null);

  // Incoming job applications/invitations for the service provider
  const [jobInvites, setJobInvites] = useState([]);

  // Completed bookings history (local log)
  const [bookingHistory, setBookingHistory] = useState([]);

  // Log summary of state transitions to feed the visualizer log
  const [actionLogs, setActionLogs] = useState([
    { id: '1', time: new Date().toLocaleTimeString(), message: 'Haazir Systems online. Welcome to On-Demand Service App.' }
  ]);

  const addLog = (message) => {
    setActionLogs((prev) => [
      { id: Date.now().toString(), time: new Date().toLocaleTimeString(), message },
      ...prev,
    ]);
  };

  // Sync state: When a new pending booking is created, make it available as a Job Invite for the Worker Flow
  useEffect(() => {
    if (activeBooking && activeBooking.status === 'pending') {
      const newInvite = {
        id: activeBooking.id,
        service: activeBooking.service,
        subService: activeBooking.subService,
        address: activeBooking.address,
        slot: activeBooking.slot,
        description: activeBooking.description,
        price: activeBooking.price,
        customerName: 'Ayesha Khan',
        customerPhone: '+92 321 9876543',
        distance: '1.2 km away',
      };
      setJobInvites([newInvite]);
      addLog(\`Job dispatched to nearby workers: \${activeBooking.service} - \${activeBooking.subService}\`);
    } else if (!activeBooking) {
      setJobInvites([]);
    }
  }, [activeBooking]);

  // Method to toggle roles (Customer vs Worker) for a unified view
  const switchRole = (role) => {
    setUserRole(role);
    addLog(\`Switched user role view to: "\${role.toUpperCase()}"\`);
  };

  // Create a new Booking (initiated by customer)
  const createBooking = (serviceKey, subService, address, slot, description) => {
    const serviceInfo = SERVICES[serviceKey] || { title: serviceKey, basePrice: 20 };
    const basePrice = serviceInfo.basePrice;
    const workPrice = Math.floor(Math.random() * 15) + 15; // Simulated service fee
    const taxPrice = Math.round((basePrice + workPrice) * 0.05);
    const totalPrice = basePrice + workPrice + taxPrice;

    const newBooking = {
      id: \`HZ-\${Math.floor(100000 + Math.random() * 90000)}\`,
      service: serviceInfo.title,
      serviceKey,
      subService: subService || 'General Maintenance',
      address: address || 'DHA Phase 5, Lahore, Pakistan',
      slot: slot || 'As soon as possible',
      description: description || 'No comments provided.',
      status: 'pending',
      price: {
        base: basePrice,
        work: workPrice,
        tax: taxPrice,
        total: totalPrice,
      },
      provider: null,
      createdAt: new Date().toISOString(),
    };

    setActiveBooking(newBooking);
    addLog(\`Customer raised new request \${newBooking.id} for "\${newBooking.service}"\`);
    return newBooking;
  };

  // Cancel current booking
  const cancelBooking = () => {
    if (activeBooking) {
      addLog(\`Booking \${activeBooking.id} cancelled by Customer.\`);
      setActiveBooking(null);
      setJobInvites([]);
    }
  };

  // Toggle Worker status (Online/Offline)
  const toggleWorkerOnline = () => {
    const nextState = !isWorkerOnline;
    setIsWorkerOnline(nextState);
    addLog(\`Service Provider toggled availability to: \${nextState ? 'ONLINE' : 'OFFLINE'}\`);
  };

  // Worker flow: Accept an incoming Job Invitation
  const acceptJobInvite = (inviteId) => {
    if (!activeBooking || activeBooking.id !== inviteId) return;

    // Transition booking condition to 'assigned' and assign mock provider
    const updatedBooking = {
      ...activeBooking,
      status: 'assigned',
      provider: MOCK_WORKER,
    };

    setActiveBooking(updatedBooking);
    setJobInvites([]); // Clear the invitation card now that it's accepted
    addLog(\`Worker "\${MOCK_WORKER.name}" ACCEPT_JOB for request \${inviteId}\`);
  };

  // Worker flow: Decline an incoming invite
  const declineJobInvite = (inviteId) => {
    setJobInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    addLog(\`Worker rejected/declined job offer \${inviteId}\`);
  };

  // Worker advances job stages: 'assigned' -> 'in_progress' -> 'completed'
  const advanceJobStatus = () => {
    if (!activeBooking) return;

    let nextStatus = 'assigned';
    let message = '';

    if (activeBooking.status === 'assigned') {
      nextStatus = 'in_progress';
      message = \`Worker "\u0024{MOCK_WORKER.name}" has ARRIVED and marked session: "IN_PROGRESS"\`;
    } else if (activeBooking.status === 'in_progress') {
      nextStatus = 'completed';
      message = \`Worker completed work. Session status updated to "COMPLETED"\`;
    }

    setActiveBooking((prev) => ({
      ...prev,
      status: nextStatus,
    }));

    addLog(message);
  };

  // Customer rates the service, resolving the booking and archiving it
  const submitCustomerRating = (rating, feedback) => {
    if (!activeBooking) return;

    const completedRecord = {
      ...activeBooking,
      rating: rating,
      feedback: feedback || 'No written response.',
      completedAt: new Date().toISOString(),
    };

    setBookingHistory((prev) => [completedRecord, ...prev]);
    addLog(\`Customer rated service (\${rating} Stars). Transaction \${activeBooking.id} archived successfully.\`);
    setActiveBooking(null); // Reset active state for next cycle
  };

  return (
    <BookingContext.Provider
      value={{
        userRole,
        switchRole,
        isWorkerOnline,
        toggleWorkerOnline,
        activeBooking,
        jobInvites,
        bookingHistory,
        actionLogs,
        createBooking,
        cancelBooking,
        acceptJobInvite,
        declineJobInvite,
        advanceJobStatus,
        submitCustomerRating,
        addLog,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);`
  },
  {
    name: 'AppNavigator.js',
    path: 'src/navigation/AppNavigator.js',
    language: 'javascript',
    explanation: 'Defines the bottom tab layout for common customer screens (Service Search and Booking History tracking) and nested stack components for scheduling procedures. Displays a separate stack for worker interfaces utilizing React Navigation v6.',
    content: `import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useBooking } from '../context/BookingContext';
import HomeScreen from '../screens/customer/HomeScreen';
import TrackerScreen from '../screens/customer/TrackerScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import WorkerDashboard from '../screens/worker/WorkerDashboard';
import JobDetailsScreen from '../screens/worker/JobDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        headerShown: true,
      })}
    >
      <Tab.Screen name="Services" component={HomeScreen} />
      <Tab.Screen name="Activity" component={TrackerScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { userRole } = useBooking();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === 'customer' ? (
          <>
            <Stack.Screen name="CustomerRoot" component={CustomerTabNavigator} />
            <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ headerShown: true, title: 'Schedule Service' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="WorkerRoot" component={WorkerDashboard} />
            <Stack.Screen name="JobDetailsScreen" component={JobDetailsScreen} options={{ headerShown: true, title: 'Job Detail' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}`
  },
  {
    name: 'HomeScreen.js',
    path: 'src/screens/customer/HomeScreen.js',
    language: 'javascript',
    explanation: 'The graphical home dashboard allowing users to select service categories (Electrician, Plumber, CCTV Security, and Appliance Repair) and choose standard common issue configurations directly.',
    content: `import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'electrician', title: 'Electrician', icon: 'flash', color: '#FFCC00', secondaryColor: '#FFFCEB' },
  { key: 'plumber', title: 'Plumber', icon: 'water', color: '#007AFF', secondaryColor: '#E6F2FF' },
  { key: 'cctv', title: 'CCTV & Security', icon: 'videocam', color: '#34C759', secondaryColor: '#EAF9EE' },
  { key: 'appliance', title: 'Appliance Repair', icon: 'construct', color: '#AF52DE', secondaryColor: '#F7EEFC' },
];

const QUICK_ISSUES = {
  electrician: ['Ceiling Fan Repair', 'UPS Installation', 'Room Wiring Diagnostic'],
  plumber: ['Water Pump Repair', 'Faucet Leaking', 'Drain Blockage Clear'],
  cctv: ['Camera Connection Lost', 'DVR Hard Disk Error', 'New CCTV System Setup'],
  appliance: ['AC Gas Refilling', 'Oven Heating Issue', 'Washing Machine Spin Fix'],
};

export default function HomeScreen({ navigation }) {
  const { activeBooking } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('electrician');

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeBooking && (
          <TouchableOpacity style={styles.activeBanner} onPress={() => navigation.navigate('Activity')}>
            <Text style={styles.activeText}>Active request is [{activeBooking.status.toUpperCase()}]</Text>
          </TouchableOpacity>
        )}
        {/* Render categories grid and quick issues... */}
      </ScrollView>
    </SafeAreaView>
  );
}`
  },
  {
    name: 'TrackerScreen.js',
    path: 'src/screens/customer/TrackerScreen.js',
    language: 'javascript',
    explanation: 'Progress tracking stage visualizer mapping out booking phases. Displays receipts, invoice itemization, and star-ratings upon worker completion.',
    content: `import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function TrackerScreen({ navigation }) {
  const { activeBooking, submitCustomerRating, bookingHistory } = useBooking();
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  if (!activeBooking) {
    return (
      <View style={styles.empty}>
        <Text>No Active Bookings</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {activeBooking.status !== 'completed' ? (
        <View style={styles.tracker}>
          {/* Timeline steps... */}
        </View>
      ) : (
        <View style={styles.ratingSection}>
          <Text>Service Done! Invoice sum: PKR {activeBooking.price.total * 100}</Text>
          {/* Star selector and comment field... */}
        </View>
      )}
    </ScrollView>
  );
}`
  },
  {
    name: 'BookingScreen.js',
    path: 'src/screens/customer/BookingScreen.js',
    language: 'javascript',
    explanation: 'Configuring address details, date selections, scheduled slots, and trouble description instructions. Pressing the booking CTA raises the context dispatch.',
    content: `import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function BookingScreen({ route, navigation }) {
  const { categoryKey, preselectedIssue } = route.params || {};
  const { createBooking } = useBooking();
  const [issueTitle, setIssueTitle] = useState(preselectedIssue || '');
  const [address, setAddress] = useState('DHA Phase 5, Lahore');
  const [slot, setSlot] = useState('As soon as possible');

  const handleSubmit = () => {
    createBooking(categoryKey, issueTitle, address, slot);
    navigation.navigate('CustomerRoot', { screen: 'Activity' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput value={issueTitle} onChangeText={setIssueTitle} placeholder="Trouble details" />
      {/* Date-time dropdown, Address tags selection... */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Request Assistance</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}`
  },
  {
    name: 'WorkerDashboard.js',
    path: 'src/screens/worker/WorkerDashboard.js',
    language: 'javascript',
    explanation: 'Handles worker availability toggling and renders a deck of active invitations or accepting sliders. Provides control buttons to update customer maps.',
    content: `import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function WorkerDashboard() {
  const { isWorkerOnline, toggleWorkerOnline, jobInvites, activeBooking, advanceJobStatus } = useBooking();

  return (
    <SafeAreaView style={styles.container}>
      <Switch value={isWorkerOnline} onValueChange={toggleWorkerOnline} />
      {/* Renders Nearby Invitations or Active Work tracker controls... */}
    </SafeAreaView>
  );
}`
  },
  {
    name: 'JobDetailsScreen.js',
    path: 'src/screens/worker/JobDetailsScreen.js',
    language: 'javascript',
    explanation: 'Renders the detailed description of customer issues, diagnostic notes, base diagnostic visit packages, and physical address items.',
    content: `import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useBooking } from '../../context/BookingContext';

export default function JobDetailsScreen({ route, navigation }) {
  const { job } = route.params || {};
  const { acceptJobInvite } = useBooking();

  return (
    <SafeAreaView>
      <Text>{job.subService}</Text>
      <Text>{job.address}</Text>
      <TouchableOpacity onPress={() => { acceptJobInvite(job.id); navigation.goBack(); }}>
        <Text>Accept Job</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}`
  },
  {
    name: 'App.js',
    path: 'App.js',
    language: 'javascript',
    explanation: 'The top level bootstrapping container mapping the entire hierarchy within structural Theme resources, safe overlays, and the booking store context provider.',
    content: `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BookingProvider } from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <BookingProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </BookingProvider>
    </SafeAreaProvider>
  );
}`
  },
  {
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    explanation: 'Lists native dependencies, run commands, lock packages, and Babel configs needed to spin up clean Android/iOS Expo simulations.',
    content: `{
  "name": "haazir-labor-app",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android"
  },
  "dependencies": {
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "expo": "~50.0.0",
    "react-native": "0.73.2",
    "react-native-screens": "~3.29.0"
  }
}`
  }
];
