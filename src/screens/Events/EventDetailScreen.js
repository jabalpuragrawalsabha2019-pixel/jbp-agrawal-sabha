// src/screens/Events/EventDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Share,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

const EventDetailScreen = ({ route }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, users(*)')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${event.title}\n\nDate: ${new Date(
          event.event_date
        ).toLocaleDateString()}\n\n${event.description || ''}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {event.poster_url && (
        <Image source={{ uri: event.poster_url }} style={styles.poster} />
      )}

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.typebadge}>
            <Ionicons name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.typeBadgeText}>
              {event.event_type?.toUpperCase() || 'EVENT'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-social" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.gray600} />
          <Text style={styles.dateText}>
            {new Date(event.event_date).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={20} color={COLORS.gray600} />
          <Text style={styles.dateText}>
            {new Date(event.event_date).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </Card>

      {event.description && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Posted By</Text>
        <View style={styles.postedBySection}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={COLORS.gray400} />
          </View>
          <View style={styles.postedByInfo}>
            <Text style={styles.postedByName}>
              {event.users?.full_name || 'Admin'}
            </Text>
            <Text style={styles.postedByDate}>
              Posted on{' '}
              {new Date(event.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </Card>

      <Button
        title="Share Event"
        onPress={handleShare}
        variant="outline"
        fullWidth
        icon={<Ionicons name="share-social" size={20} color={COLORS.primary} />}
        style={styles.shareButton}
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
    paddingBottom: SPACING['2xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  card: {
    margin: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
    lineHeight: 24,
  },
  postedBySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postedByInfo: {
    flex: 1,
  },
  postedByName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  postedByDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  shareButton: {
    marginHorizontal: SPACING.lg,
  },
});

export default EventDetailScreen;