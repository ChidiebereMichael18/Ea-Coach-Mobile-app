import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import BookingScreen from '../screens/dashboard/BookingScreen';
import ChatSupportScreen from '../screens/dashboard/ChatSupportScreen';
import SeatSelectionScreen from '../screens/main/SeatSelectionScreen';
import PassengerDetailsScreen from '../screens/main/PassengerDetailsScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import BookingConfirmationScreen from '../screens/main/BookingConfirmationScreen';
import RoutesScreen from '../screens/main/RoutesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, initializing } = useAuth();

  // Always show the splash on cold start for at least 2.5 seconds
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Keep showing splash until BOTH: timer elapsed AND auth token check is done
  if (showSplash || initializing) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="ChatSupport" component={ChatSupportScreen} />
          <Stack.Screen name="Routes" component={RoutesScreen} />
          <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
          <Stack.Screen name="PassengerDetails" component={PassengerDetailsScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;