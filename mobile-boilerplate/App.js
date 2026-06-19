import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import our providers and root routing components
import { BookingProvider } from './src/context/BookingContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <BookingProvider>
        {/* Safe Area and Device Context Configuration */}
        <StatusBar style="auto" />
        <AppNavigator />
      </BookingProvider>
    </SafeAreaProvider>
  );
}
