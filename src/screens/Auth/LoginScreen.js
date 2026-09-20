/**
 * Login screen — Google OAuth entry point.
 * Navigation after auth is handled by AppNavigator from AuthProvider state.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { signInWithGoogleOAuth, getAuthRedirectUrl } from '../../utils/oauthSession';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const LoginScreen = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Redirect URL:', getAuthRedirectUrl());
  }, []);

  /**
   * Starts Google OAuth. On success, AuthProvider + AppNavigator route the user.
   * @returns {Promise<void>}
   */
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Google Sign In...');

      const { session, cancelled } = await signInWithGoogleOAuth();

      if (cancelled) {
        console.log('Sign in cancelled or browser dismissed without tokens');
        Alert.alert(
          'Sign In Incomplete',
          'Google sign-in did not return to the app.\n\nIn Supabase → Authentication → URL Configuration, add:\n• com.jbpagrawal.sabha://**\n• exp://**\n\nThen try again.',
        );
        return;
      }

      if (!session) {
        throw new Error('Session not established after sign in');
      }

      console.log('Session verified for user:', session.user?.id);
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Unable to sign in with Google. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const buttonBusy = loading || (authLoading && !!user);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
          <Text style={styles.title}>JBP Agrawal Sabha</Text>
          <Text style={styles.subtitle}>Unity • Prosperity • Service</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Inspired by Maharaj Agrasen</Text>
        </View>

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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={buttonBusy}
            activeOpacity={0.8}
          >
            {buttonBusy ? (
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
