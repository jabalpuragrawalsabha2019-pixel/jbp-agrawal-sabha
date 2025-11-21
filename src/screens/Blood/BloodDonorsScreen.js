// src/screens/Blood/BloodDonorsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES, BLOOD_GROUPS, CITIES } from '../../utils/constants';

const BloodDonorsScreen = ({ navigation }) => {
  const { isVerified } = useAuth();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: null,
    city: null,
  });

  useEffect(() => {
    loadDonors();
  }, [filters]);

  const loadDonors = async () => {
    try {
      const { data, error } = await dbHelpers.getBloodDonors(
        filters.bloodGroup,
        filters.city
      );
      if (error) throw error;
      setDonors(data || []);
    } catch (error) {
      console.error('Error loading donors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDonors();
  };

  const handleCall = (phone) => {
    if (!isVerified) {
      Alert.alert(
        'Verification Required',
        'You need to be verified to access contact information'
      );
      return;
    }

    Alert.alert('Call Donor', `Do you want to call this donor?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => Linking.openURL(`tel:+91${phone}`),
      },
    ]);
  };

  const getBloodGroupColor = (bloodGroup) => {
    if (bloodGroup.includes('+')) return COLORS.error;
    return COLORS.primary;
  };

  const renderDonor = ({ item }) => (
    <Card style={styles.donorCard}>
      <View style={styles.donorHeader}>
        <View
          style={[
            styles.bloodGroupBadge,
            { backgroundColor: `${getBloodGroupColor(item.blood_group)}20` },
          ]}
        >
          <Ionicons
            name="water"
            size={24}
            color={getBloodGroupColor(item.blood_group)}
          />
          <Text
            style={[
              styles.bloodGroupText,
              { color: getBloodGroupColor(item.blood_group) },
            ]}
          >
            {item.blood_group}
          </Text>
        </View>

        <View style={styles.donorInfo}>
          <Text style={styles.donorName}>{item.users?.full_name}</Text>
          
          {item.city && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={14} color={COLORS.gray500} />
              <Text style={styles.infoText}>{item.city}</Text>
            </View>
          )}

          {item.last_donation_date && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={14} color={COLORS.gray500} />
              <Text style={styles.infoText}>
                Last donated:{' '}
                {new Date(item.last_donation_date).toLocaleDateString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.availabilityBadge}>
            <View
              style={[
                styles.availabilityDot,
                {
                  backgroundColor: item.is_available
                    ? COLORS.success
                    : COLORS.gray400,
                },
              ]}
            />
            <Text style={styles.availabilityText}>
              {item.is_available ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>
      </View>

      {isVerified && item.users?.phone && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item.users.phone)}
        >
          <Ionicons name="call" size={18} color={COLORS.white} />
          <Text style={styles.callButtonText}>Call Donor</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="water-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyText}>No donors found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
    </View>
  );

  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Donors</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray700} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Blood Group</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.bloodGroup}
                onValueChange={(value) =>
                  setFilters({ ...filters, bloodGroup: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="All Blood Groups" value={null} />
                {BLOOD_GROUPS.map((group) => (
                  <Picker.Item key={group} label={group} value={group} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>City</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.city}
                onValueChange={(value) => setFilters({ ...filters, city: value })}
                style={styles.picker}
              >
                <Picker.Item label="All Cities" value={null} />
                {CITIES.map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Clear Filters"
              variant="outline"
              onPress={() => {
                setFilters({ bloodGroup: null, city: null });
                setFilterVisible(false);
              }}
              style={{ flex: 1 }}
            />
            <Button
              title="Apply"
              onPress={() => setFilterVisible(false)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.actionBar}>
        {isVerified && (
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('RegisterDonor')}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.registerButtonText}>Register as Donor</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {donors.length} {donors.length === 1 ? 'Donor' : 'Donors'} Available
        </Text>
      </View>

      <FlatList
        data={donors}
        renderItem={renderDonor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actionBar: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  registerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  registerButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterIconButton: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statsBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  donorCard: {
    marginBottom: SPACING.md,
  },
  donorHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  bloodGroupBadge: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodGroupText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  donorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  donorName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  callButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
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
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});

export default BloodDonorsScreen;