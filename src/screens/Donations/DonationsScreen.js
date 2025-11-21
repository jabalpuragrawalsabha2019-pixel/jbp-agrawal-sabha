// src/screens/Donations/DonationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbHelpers } from '../../config/supabase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES, APP_INFO } from '../../utils/constants';

const DonationsScreen = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    transaction_id: '',
  });

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const { data, error } = await dbHelpers.getDonations();
      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
    }
  };

  const validateForm = () => {
    if (!formData.donor_name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter valid amount');
      return false;
    }
    if (!formData.transaction_id.trim()) {
      Alert.alert('Required', 'Please enter transaction ID');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const { data, error } = await dbHelpers.recordDonation({
        donor_name: formData.donor_name,
        amount: parseFloat(formData.amount),
        transaction_id: formData.transaction_id,
      });

      if (error) throw error;

      Alert.alert(
        'Thank You!',
        'Your donation has been recorded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ donor_name: '', amount: '', transaction_id: '' });
              setShowForm(false);
              loadDonations();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Donation error:', error);
      Alert.alert('Error', 'Failed to record donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalDonations = donations.reduce(
    (sum, donation) => sum + parseFloat(donation.amount || 0),
    0
  );

  const renderDonation = ({ item }) => (
    <View style={styles.donationItem}>
      <View style={styles.donationIcon}>
        <Ionicons name="gift" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.donationInfo}>
        <Text style={styles.donorName}>{item.donor_name}</Text>
        <Text style={styles.donationDate}>
          {new Date(item.donated_at).toLocaleDateString('en-IN')}
        </Text>
      </View>
      <Text style={styles.donationAmount}>₹{item.amount}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card style={styles.headerCard} variant="elevated">
        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={40} color={COLORS.error} />
          </View>
          <Text style={styles.headerTitle}>Support Our Community</Text>
          <Text style={styles.headerSubtitle}>
            Your contributions help organize events and support community initiatives
          </Text>
        </View>
      </Card>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{totalDonations.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Raised</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donations.length}</Text>
            <Text style={styles.statLabel}>Contributors</Text>
          </View>
        </View>
      </Card>

      {/* UPI Payment Card */}
      <Card style={styles.upiCard}>
        <Text style={styles.sectionTitle}>Pay via UPI</Text>
        
        <View style={styles.upiInfo}>
          <View style={styles.upiRow}>
            <Text style={styles.upiLabel}>UPI ID:</Text>
            <Text style={styles.upiValue}>{APP_INFO.upiId}</Text>
          </View>
          <View style={styles.upiRow}>
            <Text style={styles.upiLabel}>Name:</Text>
            <Text style={styles.upiValue}>{APP_INFO.upiName}</Text>
          </View>
        </View>

        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code" size={100} color={COLORS.gray400} />
          <Text style={styles.qrText}>Scan QR Code to Pay</Text>
          <Text style={styles.qrSubtext}>
            (QR code would be generated and displayed here)
          </Text>
        </View>

        <Button
          title="I've Made a Donation"
          onPress={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'primary'}
          fullWidth
          icon={
            <Ionicons
              name={showForm ? 'close' : 'checkmark-circle'}
              size={20}
              color={showForm ? COLORS.primary : COLORS.white}
            />
          }
        />
      </Card>

      {/* Donation Form */}
      {showForm && (
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Record Your Donation</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray400}
              value={formData.donor_name}
              onChangeText={(text) =>
                setFormData({ ...formData, donor_name: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={COLORS.gray400}
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transaction ID / UPI Ref *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter transaction ID"
              placeholderTextColor={COLORS.gray400}
              value={formData.transaction_id}
              onChangeText={(text) =>
                setFormData({ ...formData, transaction_id: text })
              }
            />
          </View>

          <Button
            title="Submit Donation"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
          />
        </Card>
      )}

      {/* Recent Donations */}
      {donations.length > 0 && (
        <Card style={styles.donationsCard}>
          <Text style={styles.sectionTitle}>Recent Donations</Text>
          <FlatList
            data={donations.slice(0, 10)}
            renderItem={renderDonation}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </Card>
      )}

      {/* Contact Info */}
      <Card style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <Ionicons name="help-circle" size={24} color={COLORS.info} />
          <Text style={styles.contactTitle}>Need Help?</Text>
        </View>
        <Text style={styles.contactText}>
          For any queries regarding donations, please contact:
        </Text>
        <Text style={styles.contactValue}>{APP_INFO.phone}</Text>
        <Text style={styles.contactValue}>{APP_INFO.email}</Text>
      </Card>
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
    backgroundColor: `${COLORS.primary}10`,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: SPACING.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
  },
  upiCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  upiInfo: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  upiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  upiLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  upiValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  qrText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginTop: SPACING.md,
  },
  qrSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  formCard: {
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
  donationsCard: {
    marginBottom: SPACING.lg,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  donationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  donationInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  donationDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  donationAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  contactCard: {
    backgroundColor: `${COLORS.info}10`,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  contactTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  contactText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  contactValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
});

export default DonationsScreen;