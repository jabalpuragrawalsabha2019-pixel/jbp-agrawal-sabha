// src/screens/Profile/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES, CITIES, OCCUPATIONS } from '../../utils/constants';

const ProfileScreen = () => {
  const { profile, isVerified, isAdmin, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    city: profile?.city || '',
    occupation: profile?.occupation || '',
    photo_url: profile?.photo_url || '',
  });

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setFormData({ ...formData, photo_url: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);

      let photoUrl = formData.photo_url;

      // Upload photo to Cloudinary if changed
      if (formData.photo_url && formData.photo_url !== profile?.photo_url && formData.photo_url.startsWith('file://')) {
        console.log('Uploading image to Cloudinary...');
        
        const uploadResult = await uploadImageToCloudinary(formData.photo_url, 'profiles');
        
        if (uploadResult.success) {
          photoUrl = uploadResult.url;
          console.log('Image uploaded successfully:', photoUrl);
        } else {
          throw new Error('Failed to upload image: ' + uploadResult.error);
        }
      }

      const { error } = await updateProfile({
        full_name: formData.full_name,
        // Use phone from formData if present, otherwise fall back to existing profile phone
        phone: formData.phone ?? profile?.phone,
        email: formData.email ?? profile?.email,
        city: formData.city,
        occupation: formData.occupation,
        photo_url: photoUrl,
      });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User initiated sign out');
              const { error } = await signOut();
              
              if (error) {
                Alert.alert('Error', 'Failed to sign out: ' + error.message);
              } else {
                console.log('Sign out successful, clearing app state...');
                
                // Clear any local state
                setFormData({
                  full_name: '',
                  city: '',
                  occupation: '',
                  photo_url: '',
                });
                
                // Force navigation to login (AppNavigator will handle this)
                console.log('Waiting for navigation to login...');
              }
            } catch (err) {
              console.error('Sign out exception:', err);
              Alert.alert('Error', 'An error occurred during sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.headerCard} variant="elevated">
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={editing ? handleImagePick : undefined}
            disabled={!editing}
          >
            {formData.photo_url ? (
              <Image source={{ uri: formData.photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color={COLORS.gray400} />
              </View>
            )}
            {editing && (
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
            <View style={styles.statusBadge}>
              {isVerified ? (
                <>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.verifiedText}>Verified Member</Text>
                </>
              ) : (
                <>
                  <Ionicons name="time" size={16} color={COLORS.warning} />
                  <Text style={styles.pendingText}>Verification Pending</Text>
                </>
              )}
            </View>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Profile Info */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <TouchableOpacity
            onPress={() => {
              if (editing) {
                setFormData({
                  full_name: profile?.full_name || '',
                  city: profile?.city || '',
                  occupation: profile?.occupation || '',
                  photo_url: profile?.photo_url || '',
                });
              }
              setEditing(!editing);
            }}
          >
            <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray400}
            />
          ) : (
            <Text style={styles.value}>{profile?.full_name || '-'}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>+91 {profile?.phone || '-'}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email || '-'}</Text>
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>City</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="Enter your city"
              placeholderTextColor={COLORS.gray400}
            />
          ) : (
            <Text style={styles.value}>{profile?.city || '-'}</Text>
          )}
        </View>

        <View style={styles.infoGroup}>
          <Text style={styles.label}>Occupation</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.occupation}
              onChangeText={(text) => setFormData({ ...formData, occupation: text })}
              placeholder="Enter your occupation"
              placeholderTextColor={COLORS.gray400}
            />
          ) : (
            <Text style={styles.value}>{profile?.occupation || '-'}</Text>
          )}
        </View>

        {editing && (
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            fullWidth
            style={styles.saveButton}
          />
        )}
      </Card>

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </Card>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>JBP Agrawal Sabha v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for the community</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  headerCard: {
    marginBottom: SPACING.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.gray300,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  adminText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  editText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
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
  saveButton: {
    marginTop: SPACING.md,
  },
  actionsCard: {
    marginBottom: SPACING.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  actionText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
});

export default ProfileScreen;