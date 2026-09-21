/**
 * Matrimonial profile detail — shows Pratyashi Parichay fields for approved/own profiles.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

/** Renders a label/value row when value is present. */
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
}

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
        .select('*, users!matrimonial_profiles_user_id_fkey(*)')
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
      Alert.alert('Verification Required', 'You need to be verified to send contact requests');
      return;
    }

    Alert.alert('Send Contact Request', 'Send a contact request for this profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: async () => {
          try {
            setRequesting(true);
            const { error } = await dbHelpers.createContactRequest(
              profileId,
              userProfile.id,
            );
            if (error) throw error;
            Alert.alert('Request Sent', 'Your contact request was sent successfully.');
          } catch (error) {
            Alert.alert('Error', 'Failed to send contact request');
          } finally {
            setRequesting(false);
          }
        },
      },
    ]);
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{loading ? 'Loading...' : 'Profile not found'}</Text>
      </View>
    );
  }

  const isOwner = userProfile?.id === profile.user_id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {profile.photos?.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {profile.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photo} />
          ))}
        </ScrollView>
      )}

      <Card style={styles.card}>
        <Text style={styles.name}>
          {profile.candidate_name || profile.users?.full_name || 'Anonymous'}
        </Text>
        {profile.status && profile.status !== 'approved' && isOwner ? (
          <Text style={styles.statusNote}>Status: {profile.status}</Text>
        ) : null}
        <DetailRow label="Gotra" value={profile.gotra} />
        <DetailRow label="Gender" value={profile.gender} />
        <DetailRow label="Age" value={profile.age ? `${profile.age} years` : null} />
        <DetailRow label="Date of birth" value={profile.date_of_birth} />
        <DetailRow label="Birth time" value={profile.birth_time} />
        <DetailRow label="Birth place" value={profile.birth_place} />
        <DetailRow label="District" value={profile.district || profile.city} />
        <DetailRow label="Height" value={profile.height} />
        <DetailRow label="Complexion" value={profile.complexion} />
        <DetailRow label="Blood group" value={profile.blood_group} />
        <DetailRow label="Rashi" value={profile.rashi} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Education & Work</Text>
        <DetailRow label="Education" value={profile.education} />
        <DetailRow
          label="Business/service"
          value={profile.business_service_name || profile.occupation}
        />
        <DetailRow label="Annual income" value={profile.annual_income} />
        <DetailRow label="Office address" value={profile.business_office_address} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Family</Text>
        <DetailRow
          label="Brothers"
          value={`${profile.brothers_married ?? 0} married, ${profile.brothers_unmarried ?? 0} unmarried`}
        />
        <DetailRow
          label="Sisters"
          value={`${profile.sisters_married ?? 0} married, ${profile.sisters_unmarried ?? 0} unmarried`}
        />
        <DetailRow label="Father/guardian" value={profile.father_guardian_name} />
        <DetailRow label="Father mobile" value={profile.father_mobile} />
        <DetailRow label="Father's work" value={profile.father_business_details} />
        <DetailRow label="Father's income" value={profile.father_annual_income} />
        <DetailRow label="Mother" value={profile.mother_name} />
        <DetailRow label="Mother status" value={profile.mother_homemaker_or_service} />
        <DetailRow label="Residential address" value={profile.residential_address} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <DetailRow label="Email" value={profile.email} />
        <DetailRow label="WhatsApp" value={profile.whatsapp_number} />
      </Card>

      {(profile.special_statuses?.length > 0 ||
        profile.previous_spouse_name ||
        profile.disability_details) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Additional circumstances</Text>
          <DetailRow
            label="Statuses"
            value={(profile.special_statuses || []).join(', ')}
          />
          <DetailRow label="Previous spouse" value={profile.previous_spouse_name} />
          <DetailRow label="Previous spouse mobile" value={profile.previous_spouse_mobile} />
          <DetailRow
            label="Previous father-in-law"
            value={profile.previous_father_in_law_name_address}
          />
          <DetailRow
            label="FIL mobile"
            value={profile.previous_father_in_law_mobile}
          />
          <DetailRow
            label="Sons"
            value={
              profile.sons_count != null
                ? `${profile.sons_count} (${profile.sons_ages || 'ages n/a'})`
                : null
            }
          />
          <DetailRow
            label="Daughters"
            value={
              profile.daughters_count != null
                ? `${profile.daughters_count} (${profile.daughters_ages || 'ages n/a'})`
                : null
            }
          />
          <DetailRow label="Disability" value={profile.disability_details} />
        </Card>
      )}

      {!isOwner && (
        <Button
          title="Send Contact Request"
          onPress={handleContactRequest}
          loading={requesting}
          fullWidth
          style={styles.contactButton}
          icon={<Ionicons name="mail" size={20} color={COLORS.white} />}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING['2xl'] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photo: { width, height: 400, resizeMode: 'cover' },
  card: { margin: SPACING.lg },
  name: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  statusNote: {
    color: COLORS.warning,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  detailRow: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  detailLabel: { fontSize: FONT_SIZES.sm, color: COLORS.gray600, marginBottom: 2 },
  detailValue: { fontSize: FONT_SIZES.base, color: COLORS.gray900 },
  contactButton: { marginHorizontal: SPACING.lg },
});

export default MatrimonialDetailScreen;
