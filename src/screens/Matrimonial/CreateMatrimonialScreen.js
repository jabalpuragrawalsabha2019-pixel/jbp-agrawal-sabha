/**
 * Create Matrimonial screen — Pratyashi Parichay form (supports multiple profiles per account).
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { dbHelpers } from '../../config/supabase';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import {
  PhotosSection,
  CandidateBasicsSection,
  SiblingsSection,
  FamilyContactSection,
  SpecialInfoSection,
  DeclarationSection,
} from '../../components/matrimonial/FormSections';
import {
  createEmptyMatrimonialForm,
  validateMatrimonialForm,
  buildMatrimonialPayload,
} from '../../utils/matrimonialForm';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const CreateMatrimonialScreen = ({ navigation }) => {
  const { profile: userProfile, isVerified } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [parentSignatureUri, setParentSignatureUri] = useState(null);
  const [candidateSignatureUri, setCandidateSignatureUri] = useState(null);
  const [form, setForm] = useState(() => {
    const base = createEmptyMatrimonialForm();
    return {
      ...base,
      candidate_name: userProfile?.full_name || '',
      email: userProfile?.email || '',
      father_mobile: userProfile?.phone || '',
      whatsapp_number: userProfile?.phone || '',
    };
  });

  useEffect(() => {
    if (!isVerified) {
      Alert.alert(
        'Verification Required',
        'Only verified members can create matrimonial profiles.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }],
      );
    }
  }, [isVerified, navigation]);

  if (!isVerified) {
    return (
      <View style={styles.locked}>
        <Ionicons name="lock-closed" size={64} color={COLORS.gray400} />
        <Text style={styles.lockedTitle}>Verification Required</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: SPACING.lg }} />
      </View>
    );
  }

  /**
   * Uploads local URIs to Cloudinary and returns secure URLs.
   * @param {string[]} uris
   * @param {string} folder
   */
  const uploadMany = async (uris, folder) => {
    const urls = [];
    for (let i = 0; i < uris.length; i += 1) {
      const result = await uploadImageToCloudinary(uris[i], folder);
      if (!result.success) {
        throw new Error(result.error || `Failed to upload file ${i + 1}`);
      }
      urls.push(result.url);
    }
    return urls;
  };

  const handleSubmit = async () => {
    const validation = validateMatrimonialForm(form, photos);
    if (!validation.ok) {
      Alert.alert('Incomplete form', validation.message);
      return;
    }

    if (!parentSignatureUri || !candidateSignatureUri) {
      Alert.alert(
        'Signatures required',
        'Please upload parent/guardian and candidate signature photos.',
      );
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      const photoUrls = await uploadMany(photos, 'matrimonial');
      const [parentSignatureUrl] = await uploadMany(
        [parentSignatureUri],
        'matrimonial/signatures',
      );
      const [candidateSignatureUrl] = await uploadMany(
        [candidateSignatureUri],
        'matrimonial/signatures',
      );

      setUploading(false);

      const payload = buildMatrimonialPayload(form, {
        userId: userProfile.id,
        photoUrls,
        parentSignatureUrl,
        candidateSignatureUrl,
      });

      const { error } = await dbHelpers.createMatrimonialProfile(payload);
      if (error) throw error;

      Alert.alert(
        'Submitted',
        'Profile submitted for admin approval. You can add another profile anytime.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.introCard}>
        <Text style={styles.introTitle}>प्रत्याशी परिचय फार्म</Text>
        <Text style={styles.introText}>
          Fill every column completely. One account can submit multiple independent profiles.
        </Text>
      </Card>

      <PhotosSection photos={photos} setPhotos={setPhotos} />
      <CandidateBasicsSection form={form} setForm={setForm} />
      <SiblingsSection form={form} setForm={setForm} />
      <FamilyContactSection form={form} setForm={setForm} />
      <SpecialInfoSection form={form} setForm={setForm} />
      <DeclarationSection
        form={form}
        setForm={setForm}
        parentSignatureUri={parentSignatureUri}
        setParentSignatureUri={setParentSignatureUri}
        candidateSignatureUri={candidateSignatureUri}
        setCandidateSignatureUri={setCandidateSignatureUri}
      />

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Each profile is reviewed independently by an admin before publishing.
        </Text>
      </View>

      {uploading && (
        <Card style={styles.uploadCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.uploadText}>Uploading photos & signatures…</Text>
        </Card>
      )}

      <Button
        title="Submit Profile"
        onPress={handleSubmit}
        loading={loading}
        disabled={uploading}
        fullWidth
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING['2xl'] },
  locked: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  lockedTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray700,
    marginTop: SPACING.lg,
  },
  introCard: { marginBottom: SPACING.lg },
  introTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  introText: { fontSize: FONT_SIZES.sm, color: COLORS.gray600, lineHeight: 20 },
  infoBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.info}10`,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.gray700 },
  uploadCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  uploadText: {
    marginTop: SPACING.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CreateMatrimonialScreen;
