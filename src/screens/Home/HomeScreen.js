// src/screens/Home/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { dbHelpers } from '../../config/supabase';
import Card from '../../components/common/Card';
import TrainAnimation from '../../components/common/TrainAnimation';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { profile, isVerified } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Load announcements and featured events for train animation
      const { data: events } = await dbHelpers.getEvents('all');
      
      if (events) {
        const now = new Date();
        
        // Get announcements (visible and approved)
        const announcementsList = events
          .filter(e => e.is_announcement && e.is_visible)
          .slice(0, 5)
          .map(e => ({
            title: e.announcement_text || e.title,
            date: e.event_date,
            is_event: false,
          }));

        // Get upcoming events (next 7 days, featured, visible, approved)
        const upcomingEventsList = events
          .filter(e => {
            if (!e.is_visible || !e.event_date) return false;
            const eventDate = new Date(e.event_date);
            const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
            return daysDiff >= 0 && daysDiff <= 7 && e.is_featured;
          })
          .slice(0, 5)
          .map(e => ({
            title: e.title,
            date: e.event_date,
            is_event: true,
          }));

        // Combine for train animation
        const combined = [...announcementsList, ...upcomingEventsList];
        setAnnouncements(combined);

        // Get upcoming events for display (next 30 days)
        const allUpcoming = events
          .filter(e => {
            if (!e.is_visible || !e.event_date || e.is_announcement) return false;
            const eventDate = new Date(e.event_date);
            return eventDate >= now;
          })
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 3);
        
        setUpcomingEvents(allUpcoming);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const modules = [
    {
      id: 'directory',
      title: 'Directory',
      icon: 'people',
      color: COLORS.primary,
      screen: 'Directory',
      description: 'Community members',
      requiresVerification: false,
    },
    {
      id: 'matrimonial',
      title: 'Matrimonial',
      icon: 'heart',
      color: COLORS.error,
      screen: 'Matrimonial',
      description: 'Find matches',
      requiresVerification: false,
    },
    {
      id: 'events',
      title: 'Events',
      icon: 'calendar',
      color: COLORS.secondary,
      screen: 'Events',
      description: 'Programs & news',
      requiresVerification: false,
    },
    {
      id: 'jobs',
      title: 'Jobs',
      icon: 'briefcase',
      color: COLORS.info,
      screen: 'Jobs',
      description: 'Opportunities',
      requiresVerification: false,
    },
    {
      id: 'blood',
      title: 'Blood Donors',
      icon: 'water',
      color: COLORS.error,
      screen: 'BloodDonors',
      description: 'Emergency help',
      requiresVerification: false,
    },
    {
      id: 'donations',
      title: 'Donations',
      icon: 'gift',
      color: COLORS.success,
      screen: 'Donations',
      description: 'Support community',
      requiresVerification: false,
    },
    {
      id: 'postholders',
      title: 'Office Bearers',
      icon: 'ribbon',
      color: COLORS.gold,
      screen: 'PostHolders',
      description: 'Leadership team',
      requiresVerification: false,
    },
  ];

  const handleModulePress = (module) => {
    if (module.requiresVerification && !isVerified) {
      Alert.alert(
        'Verification Required',
        'This feature is only available to verified members. Please contact admin for verification.'
      );
      return;
    }
    navigation.navigate(module.screen);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.nameText}>{profile?.full_name || 'Member'}</Text>
          </View>
          <View style={styles.badge}>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="time" size={16} color={COLORS.warning} />
                <Text style={styles.unverifiedText}>Pending</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Train Animation */}
        {announcements.length > 0 && (
          <TrainAnimation announcements={announcements} />
        )}

        {/* Quote Section */}
        <Card style={styles.quoteCard} variant="elevated">
          <View style={styles.quoteHeader}>
            <View style={styles.quoteImagePlaceholder}>
              <Ionicons name="person" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.quoteTitle}>Maharaj Agrasen</Text>
          </View>
          <Text style={styles.quoteText}>
            "एक ईंट, एक रुपया"
          </Text>
          <Text style={styles.quoteSubtext}>
            Unity • Prosperity • Service
          </Text>
        </Card>

        {/* Quick Access Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.modulesGrid}>
            {modules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module)}
                activeOpacity={0.7}
              >
                <View style={[styles.moduleIcon, { backgroundColor: module.color + '20' }]}>
                  <Ionicons name={module.icon} size={28} color={module.color} />
                </View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              >
                <View style={styles.eventContent}>
                  <View style={styles.eventIconContainer}>
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.event_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Community Stats */}
        <Card style={styles.statsCard} variant="elevated">
          <Text style={styles.statsTitle}>Community Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5K+</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100+</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>500+</Text>
              <Text style={styles.statLabel}>Marriages</Text>
            </View>
          </View>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            JBP Agrawal Sabha • Version 1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for the community
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  nameText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  badge: {
    marginLeft: SPACING.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  unverifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  quoteCard: {
    marginBottom: SPACING.lg,
    backgroundColor: `${COLORS.primary}10`,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quoteImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  quotePlaceholder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  quoteTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quoteText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  moduleCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  moduleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moduleTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  moduleDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  eventCard: {
    marginBottom: SPACING.md,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  eventDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  statsCard: {
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsGrid: {
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

export default HomeScreen;