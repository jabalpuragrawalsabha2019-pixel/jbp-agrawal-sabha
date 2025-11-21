// src/screens/Blood/RegisterDonorScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../hooks/useAuth';
import { dbHelpers } from '../../config/supabase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES, BLOOD_GROUPS, CITIES } from '../../utils/constants';

const RegisterDonorScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    city: profile?.city || '',
    is_available: true,
    last_donation_date: null,
  });

  const validateForm = () => {
    if (!formData.blood_group) {
      Alert.alert('Required', 'Please select your blood group');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Required', 'Please select your city');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const { data, error } = await dbHelpers.registerBloodDonor({
        user_id: profile.id,
        blood_group: formData.blood_group,
        city: formData.city,
        is_available: formData.is_available,
        last_donation_date: formData.last_donation_date,
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'You have been registered as a blood donor!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={40} color={COLORS.error} />
          </View>
          <Text style={styles.headerTitle}>Become a Blood Donor</Text>
          <Text style={styles.headerSubtitle}>
            Your donation can save lives. Register today!
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Donor Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Blood Group *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.blood_group}
              onValueChange={(value) =>
                setFormData({ ...formData, blood_group: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Blood Group" value="" />
              {BLOOD_GROUPS.map((group) => (
                <Picker.Item key={group} label={group} value={group} />
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

        <View style={styles.switchGroup}>
          <View style={styles.switchLabel}>
            <Text style={styles.label}>Currently Available to Donate</Text>
            <Text style={styles.helperText}>
              Enable this if you're ready to donate blood
            </Text>
          </View>
          <Switch
            value={formData.is_available}
            onValueChange={(value) =>
              setFormData({ ...formData, is_available: value })
            }
            trackColor={{ false: COLORS.gray300, true: COLORS.success }}
            thumbColor={COLORS.white}
          />
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color={COLORS.info} />
          <Text style={styles.infoTitle}>Important Information</Text>
        </View>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>
              You must be 18-65 years old and weigh at least 50 kg
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>
              Wait at least 3 months between donations
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>
              Your contact will be shared with members in emergency
            </Text>
          </View>
        </View>
      </Card>

      <Button
        title="Register as Donor"
        onPress={handleSubmit}
        loading={loading}
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.error}10`,
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
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
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
  helperText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
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
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: SPACING.md,
  },
  infoCard: {
    backgroundColor: `${COLORS.info}10`,
    borderColor: COLORS.info,
    marginBottom: SPACING.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  infoList: {
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: SPACING.lg,
  },
});

export default RegisterDonorScreen;