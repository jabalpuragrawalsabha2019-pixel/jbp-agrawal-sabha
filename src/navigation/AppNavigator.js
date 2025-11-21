// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../utils/constants';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import PhoneVerificationScreen from '../screens/Auth/PhoneVerificationScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import DirectoryScreen from '../screens/Profile/DirectoryScreen';
import MatrimonialListScreen from '../screens/Matrimonial/MatrimonialListScreen';
import MatrimonialDetailScreen from '../screens/Matrimonial/MatrimonialDetailScreen';
import CreateMatrimonialScreen from '../screens/Matrimonial/CreateMatrimonialScreen';
import EventsScreen from '../screens/Events/EventsScreen';
import EventDetailScreen from '../screens/Events/EventDetailScreen';
import JobsScreen from '../screens/Jobs/JobsScreen';
import PostJobScreen from '../screens/Jobs/PostJobScreen';
import BloodDonorsScreen from '../screens/Blood/BloodDonorsScreen';
import RegisterDonorScreen from '../screens/Blood/RegisterDonorScreen';
import DonationsScreen from '../screens/Donations/DonationsScreen';
import PostHoldersScreen from '../screens/PostHolders/PostHoldersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Directory':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Matrimonial':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'More':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray200,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'JBP Agrawal Sabha' }}
      />
      <Tab.Screen 
        name="Directory" 
        component={DirectoryScreen}
        options={{ title: 'Directory' }}
      />
      <Tab.Screen 
        name="Matrimonial" 
        component={MatrimonialListScreen}
        options={{ title: 'Matrimonial' }}
      />
      <Tab.Screen 
        name="More" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, profile, loading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('=== AppNavigator State ===');
    console.log('Loading:', loading);
    console.log('User exists:', !!user);
    console.log('Profile exists:', !!profile);
    console.log('Profile phone:', profile?.phone);
    console.log('========================');
  }, [loading, user, profile]);

  if (loading) {
    console.log('Showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Determine authentication state
  const hasUser = !!user;
  const hasProfile = !!profile;
  const hasPhone = !!profile?.phone;

  console.log('Auth State:', { hasUser, hasProfile, hasPhone });

  // Route decision logic:
  // 1. No user -> Show Login
  // 2. Has user but no profile or no phone -> Show Phone Verification
  // 3. Has user, profile, and phone -> Show Main App

  if (!hasUser) {
    console.log('No user - showing Login');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (!hasProfile || !hasPhone) {
    console.log('User exists but needs phone verification');
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="PhoneVerification"
          component={PhoneVerificationScreen}
          options={{ 
            title: 'Verify Phone Number',
            headerLeft: null, // Prevent going back
          }}
        />
      </Stack.Navigator>
    );
  }

  // User is fully authenticated
  console.log('User fully authenticated - showing main app');
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MatrimonialDetail"
        component={MatrimonialDetailScreen}
        options={{ title: 'Profile Details' }}
      />
      <Stack.Screen
        name="CreateMatrimonial"
        component={CreateMatrimonialScreen}
        options={{ title: 'Create Matrimonial Profile' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="Events"
        component={EventsScreen}
        options={{ title: 'Events & News' }}
      />
      <Stack.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ title: 'Job Opportunities' }}
      />
      <Stack.Screen
        name="PostJob"
        component={PostJobScreen}
        options={{ title: 'Post a Job' }}
      />
      <Stack.Screen
        name="BloodDonors"
        component={BloodDonorsScreen}
        options={{ title: 'Blood Donors' }}
      />
      <Stack.Screen
        name="RegisterDonor"
        component={RegisterDonorScreen}
        options={{ title: 'Register as Donor' }}
      />
      <Stack.Screen
        name="Donations"
        component={DonationsScreen}
        options={{ title: 'Donations' }}
      />
      <Stack.Screen
        name="PostHolders"
        component={PostHoldersScreen}
        options={{ title: 'Office Bearers' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;