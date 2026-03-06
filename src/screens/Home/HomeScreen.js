// src/screens/Home/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { dbHelpers } from "../../config/supabase";
import Card from "../../components/common/Card";
import TrainAnimation from "../../components/common/TrainAnimation";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZES,
  SHADOWS,
} from "../../utils/constants";
import agrasenImg from "../../../assets/agrasen.png";

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
      const { data: events } = await dbHelpers.getEvents("all");

      if (events) {
        const now = new Date();

        // Get announcements (visible and approved)
        const announcementsList = events
          .filter((e) => e.is_announcement && e.is_visible)
          .slice(0, 5)
          .map((e) => ({
            title: e.announcement_text || e.title,
            date: e.event_date,
            is_event: false,
          }));

        // Get upcoming events (next 7 days, featured, visible, approved)
        const upcomingEventsList = events
          .filter((e) => {
            if (!e.is_visible || !e.event_date) return false;
            const eventDate = new Date(e.event_date);
            const daysDiff = Math.ceil(
              (eventDate - now) / (1000 * 60 * 60 * 24),
            );
            return daysDiff >= 0 && daysDiff <= 7 && e.is_featured;
          })
          .slice(0, 5)
          .map((e) => ({
            title: e.title,
            date: e.event_date,
            is_event: true,
          }));

        // Combine for train animation
        const combined = [...announcementsList, ...upcomingEventsList];
        setAnnouncements(combined);

        // Get upcoming events for display (next 30 days)
        const allUpcoming = events
          .filter((e) => {
            if (!e.is_visible || !e.event_date || e.is_announcement)
              return false;
            const eventDate = new Date(e.event_date);
            return eventDate >= now;
          })
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 3);

        setUpcomingEvents(allUpcoming);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
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
      id: "directory",
      title: "Directory",
      icon: "people",
      color: COLORS.primary,
      screen: "Directory",
      description: "Browse community members",
      requiresVerification: false,
    },
    {
      id: "matrimonial",
      title: "Matrimonial",
      icon: "heart",
      color: COLORS.error,
      screen: "Matrimonial",
      description: "Rishta connections",
      requiresVerification: false,
    },
    {
      id: "events",
      title: "Events",
      icon: "calendar",
      color: COLORS.secondary,
      screen: "Events",
      description: "Upcoming programs",
      requiresVerification: false,
    },
    {
      id: "jobs",
      title: "Jobs",
      icon: "briefcase",
      color: COLORS.info,
      screen: "Jobs",
      description: "Career opportunities",
      requiresVerification: false,
    },
    {
      id: "blood",
      title: "Blood Donors",
      icon: "water",
      color: COLORS.error,
      screen: "BloodDonors",
      description: "Save a life today",
      requiresVerification: false,
    },
    {
      id: "donations",
      title: "Donations",
      icon: "gift",
      color: COLORS.success,
      screen: "Donations",
      description: "Give back to samaj",
      requiresVerification: false,
    },
    {
      id: "postholders",
      title: "Office Bearers",
      icon: "ribbon",
      color: COLORS.gold,
      screen: "PostHolders",
      description: "Sabha leadership",
      requiresVerification: false,
    },
  ];

  const handleModulePress = (module) => {
    if (module.requiresVerification && !isVerified) {
      Alert.alert(
        "Verification Required",
        "This feature is only available to verified members. Please contact admin for verification.",
      );
      return;
    }
    navigation.navigate(module.screen);
  };

  return (
    <View style={styles.container}>
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
        <Card
          style={[styles.quoteCard, { alignItems: "center" }]}
          variant="elevated"
        >
          <Image
            source={agrasenImg}
            style={[
              styles.quoteImage,
              { width: 300, height: 300, marginBottom: -40 },
            ]}
          />
          <Text style={styles.quoteTitle}>Maharaj Agrasen Ji</Text>
          <View style={styles.quoteDivider} />
          <Text style={styles.quoteText}>"एक ईंट, एक रुपया"</Text>
          <Text style={styles.quoteSubtext}>एकता • समृद्धि • सेवा</Text>
          <Text style={styles.quoteEnglishSubtext}>
            Unity • Prosperity • Service
          </Text>
        </Card>
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
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: module.color + "20" },
                  ]}
                >
                  <Ionicons name={module.icon} size={28} color={module.color} />
                </View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>
                  {module.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Events")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                style={styles.eventCard}
                onPress={() =>
                  navigation.navigate("EventDetail", { eventId: event.id })
                }
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
                      {new Date(event.event_date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.gray400}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Community Stats */}
        <Card style={styles.statsCard} variant="elevated">
          <View style={styles.statsHeader}>
            <View style={styles.statsHeaderTopRow}>
              <View style={styles.statsBadge}>
                <Text style={styles.statsBadgeText}>हमारा समाज</Text>
              </View>
              <View style={styles.statsYearChip}>
                <Text style={styles.statsYearText}>2026</Text>
              </View>
            </View>
            <Text style={styles.statsSubtitle}>Our Community at a Glance</Text>
          </View>
          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <View style={[styles.statIconBadge, styles.statIconMembers]}>
                <Ionicons name="people" size={18} color={COLORS.primaryDark} />
              </View>
              <View style={styles.statTextBlock}>
                <Text style={styles.statLabel}>Members</Text>
                <Text style={styles.statValue}>5,000+</Text>
              </View>
            </View>

            <View style={styles.statRowDivider} />

            <View style={styles.statRow}>
              <View style={[styles.statIconBadge, styles.statIconEvents]}>
                <Ionicons
                  name="calendar"
                  size={18}
                  color={COLORS.secondaryDark}
                />
              </View>
              <View style={styles.statTextBlock}>
                <Text style={styles.statLabel}>Events Held</Text>
                <Text style={styles.statValue}>100+</Text>
              </View>
            </View>

            <View style={styles.statRowDivider} />

            <View style={styles.statRow}>
              <View style={[styles.statIconBadge, styles.statIconMarriages]}>
                <Ionicons name="heart" size={18} color={COLORS.accent} />
              </View>
              <View style={styles.statTextBlock}>
                <Text style={styles.statLabel}>Marriages</Text>
                <Text style={styles.statValue}>500+</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>JBP Agrawal Sabha • v1.0.0</Text>
          <Text style={styles.footerSubtext}>समाज सेवा में समर्पित 🙏</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.9)",
  },
  nameText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  badge: {
    marginLeft: SPACING.md,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.success,
  },
  unverifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  unverifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.warning,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING["2xl"],
  },
  quoteCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: `${COLORS.primary}25`,
    overflow: "hidden",
  },
  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quoteImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  quotePlaceholder: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
  },
  quoteTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  quoteDivider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  quoteText: {
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "700",
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
    fontStyle: "italic",
    textAlign: "center",
  },
  quoteSubtext: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  quoteEnglishSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    textAlign: "center",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.gray900,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  moduleCard: {
    width: "47%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  moduleTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  moduleDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    textAlign: "center",
    lineHeight: 16,
  },
  eventCard: {
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  eventIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  eventDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: `${COLORS.primary}25`,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    overflow: "hidden",
  },
  statsHeader: {
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  statsHeaderTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}12`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  statsBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primaryDark,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statsYearChip: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statsYearText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
    fontWeight: "600",
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.gray900,
  },
  statsSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    textAlign: "left",
  },
  statsList: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  statRowDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginLeft: 52,
  },
  statTextBlock: {
    flex: 1,
  },
  statIconMembers: {
    backgroundColor: `${COLORS.primary}20`,
  },
  statIconEvents: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  statIconMarriages: {
    backgroundColor: `${COLORS.error}08`,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.gray900,
    marginTop: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
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
