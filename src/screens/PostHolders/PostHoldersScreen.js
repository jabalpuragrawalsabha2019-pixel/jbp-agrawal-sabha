// src/screens/PostHolders/PostHoldersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbHelpers } from '../../config/supabase';
import Card from '../../components/common/Card';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const PostHoldersScreen = () => {
  const [postHolders, setPostHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPostHolders();
  }, []);

  const loadPostHolders = async () => {
    try {
      const { data, error } = await dbHelpers.getPostHolders();
      if (error) throw error;
      setPostHolders(data || []);
    } catch (error) {
      console.error('Error loading post holders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPostHolders();
  };

  const getDesignationIcon = (designation) => {
    if (designation.toLowerCase().includes('president')) return 'ribbon';
    if (designation.toLowerCase().includes('secretary')) return 'document-text';
    if (designation.toLowerCase().includes('treasurer')) return 'wallet';
    return 'person';
  };

  const getDesignationColor = (designation) => {
    if (designation.toLowerCase().includes('president')) return COLORS.gold;
    if (designation.toLowerCase().includes('vice')) return COLORS.primary;
    if (designation.toLowerCase().includes('secretary')) return COLORS.info;
    if (designation.toLowerCase().includes('treasurer')) return COLORS.success;
    return COLORS.gray600;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Card style={styles.headerCard} variant="elevated">
        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Office Bearers</Text>
          <Text style={styles.headerSubtitle}>
            Leadership team managing our community
          </Text>
        </View>
      </Card>

      {/* Post Holders List */}
      {postHolders.map((holder, index) => {
        const color = getDesignationColor(holder.designation);
        const icon = getDesignationIcon(holder.designation);

        return (
          <Card key={holder.id} style={styles.holderCard}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.designationBadge,
                  { backgroundColor: `${color}20` },
                ]}
              >
                <Ionicons name={icon} size={20} color={color} />
                <Text style={[styles.designationText, { color }]}>
                  {holder.designation}
                </Text>
              </View>
            </View>

            <View style={styles.holderInfo}>
              {holder.users?.photo_url ? (
                <Image
                  source={{ uri: holder.users.photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.gray400} />
                </View>
              )}

              <View style={styles.infoSection}>
                <Text style={styles.holderName}>
                  {holder.users?.full_name || 'TBD'}
                </Text>

                {holder.term_start && (
                  <View style={styles.termRow}>
                    <Ionicons name="calendar" size={14} color={COLORS.gray500} />
                    <Text style={styles.termText}>
                      {new Date(holder.term_start).getFullYear()}
                      {holder.term_end &&
                        ` - ${new Date(holder.term_end).getFullYear()}`}
                    </Text>
                  </View>
                )}

                {holder.users?.city && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={14} color={COLORS.gray500} />
                    <Text style={styles.detailText}>{holder.users.city}</Text>
                  </View>
                )}
              </View>
            </View>

            {holder.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioText}>{holder.bio}</Text>
              </View>
            )}
          </Card>
        );
      })}

      {postHolders.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No office bearers listed</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Serving the JBP Agrawal community with dedication
        </Text>
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
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  holderCard: {
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  designationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  designationText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  holderInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.gray300,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  holderName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  termText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    fontWeight: '500',
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
  bioSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  bioText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PostHoldersScreen;