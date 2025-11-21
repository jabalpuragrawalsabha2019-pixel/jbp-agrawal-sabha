// src/screens/Jobs/PostJobScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { dbHelpers } from '../../config/supabase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const PostJobScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contact_info: '',
  });

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Required', 'Please enter job title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Required', 'Please enter job description');
      return false;
    }
    if (!formData.contact_info.trim()) {
      Alert.alert('Required', 'Please enter contact information');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const { data, error } = await dbHelpers.createJob({
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        contact_info: formData.contact_info,
        posted_by: profile.id,
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your job posting has been submitted for admin approval!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="briefcase" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.headerTitle}>Post Job Opportunity</Text>
            <Text style={styles.headerSubtitle}>
              Help fellow community members find opportunities
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Sales Manager, Software Developer"
              placeholderTextColor={COLORS.gray400}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the job role, requirements, and responsibilities..."
              placeholderTextColor={COLORS.gray400}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Jabalpur, Remote, etc."
              placeholderTextColor={COLORS.gray400}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Information *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Phone, Email, or other contact details..."
              placeholderTextColor={COLORS.gray400}
              value={formData.contact_info}
              onChangeText={(text) => setFormData({ ...formData, contact_info: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </Card>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Your job posting will be reviewed by an admin before being published
          </Text>
        </View>

        <Button
          title="Post Job"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    marginBottom: SPACING.lg,
  },
  headerSection: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'center',
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
    minHeight: 120,
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
  submitButton: {
    marginBottom: SPACING.lg,
  },
});

export default PostJobScreen;