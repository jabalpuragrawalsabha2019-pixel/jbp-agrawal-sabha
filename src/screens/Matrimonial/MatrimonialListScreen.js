// src/screens/Matrimonial/MatrimonialListScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES, GOTRAS, CITIES } from '../../utils/constants';

const MatrimonialListScreen = ({ navigation }) => {
  const { isVerified } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    gender: null,
    city: null,
    gotra: null,
  });

  useEffect(() => {
    loadProfiles();
  }, [filters]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await dbHelpers.getMatrimonialProfiles(filters);
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfiles();
  };

  const renderProfile = ({ item }) => (
    <Card
      style={styles.profileCard}
      onPress={() =>
        navigation.navigate('MatrimonialDetail', { profileId: item.id })
      }
    >
      <View style={styles.profileHeader}>
        {item.photos && item.photos.length > 0 ? (
          <Image source={{ uri: item.photos[0] }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name={item.gender === 'male' ? 'man' : 'woman'}
              size={48}
              color={COLORS.gray400}
            />
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {item.users?.full_name || 'Anonymous'}
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color={COLORS.gray500} />
            <Text style={styles.detailText}>{item.age} years</Text>
          </View>

          {item.education && (
            <View style={styles.detailRow}>
              <Ionicons name="school" size={14} color={COLORS.gray500} />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.education}
              </Text>
            </View>
          )}

          {item.city && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={14} color={COLORS.gray500} />
              <Text style={styles.detailText}>{item.city}</Text>
            </View>
          )}

          {item.gotra && (
            <View style={styles.gotraBadge}>
              <Text style={styles.gotraText}>{item.gotra}</Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={24} color={COLORS.gray400} />
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyText}>No profiles found</Text>
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
            <Text style={styles.modalTitle}>Filter Profiles</Text>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray700} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Gender</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.gender === 'male' && styles.filterButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, gender: 'male' })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.gender === 'male' && styles.filterButtonTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.gender === 'female' && styles.filterButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, gender: 'female' })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.gender === 'female' && styles.filterButtonTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, !filters.gender && styles.filterButtonActive]}
                onPress={() => setFilters({ ...filters, gender: null })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !filters.gender && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Clear Filters"
              variant="outline"
              onPress={() => {
                setFilters({ gender: null, city: null, gotra: null });
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
      {isVerified && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateMatrimonial')}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerBar}>
        <Text style={styles.statsText}>
          {profiles.length} {profiles.length === 1 ? 'Profile' : 'Profiles'}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={20} color={COLORS.primary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={profiles}
        renderItem={renderProfile}
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  createButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  profileCard: {
    marginBottom: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray300,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  gotraBadge: {
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  gotraText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
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
  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});

export default MatrimonialListScreen;