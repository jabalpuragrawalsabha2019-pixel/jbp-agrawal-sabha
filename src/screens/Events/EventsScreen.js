// src/screens/Events/EventsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const EventsScreen = ({ navigation }) => {
  const { isVerified } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, events, announcements
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    try {
      const { data, error } = await dbHelpers.getEvents('all');
      if (error) throw error;
      
      if (data) {
        let filteredData = data.filter(e => e.is_visible);
        
        // Apply filter
        if (filter === 'events') {
          filteredData = filteredData.filter(e => !e.is_announcement);
        } else if (filter === 'announcements') {
          filteredData = filteredData.filter(e => e.is_announcement);
        }

        // Organize into sections
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const todayEvents = [];
        const upcomingEvents = [];
        const pastEvents = [];
        const announcements = [];

        filteredData.forEach(event => {
          if (event.is_announcement) {
            announcements.push(event);
          } else if (event.event_date) {
            const eventDate = new Date(event.event_date);
            const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            
            if (eventDay.getTime() === today.getTime()) {
              todayEvents.push(event);
            } else if (eventDate >= now) {
              upcomingEvents.push(event);
            } else {
              pastEvents.push(event);
            }
          }
        });

        // Sort by date
        todayEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        upcomingEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        pastEvents.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
        announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Build sections
        const sectionsData = [];
        
        if (announcements.length > 0 && filter !== 'events') {
          sectionsData.push({
            title: '📢 Announcements',
            data: announcements,
          });
        }

        if (todayEvents.length > 0 && filter !== 'announcements') {
          sectionsData.push({
            title: '🔔 Today',
            data: todayEvents,
          });
        }

        if (upcomingEvents.length > 0 && filter !== 'announcements') {
          sectionsData.push({
            title: '📅 Upcoming Events',
            data: upcomingEvents,
          });
        }

        if (pastEvents.length > 0 && filter !== 'announcements') {
          sectionsData.push({
            title: '📚 Past Events',
            data: pastEvents.slice(0, 10), // Show only last 10 past events
          });
        }

        setSections(sectionsData);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const getEventIcon = (event) => {
    if (event.is_announcement) return 'megaphone';
    
    const today = new Date();
    const eventDate = new Date(event.event_date);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'alarm';
    } else if (eventDate > today) {
      return 'calendar';
    } else {
      return 'calendar-outline';
    }
  };

  const getEventColor = (event) => {
    if (event.is_announcement) return COLORS.info;
    
    const today = new Date();
    const eventDate = new Date(event.event_date);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return COLORS.success;
    } else if (eventDate > today) {
      return COLORS.primary;
    } else {
      return COLORS.gray500;
    }
  };

  const formatEventDate = (event) => {
    if (event.is_announcement) {
      return `Posted ${new Date(event.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      })}`;
    }

    const eventDate = new Date(event.event_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return `Today at ${eventDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${eventDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return eventDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: eventDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderEvent = ({ item: event }) => {
    const icon = getEventIcon(event);
    const color = getEventColor(event);

    return (
      <Card
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      >
        {event.poster_url && !event.is_announcement && (
          <Image source={{ uri: event.poster_url }} style={styles.poster} />
        )}

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.eventTypeContainer}>
              <Text style={[styles.eventType, { color }]}>
                {event.is_announcement ? 'ANNOUNCEMENT' : event.event_type?.toUpperCase() || 'EVENT'}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.is_announcement ? event.announcement_text : event.title}
          </Text>

          {event.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
          )}

          <View style={styles.eventFooter}>
            <View style={styles.dateContainer}>
              <Ionicons name="time-outline" size={14} color={COLORS.gray500} />
              <Text style={styles.dateText}>{formatEventDate(event)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
          </View>
        </View>
      </Card>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyText}>No events found</Text>
      <Text style={styles.emptySubtext}>
        {filter === 'announcements' 
          ? 'No announcements at this time'
          : 'Check back later for upcoming events'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'events' && styles.filterButtonActive]}
          onPress={() => setFilter('events')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'events' && styles.filterButtonTextActive,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'announcements' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('announcements')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'announcements' && styles.filterButtonTextActive,
            ]}
          >
            Announcements
          </Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderEvent}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
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
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  eventCard: {
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    padding: 0,
  },
  poster: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  eventDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});

export default EventsScreen;