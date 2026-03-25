import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Feather';
import HomeScreen from '../screens/dashboard/HomeScreen';
import RoutesScreen from '../screens/main/RoutesScreen';
import BookingHistoryScreen from '../screens/dashboard/BookingHistoryScreen';
import ChatSupportScreen from '../screens/dashboard/ChatSupportScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Explore') iconName = 'compass';
          else if (route.name === 'Bookings') iconName = 'briefcase';
          else if (route.name === 'Chat') iconName = 'message-circle';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={iconName} size={20} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={RoutesScreen} />
      <Tab.Screen name="Bookings" component={BookingHistoryScreen} />
      <Tab.Screen name="Chat" component={ChatSupportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
  },
  iconWrapActive: {
    // subtle emphasis
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});

export default MainTabNavigator;