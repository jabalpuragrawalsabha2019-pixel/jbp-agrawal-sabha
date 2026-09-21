/**
 * Matrimonial browse list + owner multi-profile management.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const STATUS_COLORS = {
  pending: COLORS.warning,
  approved: COLORS.success,
  rejected: COLORS.error,
};

const MatrimonialListScreen = ({ navigation }) => {
  const { isVerified, profile: userProfile } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [myProfiles, setMyProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    gender: null,
    city: null,
    gotra: null,
  });

  const loadProfiles = async () => {
    try {
      const { data, error } = await dbHelpers.getMatrimonialProfiles(filters);
      if (error) throw error;
      setProfiles(data || []);

      if (userProfile?.id) {
        const mine = await dbHelpers.getMyMatrimonialProfiles(userProfile.id);
        if (!mine.error) setMyProfiles(mine.data || []);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [filters, userProfile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [filters, userProfile?.id]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfiles();
  };

  const deleteMine = (item) => {
    if (!['pending', 'rejected'].includes(item.status)) {
      Alert.alert('Not allowed', 'Only pending or rejected profiles can be deleted.');
      return;
    }
    Alert.alert('Delete profile', `Delete ${item.candidate_name || 'this profile'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await dbHelpers.deleteMatrimonialProfile(item.id);
          if (error) Alert.alert('Error', error.message);
          else loadProfiles();
        },
      },
    ]);
  };

  const renderMyProfile = ({ item }) => (
    <Card style={styles.myCard}>
      <TouchableOpacity
        style={styles.profileHeader}
        onPress={() => navigation.navigate('MatrimonialDetail', { profileId: item.id })}
      >
        {item.photos?.[0] ? (
          <Image source={{ uri: item.photos[0] }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={36} color={COLORS.gray400} />
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{item.candidate_name || 'Unnamed'}</Text>
          <Text style={styles.detailText}>
            {item.age ? `${item.age} yrs` : ''}
            {item.district || item.city ? ` · ${item.district || item.city}` : ''}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${STATUS_COLORS[item.status] || COLORS.gray400}22` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[item.status] || COLORS.gray600 },
              ]}
            >
              {(item.status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>
        {['pending', 'rejected'].includes(item.status) && (
          <TouchableOpacity onPress={() => deleteMine(item)} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Card>
  );

  const renderProfile = ({ item }) => (
    <Card
      style={styles.profileCard}
      onPress={() => navigation.navigate('MatrimonialDetail', { profileId: item.id })}
    >
      <View style={styles.profileHeader}>
        {item.photos?.[0] ? (
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
            {item.candidate_name || item.users?.full_name || 'Anonymous'}
          </Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color={COLORS.gray500} />
            <Text style={styles.detailText}>{item.age} years</Text>
          </View>
          {item.education ? (
            <View style={styles.detailRow}>
              <Ionicons name="school" size={14} color={COLORS.gray500} />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.education}
              </Text>
            </View>
          ) : null}
          {(item.district || item.city) && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={14} color={COLORS.gray500} />
              <Text style={styles.detailText}>{item.district || item.city}</Text>
            </View>
          )}
          {item.gotra ? (
            <View style={styles.gotraBadge}>
              <Text style={styles.gotraText}>{item.gotra}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.gray400} />
      </View>
    </Card>
  );

  const listHeader = (
    <View>
      {isVerified && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateMatrimonial')}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.createButtonText}>
            {myProfiles.length > 0 ? 'Add Another Profile' : 'Create Profile'}
          </Text>
        </TouchableOpacity>
      )}

      {isVerified && myProfiles.length > 0 && (
        <View style={styles.mySection}>
          <Text style={styles.sectionTitle}>My Profiles ({myProfiles.length})</Text>
          <Text style={styles.sectionHint}>
            One account can manage multiple independent candidate profiles.
          </Text>
          {myProfiles.map((item) => (
            <View key={item.id}>{renderMyProfile({ item })}</View>
          ))}
        </View>
      )}

      <View style={styles.headerBar}>
        <Text style={styles.statsText}>
          {profiles.length} approved {profiles.length === 1 ? 'profile' : 'profiles'}
        </Text>
        <TouchableOpacity
          style={[
            styles.filterTrigger,
            filters.gender && styles.filterTriggerActive,
          ]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="options"
            size={18}
            color={filters.gender ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.filterTriggerText,
              filters.gender && styles.filterTriggerTextActive,
            ]}
          >
            {filters.gender ? 'Filtered' : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={COLORS.gray300} />
              <Text style={styles.emptyText}>No approved profiles yet</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Profiles</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'male', label: 'Male' },
                { key: 'female', label: 'Female' },
                { key: null, label: 'All' },
              ].map((opt) => (
                <TouchableOpacity
                  key={String(opt.key)}
                  style={[
                    styles.filterButton,
                    filters.gender === opt.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilters({ ...filters, gender: opt.key })}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.gender === opt.key && styles.filterButtonTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.applyBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  createButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  mySection: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  sectionHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  myCard: { marginBottom: SPACING.sm },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsText: { fontSize: FONT_SIZES.sm, color: COLORS.gray600, fontWeight: '500' },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  filterTriggerActive: { backgroundColor: COLORS.primary },
  filterTriggerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  filterTriggerTextActive: { color: COLORS.white },
  listContent: { padding: SPACING.lg },
  profileCard: { marginBottom: SPACING.md },
  profileHeader: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  imagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  detailText: { fontSize: FONT_SIZES.sm, color: COLORS.gray600 },
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
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  filterButtons: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: COLORS.primary },
  filterButtonText: { fontWeight: '600', color: COLORS.gray600 },
  filterButtonTextActive: { color: COLORS.white },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  applyBtnText: { color: COLORS.white, fontWeight: '700' },
});

export default MatrimonialListScreen;
