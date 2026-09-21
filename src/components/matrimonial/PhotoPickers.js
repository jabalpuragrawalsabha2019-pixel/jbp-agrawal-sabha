/**
 * Photo + signature image pickers for matrimonial profiles.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

/**
 * Requests gallery permission and returns a local image URI or null.
 * @returns {Promise<string|null>}
 */
async function pickImage() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Required', 'Please allow access to your photos');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

/**
 * Candidate photo grid — official form requires 2 recent colour photos.
 * @param {object} props
 */
export function PhotoPickerGrid({ photos, setPhotos, maxPhotos = 2 }) {
  const addPhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `Upload exactly ${maxPhotos} recent colour photographs`);
      return;
    }
    try {
      const uri = await pickImage();
      if (uri) setPhotos([...photos, uri]);
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <View>
      <Text style={styles.helper}>
        Submit {maxPhotos} recent colour photographs (without punching/pins)
      </Text>
      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View key={`${photo}-${index}`} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < maxPhotos && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
            <Ionicons name="camera" size={32} color={COLORS.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/**
 * Single signature image picker (parent/guardian or candidate).
 * @param {object} props
 */
export function SignaturePicker({ label, uri, onChange }) {
  const pick = async () => {
    try {
      const next = await pickImage();
      if (next) onChange(next);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick signature image');
    }
  };

  return (
    <View style={styles.signBlock}>
      <Text style={styles.signLabel}>{label}</Text>
      {uri ? (
        <View style={styles.signPreviewWrap}>
          <Image source={{ uri }} style={styles.signPreview} />
          <TouchableOpacity onPress={() => onChange(null)}>
            <Text style={styles.clearText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.signButton} onPress={pick}>
          <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          <Text style={styles.signButtonText}>Upload signature photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  helper: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 130,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 130,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  addPhotoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  signBlock: {
    marginBottom: SPACING.lg,
  },
  signLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray50,
  },
  signButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  signPreviewWrap: {
    gap: SPACING.sm,
  },
  signPreview: {
    width: '100%',
    height: 90,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray100,
    resizeMode: 'contain',
  },
  clearText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});
