// src/screens/Matrimonial/MatrimonialDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

const MatrimonialDetailScreen = ({ route }) => {
  const { profileId } = route.params;
  const { profile: userProfile, isVerified } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('matrimonial_profiles')
        .select('*, users(*)')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleContactRequest = async () => {
    if (!isVerified) {
      Alert.alert(
        'Verification Required',
        'You need to be verified to send contact requests'
      );
      return;
    }

    Alert.alert(
      'Send Contact Request',
      'Would you like to send a contact request to this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              setRequesting(true);
              const { error } = await dbHelpers.createContactRequest(
                profileId,
                userProfile.id
              );

              if (error) throw error;

              Alert.alert(
                'Request Sent',
                'Your contact request has been sent successfully!'
              );
            } catch (error) {
              console.error('Error sending request:', error);
              Alert.alert('Error', 'Failed to send contact request');
            } finally {
              setRequesting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photos */}
      {profile.photos && profile.photos.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.photoScroll}
        >
          {profile.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Basic Info */}
      <Card style={styles.card}>
        <Text style={styles.name}>{profile.users?.full_name || 'Anonymous'}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{profile.age} years</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="male-female" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {profile.gender === 'male' ? 'Male' : 'Female'}
            </Text>
          </View>

          {profile.gotra && (
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Gotra</Text>
              <Text style={styles.infoValue}>{profile.gotra}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Education & Career */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Education & Career</Text>
        
        {profile.education && (
          <View style={styles.detailRow}>
            <Ionicons name="school" size={20} color={COLORS.gray600} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Education</Text>
              <Text style={styles.detailValue}>{profile.education}</Text>
            </View>
          </View>
        )}

        {profile.occupation && (
          <View style={styles.detailRow}>
            <Ionicons name="briefcase" size={20} color={COLORS.gray600} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Occupation</Text>
              <Text style={styles.detailValue}>{profile.occupation}</Text>
            </View>
          </View>
        )}

        {profile.city && (
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={COLORS.gray600} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>City</Text>
              <Text style={styles.detailValue}>{profile.city}</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Family Details */}
      {profile.family_details && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Family Details</Text>
          <Text style={styles.description}>{profile.family_details}</Text>
        </Card>
      )}

      {/* Additional Info */}
      {profile.additional_info && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <Text style={styles.description}>{profile.additional_info}</Text>
        </Card>
      )}

      {/* Horoscope */}
      {profile.horoscope_url && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Horoscope</Text>
          <TouchableOpacity
            style={styles.horoscopeButton}
            onPress={() => Linking.openURL(profile.horoscope_url)}
          >
            <Ionicons name="document-text" size={24} color={COLORS.primary} />
            <Text style={styles.horoscopeText}>View Horoscope</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Contact Button */}
      <Button
        title="Send Contact Request"
        onPress={handleContactRequest}
        loading={requesting}
        fullWidth
        style={styles.contactButton}
        icon={<Ionicons name="mail" size={20} color={COLORS.white} />}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING['2xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoScroll: {
    height: 400,
  },
  photo: {
    width: width,
    height: 400,
  },
  card: {
    margin: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  horoscopeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: `${COLORS.primary}10`,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  horoscopeText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  contactButton: {
    marginHorizontal: SPACING.lg,
  },
});

export default MatrimonialDetailScreen;