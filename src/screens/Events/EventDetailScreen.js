// src/screens/Events/EventDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Share,
  TouchableOpacity,
  Modal,
  FlatList,
  StatusBar,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../config/supabase";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../utils/constants";

const { width } = Dimensions.get("window");

const EventDetailScreen = ({ route }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, users!events_posted_by_fkey(*)")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error loading event:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = event.is_announcement
        ? `${event.announcement_text || event.title}\n\n${event.description || ""}`
        : `${event.title}\n\nDate: ${new Date(event.event_date).toLocaleDateString()}\n\n${event.description || ""}`;

      await Share.share({
        message: shareMessage,
        title: event.is_announcement
          ? event.announcement_text || event.title || "Announcement"
          : event.title || "Event",
      });
    } catch (error) {
      console.error("Share error:", error);
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
          <View style={styles.typeBadge}>
            <Ionicons
              name={event.is_announcement ? "megaphone" : "calendar"}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.typeBadgeText}>
              {event.is_announcement
                ? "ANNOUNCEMENT"
                : event.event_type?.toUpperCase() || "EVENT"}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons
              name="share-social-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {event.is_announcement
            ? event.announcement_text || event.title || "Announcement"
            : event.title || "Event"}
        </Text>

        {!event.is_announcement && event.event_date && (
          <>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.gray600}
              />
              <Text style={styles.dateText}>
                {new Date(event.event_date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.gray600} />
              <Text style={styles.dateText}>
                {new Date(event.event_date).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </>
        )}
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
              {event.users?.full_name || "Admin"}
            </Text>
            <Text style={styles.postedByDate}>
              Posted on{" "}
              {new Date(event.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </Card>

      {/* Gallery — Photos */}
      {event.gallery_images && event.gallery_images.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            Photos ({event.gallery_images.length})
          </Text>
          <View style={styles.galleryGrid}>
            {event.gallery_images
              .map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.galleryThumb}
                  onPress={() => openLightbox(idx)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri }} style={styles.galleryThumbImg} />
                  {idx === 8 && event.gallery_images.length > 9 && (
                    <View style={styles.galleryMore}>
                      <Text style={styles.galleryMoreText}>
                        +{event.gallery_images.length - 9}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
              .slice(0, 9)}
          </View>
        </Card>
      )}

      {/* Gallery — Links */}
      {event.gallery_links && event.gallery_links.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Photo Albums</Text>
          <View style={styles.linksContainer}>
            {event.gallery_links.map((link, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.linkRow}
                onPress={() => openLink(link.url)}
                activeOpacity={0.75}
              >
                <View style={styles.linkIconWrap}>
                  <Ionicons name="link" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.linkTextWrap}>
                  <Text style={styles.linkTitle} numberOfLines={1}>
                    {link.title || "View Album"}
                  </Text>
                  <Text style={styles.linkUrl} numberOfLines={1}>
                    {link.url}
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      <TouchableOpacity style={styles.bottomShareBtn} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={20} color={COLORS.white} />
        <Text style={styles.bottomShareBtnText}>
          {event.is_announcement ? "Share Announcement" : "Share Event"}
        </Text>
      </TouchableOpacity>

      {/* Lightbox */}
      <Modal
        visible={lightboxVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLightboxVisible(false)}
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setLightboxVisible(false)}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.lightboxCounter}>
            {lightboxIndex + 1} / {event.gallery_images?.length}
          </Text>
          <FlatList
            data={event.gallery_images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={lightboxIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setLightboxIndex(index);
            }}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={styles.lightboxImageWrap}>
                <Image
                  source={{ uri: item }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  poster: {
    width: width,
    height: 300,
    resizeMode: "cover",
  },
  card: {
    margin: SPACING.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  bottomShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  bottomShareBtnText: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.white,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: `${COLORS.primary}40`,
    backgroundColor: `${COLORS.primary}08`,
  },
  shareBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.primary,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "bold",
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
    lineHeight: 24,
  },
  postedBySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  postedByInfo: {
    flex: 1,
  },
  postedByName: {
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  postedByDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  // Gallery grid
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  galleryThumb: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2 - 8) / 3,
    height: (width - SPACING.lg * 2 - SPACING.md * 2 - 8) / 3,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
    backgroundColor: COLORS.gray100,
  },
  galleryThumbImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  galleryMore: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryMoreText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
  },
  // Links
  linksContainer: {
    gap: SPACING.sm,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: `${COLORS.primary}08`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}25`,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  linkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  linkTextWrap: {
    flex: 1,
  },
  linkTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.gray900,
  },
  linkUrl: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 50,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  lightboxCounter: {
    position: "absolute",
    top: 55,
    alignSelf: "center",
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    zIndex: 10,
  },
  lightboxImageWrap: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: {
    width,
    height: width * 1.2,
  },
});

export default EventDetailScreen;
