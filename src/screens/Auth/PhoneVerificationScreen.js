// src/screens/Auth/PhoneVerificationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { COLORS, SPACING, RADIUS, FONT_SIZES, PATTERNS } from '../../utils/constants';

const PhoneVerificationScreen = () => {
  const { checkPhoneVerification, createUserProfile, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState({
    full_name: user?.user_metadata?.full_name || '',
    city: '',
    occupation: '',
  });

  // requestIdRef helps ignore stale async responses (e.g., after sign-out/in)
  const requestIdRef = useRef(0);

  // Reset verification and info when user changes (e.g., sign out/in)
  useEffect(() => {
    // bump requestId to invalidate any in-flight verification
    requestIdRef.current += 1;
    setVerificationResult(null);
    setPhone('');
    setLoading(false);
    setAdditionalInfo({
      full_name: user?.user_metadata?.full_name || '',
      city: '',
      occupation: '',
    });
  }, [user]);

  const handleVerifyPhone = async () => {
    if (!phone || !PATTERNS.phone.test(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    // mark this request id; any later change to requestIdRef.current will make this response stale
    const localRequestId = ++requestIdRef.current;

    setLoading(true);
    const cleanPhone = phone.trim();
    console.log('Verifying phone (requestId=' + localRequestId + '):', cleanPhone);
    setLoadingMessage('Checking member registry...');

    // Increased timeout to account for potential retries (20s + 1s delay + 40s + 1s delay = 62s)
    // Adding 10s buffer = 72s total
    const timeoutMs = 72000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Phone verification is taking too long. Please try again.')), timeoutMs)
    );

    try {
      // Race verification and timeout
      const result = await Promise.race([checkPhoneVerification(cleanPhone), timeoutPromise]);

      // If another request or user change occurred, ignore this result
      if (localRequestId !== requestIdRef.current) {
        console.log('Stale verification response (requestId=' + localRequestId + '), ignoring');
        return;
      }

      setLoading(false);

      // checkPhoneVerification may return { data, error }
      const data = result?.data ?? null;
      const error = result?.error ?? null;

      console.log('Verification result (requestId=' + localRequestId + '):', { data, error });

      if (error) {
        console.log('Error during verification:', error);
        setVerificationResult({ verified: false });
        Alert.alert(
          '⚠️ Error',
          'There was an error verifying your phone. You can continue with limited access.',
          [{ text: 'Continue' }]
        );
        return;
      }

      if (data) {
        console.log('Phone found in approved list:', data);
        setVerificationResult({ verified: true, data });
        setAdditionalInfo({
          full_name: data.full_name || user?.user_metadata?.full_name || '',
          city: data.city || '',
          occupation: '',
        });
        Alert.alert(
          '✅ Verified!',
          'Your phone number is registered. You will have full access to the app.',
          [{ text: 'Continue' }]
        );
      } else {
        console.log('Phone not found, creating unverified profile');
        setVerificationResult({ verified: false });
        Alert.alert(
          '⚠️ Phone Not Found',
          'Your phone number is not in our registry. You can still create a profile with read-only access. An admin will verify you later for full access.',
          [{ text: 'Continue' }]
        );
      }
    } catch (err) {
      // If request is stale, ignore
      if (localRequestId !== requestIdRef.current) {
        console.log('Stale/ignored error for requestId=' + localRequestId + ':', err.message);
        return;
      }

      setLoading(false);
      setVerificationResult({ verified: false });
      console.error('Verification error (requestId=' + localRequestId + '):', err);
      Alert.alert('Verification Error', err.message || 'An unexpected error occurred. You can continue with limited access.', [{ text: 'OK' }]);
    }
  };

  const handleCompleteProfile = async () => {
    if (!additionalInfo.full_name.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    if (!additionalInfo.city.trim()) {
      Alert.alert('Required', 'Please enter your city');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting profile creation...');

      const profileData = {
        phone: phone,
        full_name: additionalInfo.full_name.trim(),
        city: additionalInfo.city.trim(),
        occupation: additionalInfo.occupation.trim() || null,
        is_verified: verificationResult?.verified || false,
        photo_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
      };

      console.log('Creating profile with data:', profileData);

      const { data, error } = await createUserProfile(profileData);

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Profile creation returned no data');
      }

      console.log('Profile created successfully:', data);

      if (verificationResult?.verified) {
        Alert.alert(
          '🎉 Welcome!',
          'Your profile has been created successfully. You have full access to all features.',
          [{ text: 'Get Started' }]
        );
      } else {
        Alert.alert(
          '✅ Profile Created',
          'Your profile has been created with read-only access. You can view all content, but posting requires admin verification. We will notify you once verified.',
          [{ text: 'Continue' }]
        );
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert(
        'Error',
        error.message || 'Unable to create profile. Please check your connection and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="phone-portrait" size={60} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              {verificationResult === null
                ? 'Enter your phone number to continue'
                : verificationResult.verified
                ? '✅ Verified! Complete your profile'
                : '⚠️ Create your profile'}
            </Text>
          </View>

          <View style={styles.content}>
            {/* Phone Input */}
            {verificationResult === null && (
              <Card style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <View style={styles.phoneInput}>
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 10-digit number"
                      placeholderTextColor={COLORS.gray400}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!loading}
                    />
                  </View>
                </View>

                <Button
                  title="Verify Phone"
                  onPress={handleVerifyPhone}
                  loading={loading}
                  fullWidth
                />

                {loading && (
                  <View style={styles.loadingMessageBox}>
                    <Text style={styles.loadingMessage}>{loadingMessage}</Text>
                  </View>
                )}

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={COLORS.info} />
                  <Text style={styles.infoText}>
                    Your phone will be checked against our member registry
                  </Text>
                </View>
              </Card>
            )}

            {/* Verification Result - VERIFIED */}
            {verificationResult?.verified && (
              <Card style={styles.card}>
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={50} color={COLORS.success} />
                  <Text style={styles.successTitle}>Phone Verified!</Text>
                  <Text style={styles.successSubtext}>
                    You will have full access to all features
                  </Text>
                </View>

                <View style={styles.verifiedInfo}>
                  <Text style={styles.infoLabel}>Registered Phone:</Text>
                  <Text style={styles.infoValue}>+91 {phone}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.gray400}
                    value={additionalInfo.full_name}
                    onChangeText={(text) =>
                      setAdditionalInfo({ ...additionalInfo, full_name: text })
                    }
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your city"
                    placeholderTextColor={COLORS.gray400}
                    value={additionalInfo.city}
                    onChangeText={(text) =>
                      setAdditionalInfo({ ...additionalInfo, city: text })
                    }
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Occupation</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your occupation"
                    placeholderTextColor={COLORS.gray400}
                    value={additionalInfo.occupation}
                    onChangeText={(text) =>
                      setAdditionalInfo({ ...additionalInfo, occupation: text })
                    }
                    editable={!loading}
                  />
                </View>

                <Button
                  title="Complete Profile"
                  onPress={handleCompleteProfile}
                  loading={loading}
                  fullWidth
                />
              </Card>
            )}

            {/* Verification Result - UNVERIFIED */}
            {verificationResult && !verificationResult.verified && (
              <Card style={styles.card}>
                <View style={styles.warningBanner}>
                  <Ionicons name="shield-checkmark-outline" size={50} color={COLORS.warning} />
                  <Text style={styles.warningTitle}>Create Your Profile</Text>
                  <Text style={styles.warningSubtext}>
                    Read-only access until admin verification
                  </Text>
                </View>

                <View style={styles.accessInfo}>
                  <Text style={styles.accessTitle}>What you can do:</Text>
                  <View style={styles.accessItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.accessText}>View all events and announcements</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.accessText}>Browse matrimonial profiles</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.accessText}>View community directory</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.accessText}>See job postings</Text>
                  </View>
                  
                  <Text style={[styles.accessTitle, { marginTop: SPACING.md }]}>After verification:</Text>
                  <View style={styles.accessItem}>
                    <Ionicons name="lock-closed" size={16} color={COLORS.gray500} />
                    <Text style={styles.accessTextLocked}>Post events and jobs</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Ionicons name="lock-closed" size={16} color={COLORS.gray500} />
                    <Text style={styles.accessTextLocked}>Create matrimonial profile</Text>
                  </View>
                  <View style={styles.accessItem}>
                    <Ionicons name="lock-closed" size={16} color={COLORS.gray500} />
                    <Text style={styles.accessTextLocked}>Access contact information</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.gray400}
                    value={additionalInfo.full_name}
                    onChangeText={(text) =>
                      setAdditionalInfo({ ...additionalInfo, full_name: text })
                    }
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your city"
                    placeholderTextColor={COLORS.gray400}
                    value={additionalInfo.city}
                    onChangeText={(text) =>
                      setAdditionalInfo({ ...additionalInfo, city: text })
                    }
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Occupation</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your occupation"
                    placeholderTextColor={COLORS.gray400}
                    value={additionalInfo.occupation}
                    onChangeText={(text) =>
                      setAdditionalInfo({ ...additionalInfo, occupation: text })
                    }
                    editable={!loading}
                  />
                </View>

                <Button
                  title="Create Profile (Pending Verification)"
                  onPress={handleCompleteProfile}
                  loading={loading}
                  fullWidth
                />

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={COLORS.info} />
                  <Text style={styles.infoText}>
                    An admin will review and verify your profile. You'll be notified once verified.
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingHorizontal: SPACING.md,
  },
  prefix: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    paddingVertical: SPACING.md,
  },
  inputField: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
  },
  loadingMessageBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.info + '15',
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  loadingMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    fontWeight: '500',
    textAlign: 'center',
  },
  successBanner: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.success + '20',
    borderRadius: RADIUS.lg,
  },
  successText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: SPACING.sm,
  },
  warningBanner: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '20',
    borderRadius: RADIUS.lg,
  },
  warningText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginTop: SPACING.sm,
  },
  verifiedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  unverifiedInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
});

export default PhoneVerificationScreen;