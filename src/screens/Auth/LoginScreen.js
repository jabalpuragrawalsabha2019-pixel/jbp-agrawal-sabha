// src/screens/Auth/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const { user, profile, loading: authLoading, needsPhoneVerification } = useAuth();
  const [loading, setLoading] = useState(false);

  // Handle auth state changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to be ready
    
    if (user) {
      console.log('User authenticated:', user.id);
      console.log('Has profile:', !!profile);
      console.log('Needs phone verification:', needsPhoneVerification);
      
      if (needsPhoneVerification) {
        // User logged in but no phone - go to verification
        console.log('Redirecting to phone verification');
        navigation.replace('PhoneVerification');
      } else if (profile) {
        // User has complete profile - go to home
        console.log('Profile complete, going home');
        navigation.replace('Home');
      }
    }
  }, [user, profile, needsPhoneVerification, authLoading, navigation]);

  // Create the redirect URI that works with both web and mobile
  const redirectUrl = makeRedirectUri({
    scheme: 'com.jbpagrawal.sabha',
    path: 'auth/callback',
  });

  useEffect(() => {
    console.log('Redirect URL:', redirectUrl);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Google Sign In...');
      console.log('Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }

      console.log('Opening browser with URL:', data.url);

      // Open the OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      console.log('Browser result:', result);

      if (result.type === 'success' && result.url) {
        console.log('Success! Processing callback...');
        
        try {
          // The URL will contain either a hash fragment (#) or search params (?)
          const url = new URL(result.url);
          let params;
          
          if (url.hash) {
            // Parse hash fragment
            params = new URLSearchParams(url.hash.substring(1));
          } else {
            // Parse search params
            params = url.searchParams;
          }
          
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          console.log('Auth tokens found:', {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token
          });

          if (!access_token || !refresh_token) {
            throw new Error('Invalid callback URL - missing tokens');
          }

          console.log('Setting session with tokens...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (sessionError) {
            throw sessionError;
          }
          
          console.log('Session set successfully!');
          console.log('User ID:', sessionData?.user?.id);
          
          // Get current session to verify
          const { data: { session }, error: getCurrentError } = await supabase.auth.getSession();
          if (getCurrentError) throw getCurrentError;
          
          if (!session) {
            throw new Error('Session not established after sign in');
          }
          
          console.log('Session verified! Auth state should update shortly...');
          
          // The AuthProvider's useEffect will handle navigation once it detects the session
          setLoading(false);
          
        } catch (parseError) {
          console.error('Error processing callback:', parseError);
          Alert.alert(
            'Sign In Error',
            'There was a problem completing the sign in. Please try again.'
          );
          setLoading(false);
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('User cancelled or dismissed sign in');
        setLoading(false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Unable to sign in with Google. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
          <Text style={styles.title}>JBP Agrawal Sabha</Text>
          <Text style={styles.subtitle}>Unity • Prosperity • Service</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            Inspired by Maharaj Agrasen
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'people', text: 'Connect with Community' },
            { icon: 'heart', text: 'Matrimonial Services' },
            { icon: 'calendar', text: 'Events & News' },
            { icon: 'briefcase', text: 'Job Opportunities' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name={feature.icon} size={20} color={COLORS.white} />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.gray700} />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color={COLORS.error} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By signing in, you agree to our Terms & Conditions
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Jabalpur Agrawal Community
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
    paddingVertical: SPACING['2xl'],
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    marginVertical: SPACING.md,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  features: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: SPACING.md,
  },
  googleButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  googleButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  disclaimer: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default LoginScreen;