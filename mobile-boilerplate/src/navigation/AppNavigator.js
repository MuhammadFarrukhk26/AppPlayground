import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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

// ROOT STACK NAVIGATOR
// Evaluates which role is currently configured and handles deep page stacks (like Booking modal, Job details)
export default function AppNavigator() {
  const { currentUser, userRole } = useBooking();

  return (
    <NavigationContainer>
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
  );
}

const styles = StyleSheet.create({
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
