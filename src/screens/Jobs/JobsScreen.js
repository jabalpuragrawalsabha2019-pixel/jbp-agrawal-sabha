// src/screens/Jobs/JobsScreen.js
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const JobsScreen = ({ navigation }) => {
  const { isVerified } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await dbHelpers.getJobs();
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleContact = (contactInfo) => {
    if (!isVerified) {
      Alert.alert(
        'Verification Required',
        'You need to be verified to access contact information'
      );
      return;
    }

    Alert.alert('Contact', contactInfo, [
      {
        text: 'Copy',
        onPress: () => {
          // Copy to clipboard functionality would go here
          Alert.alert('Copied', 'Contact info copied to clipboard');
        },
      },
      { text: 'OK' },
    ]);
  };

  const renderJob = ({ item }) => (
    <Card style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="briefcase" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={COLORS.gray500} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>

      {item.description && (
        <Text style={styles.jobDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.jobFooter}>
        <View style={styles.postedBy}>
          <Ionicons name="person" size={14} color={COLORS.gray500} />
          <Text style={styles.postedByText}>
            {item.users?.full_name || 'Anonymous'}
          </Text>
        </View>

        {isVerified && item.contact_info && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContact(item.contact_info)}
          >
            <Ionicons name="call" size={16} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="time" size={12} color={COLORS.gray400} />
        <Text style={styles.dateText}>
          Posted{' '}
          {new Date(item.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyText}>No job postings yet</Text>
      <Text style={styles.emptySubtext}>Check back later for opportunities</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isVerified && (
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => navigation.navigate('PostJob')}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.postButtonText}>Post a Job</Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Available
        </Text>
      </View>

      <FlatList
        data={jobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  postButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.white,
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
  jobCard: {
    marginBottom: SPACING.md,
  },
  jobHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  jobDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  postedByText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
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
});

export default JobsScreen;