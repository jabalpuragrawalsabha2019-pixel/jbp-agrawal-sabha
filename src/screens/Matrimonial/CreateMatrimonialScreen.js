// src/screens/Matrimonial/CreateMatrimonialScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../hooks/useAuth';
import { dbHelpers } from '../../config/supabase';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZES,
  GENDER_OPTIONS,
  EDUCATION_LEVELS,
  OCCUPATIONS,
  CITIES,
  GOTRAS,
} from '../../utils/constants';

const CreateMatrimonialScreen = ({ navigation }) => {
  const { profile: userProfile, isVerified } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    education: '',
    occupation: '',
    city: '',
    gotra: '',
    family_details: '',
    additional_info: '',
  });

  // Check if user is verified
  React.useEffect(() => {
    if (!isVerified) {
      Alert.alert(
        'Verification Required',
        'You need to be a verified member to create a matrimonial profile. Please contact admin for verification.',
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [isVerified]);

  // Don't render form if not verified
  if (!isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.notVerifiedContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.gray400} />
          <Text style={styles.notVerifiedText}>Verification Required</Text>
          <Text style={styles.notVerifiedSubtext}>
            Only verified members can create matrimonial profiles
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </View>
    );
  }

  const handleImagePick = async () => {
    if (photos.length >= 3) {
      Alert.alert('Limit Reached', 'You can upload maximum 3 photos');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      });

      if (!result.canceled) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.gender) {
      Alert.alert('Required', 'Please select gender');
      return false;
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
      Alert.alert('Invalid Age', 'Please enter valid age (18-100)');
      return false;
    }
    if (!formData.education) {
      Alert.alert('Required', 'Please enter education');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Required', 'Please enter city');
      return false;
    }
    if (photos.length === 0) {
      Alert.alert('Required', 'Please upload at least one photo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setUploadingPhotos(true);

      // Upload photos to Cloudinary
      console.log(`Uploading ${photos.length} photos to Cloudinary...`);
      const uploadedPhotos = [];
      
      for (let i = 0; i < photos.length; i++) {
        console.log(`Uploading photo ${i + 1}/${photos.length}...`);
        
        const uploadResult = await uploadImageToCloudinary(photos[i], 'matrimonial');
        
        if (uploadResult.success) {
          uploadedPhotos.push(uploadResult.url);
          console.log(`Photo ${i + 1} uploaded successfully`);
        } else {
          throw new Error(`Failed to upload photo ${i + 1}: ${uploadResult.error}`);
        }
      }

      setUploadingPhotos(false);
      console.log('All photos uploaded successfully');

      // Create matrimonial profile
      console.log('Creating matrimonial profile...');
      const { data, error } = await dbHelpers.createMatrimonialProfile({
        user_id: userProfile.id,
        gender: formData.gender,
        age: parseInt(formData.age),
        education: formData.education,
        occupation: formData.occupation || null,
        city: formData.city,
        gotra: formData.gotra || null,
        family_details: formData.family_details || null,
        additional_info: formData.additional_info || null,
        photos: uploadedPhotos,
        status: 'pending',
      });

      if (error) throw error;

      console.log('Matrimonial profile created:', data);

      Alert.alert(
        'Success',
        'Your matrimonial profile has been submitted for admin approval!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to create profile: ' + error.message);
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Profile Photos</Text>
        <Text style={styles.helperText}>Upload up to 3 photos</Text>

        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 3 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleImagePick}>
              <Ionicons name="camera" size={32} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              {GENDER_OPTIONS.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor={COLORS.gray400}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Education *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.education}
              onValueChange={(value) => setFormData({ ...formData, education: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Education" value="" />
              {EDUCATION_LEVELS.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Occupation</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.occupation}
              onValueChange={(value) => setFormData({ ...formData, occupation: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Occupation" value="" />
              {OCCUPATIONS.map((occ) => (
                <Picker.Item key={occ} label={occ} value={occ} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select City" value="" />
              {CITIES.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gotra</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gotra}
              onValueChange={(value) => setFormData({ ...formData, gotra: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Gotra" value="" />
              {GOTRAS.map((gotra) => (
                <Picker.Item key={gotra} label={gotra} value={gotra} />
              ))}
            </Picker>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Family Details</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell about your family..."
          placeholderTextColor={COLORS.gray400}
          value={formData.family_details}
          onChangeText={(text) => setFormData({ ...formData, family_details: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Additional Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional details you'd like to share..."
          placeholderTextColor={COLORS.gray400}
          value={formData.additional_info}
          onChangeText={(text) => setFormData({ ...formData, additional_info: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Your profile will be reviewed by an admin before being published
        </Text>
      </View>

      {uploadingPhotos && (
        <Card style={styles.uploadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.uploadingText}>Uploading photos to cloud...</Text>
          <Text style={styles.uploadingSubtext}>Please wait, this may take a moment</Text>
        </Card>
      )}

      <Button
        title="Submit Profile"
        onPress={handleSubmit}
        loading={loading}
        disabled={uploadingPhotos}
        fullWidth
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  notVerifiedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  notVerifiedText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray700,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  notVerifiedSubtext: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  card: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  helperText: {
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
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.gray900,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.info}10`,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  uploadingCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: `${COLORS.primary}10`,
    marginBottom: SPACING.lg,
  },
  uploadingText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  uploadingSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  submitButton: {
    marginBottom: SPACING.lg,
  },
});

export default CreateMatrimonialScreen;