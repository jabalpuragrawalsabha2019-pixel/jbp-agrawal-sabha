// src/screens/Profile/DirectoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dbHelpers } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../../utils/constants';

const DirectoryScreen = () => {
  const { isVerified } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

  const loadMembers = async () => {
    try {
      const { data, error } = await dbHelpers.getVerifiedUsers();
      if (error) throw error;
      setMembers(data || []);
      setFilteredMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterMembers = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(
      (member) =>
        member.full_name?.toLowerCase().includes(query) ||
        member.city?.toLowerCase().includes(query) ||
        member.occupation?.toLowerCase().includes(query)
    );
    setFilteredMembers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const handleCall = (phone) => {
    if (!isVerified) {
      alert('Please get verified to access contact details');
      return;
    }
    Linking.openURL(`tel:+91${phone}`);
  };

  const renderMember = ({ item }) => (
    <Card style={styles.memberCard}>
      <View style={styles.memberHeader}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={32} color={COLORS.gray400} />
          </View>
        )}
        
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName}>{item.full_name}</Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            )}
          </View>
          
          {item.city && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={14} color={COLORS.gray500} />
              <Text style={styles.infoText}>{item.city}</Text>
            </View>
          )}
          
          {item.occupation && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase" size={14} color={COLORS.gray500} />
              <Text style={styles.infoText}>{item.occupation}</Text>
            </View>
          )}
        </View>
      </View>

      {isVerified && item.phone && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call" size={18} color={COLORS.primary} />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyText}>
        {searchQuery ? 'No members found' : 'No members yet'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, city, or occupation"
          placeholderTextColor={COLORS.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}
        </Text>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    paddingVertical: SPACING.md,
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
  memberCard: {
    marginBottom: SPACING.md,
  },
  memberHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray300,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  memberName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
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
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.primary}10`,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  callText: {
    fontSize: FONT_SIZES.sm,
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
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
});

export default DirectoryScreen;