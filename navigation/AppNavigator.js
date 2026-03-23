import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import BookingScreen from '../screens/dashboard/BookingScreen';
import SeatSelectionScreen from '../screens/main/SeatSelectionScreen';
import PassengerDetailsScreen from '../screens/main/PassengerDetailsScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import BookingConfirmationScreen from '../screens/main/BookingConfirmationScreen';
import RoutesScreen from '../screens/main/RoutesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
          <Stack.Screen name="PassengerDetails" component={PassengerDetailsScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          <Stack.Screen name="Routes" component={RoutesScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;